import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import SectionTitle from './SectionTitle'
import { rise, viewportOnce } from '../lib/anim'

// Op glyph + verbatim signature, one per op. Titles/bodies come from i18n
// (ops.cards), same order. This is the engine's spec sheet, not a marketing
// card wall — a tool list on the left, the selected op's inspector on the right.
const OPS = [
  { id: 'resize', g: '⤢', kind: 'resample', sig: '{ "op": "resize", "width": 1600, "filter": "lanczos3" }' },
  { id: 'crop', g: '⌗', kind: 'geometry', sig: '{ "op": "crop", "x": 0, "y": 0, "width": 800, "height": 600 }' },
  { id: 'exposure', g: '◐', kind: 'tone', sig: '{ "op": "exposure", "stops": 0.5 }' },
  { id: 'grayscale', g: '◑', kind: 'tone', sig: '{ "op": "grayscale" }' },
  { id: 'draw_rect', g: '▭', kind: 'draw', sig: '{ "op": "draw_rect", "width": 200, "height": 120, "corner_radius": 8, "stroke": "amber" }' },
  { id: 'draw_ellipse', g: '◯', kind: 'draw', sig: '{ "op": "draw_ellipse", "width": 180, "height": 180, "stroke": "cyan" }' },
  { id: 'draw_line', g: '╱', kind: 'draw', sig: '{ "op": "draw_line", "x1": 0, "y1": 0, "x2": 400, "y2": 300, "thickness": 3 }' },
  { id: 'draw_arrow', g: '↗', kind: 'draw', sig: '{ "op": "draw_arrow", "x2": 210, "y2": 90, "head_length": 18 }' },
  { id: 'overlay', g: '▦', kind: 'compose', sig: 'overlay(base, top, x, y, opacity)  ·  source-over, linear premultiplied' },
  { id: 'collage', g: '▤', kind: 'compose', sig: 'collage(images, target_width: 1600, row_height: 320, gap: 12)' },
]
const HOLD = 2600

export default function Ops() {
  const { t } = useTranslation()
  const cards = t('ops.cards', { returnObjects: true })
  const reduced = useReducedMotion()
  const [sel, setSel] = useState(0)
  const [auto, setAuto] = useState(!reduced)

  useEffect(() => {
    if (!auto) return
    const id = window.setTimeout(() => setSel((v) => (v + 1) % OPS.length), HOLD)
    return () => clearTimeout(id)
  }, [sel, auto])

  const op = OPS[sel]
  const card = cards[sel]

  return (
    <section id="ops" className="px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          index="03"
          kicker={t('ops.kicker')}
          title={t('ops.title')}
          sub={t('ops.sub')}
        />

        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 grid gap-4 lg:grid-cols-[22rem_1fr]"
        >
          {/* the tool list */}
          <ul
            className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-1"
            onMouseEnter={() => setAuto(false)}
            onMouseLeave={() => setAuto(!reduced)}
          >
            {OPS.map((o, i) => {
              const on = i === sel
              return (
                <li key={o.id}>
                  <button
                    onClick={() => setSel(i)}
                    onMouseEnter={() => setSel(i)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded border px-3 py-2.5 text-left font-mono text-sm transition-colors ${
                      on
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-line bg-panel text-soft hover:border-accent/50 hover:text-accent-soft'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`text-base ${on ? 'text-accent' : 'text-dim'}`}
                    >
                      {o.g}
                    </span>
                    <span className="truncate">{o.id}</span>
                    <span className="ml-auto hidden text-[10px] text-dim lg:inline">
                      {o.kind}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* the inspector */}
          <div
            className="relative min-h-[19rem] overflow-hidden rounded-lg border border-line bg-panel-deep p-6"
            onMouseEnter={() => setAuto(false)}
            onMouseLeave={() => setAuto(!reduced)}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={op.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
              >
                <div className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex size-11 items-center justify-center rounded-md bg-accent/15 text-2xl text-accent"
                  >
                    {op.g}
                  </span>
                  <div>
                    <p className="font-mono text-xs text-accent">{op.id}</p>
                    <h3 className="text-xl font-bold text-fg">{card.title}</h3>
                  </div>
                  <span className="ml-auto rounded border border-line px-2 py-0.5 font-mono text-[10px] text-dim uppercase">
                    {op.kind}
                  </span>
                </div>

                <pre className="mt-5 overflow-x-auto rounded-md border border-line bg-ink px-4 py-3 font-mono text-[11px] leading-6 text-accent-soft sm:text-xs">
                  {op.sig}
                </pre>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-soft">
                  {card.body}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* progress dots */}
            <div className="absolute right-6 bottom-6 flex gap-1.5" aria-hidden>
              {OPS.map((_, i) => (
                <motion.span
                  key={i}
                  animate={{
                    backgroundColor: i === sel ? '#f2a93b' : '#262730',
                    scale: i === sel ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className="size-1.5 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
