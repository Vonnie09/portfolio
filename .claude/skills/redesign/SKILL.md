---
name: redesign
description: Redesign Von's portfolio (new theme, colors, fonts, layout or sections) safely, compare designs side by side, and go back to a saved design like "VonDesignPart1". Use whenever the user asks to redesign, restyle, change the theme/layout/look, try a new design, compare designs, save a design, or return to VonDesignPart1 (or VonDesignPartN).
---

# Redesigning the portfolio

The portfolio is Vite + React (src/), deployed by Vercel from `main` of GitHub `Vonnie09/portfolio`
(live: https://portfolio-von-de-asis.vercel.app). Designs are saved as git tags. The first one is
**VonDesignPart1** (commit 0e3cefb): dark space theme, 3D lanyard badge, 3D cartoon avatar, box animations.

All design housekeeping goes through `npm run design -- <command>` (scripts/design.mjs):

| Command | What it does |
|---|---|
| `list` | saved designs (tags) and design branches |
| `start <name>` | new branch `design/<name>` from main, so the live site keeps the old look |
| `save <DesignName> [--push]` | tag the current commit, e.g. `VonDesignPart2` (never overwrites) |
| `restore <DesignName>` | bring a saved design's files back, uncommitted, for review |
| `shots [DesignName]` | build it, open it in real headless Chrome, and photograph every section (desktop + phone) plus the top without 3D, into `design-shots/<name>/` |

## Workflow

1. **Before touching anything**: make sure the current look is saved (`list`; if the live design has no
   tag yet, `save` it). Then `start <name>` so the redesign happens on its own branch.
2. **Ask what they want** if it's vague: mood/colors, reference sites or screenshots, what to keep.
   Offer 2–3 concrete directions rather than an open question.
3. **Change the look in layers**, smallest first:
   - Theme: the color/font tokens in `:root` at the top of `src/styles.css` (`--bg`, `--surface`,
     `--border`, `--text`, `--muted`, `--accent`, `--accent-2`, `--radius`, `--font`, `--display`)
     and the Google Fonts link in `index.html`.
   - Layout and sections: components in `src/components/` and their order in `src/App.jsx`.
   - Content never moves out of `src/data.js` — keep using it instead of hard-coding text.
4. **Keep what already works** unless the user says to drop it: resume pop-up (`ResumeModal`),
   WhatsApp QR card, flat badge fallback + `lite` mode for browsers without WebGL (`src/perf.js`),
   reduced-motion support, mobile layout, sound toggle.
5. **Check every round** before showing the user:
   - `npm run build` passes.
   - `npm run design -- shots` and look at the pictures (each section on desktop and phone, plus `no-3d-1-home`).
   - For side by side: `npm run design -- shots VonDesignPart1` and compare the folders.
   - Hover/click details in the browser pane (`npm run dev`).
6. **Share before going live**: push the design branch (`git push -u origin design/<name>`) — Vercel
   makes a separate preview link for it. Only merge into `main` when the user says the new design is the one.
7. **When they're happy**: merge to main, then `save VonDesignPart2 --push` (next free number).

## Going back

"Go back to VonDesignPart1" → on main, `npm run design -- restore VonDesignPart1`, check it with
`npm run dev`, commit "Go back to VonDesignPart1", and push only after the user says yes. Never
force-push or reset main; restoring is always a new commit so the newer design stays in history.

## Design help

For taste and polish, load these skills when useful: `ui-ux-pro-max` (searchable styles, color
palettes, font pairings and UX rules — run its `--design-system` search to propose directions; stack
is `react`), `impeccable` (design/critique/polish),
`design-taste-frontend` (avoid a generic AI look), `animate` / `animation-performance` (motion that
stays smooth), `mobile-native` (phone feel). Keep motion cheap: the user's Chrome may run without
graphics acceleration, which is why `lite` mode exists.
