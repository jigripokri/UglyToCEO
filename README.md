# Ugly to CEO

> *Professional AI-powered headshots. Studio quality, without the studio.*
> *(It even works for beautiful people.)*

---

## What is this?

You know that photo your mom took of you at Thanksgiving where you look like you just survived something? Yeah. This turns that into a headshot that makes you look like you run a series-B startup and definitely have opinions about leadership.

Upload a photo (or four — the AI appreciates the extra reference material). Pick a background color. Pick an outfit. Watch Google's Gemini model perform what can only be described as a miracle of professional costuming. Download. Update LinkedIn. Watch recruiters come out of hiding.

## Why does this exist?

Professional headshots cost $200-$500 and require you to stand in a stranger's living room while they tell you to "look natural." This costs approximately $0.03 in API calls and you can do it in your pajamas.

We built this for friends and family who needed a decent photo and couldn't justify the studio session. It turns out, everyone needs a decent photo.

## Features

- **1–4 reference photos** — More shots = better likeness. The AI is doing its best to figure out your face.
- **6 background colors** — Burgundy, Navy, Charcoal, Forest Green, Taupe, and Classic Black. All of them say "I take my career seriously."
- **8 outfit options** — From "casual knit at a startup" to "full suit, I'm meeting investors." Men's and women's styles.
- **Two AI models** — Flash (fast, great) and Pro (slower, great-er). Both will make you look like you have a 401(k).
- **Before / After comparison** — For the humbling experience of seeing how you actually look versus how the AI thinks you *should* look.
- **Analytics dashboard** — Because we track things now. We're professionals.

## How to use it

1. Open the app
2. Upload a photo of yourself (be honest, pick a clear one)
3. Choose your background vibe
4. Choose your power outfit
5. Click the button
6. Wait ~15 seconds while Gemini reimagines your professional destiny
7. Download
8. Go forth and network

## Tech stack

Built with React, Express, TypeScript, and Google Gemini's image generation API. The database is PostgreSQL because we are adults. The UI is clean and minimal because the photos deserve to be the chaotic part.

## Running it locally

```bash
npm install
npm run dev
```

You'll need a `GOOGLE_API_KEY_HH` environment variable with a Gemini API key that has image generation enabled. You'll also need a `DATABASE_URL` pointing at a PostgreSQL instance. Both of these are available if you're running this on Replit, which, you probably are.

## Caveats (the honest section)

- The AI does its best to preserve your likeness, but it is an AI, not a time machine. If you want to look like yourself, upload a clear, well-lit photo. If you want to look like a stock photo model who shares your general bone structure, also upload a clear, well-lit photo.
- Results vary. Sometimes you get a masterpiece. Sometimes you get someone who looks like your cousin. More reference photos help.
- This is not a replacement for an actual professional photographer if you're, say, running for Senate. For LinkedIn, it's fine.

## Made by

**Sticky Wicket Labs** — a very small, very informal operation that builds tools for friends and family and then decides to clean them up and share them. We enjoy good design, blunt product descriptions, and not paying $400 for headshots.

---

*"It even works for beautiful people."*
