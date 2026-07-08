import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { GITHUB_URL } from '../lib/anim'
import { LANGS } from '../i18n'

// The page's top chrome is an editor menubar, not a website nav.
const MENU = [
  { href: '#bench', label: 'bench' },
  { href: '#ops', label: 'ops' },
  { href: '#pipeline', label: 'pipeline' },
  { href: '#ports', label: 'ports' },
]

export default function Menubar() {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-x-0 top-0 z-50 border-b border-line bg-panel/90 backdrop-blur-sm"
    >
      <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-3 text-sm">
        <a
          href="#top"
          className="flex items-center gap-2 pr-2 font-mono text-sm font-bold text-fg"
        >
          <span aria-hidden className="text-base leading-none">
            🦀🎨
          </span>
          craws
        </a>

        {/* window-menu style section links */}
        <nav className="ml-1 hidden items-center gap-0.5 sm:flex">
          {MENU.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className="rounded px-2.5 py-1 font-mono text-[13px] text-soft transition-colors hover:bg-panel-hi hover:text-accent-soft"
            >
              {m.label}
            </a>
          ))}
        </nav>

        {/* the open document, like an editor tab */}
        <div className="ml-3 hidden items-center gap-2 rounded-t border-x border-t border-line bg-panel-deep px-3 py-1 font-mono text-[11px] text-dim md:flex">
          <span className="size-2 rounded-full bg-accent" />
          IMG_2153.webp
        </div>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <LangSwitch />
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="rounded border border-line px-3 py-1 text-xs whitespace-nowrap text-accent-soft transition-colors hover:border-accent max-[350px]:px-2"
          >
            <span className="max-[350px]:hidden">★ </span>GitHub
          </a>
        </div>
      </div>
    </motion.header>
  )
}

function LangSwitch() {
  const { i18n } = useTranslation()
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex items-center overflow-hidden rounded border border-line font-mono text-xs"
    >
      {LANGS.map((l) => {
        const active = i18n.resolvedLanguage === l.code
        return (
          <button
            key={l.code}
            onClick={() => i18n.changeLanguage(l.code)}
            aria-pressed={active}
            className={`px-2 py-1 transition-colors ${
              active
                ? 'bg-sel text-accent-soft'
                : 'text-dim hover:text-accent-soft'
            }`}
          >
            {l.label}
          </button>
        )
      })}
    </div>
  )
}
