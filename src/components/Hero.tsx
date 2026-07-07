import { useState } from 'react'
import { motion } from 'motion/react'
import { Trans, useTranslation } from 'react-i18next'
import Logo from './Logo'
import Editor from './Editor'
import { GITHUB_URL } from '../lib/anim'

const COPY_CMD =
  'git clone https://github.com/Aver005/craws && cargo run --release -p craws-cli -- run pipeline.json --in photo.jpg --out out.webp'

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
})

export default function Hero() {
  const { t } = useTranslation()
  return (
    <header className="relative px-4 pt-28 pb-16 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        {/* masthead — deliberately asymmetric: an oversized serif wordmark on
            the left, a tight editorial column on the right */}
        <div className="grid items-end gap-x-12 gap-y-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="min-w-0">
            <motion.div
              {...fade(0)}
              className="inline-flex items-center gap-2 rounded border border-line bg-panel/60 px-2.5 py-1 font-mono text-[11px] text-soft backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              open-source · Rust · MIT
            </motion.div>

            <motion.div {...fade(0.08)}>
              <Logo className="mt-5 text-[clamp(3.75rem,13vw,9.5rem)] leading-[0.82]" />
            </motion.div>

            {/* exposure ruler — echoes the editor's slider */}
            <motion.div
              {...fade(0.16)}
              aria-hidden
              className="mt-8 hidden max-w-sm sm:block"
            >
              <div className="relative h-4">
                <div className="absolute inset-x-0 top-2 h-px bg-line" />
                {Array.from({ length: 13 }).map((_, i) => (
                  <div
                    key={i}
                    className={`absolute top-1 w-px ${i % 6 === 0 ? 'h-3 bg-dim' : 'h-2 bg-line'}`}
                    style={{ left: `${(i / 12) * 100}%` }}
                  />
                ))}
                <div
                  className="absolute top-2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ink bg-accent shadow-[0_0_10px_rgba(242,169,59,0.6)]"
                  style={{ left: '64%' }}
                />
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[9px] tracking-widest text-dim">
                <span>−2</span>
                <span className="text-accent-soft">EV +0.5</span>
                <span>+2</span>
              </div>
            </motion.div>
          </div>

          <div className="min-w-0 lg:pb-2">
            <motion.p
              {...fade(0.12)}
              className="font-mono text-xs text-soft"
            >
              <span className="text-accent">●</span> {t('hero.pill')}
            </motion.p>

            <motion.p
              {...fade(0.2)}
              className="mt-4 font-display text-2xl leading-tight font-medium text-fg sm:text-[1.75rem]"
            >
              {t('hero.tagline')}
            </motion.p>

            <motion.p
              {...fade(0.28)}
              className="mt-4 max-w-xl text-sm leading-7 text-dim sm:text-[15px]"
            >
              <Trans
                i18nKey="hero.desc"
                components={{
                  hi: <span className="font-medium text-accent-soft" />,
                }}
              />
            </motion.p>

            <motion.div
              {...fade(0.36)}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <CopyCommand />
              <motion.a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="shrink-0 rounded-md bg-accent px-6 py-3 text-center text-sm font-bold text-ink transition-colors hover:bg-accent-soft"
              >
                ★ GitHub
              </motion.a>
            </motion.div>
          </div>
        </div>

        {/* the editor, framed as a figure */}
        <motion.div
          {...fade(0.3)}
          className="mt-16"
        >
          <div className="crop-mark mx-auto flex max-w-5xl items-baseline justify-between gap-3 border-t border-line pt-3 font-mono text-[11px] text-dim">
            <span>
              <span className="text-accent">fig.01</span> — pipeline.json ·
              live
            </span>
            <span className="hidden sm:inline">
              4 steps · cached · 11.8 ms
            </span>
          </div>
          <div className="mt-4 flex justify-center">
            <Editor />
          </div>
        </motion.div>
      </div>
    </header>
  )
}

function CopyCommand() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COPY_CMD)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable — leave the button as-is */
    }
  }
  return (
    <button
      onClick={copy}
      className="group flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-md border border-line bg-panel-deep px-4 py-3 text-left font-mono text-xs text-soft transition-colors hover:border-accent sm:text-sm"
      title={t('hero.copyTitle')}
    >
      <span className="shrink-0 text-accent">❯</span>
      <span className="truncate">
        craws run pipeline.json --in photo.jpg --out out.webp
      </span>
      <span className="ml-auto shrink-0 text-dim transition-colors group-hover:text-accent-soft">
        {copied ? <span className="text-ok">{t('hero.copied')}</span> : '⧉'}
      </span>
    </button>
  )
}
