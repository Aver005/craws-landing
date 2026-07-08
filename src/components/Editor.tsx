import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import sampleUrl from '../assets/sample.webp'

/* The centerpiece: craws' own editor, turned into a webpage. A real photo on
   the canvas; a tool rail, a properties inspector, a pipeline node strip and a
   live luminance histogram around it. A cinematic script drives the whole
   window — the tool switches, the inspector's slider slides, the canvas is
   re-graded, the histogram shifts, and only the affected tiles flash amber as
   the content-hash cache recomputes. Then it loops. Nothing here is faked with
   a video: the histogram is computed from the actual pixels, and the grade is
   the browser applying the same ops the engine does. */

const COLS = 8
const ROWS = 6
const TILE_COUNT = COLS * ROWS
const ALL = Array.from({ length: TILE_COUNT }, (_, i) => i)
const rect = (c0: number, r0: number, c1: number, r1: number) => {
  const out: number[] = []
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) out.push(r * COLS + c)
  return out
}

type Inspect = 'info' | 'resize' | 'exposure' | 'crop' | 'grayscale' | 'ellipse' | 'export'

type Phase = {
  tool: string // active tool-rail id
  node: number // active node index (-1 = none highlighted beyond)
  op: string // display op name
  json: string // param line
  inspect: Inspect
  dims: string
  time: string
  recompute: number[] // tiles that flash
  hold: number
  brightness: number
  grayscale: number
  crop: boolean
  ellipse: boolean
  stops?: number // for the exposure inspector slider
  cached?: boolean
}

const NODES = ['decode', 'resize', 'exposure', 'crop', 'grayscale', 'draw', 'export']

const PHASES: Phase[] = [
  {
    tool: 'open',
    node: 0,
    op: 'open_image',
    json: 'IMG_2153.webp → linear f32 tiles',
    inspect: 'info',
    dims: '720×1080',
    time: 'decode 6.1 ms',
    recompute: ALL,
    hold: 1100,
    brightness: 1,
    grayscale: 0,
    crop: false,
    ellipse: false,
  },
  {
    tool: 'resize',
    node: 1,
    op: 'resize',
    json: '{ "op": "resize", "width": 1600 }',
    inspect: 'resize',
    dims: '1600×2400',
    time: '54 ms',
    recompute: ALL,
    hold: 1300,
    brightness: 1,
    grayscale: 0,
    crop: false,
    ellipse: false,
  },
  {
    tool: 'exposure',
    node: 2,
    op: 'exposure',
    json: '{ "op": "exposure", "stops": 0.5 }',
    inspect: 'exposure',
    dims: '1600×2400',
    time: '3.1 ms',
    recompute: ALL,
    hold: 1500,
    brightness: 1.32,
    grayscale: 0,
    crop: false,
    ellipse: false,
    stops: 0.5,
  },
  {
    tool: 'crop',
    node: 3,
    op: 'crop',
    json: '{ "op": "crop", "x": 210, "y": 120, "width": 1180, "height": 1180 }',
    inspect: 'crop',
    dims: '1180×1180',
    time: '0.9 ms',
    recompute: rect(1, 0, 6, 4),
    hold: 1500,
    brightness: 1.32,
    grayscale: 0,
    crop: true,
    ellipse: false,
  },
  {
    tool: 'grayscale',
    node: 4,
    op: 'grayscale',
    json: '{ "op": "grayscale" }',
    inspect: 'grayscale',
    dims: '1180×1180',
    time: '2.4 ms',
    recompute: rect(1, 0, 6, 4),
    hold: 1400,
    brightness: 1.32,
    grayscale: 1,
    crop: true,
    ellipse: false,
  },
  {
    tool: 'ellipse',
    node: 5,
    op: 'draw_ellipse',
    json: '{ "op": "draw_ellipse", "stroke": "amber", "stroke_width": 6 }',
    inspect: 'ellipse',
    dims: '1180×1180',
    time: '0.6 ms',
    recompute: rect(3, 1, 5, 3),
    hold: 1500,
    brightness: 1.32,
    grayscale: 1,
    crop: true,
    ellipse: true,
  },
  {
    tool: 'export',
    node: 6,
    op: 'export',
    json: 'out.webp  (linear → sRGB, encode, write)',
    inspect: 'export',
    dims: '1180×1180',
    time: 'total 336 ms',
    recompute: [],
    hold: 1700,
    brightness: 1.32,
    grayscale: 1,
    crop: true,
    ellipse: true,
    cached: true,
  },
  {
    tool: 'exposure',
    node: 2,
    op: 'exposure',
    json: '~ slider: exposure  0.5 → 0.8',
    inspect: 'exposure',
    dims: '1180×1180',
    time: 'warm · 11.8 ms',
    recompute: rect(1, 0, 6, 4),
    hold: 2600,
    brightness: 1.62,
    grayscale: 1,
    crop: true,
    ellipse: true,
    stops: 0.8,
  },
]
const LAST = PHASES.length - 1
const RESTART_MS = 1200

