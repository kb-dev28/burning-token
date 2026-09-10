# Burn fAIke

**The AI-Powered Conspiracy & Viral Rumor Trace Engine.**

Click a rumor. The app traces where it started, how it mutated, and how spicy it looks. It is a **context engine**, not a judge of truth: you get sources and a Paranoia Meter, not a single verdict.

Anyone can open it. There is no login.

## Live demo

**https://burn-faike.vercel.app** — no login.

[Burning Token project form](https://app.burningtoken.dev/dashboard/projects/dbe481c5-7c32-49f2-a897-bdbf8163f2fc/edit)

## What judges should click

1. **NERDCONF card** — banner `YES! 100% FACTUALLY VERIFIED` plus the `i` disclaimer. No web search, no model call.
2. **Avocado pits card** — wait ~10–40s. Paranoia Meter, trace summary, Evidence Board (sources by layer), research trail **V1 → V2 → V3**, latency and tokens.
3. **Whisper-to-router Wi-Fi card** — the honest fail: the product still returns a result, but it can invent an origin story and look too sure. That is the Nebius eval case, not a crash.

Paste any other rumor in the input if you want a custom trace.

## Tracks

| Track | What this app actually does |
| --- | --- |
| **Deep Research · Linkup** | Every research path search goes through Linkup. Findings are saved. Gaps drive the next query (max 3 rounds). The trail shows query + why. |
| **Applied AI · Nebius Token Factory** | The main synthesis (score, summary, cites, uncertainty) runs on Token Factory. Keys stay on the server. Screen shows latency and tokens. Eval set: 4 seeds, including one that fails. |
| **Fun Build · NERDCONF** | Zero-friction cards, Paranoia Meter labels, and the NERDCONF easter egg. |

Not in this MVP: RevenueCat, Convex, Render, auth, wallets, or onchain.

## How a trace works

```
card or pasted claim
        │
        ▼
NERDCONF easter egg?  yes → banner only (no Linkup, no Nebius)
        │ no
        ▼
Linkup search → store findings → missing gaps → next query  (≤3 rounds)
        │
        ▼
Nebius reads ONLY saved findings
        │
        ▼
Paranoia Meter + summary + Evidence Board + trail + latency/tokens
```

The model is not allowed to invent URLs. Citations whose URL is not in the research pack are dropped.

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

`NEBIUS_BASE_URL` must be the `/v1/` root. Do **not** paste `.../chat/completions` — the OpenAI client already appends that path.

```bash
npm run dev
```

Open http://localhost:3000

## Eval snapshot (2026-09-10)

Measured on localhost `POST /api/intake`. Accuracy = whether `citations` introduced a URL that was not in Linkup findings. Cost is an estimate from public Token Factory / OpenRouter list prices, not the dashboard invoice.

| # | Claim | Invented citation URLs? | Time-to-trace | Tokens in/out | Notes |
| --- | --- | --- | --- | --- | --- |
| 1 | Avocado pits / microwave | No (`citations: []`) | 12.55 s | 3466 / 579 | Score 35. Useful, but origin of *this* myth is weak. |
| 2 | National holiday this Friday | No (`citations: []`) | 12.79 s | 3413 / 572 | Score 42. Fills a country-less rumor with US results. |
| 3 | NERDCONF handsome developers | n/a | 0.01 s | 0 / 0 | Easter egg bypass. |
| 4 | Whisper to the router for faster Wi-Fi | No (`citations: []`) | 13.88 s | 3782 / 551 | **Fails honestly:** score 92, empty uncertainty, invented origin narrative. |

Research totals (1+2+4): ~39 s, ~10.7k in / 1.7k out. NERDCONF does not count.

## Limits (say these in the demo)

- Structured `citations` often stay empty even when the Evidence Board has 20+ Linkup findings. Usable output is **score + summary + board + trail**.
- Case 4 still runs and looks confident. That is the intended Nebius failure, not a 404.
- Findings persist per job (`/tmp` on Vercel). There is no user history across sessions.
- Keys never go to the browser or to git.

## Stack

Next.js (App Router) · Linkup SDK · Nebius Token Factory (OpenAI-compatible) · Tailwind.
