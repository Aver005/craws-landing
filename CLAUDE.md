# CLAUDE.md

Guidance for Claude Code (and any agent) working in this repository.

## What this is

The marketing landing page for **Craws** (`E:\Projects\Me\craws`) — a
blazing-fast, automation-first image editor for developers, written in Rust
(🦀🎨 "claws + draws"). This repo is the *website about it*, not the engine.
One page, no routing, no backend, no state library.

The guiding idea: the PoopRusteek landing is "the TUI, but a webpage"; **this
is "the craws editor, but a webpage."** The page's form is the product's form —
an app menubar on top, an editor status **dock** on the bottom, and a hero that
is a real editor window running a pipeline on a real photo. Aesthetic is a
**darkroom**: amber claws on charcoal, film grain, warm light leaks, editorial
serif type. Do not regress it toward a generic marketing scroll or the sibling
site's terminal look.

Stack: **Bun** (runtime + package manager — never npm/pnpm/yarn), **Vite**,
**React 19 + TypeScript (strict)**, **Tailwind v4** (CSS-first `@theme` in
`src/index.css`, no tailwind.config), **Motion** (`motion/react`), **i18next**
(en/ru), **oxlint**.

```sh
bun install
bun dev              # http://localhost:5173/craws/
bun run build        # tsc -b && vite build → dist/
bun run preview      # serves dist/ at http://localhost:4173/craws/
bun run lint         # oxlint (no output = clean)
```

## Invariants — break these and the site breaks

1. **`base: '/craws/'` in `vite.config.ts` must equal the deploy slug.** The
   site is served by aaaver-app from `sites/craws/` at `aaaver.ru/craws/`. Dev
   and preview URLs also live under `/craws/` — `localhost:5173/` alone 404s.
2. **The palette is craws' own brand, not invented.** Amber `#F2A93B` claws on
   charcoal `#14161C` — lifted from the project's icon generator
   (`craws/scratchpad/gen_icons.py`) and its M2 frontend spike. All tokens live
   in `src/index.css` `@theme` (`ink/panel/panel-deep/panel-hi/fg/accent×3/
   line/dim/soft/ok/warn/err/sel` + `chan-r/g/b`). New UI uses existing tokens.
3. **Three fonts, each with a job.** `Fraunces Variable` (display serif) for
   headlines + the CRAWS masthead; `Hanken Grotesk Variable` for body prose;
   `JetBrains Mono Variable` for everything technical (op JSON, params, numbers,
   hashes, badges). **Never** swap in Inter/Roboto/system fonts.
4. **Numbers are real criterion benches — never invent perf claims.** The ones
   in use (all 24MP, release; from `craws/.memories/STATE.md`): resize
   323→54 ms (6×), jpeg encode 910→375 ms (2.4×), 4-step chain 85→11.8 ms warm,
   cached op 85 µs, exposure cold 49 ms, CLI end-to-end 336 ms, tile 256²,
   cache blake3 Merkle 2 GiB LRU, 71 tests / clippy 0. If craws' numbers change,
   re-read the source and update — don't guess.