// tool rail: op glyph + id
const TOOLS = [
  { id: 'resize', g: '⤢' },
  { id: 'crop', g: '⌗' },
  { id: 'exposure', g: '◐' },
  { id: 'grayscale', g: '◑' },
  { id: 'rect', g: '▭' },
  { id: 'ellipse', g: '◯' },
  { id: 'arrow', g: '↗' },
  { id: 'overlay', g: '▦' },
]

export default function Editor() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState(reduced ? LAST : 0)
  const timer = useRef<number>(undefined)
  const bins = useHistogram(sampleUrl)
  const rootRef = useRef<HTMLDivElement>(null)
  // Only run the phase script while the editor is actually on screen — no point
  // burning the main thread re-grading a canvas the reader has scrolled past.
  const inView = useInView(rootRef, { margin: '120px' })

  useEffect(() => {
    if (reduced || !inView) return
    const p = PHASES[phase]
    timer.current = window.setTimeout(
      () => setPhase((v) => (v + 1) % PHASES.length),
      phase === LAST ? p.hold + RESTART_MS : p.hold,
    )
    return () => clearTimeout(timer.current)
  }, [phase, reduced, inView])

  const p = PHASES[phase]
  const flash = useMemo(() => new Set(p.recompute), [p])

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0, y: 40, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="w-full max-w-5xl overflow-hidden rounded-xl border border-line bg-panel text-left shadow-[0_32px_100px_-30px_rgba(242,169,59,0.3)]"
    >
      {/* window titlebar */}
      <div className="flex items-center gap-2 border-b border-line bg-panel-hi px-4 py-2.5">
        <span className="size-3 rounded-full bg-err/80" />
        <span className="size-3 rounded-full bg-warn/80" />
        <span className="size-3 rounded-full bg-ok/80" />
        <span className="ml-3 truncate font-mono text-xs text-dim">
          craws — IMG_2153.webp — {p.dims} @ 100%
        </span>
        <span className="ml-auto hidden font-mono text-[11px] text-dim sm:inline">
          {p.time}
        </span>
      </div>

      <div className="flex">
        <ToolRail active={p.tool} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* node strip */}
          <NodeStrip phase={phase} />

          <div className="flex min-w-0 flex-1 flex-col md:flex-row">
            {/* canvas */}
            <div className="min-w-0 flex-1 p-3">
              <Canvas p={p} flash={flash} />
            </div>
            {/* inspector */}
            <Inspector p={p} />
          </div>

          {/* histogram + readout */}
          <Histogram bins={bins} brightness={p.brightness} gray={p.grayscale} />
        </div>
      </div>
    </motion.div>
  )
}

/* ---------- canvas ---------- */

