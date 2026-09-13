import { classifyIntake } from "@/lib/intake";
import { synthesizeTrace } from "@/lib/nebius";
import { runResearchLoop } from "@/lib/research-loop";
import { saveResearchJob } from "@/lib/trace-store";
import type { TraceJob } from "@/lib/trace-job";

export const maxDuration = 90;

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
  "https://kb-dev28.github.io",
];

function allowedOrigin(request: Request): string | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  const extra = (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_CORS_ORIGINS, ...extra]);
  return allowed.has(origin) ? origin : null;
}

function corsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = allowedOrigin(request);
  if (origin) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  return headers;
}

function json(request: Request, body: unknown, init?: ResponseInit) {
  const headers = corsHeaders(request);
  const extra = init?.headers;
  if (extra) {
    const incoming = new Headers(extra);
    incoming.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return Response.json(body, { ...init, headers });
}

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

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json(request, { error: "Expected JSON body." }, { status: 400 });
  }

  const raw =
    typeof body === "object" && body && "claim" in body
      ? (body as { claim: unknown }).claim
      : null;

  if (typeof raw !== "string" || !raw.trim()) {
    return json(request, { error: "Claim is required." }, { status: 400 });
  }

  const { claim, mode } = classifyIntake(raw);

  if (!claim) {
    return json(request, { error: "Claim is required." }, { status: 400 });
  }

  if (mode === "easter_egg") {
    return json(request, { job: emptyJob(claim, "easter_egg") });
  }

  const job = emptyJob(claim, "research");
  await saveResearchJob(job);

  try {
    const finished = await runResearchLoop(job);
    finished.synthesis = await synthesizeTrace(finished);
    await saveResearchJob(finished);
    return json(request, { job: finished });
  } catch (caught) {
    const message =
      caught instanceof Error ? caught.message : "Trace failed.";
    return json(request, { error: message, job }, { status: 502 });
  }
}
