---
name: Dev server has no file watch
description: The Express/tsx dev server does not hot-reload on server-side changes
---

The `dev` script runs `tsx server/index.ts` with NO `--watch` flag, so changes to
server-side code (`server/*.ts`) are NOT picked up automatically.

**Why:** `replit.md` claims "tsx with hot reload and watch mode" — this is inaccurate
for the server. Only the Vite-served client has HMR.

**How to apply:** After editing any server file, restart the `Start application`
workflow before testing. Client/`.tsx` edits hot-reload via Vite and need no restart.
