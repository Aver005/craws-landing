import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import SectionTitle from './SectionTitle'
import { rise, stagger, viewportOnce } from '../lib/anim'

// Real criterion numbers, 24MP, release build. before/after are milliseconds;
// each row is normalised to its own `before` so the shrink is visible.
const BARS = [
  { label: 'resize · 6000→1920 · lanczos3', before: 323, after: 54, speed: '6×' },
  { label: 'encode · jpeg q90 · 24MP', before: 910, after: 375, speed: '2.4×' },
  { label: '4-step chain · slider tweak', before: 85, after: 11.8, speed: '7×' },
  { label: 'exposure · 24MP · cached', before: 49, after: 0.085, speed: '580×' },
]

const ms = (v: number) => (v < 1 ? `${Math.round(v * 1000)}µs` : `${v} ms`)

export default function Bench() {
  const { t } = useTranslation()
  return (
    <section id="bench" className="border-y border-line bg-panel/40 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="02"
          kicker={t('bench.kicker')}
          title={t('bench.title')}
          sub={t('bench.sub')}
        />

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-14 space-y-7"
        >
          {BARS.map((b) => {
            const afterPct = Math.max(1.5, (b.after / b.before) * 100)
            return (
              <motion.div key={b.label} variants={rise}>
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="font-mono text-xs text-soft">{b.label}</span>
                  <span className="rounded border border-accent/40 bg-accent/10 px-2 py-0.5 font-mono text-[11px] font-bold text-accent">
                    {b.speed} faster
                  </span>
                </div>

                {/* before */}
                <div className="flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-[10px] text-dim">
                    {t('bench.before')}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm bg-panel-deep">
                    <motion.div
                      className="h-full rounded-sm bg-line"
                      initial={{ width: 0 }}
                      whileInView={{ width: '100%' }}
                      viewport={viewportOnce}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[10px] text-dim">
                    {ms(b.before)}
                  </span>
                </div>

                {/* after */}
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="w-12 shrink-0 font-mono text-[10px] text-accent">
                    {t('bench.after')}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm bg-panel-deep">
                    <motion.div
                      className="h-full rounded-sm bg-gradient-to-r from-accent-dim to-accent"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${afterPct}%` }}
                      viewport={viewportOnce}
                      transition={{
                        duration: 0.8,
                        delay: 0.15,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right font-mono text-[10px] font-bold text-accent-soft">
                    {ms(b.after)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        <motion.p
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-12 font-mono text-xs text-dim"
        >
          {t('bench.note')}
        </motion.p>
      </div>
    </section>
  )
}
