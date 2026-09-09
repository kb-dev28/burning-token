import { classifyIntake } from "@/lib/intake";
import { originSearchQuery, searchClaimSources } from "@/lib/linkup";
import { saveResearchJob } from "@/lib/trace-store";
import type { TraceJob } from "@/lib/trace-job";

export const maxDuration = 30;

function emptyJob(claim: string, mode: TraceJob["mode"]): TraceJob {
  return {
    id: crypto.randomUUID(),
    claim,
    mode,
    created_at: new Date().toISOString(),
    findings: [],
    memory: {
      origin_hypothesis: null,
      open_gaps: [],
      next_query: mode === "research" ? originSearchQuery(claim) : null,
      stop_reason: null,
    },
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const raw =
    typeof body === "object" && body && "claim" in body
      ? (body as { claim: unknown }).claim
      : null;

  if (typeof raw !== "string" || !raw.trim()) {
    return Response.json({ error: "Claim is required." }, { status: 400 });
  }

  const { claim, mode } = classifyIntake(raw);

  if (!claim) {
    return Response.json({ error: "Claim is required." }, { status: 400 });
  }

  if (mode === "easter_egg") {
    return Response.json({ job: emptyJob(claim, "easter_egg") });
  }

  const job = emptyJob(claim, "research");

  try {
    const { findings } = await searchClaimSources(claim);
    job.findings = findings;
    job.memory.stop_reason = "single_search";
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Linkup search failed.";
    return Response.json({ error: message }, { status: 502 });
  }

  await saveResearchJob(job);
  return Response.json({ job });
}
