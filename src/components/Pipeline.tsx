import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import SectionTitle from './SectionTitle'

type Kind = 'idle' | 'compute' | 'hit' | 'stale'
const NODES = ['decode', 'resize', 'exposure', 'crop', 'grayscale', 'draw', 'export']

// Each state paints the graph: which nodes recompute (amber), which the
// content-hash serves from cache (green), which just went stale (the edit).
// Log lines live in i18n (pipeline.logs), one per state, same order.
const STATES: {
  badge: string
  cls: string
  hold: number
  kind: (i: number) => Kind
}[] = [
  {
    badge: '[COLD RUN]',
    cls: 'text-warn border-warn/40 bg-warn/10',
    hold: 1800,
    kind: () => 'compute',
  },
  {
    badge: '[CACHED · 85µs]',
    cls: 'text-ok border-ok/40 bg-ok/10',
    hold: 1800,
    kind: () => 'hit',
  },
  {
    badge: '[EDIT exposure]',
    cls: 'text-accent border-accent/40 bg-accent/10',
    hold: 1600,
    kind: (i) => (i === 2 ? 'stale' : i < 2 ? 'hit' : 'idle'),
  },
  {
    badge: '[RECOMPUTE ↓]',
    cls: 'text-accent-soft border-accent/40 bg-accent/10',
    hold: 2000,
    kind: (i) => (i < 2 ? 'hit' : 'compute'),
  },
  {
    badge: '[WARM · 11.8ms]',
    cls: 'text-ok border-ok/40 bg-ok/10',
    hold: 3200,
    kind: () => 'hit',
  },
]

const DOT: Record<Kind, string> = {
  idle: '#3a3a44',
  compute: '#f2a93b',
  hit: '#4fd08a',
  stale: '#f2a93b',
}
const BORDER: Record<Kind, string> = {
  idle: 'rgba(38,39,48,1)',
  compute: 'rgba(242,169,59,0.6)',
  hit: 'rgba(79,208,138,0.4)',
  stale: 'rgba(242,169,59,0.8)',
}
const BG: Record<Kind, string> = {
  idle: 'rgba(20,22,28,0.6)',
  compute: 'rgba(242,169,59,0.12)',
  hit: 'rgba(79,208,138,0.08)',
  stale: 'rgba(242,169,59,0.18)',
}

export default function Pipeline() {
  const { t } = useTranslation()
  const logs = t('pipeline.logs', { returnObjects: true })
  const reduced = useReducedMotion()
  const [i, setI] = useState(reduced ? STATES.length - 1 : 0)

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(
      () => setI((v) => (v + 1) % STATES.length),
      STATES[i].hold,
    )
    return () => clearTimeout(id)
  }, [i, reduced])

  const s = STATES[i]

  return (
    <section id="pipeline" className="px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="04"
          kicker={t('pipeline.kicker')}
          title={t('pipeline.title')}
          sub={t('pipeline.sub')}
        />

        {/* the node graph */}
        <div className="mt-14 overflow-x-auto pb-2">
          <div className="flex min-w-max items-stretch gap-0">
            {NODES.map((n, idx) => {
              const k = s.kind(idx)
              const hash = hashFor(n, k, i)
              return (
                <div key={n} className="flex items-center">
                  <motion.div
                    className="w-28 rounded-lg border p-3"
                    animate={{
                      backgroundColor: BG[k],
                      borderColor: BORDER[k],
                    }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[13px] font-bold text-fg">
                        {n}
                      </span>
                      <motion.span
                        className="size-2 rounded-full"
                        animate={{ backgroundColor: DOT[k] }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className="mt-2 font-mono text-[10px] text-dim">
                      #{hash}
                    </p>
                    <p
                      className="mt-0.5 font-mono text-[9px]"
                      style={{ color: k === 'hit' ? '#4fd08a' : '#767683' }}
                    >
                      {k === 'compute'
                        ? 'recompute'
                        : k === 'hit'
                          ? 'cache hit'
                          : k === 'stale'
                            ? 'stale'
                            : 'idle'}
                    </p>
                  </motion.div>
                  {idx < NODES.length - 1 && (
                    <motion.span
                      className="px-1 text-lg"
                      animate={{
                        color:
                          s.kind(idx + 1) === 'compute' ||
                          s.kind(idx + 1) === 'stale'
                            ? '#f2a93b'
                            : '#3a3a44',
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      →
                    </motion.span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* state readout */}
        <div className="mt-10 flex flex-col items-start gap-5">
          <div className="flex h-14 items-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={`${i}-${s.badge}`}
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
                transition={{ duration: 0.3 }}
                className={`rounded border px-5 py-2.5 font-mono text-lg font-bold sm:text-2xl ${s.cls}`}
              >
                {s.badge}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex min-h-10 items-start">
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="max-w-xl text-sm leading-7 text-soft"
              >
                {logs[i]}
              </motion.p>
            </AnimatePresence>
          </div>
          <div className="flex items-center gap-4 font-mono text-xs text-dim">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-accent" /> recompute
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-ok/50" /> cache hit
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

// stable-ish short hash per node/state so cached nodes keep their key and
// recomputed ones visibly change
function hashFor(node: string, kind: Kind, state: number): string {
  const seed =
    node.length * 2654435761 +
    (kind === 'hit' ? 7 : state * 40503) +
    node.charCodeAt(0) * 131
  return ((seed >>> 0) % 0xfffff).toString(16).padStart(5, '0')
}
