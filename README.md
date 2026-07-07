<div align="center">

# 🦀🎨 craws-landing

**The landing page for [Craws](https://github.com/Aver005/craws) —
a blazing-fast, automation-first image editor for developers. Written in Rust.**

*claws + draws · tiled · content-hash cached · linear-light f32*

[![Bun](https://img.shields.io/badge/Bun-runtime-000000?logo=bun&logoColor=fbf0df)](https://bun.sh)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Motion](https://img.shields.io/badge/Motion-12-FFF42B?logo=framer&logoColor=black)](https://motion.dev)

</div>

---

## What is this

A single-page landing that sells Craws the way its sibling site sells a TUI —
by **being the product**. Where the PoopRusteek landing is "the TUI, but a
webpage", this is **"the craws editor, but a webpage"**: an app menubar on top,
an editor status bar on the bottom, and a hero that is a real editor window —
a tool rail, a **live canvas with an actual photo**, a properties inspector, a
pipeline node strip and a **histogram computed from the real pixels**. A
cinematic script drives the whole window: the exposure slider slides, the photo
re-grades in the browser, crop zooms in, grayscale desaturates, `draw_ellipse`
lands on the face — and only the affected tiles flash amber as the content-hash
cache recomputes what changed.

| Section | What it does |
|---|---|
| **Menubar** | App-style top chrome: `craws 🦀🎨`, section menu, the open document tab `IMG_2153.webp`, lang switch, GitHub |
| **Editor** (hero) | The centerpiece — a full editor window running a pipeline on a real photo: tool rail · canvas + tiles + annotation · inspector with a live exposure slider · node strip · real luminance histogram · `total 336 ms` → warm tweak `11.8 ms` |
| **`bench`** | `proof over vibes` — criterion before/after bars: resize `6×`, jpeg encode `2.4×`, cached op `580×`, warm chain `7×` |
| **`ops`** | The toolbox as a master–detail inspector: a 10-tool list on the left, the selected op's signature + description on the right |
| **`pipeline`** | The content-hash cache as the node graph it is — edit one node, its blake3 key and everything downstream restamps while the rest stays cached |
| **`ports`** | An architecture diagram: `domain ← craws-engine ← adapters`, four equal ports (GUI · CLI · CI · MCP) hanging off the engine |
| **Status bar** | Fixed bottom editor strip: `craws · engine · 720×1080 · linear-light f32 [cache 2 GiB · tiles 256²]` + scroll-as-render meter |

The demo photo (`src/assets/sample.webp`, a warm café portrait) is the only
asset — everything else is CSS, SVG and Motion. The grade the canvas shows is
the browser applying the same ops the engine does.

## Quick start

Bun only — no npm, no pnpm.

```sh
bun install
bun dev        # http://localhost:5173/craws/
```

| Script | What |
|---|---|
| `bun dev` | Vite dev server with HMR |
| `bun run build` | `tsc -b && vite build` → `dist/` |
| `bun run preview` | Serve `dist/` at `http://localhost:4173/craws/` |
| `bun run lint` | oxlint |

## Deploy

The site is hosted by **aaaver-app** (`E:\Projects\Me\aaaver-app`), a Bun
server that maps `sites/<slug>/` → `https://aaaver.ru/<slug>/`.

```
bun run build                 dist/ with base=/craws/
      │
      ▼
deploy-site.bat craws E:\Projects\Me\craws-landing\dist
      │                       scp → temp dir → atomic rename
      ▼
https://aaaver.ru/craws/       live, zero downtime, no restart
```

The one rule everything hangs on: **`base: '/craws/'` in `vite.config.ts` must
equal the slug.** Change one, change both.

## Design system

Colors are craws' own brand identity — **amber claws on charcoal** (from the
project's icon generator and its M2 frontend spike) — declared as Tailwind v4
tokens in `src/index.css` (`@theme`):

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0A0A0C` | canvas / page background |
| `panel` / `panel-deep` / `panel-hi` | `#14161C` / `#0F1015` / `#1B1E27` | charcoal surfaces + raised editor chrome |
| `fg` | `#ECEBE4` | warm off-white text |
| `accent` / `accent-dim` / `accent-soft` | `#F2A93B` / `#D0821F` / `#F9CE86` | the amber claw |
| `ok` / `warn` / `err` | `#4FD08A` / `#F2C94C` / `#F26D6D` | status / channel colors |
| `chan-r` / `chan-g` / `chan-b` | `#FF6B6B` / `#4FD08A` / `#5B8DEF` | linear-light RGB flavor |
| `line` / `dim` / `soft` / `sel` | `#262730` / `#767683` / `#A6A6B2` / `#2A2113` | chrome |

Typography: **Fraunces Variable** (a high-contrast optical serif) for display
headlines and the `CRAWS` masthead — editorial and warm, unexpected on a dev
tool; **Hanken Grotesk Variable** for body prose; **JetBrains Mono Variable**
for everything technical (op JSON, params, numbers, hashes, badges).

The page is a **darkroom**, not a document: a fixed `Backdrop` layers drifting
warm/cool light leaks, a faint transparency checkerboard and a slow amber
tile-scan beam; `.darkroom` adds film grain + a vignette over everything. The
hero masthead is deliberately asymmetric (oversized serif wordmark + an
exposure ruler that echoes the editor's slider), and the bottom chrome is a
floating glassy editor **dock**, not a terminal status bar.

Motion: [Motion](https://motion.dev) for reveals, `AnimatePresence` swaps and
scroll-linked progress. `MotionConfig reducedMotion="user"` + manual
`useReducedMotion` guards on every JS-timer animation (the Editor script, the
Pipeline cache loop, the Ops cycler and the status spinner each seed to a
sensible static end-state).

## Repo map

```
src/
├── App.tsx                  section order lives here
├── index.css                @theme tokens (3 fonts), .darkroom grain+vignette, .checker, .crop-mark, keyframes
├── assets/sample.webp       the demo photo the editor grades
├── lib/anim.ts              shared variants (rise/stagger), GITHUB_URL
├── i18n/                    en + ru, typed against en.ts
└── components/
    ├── Backdrop.tsx         fixed darkroom atmosphere (light leaks, checker, tile-scan)
    ├── Menubar.tsx          app top bar (section menu, doc tab, lang, GitHub)
    ├── Hero.tsx             wordmark + copy + install command + <Editor/>
    ├── Logo.tsx             the amber-wave CRAWS wordmark
    ├── Editor.tsx           the hero: editor window running a pipeline on a real photo
    ├── Bench.tsx            criterion before/after benchmark bars
    ├── Ops.tsx              the toolbox as a master–detail op inspector
    ├── Pipeline.tsx         the content-hash cache as an animated node graph
    ├── Ports.tsx            engine-core architecture diagram + four ports
    ├── SectionTitle.tsx     shared kicker/title/sub block
    ├── Footer.tsx           CTA + credits
    └── StatusBar.tsx        floating editor dock (mini tool palette + render meter)
```

---

<div align="center">

Built with amber, blake3, linear light, and zero adjectives without a number.

MIT ▊

</div>
