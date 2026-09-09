"use client";

import { useState } from "react";
import {
  NERDCONF_DISCLAIMER,
  SEED_CARDS,
  type SeedCard,
} from "@/lib/seed-cards";

type View =
  | { kind: "home" }
  | { kind: "easter_egg"; card: SeedCard }
  | { kind: "mock"; card: SeedCard };

export function Landing() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);

  function openCard(card: SeedCard) {
    setDisclaimerOpen(false);
    if (card.mode === "easter_egg") {
      setView({ kind: "easter_egg", card });
      return;
    }
    setView({ kind: "mock", card });
  }

  if (view.kind === "easter_egg") {
    return (
      <div className="flex flex-1 flex-col bg-zinc-950">
        <header className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => setView({ kind: "home" })}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            ← Back
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Local override
          </span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-24">
          <p className="max-w-2xl text-center text-sm text-zinc-400">
            {view.card.claim}
          </p>
          <div className="mt-8 w-full max-w-5xl rotate-[-1.5deg] border-4 border-lime-300 bg-lime-400 px-4 py-8 text-center shadow-[8px_8px_0_0_#3f6212] sm:py-12">
            <p className="text-4xl font-black leading-none tracking-tight text-zinc-950 sm:text-6xl md:text-7xl">
              YES! 100% FACTUALLY VERIFIED
            </p>
          </div>
          <div className="relative mt-8">
            <button
              type="button"
              aria-label="Disclaimer"
              aria-expanded={disclaimerOpen}
              onClick={() => setDisclaimerOpen((open) => !open)}
              onMouseEnter={() => setDisclaimerOpen(true)}
              onMouseLeave={() => setDisclaimerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-500 text-sm font-semibold text-zinc-300 hover:border-lime-300 hover:text-lime-300"
            >
              i
            </button>
            {disclaimerOpen ? (
              <p
                role="tooltip"
                className="absolute left-1/2 top-10 z-10 w-72 -translate-x-1/2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-left text-xs leading-5 text-zinc-300 sm:w-96"
              >
                {NERDCONF_DISCLAIMER}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  if (view.kind === "mock") {
    return (
      <div className="flex flex-1 flex-col bg-zinc-950">
        <header className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => setView({ kind: "home" })}
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            ← Back
          </button>
          <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            Mock trace
          </span>
        </header>
        <main className="mx-auto w-full max-w-xl flex-1 px-6 py-16">
          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            {view.card.tag}
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
            {view.card.claim}
          </h2>
          <p className="mt-6 rounded-lg border border-dashed border-zinc-700 px-4 py-5 text-sm leading-6 text-zinc-400">
            Research loop not wired yet. Linkup and Nebius stay off until later
            steps. This card is a placeholder so the landing is not a blank page.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950">
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        <p className="text-sm tracking-[0.2em] uppercase text-zinc-500">
          Burning Token
        </p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-zinc-50">
          Burn fAIke
        </h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-zinc-400">
          Trace a viral rumor. See where it started, how it mutated, and how
          spicy it looks — not a verdict.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {SEED_CARDS.map((card) => (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => openCard(card)}
                className={`flex h-full w-full flex-col rounded-xl border px-5 py-5 text-left transition hover:-translate-y-0.5 ${
                  card.mode === "easter_egg"
                    ? "border-lime-400/70 bg-lime-400/10 hover:border-lime-300"
                    : "border-zinc-800 bg-zinc-900 hover:border-zinc-500"
                }`}
              >
                <span className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                  {card.tag}
                </span>
                <span className="mt-3 text-lg font-medium leading-7 text-zinc-50">
                  {card.claim}
                </span>
                <span className="mt-4 text-sm text-zinc-500">
                  {card.mode === "easter_egg" ? "Trace now" : "Mock trace"}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
