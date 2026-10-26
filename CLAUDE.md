# Ugly to CEO — working notes

AI headshot generator. React 19 + Vite + Tailwind v4 on the client, Express + tsx on the
server, Neon/Postgres via Drizzle, Google Gemini for image generation.

Live: https://ugly2ceo.stickywicketlabs.com/ — deployed from Replit, which syncs from
GitHub `main`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Express on :5000 with Vite middleware. Serves API *and* client. |
| `npm run build` | Vite → `dist/public`, esbuild → `dist/index.cjs`. |
| `npm run start` | Runs the production bundle. |
| `npm run check` | `tsc`, no emit config — type check only. |
| `npm run db:push` | Drizzle push. **Points at whatever `DATABASE_URL` is set.** |

Preview during a Claude Code session: `.claude/launch.json` defines the `ugly2ceo` server,
so the `preview_start` tool boots it on :5000.

## Gotchas

**The dev server does not watch server files.** `tsx` runs without `--watch`. Edits under
`server/` need a restart. Client `.tsx`/`.css` edits hot-reload through Vite.

**Windows.** Two things were fixed to make this repo run outside Replit's Linux box, and
both must stay cross-platform:
- `npm` runs scripts through `cmd.exe` on Windows, which can't parse a `NODE_ENV=x cmd`
  prefix. The `dev` script uses `cross-env`. Don't revert it to a bare prefix.
- `httpServer.listen({ reusePort: true })` throws `ENOTSUP` on Windows sockets. It's now
  gated on `process.platform !== "win32"` in `server/index.ts`.

**`server/db.ts` throws at import time if `DATABASE_URL` is unset**, and it's on the
startup path (`index.ts` → `routes.ts` → `storage.ts` → `db.ts`). So the server will not
boot without one. A syntactically-valid placeholder is enough for all UI work — Neon's
`Pool` connects lazily. Only `/analytics`, `/evals`, and analytics logging need a real DB.

## Environment

Copy `.env.example` → `.env` (gitignored) and fill it in from the Replit **Secrets** pane.
The dev script loads it via `--env-file-if-exists=.env`, which is a no-op on Replit where
Secrets are injected as real env vars.

- `DATABASE_URL` — required to boot.
- `GOOGLE_API_KEY_HH` — required for `POST /api/transform`.
- `OPENROUTER_API_KEY_U2C` — required only for `/lab`.

If `.env` holds the **production** `DATABASE_URL`, then local transforms write real rows
into `analytics_logs`, and `npm run db:push` will migrate the live database. Treat both as
production actions.

## Workflow

`main` is what Replit deploys, so it stays deployable.

1. `git checkout -b <branch>`
2. Edit, preview on :5000, verify.
3. `npm run check` and `npm run build` before pushing — Replit's deploy runs `build`, and a
   type error there fails the deploy, not the push.
4. `git push -u origin <branch>` and `gh pr create`.
5. Merge the PR.
6. In Replit: pull from GitHub, then **Deploy**.

## Redesign

`design/` holds files exported from the Claude Design project *"Headshot generator
redesign"* (`10d36bf5-2869-4ec0-a5f1-1765571311e6`), pulled with the `DesignSync` tool.

They are **reference, not source**. They're in Claude's DesignComposer format — `<x-dc>`,
`<sc-if>`, `<dc-import>`, `{{ }}` bindings, `<image-slot>` placeholders — which does not
run in this app. Port them into React components; never copy the markup wholesale.

The redesign is a dark, gold-on-near-black landing page. The live app is a light "clean
studio" palette. The difference is almost entirely design tokens:

- Colors live as HSL triplets in `:root` in `client/src/index.css`, surfaced to Tailwind
  through `@theme inline`. Retheming is mostly editing those variables.
- Fonts are linked in `client/index.html` and aliased as `--font-sans` / `--font-display`.
  Today: Inter + Cormorant Garamond. The design calls for Bricolage Grotesque, Space
  Grotesk, Space Mono, and Caveat.

The design also introduces a **$10 checkout/paywall flow** (`design/BuyModal.dc.html`)
that has no backend behind it. Its own copy labels it "Prototype checkout." Shipping it
needs a real payment integration — it is not a styling change.
