// The page atmosphere: a darkroom, not a grid. Two drifting warm/cool light
// leaks give depth; a faint checkerboard is the image-editor's transparency
// ground; and a slow amber band sweeps down like the engine scanning tiles.
// Everything is CSS-animated so `prefers-reduced-motion` (index.css) stills it.
export default function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* warm safelight, drifting */}
      <div className="animate-drift absolute -top-48 -left-40 h-[46rem] w-[46rem] rounded-full bg-accent/12 blur-[150px]" />
      {/* cool counter-glow */}
      <div className="animate-drift-slow absolute -right-40 -bottom-48 h-[40rem] w-[40rem] rounded-full bg-chan-b/10 blur-[160px]" />

      {/* transparency ground — barely there */}
      <div className="checker absolute inset-0 opacity-60" />

      {/* the tile-scan: a soft amber band sweeping down the frame */}
      <div className="absolute inset-x-0 -top-24 h-56 bg-[linear-gradient(to_bottom,transparent,rgba(242,169,59,0.05),transparent)] mix-blend-plus-lighter animate-scan" />
    </div>
  )
}
