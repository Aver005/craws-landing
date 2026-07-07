import type { Variants } from 'motion/react'

export const GITHUB_URL = 'https://github.com/Aver005/craws'

export const rise: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}

export const viewportOnce = { once: true, margin: '-80px' } as const
