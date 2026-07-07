import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import SectionTitle from './SectionTitle'
import { rise, stagger, viewportOnce } from '../lib/anim'

const GLYPHS = ['⊞', '❯', '⟳', '◇'] // GUI · CLI · CI · MCP
const ADAPTERS = ['domain', 'codecs', 'gpu', 'ai']

export default function Ports() {
  const { t } = useTranslation()
  const cards = t('ports.cards', { returnObjects: true })
  return (
    <section id="ports" className="border-y border-line bg-panel/40 px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <SectionTitle
          index="05"
          kicker={t('ports.kicker')}
          title={t('ports.title')}
          sub={t('ports.sub')}
        />

        {/* the engine core */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mx-auto mt-14 max-w-md rounded-lg border border-accent/40 bg-accent/5 p-5 text-center"
        >
          <p className="font-mono text-sm font-bold text-accent">
            craws-engine
          </p>
          <p className="mt-1.5 font-mono text-[11px] text-soft">
            tiled · content-hash cache · linear f32 · rayon
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {ADAPTERS.map((a) => (
              <span
                key={a}
                className="rounded border border-line bg-panel px-2 py-0.5 font-mono text-[10px] text-dim"
              >
                {a}
              </span>
            ))}
          </div>
        </motion.div>

        {/* connector bus (desktop) */}
        <div aria-hidden className="mx-auto hidden w-full max-w-4xl lg:block">
          <div className="mx-auto h-6 w-px bg-accent/40" />
          <div className="relative mx-auto h-px w-3/4 bg-line">
            {[0, 1, 2, 3].map((n) => (
              <span
                key={n}
                className="absolute top-0 h-6 w-px bg-line"
                style={{ left: `${12.5 + n * 25}%` }}
              />
            ))}
          </div>
          <div className="h-6" />
        </div>

        {/* the four ports */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={viewportOnce}
          className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-0 lg:grid-cols-4"
        >
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              variants={rise}
              whileHover={{ y: -6 }}
              className="flex flex-col border border-line bg-panel-deep p-5 transition-colors hover:border-accent"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  aria-hidden
                  className="flex size-8 items-center justify-center rounded bg-accent/15 font-mono text-accent"
                >
                  {GLYPHS[i]}
                </span>
                <span className="font-mono text-[11px] text-accent">
                  {c.tag}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-bold text-fg">{c.title}</h3>
              <p className="mt-2 text-[13px] leading-6 text-dim">{c.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
