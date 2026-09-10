import { classifyIntake } from "@/lib/intake";
import { synthesizeTrace } from "@/lib/nebius";
import { runResearchLoop } from "@/lib/research-loop";
import { saveResearchJob } from "@/lib/trace-store";
import type { TraceJob } from "@/lib/trace-job";

export const maxDuration = 90;

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
      next_query: null,
      stop_reason: null,
      trail: [],
    },
    synthesis: null,
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
  await saveResearchJob(job);

  try {
    const finished = await runResearchLoop(job);
    finished.synthesis = await synthesizeTrace(finished);
    await saveResearchJob(finished);
    return Response.json({ job: finished });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Trace failed.";
    return Response.json({ error: message, job }, { status: 502 });
  }
}