const Canvas = memo(function Canvas({
  p,
  flash,
}: {
  p: Phase
  flash: Set<number>
}) {
  return (
    <div className="checker relative aspect-4/3 w-full overflow-hidden rounded-md border border-line">
      <motion.img
        src={sampleUrl}
        alt="craws sample — a warm café portrait"
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
        animate={{
          filter: `brightness(${p.brightness}) grayscale(${p.grayscale}) saturate(${p.grayscale ? 0 : 1})`,
          scale: p.crop ? 1.5 : 1,
          x: p.crop ? '2%' : '0%',
          y: p.crop ? '-8%' : '0%',
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* the draw_ellipse annotation craws lands on the face */}
      <motion.svg
        viewBox="0 0 400 300"
        className="pointer-events-none absolute inset-0 h-full w-full"
        initial={false}
        animate={{ opacity: p.ellipse ? 1 : 0 }}
        transition={{ duration: 0.35 }}
      >
        <ellipse
          cx="205"
          cy="120"
          rx="78"
          ry="98"
          fill="none"
          stroke="#f2a93b"
          strokeWidth="5"
        />
      </motion.svg>

      {/* tile grid — flashes amber only where the content-hash misses. One
         keyed container of plain divs replays a CSS animation once per phase,
         instead of mounting 48 Motion components on every step. */}
      <div
        key={`${p.op}-${p.time}`}
        className="pointer-events-none absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
      >
        {ALL.map((i) => (
          <div key={i} className="border-[0.5px] border-white/5">
            {flash.has(i) && (
              <div
                className="tile-flash h-full w-full bg-accent"
                style={{ animationDelay: `${(i % COLS) * 15}ms` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* crop marquee */}
      <motion.div
        className="pointer-events-none absolute inset-3 rounded-sm border border-dashed border-accent/70"
        initial={false}
        animate={{ opacity: p.inspect === 'crop' ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-linear-to-t from-black/70 to-transparent px-2.5 py-1.5 font-mono text-[10px]">
        <span className="text-accent-soft">{p.op}</span>
        <span className={p.cached ? 'text-ok' : 'text-dim'}>
          {p.cached
            ? '✓ cache hit · 0 tiles'
            : `recompute ${p.recompute.length}/${TILE_COUNT}`}
        </span>
      </div>
    </div>
  )
})

/* ---------- tool rail ---------- */

const ToolRail = memo(function ToolRail({ active }: { active: string }) {
  return (
    <div className="flex shrink-0 flex-col gap-1 border-r border-line bg-panel-hi p-1.5">
      {TOOLS.map((tl) => {
        const on = tl.id === active
        return (
          <div
            key={tl.id}
            title={tl.id}
            className={`flex size-8 items-center justify-center rounded text-base transition-colors ${
              on
                ? 'bg-accent/20 text-accent'
                : 'text-dim hover:bg-panel hover:text-soft'
            }`}
          >
            <span aria-hidden>{tl.g}</span>
          </div>
        )
      })}
    </div>
  )
})

/* ---------- node strip ---------- */

const NodeStrip = memo(function NodeStrip({ phase }: { phase: number }) {
  const active = PHASES[phase].node
  return (
    <div className="flex items-center gap-1 overflow-x-auto border-b border-line bg-panel-deep px-3 py-2 font-mono text-[10px]">
      {NODES.map((n, i) => {
        const state = i === active ? 'active' : i < active ? 'done' : 'idle'
        return (
          <div key={n} className="flex shrink-0 items-center gap-1">
            <span
              className={`rounded border px-2 py-1 transition-colors ${
                state === 'active'
                  ? 'border-accent bg-accent/15 text-accent'
                  : state === 'done'
                    ? 'border-ok/30 bg-ok/10 text-ok'
                    : 'border-line text-dim'
              }`}
            >
              {n}
            </span>
            {i < NODES.length - 1 && (
              <span
                className={i < active ? 'text-ok/50' : 'text-line'}
              >
                →
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
})

/* ---------- inspector ---------- */

const Inspector = memo(function Inspector({ p }: { p: Phase }) {
  return (
    <div className="shrink-0 border-t border-line bg-panel-hi p-3 font-mono text-[11px] md:w-56 md:border-t-0 md:border-l">
      <p className="mb-3 flex items-center justify-between text-dim">
        <span className="uppercase tracking-widest">properties</span>
        <span className="text-accent-soft">{p.op}</span>
      </p>

      {p.inspect === 'info' && (
        <Rows
          rows={[
            ['source', 'IMG_2153.webp'],
            ['size', '720×1080'],
            ['color', 'sRGB → linear f32'],
            ['tiles', '256² · premultiplied'],
          ]}
        />
      )}
      {p.inspect === 'resize' && (
        <Rows
          rows={[
            ['width', '1600'],
            ['height', 'auto · aspect'],
            ['filter', 'lanczos3'],
          ]}
        />
      )}
      {p.inspect === 'exposure' && <ExposureCtrl stops={p.stops ?? 0.5} />}
      {p.inspect === 'crop' && (
        <Rows
          rows={[
            ['x · y', '210 · 120'],
            ['w · h', '1180 · 1180'],
            ['inside', '✓ fits image'],
          ]}
        />
      )}
      {p.inspect === 'grayscale' && (
        <Rows
          rows={[
            ['model', 'Rec.709'],
            ['space', 'linear light'],
            ['luma', '0.2126 R + 0.7152 G + 0.0722 B'],
          ]}
        />
      )}
      {p.inspect === 'ellipse' && (
        <Rows
          rows={[
            ['stroke', 'amber #F2A93B'],
            ['stroke_width', '6 px'],
            ['aa', '1px · linear light'],
          ]}
        />
      )}
      {p.inspect === 'export' && (
        <Rows
          rows={[
            ['format', 'webp · from ext'],
            ['quality', '90'],
            ['total', '336 ms'],
            ['determinism', 'bit-identical'],
          ]}
        />
      )}
    </div>
  )
})

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-2">
      {rows.map(([k, v]) => (
        <div key={k} className="flex items-baseline justify-between gap-2">
          <dt className="text-dim">{k}</dt>
          <dd className="min-w-0 truncate text-right text-soft">{v}</dd>
        </div>
      ))}
    </dl>
  )
}

function ExposureCtrl({ stops }: { stops: number }) {
  // stops range -2..+2 → 0..1 knob position
  const pos = Math.min(1, Math.max(0, (stops + 2) / 4))
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-dim">stops</span>
        <span className="text-accent">
          {stops > 0 ? '+' : ''}
          {stops.toFixed(1)} EV
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-panel-deep">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent/40"
          animate={{ width: `${pos * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent bg-accent-soft shadow"
          animate={{ left: `${pos * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-dim">
        <span>-2</span>
        <span>0</span>
        <span>+2</span>
      </div>
      <p className="text-[10px] leading-4 text-dim">
        linear × 2^stops · no clamp — HDR headroom kept to export
      </p>
    </div>
  )
}

/* ---------- histogram ---------- */

const Histogram = memo(function Histogram({
  bins,
  brightness,
  gray,
}: {
  bins: number[] | null
  brightness: number
  gray: number
}) {
  // remap the base luminance histogram by the current exposure
  const shown = useMemo(() => {
    if (!bins) return null
    const n = bins.length
    const out = new Array(n).fill(0)
    for (let i = 0; i < n; i++) {
      const v = Math.min(1, (i / (n - 1)) * brightness)
      out[Math.round(v * (n - 1))] += bins[i]
    }
    const max = Math.max(...out, 1e-6)
    return out.map((x) => x / max)
  }, [bins, brightness])

  return (
    <div className="flex items-end gap-3 border-t border-line bg-panel-deep px-3 py-2">
      <div className="flex h-12 flex-1 items-end gap-px">
        {(shown ?? new Array(48).fill(0)).map((h, i) => (
          <span
            key={i}
            className="hist-bar min-w-0 flex-1 rounded-t-[1px]"
            style={{
              height: `${Math.max(2, h * 100)}%`,
              transitionDelay: `${i * 4}ms`,
              background: gray
                ? '#a6a6b2'
                : 'linear-gradient(to top, #d0821f, #f9ce86)',
            }}
          />
        ))}
      </div>
      <div className="shrink-0 font-mono text-[10px] leading-4 text-dim">
        <p className="text-accent-soft">histogram</p>
        <p>luminance · {gray ? 'Rec.709' : 'RGB'}</p>
      </div>
    </div>
  )
})

// Compute a real luminance histogram from the sample's pixels.
function useHistogram(url: string): number[] | null {
  const [bins, setBins] = useState<number[] | null>(null)
  useEffect(() => {
    let alive = true
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = url
    img.onload = () => {
      const N = 48
      const w = 180
      const h = Math.max(1, Math.round((img.height / img.width) * w))
      const cvs = document.createElement('canvas')
      cvs.width = w
      cvs.height = h
      const ctx = cvs.getContext('2d')
      if (!ctx) return
      ctx.drawImage(img, 0, 0, w, h)
      let data: Uint8ClampedArray
      try {
        data = ctx.getImageData(0, 0, w, h).data
      } catch {
        return
      }
      const out = new Array(N).fill(0)
      for (let i = 0; i < data.length; i += 4) {
        const l =
          (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
        out[Math.min(N - 1, Math.floor(l * N))] += 1
      }
      if (alive) setBins(out)
    }
    return () => {
      alive = false
    }
  }, [url])
  return bins
}
