import { motion } from 'motion/react'
import { rise, viewportOnce } from '../lib/anim'

export default function SectionTitle({
  kicker,
  title,
  sub,
  index,
}: {
  kicker: string
  title: string
  sub?: string
  index?: string
}) {
  return (
    <motion.div
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      className="max-w-3xl"
    >
      <p className="flex items-center gap-3 font-mono text-xs tracking-[0.3em] text-dim uppercase">
        {index && <span className="text-accent-soft">{index}</span>}
        <span className="text-accent">◢</span> {kicker}
      </p>
      <h2 className="crop-mark mt-4 inline-block font-display text-3xl font-black tracking-[-0.02em] text-fg sm:text-5xl">
        {title}
      </h2>
      {sub && <p className="mt-5 text-sm leading-7 text-soft">{sub}</p>}
    </motion.div>
  )
}
