import { searchWithQuery } from "./linkup";
import type {
  ResearchGoal,
  TraceFinding,
  TraceJob,
  TraceLayer,
  TraceTrailStep,
} from "./trace-job";
import { saveResearchJob } from "./trace-store";

const MAX_ROUNDS = 3;

const GOALS: ResearchGoal[] = ["origin", "mutation", "check"];

function goalLayer(goal: ResearchGoal): TraceLayer {
  if (goal === "origin") return "origin";
  if (goal === "mutation") return "mutation";
  return "official";
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

function classifyFinding(finding: TraceFinding): TraceFinding {
  const host = hostOf(finding.source_url);
  const text = `${finding.source_url} ${finding.snippet}`.toLowerCase();

  const officialHost =
    host.endsWith(".gov") ||
    host.includes("who.int") ||
    host.includes("nih.gov") ||
    host.includes("fda.gov") ||
    host.includes("cdc.gov") ||
    host.includes("usda.gov") ||
    host.includes("europa.eu") ||
    host.includes("pubmed") ||
    host.includes("nature.com") ||
    host.includes("science.org") ||
    host.includes("snopes.com") ||
    host.includes("factcheck.org") ||
    host.includes("fullfact.org");

  const socialHost =
    host.includes("tiktok") ||
    host.includes("reddit") ||
    host.includes("twitter") ||
    host.includes("x.com") ||
    host.includes("facebook") ||
    host.includes("instagram") ||
    host.includes("forum");

  let layer: TraceLayer = finding.layer;
  if (officialHost || /debunk|peer-reviewed|scientific study|no evidence/.test(text)) {
    layer = "official";
  } else if (
    /first mention|originated|started in|urban legend|earliest/.test(text)
  ) {
    layer = "origin";
  } else if (
    socialHost ||
    /tiktok|recirculat|went viral|copy[- ]?pasta|repost/.test(text)
  ) {
    layer = "mutation";
  } else if (finding.round === 2) {
    layer = "social";
  }

  let stance: TraceFinding["stance"] = "unknown";
  if (/debunk|false|myth|no evidence|does not|don't|do not/.test(text)) {
    stance = "contradicts";
  } else if (/confirm|study shows|true that/.test(text)) {
    stance = "supports";
  } else if (/related|similar claim/.test(text)) {
    stance = "related";
  }

  return { ...finding, layer, stance };
}

function gapsOf(findings: TraceFinding[]): string[] {
  const layers = new Set(findings.map((item) => item.layer));
  const gaps: string[] = [];
  if (!layers.has("origin")) gaps.push("origin");
  if (!layers.has("mutation") && !layers.has("social")) gaps.push("mutation");
  if (!layers.has("official")) gaps.push("check");
  return gaps;
}

function queryFor(
  goal: ResearchGoal,
  claim: string,
  findings: TraceFinding[],
): string {
  const urls = findings
    .slice(0, 5)
    .map((item) => item.source_url)
    .join(", ");

  if (goal === "origin") {
    return `Find the origin or first mention of this claim: "${claim}". Search old blogs, forums, and earliest coverage. Return source URLs and short snippets. If none exist, say none found.`;
  }

  if (goal === "mutation") {
    return `The claim is "${claim}". Already saved sources: ${urls || "none"}. Find how it mutated or recirculated (TikTok, forums, viral copies). Return NEW source URLs and snippets not already listed. If none exist, say none found.`;
  }

  return `The claim is "${claim}". Already saved sources: ${urls || "none"}. Find scientific studies, food-safety agencies, or debunks that confirm or contradict it. Return NEW source URLs and snippets. If no official confirmation exists, say so and still return the closest checks.`;
}

function triggerFor(
  goal: ResearchGoal,
  findings: TraceFinding[],
): Pick<TraceTrailStep, "triggered_by_url" | "triggered_by_why"> {
  if (goal === "origin" || findings.length === 0) {
    return { triggered_by_url: null, triggered_by_why: null };
  }

  if (goal === "mutation") {
    const origin =
      findings.find((item) => item.layer === "origin") ?? findings[0];
    return {
      triggered_by_url: origin.source_url,
      triggered_by_why:
        "Round 1 did not show recirculation. This source triggered a mutation search.",
    };
  }

  const mutation =
    findings.find(
      (item) => item.layer === "mutation" || item.layer === "social",
    ) ?? findings[findings.length - 1];

  return {
    triggered_by_url: mutation.source_url,
    triggered_by_why:
      "Need an official or scientific check after this source.",
  };
}

export async function runResearchLoop(job: TraceJob): Promise<TraceJob> {
  const seenUrls = new Set(job.findings.map((item) => item.source_url));

  for (let index = 0; index < MAX_ROUNDS; index += 1) {
    const round = index + 1;
    const goal = GOALS[index];
    const query = queryFor(goal, job.claim, job.findings);
    const trigger = triggerFor(goal, job.findings);

    job.memory.next_query = query;
    job.memory.open_gaps = gapsOf(job.findings);
    await saveResearchJob(job);

    const fresh = await searchWithQuery({
      query,
      round,
      layer: goalLayer(goal),
      seenUrls,
    });
    const classified = fresh.map(classifyFinding);
    job.findings.push(...classified);

    job.memory.trail.push({
      round,
      goal,
      query,
      triggered_by_url: trigger.triggered_by_url,
      triggered_by_why: trigger.triggered_by_why,
      new_result_count: classified.length,
    });

    const gaps = gapsOf(job.findings);
    job.memory.open_gaps = gaps;
    job.memory.origin_hypothesis =
      job.findings.find((item) => item.layer === "origin")?.source_url ??
      job.memory.origin_hypothesis;

    if (classified.length === 0) {
      job.memory.next_query = null;
      job.memory.stop_reason = "no_new_results";
      await saveResearchJob(job);
      return job;
    }

    if (gaps.length === 0) {
      job.memory.next_query = null;
      job.memory.stop_reason = "gaps_covered";
      await saveResearchJob(job);
      return job;
    }

    await saveResearchJob(job);
  }

  job.memory.next_query = null;
  job.memory.stop_reason = "max_rounds";
  await saveResearchJob(job);
  return job;
}
