import { motion } from 'motion/react'

// The CRAWS masthead: set in Fraunces (a high-contrast optical serif) and
// lit by a slow amber wave (soft → amber → deep-amber → amber → soft), the
// claw-mark palette. Editorial, warm, unexpected on a dev tool — on purpose.
const WORD = 'CRAWS'
const WAVE = ['#F9CE86', '#F2A93B', '#D0821F', '#F2A93B', '#F9CE86']

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <h1
      className={`font-display font-black tracking-[-0.02em] whitespace-nowrap select-none [font-optical-sizing:auto] ${className}`}
      aria-label="Craws"
    >
      {WORD.split('').map((ch, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="inline-block"
          animate={{ color: WAVE }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
            delay: i * 0.16,
          }}
        >
          {ch}
        </motion.span>
      ))}
    </h1>
  )
}
