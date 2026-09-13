# Burn fAIke

**Trace a rumor before it moves a price.**

Burn fAIke is an AI-powered rumor tracing agent for trading desks.

Instead of returning a simple **true/false** answer, it reconstructs a claim's research trail:

* Where the claim may have originated
* How it may have mutated or recirculated
* What evidence supports or contradicts it
* What remains uncertain
* How suspicious the overall trail looks

The result is a **provenance trail**, not a claim of absolute truth.

## Live Demo

[**Open Burn fAIke**](https://kb-dev28.github.io/burnfaike-front/)

No login required.

### Recommended demo flow

For the clearest demonstration of the product:

1. **GameStop / Reddit** — see how a market-moving narrative can be traced across sources.
2. **Tesla / “Funding Secured”** — see a financial claim with a clearer historical evidence trail.
3. **Bitcoin / China mining rumors** — see a more ambiguous case where uncertainty matters.
4. **NERDCONF** — try the deliberately absurd easter egg.
5. Or paste your own rumor.

## How it works

```text
Claim
  │
  ▼
Linkup web research
  │
  ▼
Save findings
  │
  ▼
Detect research gaps
  │
  ▼
Follow-up searches
  │
  ▼
Research Pack
  │
  ▼
Nebius Token Factory
  │
  ▼
Structured synthesis
  │
  ├── Paranoia Score
  ├── Summary
  ├── Uncertainty
  └── Contradictions
  │
  ▼
Evidence Board + Research Trail
```

The key design choice is the separation between **research and synthesis**:

> **Linkup researches. Nebius synthesizes.**

Nebius does not perform independent web searches. It receives only the findings collected by the Linkup research process. Citation URLs are also validated against the saved research findings.

## Deep Research with Linkup

Each trace can run up to **three research rounds**:

| Round  | Goal                                      |
| ------ | ----------------------------------------- |
| **V1** | Find the possible origin / first mentions |
| **V2** | Investigate mutation and recirculation    |
| **V3** | Check evidence and counter-evidence       |

The UI exposes the process as a **Research Trail**, showing what was searched, why another search was triggered, and what sources were found.

## Applied AI with Nebius

Nebius Token Factory receives the saved research pack and produces a structured synthesis containing:

* **Paranoia Score:** 0–100
* **Trace Summary**
* **Citations**
* **Uncertainty**
* **Contradictions**

The application also measures **time-to-trace** and token usage.

### Paranoia Meter

The score is a contextual signal about the claim and its research trail:

```text
0    Boring Official Fact
50   Unverified Internet Gossip
100  Pure Underground Conspiracy
```

It is **not a scientific probability of truth**.

## Built for the hackathon tracks

| Track                                 | Implementation                                                                                        |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Deep Research · Linkup**            | Multi-round web research, stored findings, gap-driven follow-up queries and visible research trail    |
| **Applied AI · Nebius Token Factory** | Structured synthesis from the research pack, including score, summary, uncertainty and contradictions |
| **Fun Build · NERDCONF**              | Rumor cards, Paranoia Meter, fast interactions and a deliberately absurd easter egg                   |

## NERDCONF Easter Egg

For the intentionally ridiculous claim:

**“Are the nerds at NERDCONF the most handsome developers in the world?”**

Burn fAIke returns:

> **YES! 100% FACTUALLY VERIFIED**

This is a local easter egg. It intentionally skips both Linkup and Nebius and displays a disclaimer explaining that it is a subjective override.

## Evaluation

Measured locally on **September 10, 2026**:

| Claim                    |   Time | Score | Result                                    |
| ------------------------ | -----: | ----: | ----------------------------------------- |
| Avocado pits / microwave | 12.55s |    35 | Useful research; origin remains uncertain |
| National holiday         | 12.79s |    42 | Country ambiguity affected the research   |
| NERDCONF                 |  0.01s |   100 | Easter egg, no API calls                  |
| Wi-Fi whisper            | 13.88s |    92 | **Intentional failure case**              |

Across the three research cases:

* **~39 seconds total**
* **~10.7k input tokens**
* **~1.7k output tokens**

The evaluation also exposed an important limitation: the model can produce a confident narrative when the evidence does not support the claimed origin. Burn fAIke deliberately shows this instead of hiding it.

## Known limitations

This is an MVP, and its limitations are intentionally visible.

* Structured citations can be empty even when many Linkup findings were retrieved.
* The model can sometimes sound more confident than the evidence justifies.
* Research is limited to up to three rounds.
* There is no cross-session user history.
* The Paranoia Meter is **not a truth probability**.

The current MVP therefore emphasizes the combination of:

**Score + Summary + Evidence Board + Research Trail**

rather than relying on a single verdict.

## Security

* API keys stay server-side.
* Keys are never exposed to the browser.
* Nebius receives the saved research pack rather than unrestricted web access.
* Citation URLs are filtered against the research findings.

## Tech Stack

* **Vite + React** — public 1-bit interface
* **Next.js** — API / research orchestration
* **Linkup SDK** — web research
* **Nebius Token Factory** — AI synthesis

## Why Burn fAIke?

Most rumor tools ask:

**“Is this true?”**

Burn fAIke asks:

**“How did this rumor get here, what happened to it along the way, and what does the available evidence actually show?”**

For trading desks, the goal is not another binary verdict. It is to understand the **provenance, evidence and uncertainty behind a claim before it can influence a market.**

## Built by

**Karm** — Engineering, backend, research pipeline and AI integration

**Gauthier De Williencourt** — UI/UX Design

GitHub: [Karm's GitHub](https://github.com/kb-dev28)

Design: [Gauthier's GitHub](https://github.com/GauthierDeWilliencourt/burnfaike-front)

Live demo: [Burn fAIke](https://kb-dev28.github.io/burnfaike-front/)
