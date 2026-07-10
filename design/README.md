# Design reference

Exported from the Claude Design project **"Headshot generator redesign"**
(project id `10d36bf5-2869-4ec0-a5f1-1765571311e6`) using the `DesignSync` tool.

Re-pull the latest with: *"pull the latest files from the Claude Design project into
`design/`"*.

## These files do not run

They're in Claude's DesignComposer format: `<x-dc>`, `<helmet>`, `<sc-if>`, `<dc-import>`,
`{{ }}` bindings, `<image-slot>` image placeholders, and `<script type="text/x-dc">`.
Nothing here is valid input to Vite. Treat them as a visual and copy reference and port
into React components under `client/src/`.

`support.js` and `image-slot.js` are DesignComposer runtime shims. They were deliberately
not exported — they have no meaning in this repo.

## Contents

- `Ugly to CEO.dc.html` — the landing page. Sticky nav, hero, before/after split, stats
  bar, "How it works", gallery, $10 pricing card, FAQ, final CTA, footer.
- `BuyModal.dc.html` — checkout modal with three states: form, processing, success. Its
  own copy calls it "Prototype checkout." There is no payment backend.

## Tokens

Dark palette, gold accent. No CSS custom properties in the source — the hex values are
inline, so they need transcribing into `client/src/index.css`.

| Role | Value |
| --- | --- |
| Page background | `#0f0e0c` |
| Card surfaces | `#14120d`, `#100f0d`, `#1a1814` |
| Primary accent | `#eab54e` (hover `#f3cc7d`, text-on-accent `#1a1408`) |
| Text | `#f4f1ea` primary; `#a8a29a` / `#9c968c` / `#8a847a` / `#7c766c` muted |
| Coral pill | `#f0866f` on `#2a0f08` |
| Mint pill | `#6fd0a8` on `#062a1c` |

Fonts (Google Fonts): Bricolage Grotesque (display), Space Grotesk (body), Space Mono
(mono labels), Caveat (handwritten accent).
