import { useEffect, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

// Not a terminal footer — a floating editor dock. A mini tool palette, a
// render meter driven by scroll, and the warm-cache badge, in a glassy pill
// that hovers above the bottom edge like a real app's toolbar.
const DOCK_TOOLS = ['⤢', '◐', '⌗', '◯', '↗']

export default function StatusBar() {
  const { scrollYProgress } = useScroll()
  // Render the % straight from the scroll MotionValue — Motion writes it to the
  // DOM text node itself, so scrolling no longer fires a React re-render/frame.
  const pctText = useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2.5 rounded-full border border-line bg-panel/85 px-3 py-1.5 shadow-[0_12px_44px_-12px_rgba(0,0,0,0.8)] backdrop-blur-sm sm:gap-3">
        <span className="hidden font-mono text-[11px] text-accent-soft sm:inline">
          craws
        </span>

        {/* mini tool dock */}
        <div className="hidden items-center gap-0.5 sm:flex">
          {DOCK_TOOLS.map((g, i) => (
            <span
              key={i}
              aria-hidden
              className="flex size-6 items-center justify-center rounded text-[13px] text-dim transition-colors hover:bg-panel-hi hover:text-accent"
            >
              {g}
            </span>
          ))}
        </div>

        <span className="hidden h-4 w-px bg-line sm:block" />

        {/* render meter — filled by scroll */}
        <div className="flex items-center gap-2 font-mono text-[11px] text-dim">
          <span className="hidden sm:inline">render</span>
          <div className="h-1 w-14 overflow-hidden rounded-full bg-panel-hi sm:w-20">
            <motion.div
              style={{ scaleX: scrollYProgress }}
              className="h-full origin-left rounded-full bg-accent will-change-transform"
            />
          </div>
          <motion.span className="w-8 text-right text-accent-soft tabular-nums">
            {pctText}
          </motion.span>
        </div>

        <span className="h-4 w-px bg-line" />

        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <Spinner />
          <span className="text-accent">[warm]</span>
        </span>
      </div>
    </div>
  )
}

function Spinner() {
  const FRAMES = ['◐', '◓', '◑', '◒']
  const [i, setI] = useState(0)
  const reduced = useReducedMotion()
  useEffect(() => {
    if (reduced) return
    let id: number | undefined
    const start = () => {
      if (id == null) id = window.setInterval(() => setI((v) => (v + 1) % 4), 180)
    }
    const stop = () => {
      if (id != null) {
        clearInterval(id)
        id = undefined
      }
    }
    // Don't spin (or schedule React work) while the tab is in the background.
    const onVisibility = () => (document.hidden ? stop() : start())
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduced])
  return <span className="inline-block w-[1ch] text-dim">{FRAMES[i]}</span>
}
