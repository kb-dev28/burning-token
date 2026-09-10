# Burn fAIke

**The AI-Powered Conspiracy & Viral Rumor Trace Engine.**

Click a rumor. Burn fAIke researches where it may have started, how it mutated as it spread, and what the available evidence looks like.

It is a **context engine, not a truth judge**: instead of forcing a single true/false verdict, it gives you a research trail, sources, uncertainty, contradictions, and a **Paranoia Meter**.

Anyone can try it. **No login required.**

## Live Demo

**https://burn-faike.vercel.app** — no login.

**[Burning Token project](https://app.burningtoken.dev/dashboard/projects/dbe481c5-7c32-49f2-a897-bdbf8163f2fc/edit)**

---

## What judges should click

For the fastest demo, try these three cards:

### 1. NERDCONF card

The **NERDCONF easter egg** immediately shows:

> **YES! 100% FACTUALLY VERIFIED**

It intentionally bypasses web research and model inference. Click the `i` icon to see the disclaimer.

### 2. Avocado pits card

Wait approximately **10–40 seconds** for the research trace.

You will see:

* Paranoia Meter
* Trace Summary
* Evidence Board
* Sources grouped by research layer
* Research trail: **V1 → V2 → V3**
* Latency
* Token usage

This is the main **Linkup + Nebius** path.

### 3. Whisper-to-router Wi-Fi card

This is the intentionally difficult evaluation case.

The product still returns a result, but the model can become too confident and produce an unsupported origin narrative.

This is shown deliberately as a **failure case**, not hidden as a crash.

You can also paste any other rumor into the input for a custom trace.

---

## Tracks

| Track                                 | How Burn fAIke uses it                                                                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Deep Research · Linkup**            | Every research search goes through Linkup. Findings are stored, gaps influence the next query, and the research trail shows the queries and why they were made.             |
| **Applied AI · Nebius Token Factory** | Nebius performs the main synthesis from the saved research pack: paranoia score, summary, citations, uncertainty, and contradictions. Latency and token usage are measured. |
| **Fun Build · NERDCONF**              | A playful zero-friction interaction with rumor cards, the Paranoia Meter, and a NERDCONF easter egg.                                                                        |

### Not part of this MVP

RevenueCat, Convex, Render, authentication, wallets, and onchain functionality are **not used**.

---

## How a trace works

```text
card or pasted claim
        │
        ▼
NERDCONF easter egg?
        │
   yes  │  no
        ▼
banner only          Linkup search
(no web, no AI)           │
                          ▼
                   store findings
                          │
                          ▼
                     find gaps
                          │
                          ▼
                  follow-up search
                     (max 3 rounds)
                          │
                          ▼
              Nebius reads ONLY the
               saved research pack
                          │
                          ▼
          score + summary + citations
          uncertainty + contradictions
                          │
                          ▼
        Paranoia Meter + Evidence Board
        research trail + latency/tokens
```

The research process is intentionally separated from synthesis:

**Linkup researches. Nebius synthesizes.**

Nebius does not perform its own web searches. It receives only the findings collected during the Linkup research process.

The application also validates citations after inference: if a citation URL does not exist in the saved research findings, it is discarded.

---

## Deep Research with Linkup

Burn fAIke uses Linkup as the web research layer.

A research trace can run up to **three rounds**:

| Round  | Purpose                                   | Example                               |
| ------ | ----------------------------------------- | ------------------------------------- |
| **V1** | Find the possible origin / first mentions | `"{claim}" origin OR "first mention"` |
| **V2** | Investigate mutation and recirculation    | Search gaps found in V1               |
| **V3** | Check evidence and counter-evidence       | Studies, official sources, debunks    |

The application stores findings from each round and uses the gaps in the current research pack to determine what to investigate next.

The UI exposes this process as a **Research Trail**, so the user can see:

* What was searched
* Which round it belonged to
* Why another search was triggered
* Which sources were found

The goal is not simply to retrieve links, but to show how the research evolves.

---

## Applied AI with Nebius Token Factory

Nebius Token Factory performs the main synthesis step.

The model receives the saved research findings and produces a structured result:

```text
paranoia_score       0–100

paranoia_label       0   Boring Official Fact
                     50  Unverified Internet Gossip
                    100  Pure Underground Conspiracy

trace_summary        2–4 sentences covering
                     origin, mutation and plausibility

citations            [{ url, why }]
                     only URLs found in the research pack

uncertainty           what could not be confirmed

contradictions        conflicts between sources
```

The application also records:

* Time-to-trace
* Input tokens
* Output tokens

API keys remain server-side and are never exposed to the browser.

---

## NERDCONF Fun Build

Burn fAIke includes a deliberately absurd NERDCONF easter egg.

For the claim:

> **Are the nerds at NERDCONF the most handsome developers in the world?**

the app skips research and displays:

> **YES! 100% FACTUALLY VERIFIED**

with an information disclaimer explaining that this is a subjective local override.

This interaction is intentionally separate from the research pipeline: **zero Linkup searches and zero Nebius inference are performed.**

---

## Evaluation Snapshot

**Measured on September 10, 2026**

Measurements were taken locally through:

```text
POST /api/intake
```

For this evaluation, **citation accuracy** means whether the final `citations` field introduced a URL that was not present in the Linkup research findings.

Cost is an estimate based on public Token Factory / OpenRouter list prices, not the dashboard invoice.

| # | Claim                                  | Invented citation URLs? | Time-to-trace | Tokens in / out | Notes                                                                               |
| - | -------------------------------------- | ----------------------- | ------------- | --------------- | ----------------------------------------------------------------------------------- |
| 1 | Avocado pits / microwave               | No (`citations: []`)    | 12.55 s       | 3466 / 579      | Score 35. Useful research, but the origin of this specific myth remains weak.       |
| 2 | National holiday this Friday           | No (`citations: []`)    | 12.79 s       | 3413 / 572      | Score 42. The country is unspecified, so the research can fall back to US results.  |
| 3 | NERDCONF handsome developers           | N/A                     | 0.01 s        | 0 / 0           | Easter egg bypass.                                                                  |
| 4 | Whisper to the router for faster Wi-Fi | No (`citations: []`)    | 13.88 s       | 3782 / 551      | **Failure case:** score 92, empty uncertainty, and an unsupported origin narrative. |

### Research totals

Across the three research cases:

* **~39 seconds total**
* **~10.7k input tokens**
* **~1.7k output tokens**

The NERDCONF easter egg is excluded from research totals because it does not call Linkup or Nebius.

---

## Known Limitations

This is an MVP, and the limitations are intentionally visible.

### 1. Structured citations can be empty

The `citations` field can remain empty even when the Evidence Board contains **20+ Linkup findings**.

The most useful output in the current MVP is therefore:

**score + summary + Evidence Board + research trail**

rather than the structured citation field alone.

### 2. The failure case can look confident

The Wi-Fi whisper case demonstrates an important limitation: the model can produce a high score and a confident-sounding narrative even when the evidence does not support the claimed origin.

The application does **not** hide this result.

### 3. No cross-session history

Findings are persisted per research job using temporary server storage.

There is no user account and no persistent user history across sessions.

### 4. Research scope

The application performs up to three research rounds. If an origin cannot be established from the available web evidence, the result can remain uncertain.

### 5. No single truth verdict

The Paranoia Meter is a contextual signal about the claim and its research trail.

It is **not a scientific probability of truth**.

---

## Security

* API keys stay on the server.
* Keys are never sent to the browser.
* Real keys are stored in `.env.local`.
* `.env.local` is excluded from git.
* Nebius does not receive unrestricted web access.
* The model cannot introduce arbitrary citation URLs into the final result; citations are filtered against the research pack.

---

## Run Locally

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env.local
```

Fill in:

```env
LINKUP_API_KEY=
NEBIUS_API_KEY=
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
NEBIUS_MODEL=
```

`NEBIUS_BASE_URL` must point to the `/v1/` root.

Do **not** add:

```text
/chat/completions
```

The OpenAI-compatible client appends that path automatically.

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

---

## Tech Stack

* **Next.js** — App Router
* **Linkup SDK** — web research
* **Nebius Token Factory** — AI inference and synthesis
* **Tailwind CSS** — UI

---

## MVP Architecture

```text
User
 │
 ├── Rumor card
 │
 └── Custom claim
        │
        ▼
     Intake
        │
        ├── NERDCONF → Easter egg
        │                └── no API calls
        │
        └── Research
                │
                ▼
             Linkup
                │
                ▼
          Saved findings
                │
                ▼
          Gap detection
                │
                ▼
        Follow-up search
           (≤ 3 rounds)
                │
                ▼
       Research pack
                │
                ▼
        Nebius Token Factory
                │
                ▼
      Structured synthesis
                │
                ▼
      Citation validation
                │
                ▼
       Burn fAIke result
```

---

## The Core Idea

Most rumor tools try to answer:

**“Is this true?”**

Burn fAIke asks a different question:

**“How did this rumor get here, what happened to it along the way, and what does the available evidence actually show?”**

That makes the research process itself part of the product.
