// Source of truth for all translatable copy (English is the default locale).
// `ru.ts` is pinned to this shape — add a key here and the build fails until
// it's translated there. Craws-verbatim strings (op JSON, CLI commands, node
// names, timing labels, filenames, benchmark numbers) stay hard-coded in
// components on purpose: they're the product, not copy.
const en = {
  hero: {
    pill: 'pre-alpha — the engine, CLI and MCP server already run',
    tagline:
      'claws + draws · a blazing-fast image editor for developers, written in Rust',
    desc: 'Craws is a <hi>pipeline</hi> editor: an ordered chain of parametrized ops over a tiled, content-hash-cached, linear-light engine. Drive it from this GUI, a headless CLI, CI, or an AI agent over MCP.',
    copyTitle: 'Copy to clipboard',
    copied: '✓ copied',
  },
  bench: {
    kicker: 'proof over vibes',
    title: 'Perf claims get numbers, not adjectives.',
    sub: 'Every bar is a criterion benchmark on a 24-megapixel photo, release build. When craws grew its own resampler and a SIMD encoder, these are the numbers that moved.',
    note: 'measured · 6000×4000 · one machine — the BLAZING contract',
    before: 'before',
    after: 'after',
  },
  ops: {
    kicker: 'the toolbox',
    title: 'Ten operations. One JSON file.',
    sub: 'Every op is one line in a pipeline — composable, versionable, replayable. The same pipeline over the same input returns bit-identical pixels.',
    // One entry per op in Ops.tsx (OPS), same order.
    cards: [
      {
        title: 'Resample',
        body: 'Own separable resampler — 6× faster than the crate it replaced, with no gamma-space bleed and no dark fringing. One dimension can preserve aspect ratio.',
      },
      {
        title: 'Crop',
        body: 'Row-run copies, pixel-exact across tile boundaries. The rectangle must lie fully inside the image — no silent clamping.',
      },
      {
        title: 'Exposure',
        body: 'Photographic stops: a linear multiply by 2^stops. No clamping — HDR headroom survives all the way to the u8 export.',
      },
      {
        title: 'Grayscale',
        body: 'Rec.709 relative luminance, computed in linear light — the way it should look, not the way an sRGB average lies.',
      },
      {
        title: 'Rectangle',
        body: 'Fill, stroke, rounded corners. SDF-rasterized with 1px anti-aliasing composited in linear light; only bbox tiles recompute.',
      },
      {
        title: 'Ellipse',
        body: 'A circle when width equals height. Great for circling the exact thing you are pointing at.',
      },
      {
        title: 'Line',
        body: 'A straight segment at any thickness. The humble building block under every annotation.',
      },
      {
        title: 'Arrow',
        body: 'A segment with a V-head at the far end — the one annotation that says look here, and means it.',
      },
      {
        title: 'Overlay',
        body: 'Composite one image onto another, source-over in linear premultiplied light, at any integer offset and opacity.',
      },
      {
        title: 'Collage',
        body: 'Justified-rows layout: mixed resolutions pack into clean rows that fill the width exactly — the Flickr / Google-Photos trick.',
      },
    ],
  },
  pipeline: {
    kicker: 'the content-hash cache',
    title: 'Change one node. Recompute one node.',
    sub: 'Each step is a node keyed by the blake3 hash of its inputs and params. Edit a value and the cache works out exactly which tiles of which nodes have to run again — everything upstream is served straight from memory.',
    // One entry per STATES badge in Pipeline.tsx, same order.
    logs: [
      'cold run — every node computes every tile from scratch',
      'run it again, untouched — every hash hits, nothing recomputes',
      'edit exposure — only its hash, and its node, go stale',
      'exposure and everything downstream recompute; the resize above stays cached',
      'a four-step chain over 24 megapixels, redrawn in 11.8 ms',
    ],
  },
  ports: {
    kicker: 'one engine, four ports',
    title: 'The engine has no opinion on who calls it.',
    sub: 'domain ← engine; codecs, GPU and AI are adapters behind traits; the CLI, the MCP server and the GUI are equal ports and never know about each other.',
    // One entry per PORTS card in Ports.tsx, same order.
    cards: [
      {
        tag: 'craws-app',
        title: 'GUI',
        body: 'A Tauri 2 + React viewport. Pan and zoom run on the GPU; a slider previews in a fragment shader so the bridge stays idle — measured 165 fps, 21× the naive round-trip.',
      },
      {
        tag: 'craws',
        title: 'CLI',
        body: 'craws run pipeline.json — headless, scriptable, deterministic. Format follows the file extension; a timing report follows every run.',
      },
      {
        tag: 'no GPU',
        title: 'CI',
        body: 'The CPU path always exists. Drop craws into a pipeline and batch-process on a runner — bit-identical output makes it safe to diff.',
      },
      {
        tag: 'craws-mcp',
        title: 'MCP',
        body: '13 tools over stdio. An agent opens an image, annotates it, exports it — automated documentation figures, the killer use case.',
      },
    ],
  },
  footer: {
    title: 'One engine. Every port. No adjectives without a number.',
    blurb: 'Craws is MIT-licensed, pre-alpha, and already blazing. The perf claims are criterion benches — go run them yourself.',
    tagline:
      'Craws 🦀🎨 · claws + draws · built in Rust on tiles, blake3 and linear light',
  },
}

export default en