5. **Real product strings are verbatim; only prose is translated.** Op JSON,
   CLI commands, node/tool names, timing labels, filenames, badges stay
   hard-coded in components (they're the product). Marketing prose lives in
   `src/i18n/locales/{en,ru}.ts`; `ru` is typed `typeof en`, so a new key fails
   the build until translated.
6. **Every JS-timer animation respects reduced motion.** Global
   `MotionConfig reducedMotion="user"` (main.tsx) covers Motion components;
   `setTimeout`/`setInterval` loops (the Editor script, Pipeline cache loop, Ops
   cycler, the dock spinner) each guard with `useReducedMotion()` and seed to a
   sensible static end-state. CSS backdrop animations are killed via the
   `prefers-reduced-motion` block in `index.css`.
7. **No horizontal overflow on mobile.** This page's #1 regression risk. Any
   single-line/mono content in a flex/grid track needs `min-w-0` + `truncate`
   (or `overflow-x-auto` on the container). The node graph, the editor node
   strip, and long op signatures already scroll internally — keep it that way.

## Repo map

- `src/App.tsx` — composition: `Backdrop → Menubar → main[Hero, Bench, Ops,
  Pipeline, Ports] → Footer → StatusBar`. Root carries `.darkroom` (grain +
  vignette overlays) and bottom padding for the floating dock.
- `src/index.css` — all theming: `@theme` tokens + 3 fonts, `.darkroom`
  grain/vignette, `.checker` (transparency ground), `.crop-mark`, keyframes
  (`blink`, `drift`, `drift-slow`, `scan`), reduced-motion block.
- `src/lib/anim.ts` — shared `rise`/`stagger` variants, `viewportOnce`,
  `GITHUB_URL` (`https://github.com/Aver005/craws`).
- `src/assets/sample.webp` — the demo photo the editor grades (a warm café
  portrait, 720×1080). The only image asset; everything else is CSS/SVG/Motion.
  `photo-source.jpg` is the un-optimized original, not shipped.
- `src/components/`
  - `Backdrop.tsx` — fixed darkroom atmosphere: drifting warm/cool light leaks,
    faint checkerboard, a slow amber tile-scan band. No static grid.
  - `Menubar.tsx` — app menubar (section menu, open-doc tab `IMG_2153.webp`,
    lang switch, GitHub).
  - `Hero.tsx` — asymmetric editorial masthead (serif `CRAWS` wordmark +
    exposure ruler) + tagline/desc/CTA + the Editor framed as `fig.01`.
  - `Logo.tsx` — the Fraunces amber-wave `CRAWS` wordmark.
  - `Editor.tsx` — **the centerpiece.** A cinematic editor window running a
    pipeline on the real photo: tool rail, canvas (tiles flash where the cache
    misses, `draw_ellipse` annotation, crop marquee), inspector with a live
    exposure slider, node strip, and a histogram **computed from the actual
    pixels**. The whole demo is the `PHASES` array — edit it to change the
    script; keep op names/params and timings real. Loops; reduced-motion shows
    the final phase.
  - `Bench.tsx` — criterion before/after benchmark bars (proof over vibes).
  - `Ops.tsx` — the 10 ops as a master–detail inspector (tool list + selected
    op's signature/description), auto-cycling, pauses on hover.
  - `Pipeline.tsx` — the content-hash cache as an animated node graph (edit one
    node → its blake3 key + downstream restamp; upstream stays cached).
  - `Ports.tsx` — architecture diagram: `domain ← engine ← adapters`, four
    equal ports (GUI · CLI · CI · MCP).
  - `SectionTitle.tsx` — shared editorial kicker (`NN ◢ kicker`) + display
    headline with crop-marks. Pass `index` for the section number.
  - `Footer.tsx` — CTA + colophon.
  - `StatusBar.tsx` — the floating glassy editor **dock** (mini tool palette,
    scroll-driven render meter, `[warm]`). NOT a full-width terminal bar.

## Verifying changes

No tests; verification is visual.

1. `bun run build` (tsc catches type errors) and `bun run lint`.
2. `bun run preview` in the background, drive it with Playwright/chrome-devtools
   MCP at `http://localhost:4173/craws/`.
3. Check desktop (1440×900) and mobile (390×844). On mobile always run the
   horizontal-overflow probe at several scroll positions —
   `document.documentElement.scrollWidth > clientWidth` must be `false`.
   Reveal-on-scroll (`whileInView`) content only appears after real scrolling,
   so a full-page screenshot shows those sections blank — scroll to each section
   before judging it.
4. If no browser MCP is available, say so plainly (don't claim visual
   verification you didn't do) and fall back to a careful static review.

## Deploying

CI/CD is the primary path. `.github/workflows/demo.yml` (triggers on `develop`)
calls the reusable `Aver005/aaaver-app/.github/workflows/site-release.yml`,
which runs `bun install --frozen-lockfile && bun run build`, tars `dist/` into
`dist.tar.gz`, and uploads it to a rolling `latest` release. The server's
`sites-updater` polls that release and pulls the fresh build — no manual step.

**Prerequisite (one-time, in the host repo, not here):** the slug must be
registered in `aaaver-app/sites.config.json`:
`"craws": { "repo": "github:Aver005/craws-landing" }`. As of writing only
`pooprusteek` is listed there — add `craws` (or ask the owner to) or the updater
won't pull it. Don't edit aaaver-app without being asked.

Manual fallback (atomic, no restart):

```bat
cd E:\Projects\Me\aaaver-app
deploy-site.bat craws E:\Projects\Me\craws-landing\dist
```

Live check: `https://aaaver.ru/api/sites` lists mounted slugs.

## Conventions

- One file per section in `src/components/`, default export, local helpers below
  it in the same file.
- Reveal-on-scroll: shared `rise`/`stagger` variants with `viewport={viewportOnce}`.
- Commits are the user's job; don't `git commit`/`git push` unless asked.
- Keep the identity: this is the craws editor as a webpage. Before adding a
  section, ask what editor/engine surface it maps to — don't bolt on a generic
  marketing block.
```
