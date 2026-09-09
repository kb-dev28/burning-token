import { NERDCONF_CLAIM } from "./seed-cards";
import type { TraceMode } from "./trace-job";

export function normalizeClaim(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function isNerdconfEasterEgg(claim: string): boolean {
  return normalizeClaim(claim).toLowerCase() === NERDCONF_CLAIM.toLowerCase();
}

export function classifyIntake(raw: string): {
  claim: string;
  mode: TraceMode;
} {
  const claim = normalizeClaim(raw);
  return {
    claim,
    mode: isNerdconfEasterEgg(claim) ? "easter_egg" : "research",
  };
}
