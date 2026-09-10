# Burn fAIke

The AI-Powered Conspiracy & Viral Rumor Trace Engine.

Click a rumor. The app traces where it started, how it mutated, and how spicy it looks. It is a context engine, not a judge of truth.

Hackathon tracks: **Linkup** (web research loop), **Nebius Token Factory** (synthesis + metrics), **NERDCONF** (cards + Paranoia Meter + easter egg).

## Run locally

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` (never commit real keys):

```
LINKUP_API_KEY=
NEBIUS_API_KEY=
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
NEBIUS_MODEL=
```

`NEBIUS_BASE_URL` must be the `/v1/` root, not `.../chat/completions`.

```bash
npm run dev
```

Open http://localhost:3000

## Try it

1. **NERDCONF card** → banner `YES! 100% FACTUALLY VERIFIED` and the `i` disclaimer. No web search, no model call.
2. **Avocado pits card** → wait 10–30s. You should see the Paranoia Meter, summary, Evidence Board (sources by layer), research trail (V1→V2→V3), and latency/tokens.
3. Paste any other rumor in the input.

Anyone can open the app. There is no login.

## Limits

- Keys stay on the server. Do not put them in the browser or in git.
- The model only reads saved Linkup findings. Invented URLs are dropped.
- One of the seed cards is meant to fail honestly (the Wi-Fi whisper claim).
