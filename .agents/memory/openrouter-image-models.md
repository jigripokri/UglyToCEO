---
name: OpenRouter image-generation catalog
description: Which image models OpenRouter actually serves, and how image generation requests/responses are shaped.
---

# OpenRouter image generation

**Rule:** Always confirm image model slugs against OpenRouter's live catalog before wiring them up — the catalog changes and many "famous" image models are NOT served through OpenRouter's image API.

**Why:** The `/lab` feature was originally specced with FLUX.2 [flex], Seedream 4.5, and Grok Imagine. None of those were available through OpenRouter's image-output API at build time — only Google Gemini image models and OpenAI GPT image models were. Hardcoding the spec's slugs would have produced all-failing tiles.

**How to check (no auth needed):**
`GET https://openrouter.ai/api/v1/models`, then filter for models whose `architecture.output_modalities` includes `"image"`. For face-preserving edits also require `input_modalities` to include `"image"`.

**Request/response shape for image generation:**
- POST `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer $OPENROUTER_API_KEY`.
- Body: `{ model: <slug>, modalities: ["image","text"], messages: [{ role:"user", content: [{type:"text",text:prompt}, {type:"image_url", image_url:{url:"data:<mime>;base64,<b64>"}}] }] }`.
- Output image is at `choices[0].message.images[0].image_url.url` as a `data:` URL — strip the prefix to get raw base64.
- If the model returns only text (no image), surface `message.content` as the error so the user sees why.

**Hanging models / fan-out resilience:**
- A model slug being present in OpenRouter's catalog does NOT mean it returns an image. Some accept the request and hang indefinitely with no response and no error (observed with `openai/gpt-5.4-image-2`).
- Every per-model fetch MUST have an AbortController timeout. Without one, a single hanging model blocks `Promise.all` forever, so a batched (single-response) fan-out leaves the whole UI stuck "loading" — symptom looks like "images not loading" even though other models succeeded.
- A timeout alone isn't enough UX-wise for a consistently-hanging model in a batched response: the user still waits the full timeout every run. Drop confirmed-broken slugs from the registry and keep the timeout only as a safety net.

**Progressive loading (Lab):** The Lab page fires one `/api/lab/compare` request per model in parallel (single-element `modelIds`) and updates each card as its own request resolves, instead of one batched request gated by the slowest model. Tradeoff: the input photo is uploaded once per model. If upload cost ever matters, switch to a single request that streams per-model results (SSE) rather than reverting to a blocking batch.
