import OpenAI from "openai";
import type { TraceJob, TraceSynthesis } from "./trace-job";

const DEFAULT_BASE_URL = "https://api.tokenfactory.nebius.com/v1/";

function labelForScore(score: number): string {
  if (score <= 25) return "Boring Official Fact";
  if (score <= 60) return "Unverified Internet Gossip";
  return "Pure Underground Conspiracy";
}

function normalizeBaseUrl(raw: string): string {
  let url = raw.trim().replace(/\/+$/, "");
  url = url.replace(/\/chat\/completions$/i, "");
  if (!/\/v1$/i.test(url)) {
    url = `${url}/v1`;
  }
  return `${url}/`;
}

function getClient() {
  const apiKey = process.env.NEBIUS_API_KEY?.trim();
  const model = process.env.NEBIUS_MODEL?.trim();
  const baseURL = normalizeBaseUrl(
    process.env.NEBIUS_BASE_URL?.trim() || DEFAULT_BASE_URL,
  );

  if (!apiKey) {
    throw new Error("NEBIUS_API_KEY is missing on the server.");
  }
  if (!model) {
    throw new Error("NEBIUS_MODEL is missing on the server.");
  }

  return {
    model,
    client: new OpenAI({ apiKey, baseURL }),
  };
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) {
    throw new Error("Nebius did not return JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function nebiousError(caught: unknown): Error {
  if (caught instanceof OpenAI.APIError) {
    const extra =
      typeof caught.error === "object" &&
      caught.error &&
      "detail" in caught.error
        ? String((caught.error as { detail: unknown }).detail)
        : caught.message;
    return new Error(`Nebius ${caught.status}: ${extra}`);
  }
  if (caught instanceof Error) return caught;
  return new Error("Nebius synthesis failed.");
}

export async function synthesizeTrace(job: TraceJob): Promise<TraceSynthesis> {
  const { client, model } = getClient();
  const allowed = new Set(job.findings.map((item) => item.source_url));

  const pack = {
    claim: job.claim,
    findings: job.findings.map((item) => ({
      url: item.source_url,
      snippet: item.snippet.slice(0, 400),
      layer: item.layer,
      stance: item.stance,
      round: item.round,
    })),
    memory: {
      origin_hypothesis: job.memory.origin_hypothesis,
      open_gaps: job.memory.open_gaps,
      stop_reason: job.memory.stop_reason,
    },
  };

  const started = Date.now();
  let response;
  try {
    response = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You synthesize a rumor trace from a research pack. Do not search the web. Use only the provided findings. Never invent URLs. If evidence is weak, raise the score and list uncertainty. Return JSON only with keys: paranoia_score (0-100), paranoia_label, trace_summary (2-4 sentences: origin, mutation, plausibility), citations (array of {url, why} using only provided urls), uncertainty (string[]), contradictions (string[]). Labels must map near: 0 Boring Official Fact, 50 Unverified Internet Gossip, 100 Pure Underground Conspiracy.`,
        },
        {
          role: "user",
          content: JSON.stringify(pack),
        },
      ],
    });
  } catch (caught) {
    throw nebiousError(caught);
  }
  const latency_ms = Date.now() - started;

  const message = response.choices[0]?.message;
  const content =
    typeof message?.content === "string"
      ? message.content
      : Array.isArray(message?.content)
        ? message.content
            .map((part) =>
              typeof part === "object" && part && "text" in part
                ? String((part as { text: unknown }).text)
                : "",
            )
            .join("\n")
        : "";
  if (!content.trim()) {
    throw new Error("Nebius returned an empty synthesis.");
  }

  const parsed = extractJson(content) as Record<string, unknown>;
  const scoreRaw = Number(parsed.paranoia_score);
  const paranoia_score = Number.isFinite(scoreRaw)
    ? Math.min(100, Math.max(0, Math.round(scoreRaw)))
    : 50;

  const citationsRaw = Array.isArray(parsed.citations)
    ? parsed.citations
    : [];
  const citations = citationsRaw.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const url = "url" in item ? String((item as { url: unknown }).url) : "";
    const why = "why" in item ? String((item as { why: unknown }).why) : "";
    if (!allowed.has(url)) return [];
    return [{ url, why }];
  });

  console.info(
    `[nebius] model=${model} latency_ms=${latency_ms} tokens_in=${response.usage?.prompt_tokens ?? 0} tokens_out=${response.usage?.completion_tokens ?? 0}`,
  );

  return {
    paranoia_score,
    paranoia_label:
      typeof parsed.paranoia_label === "string" && parsed.paranoia_label
        ? parsed.paranoia_label
        : labelForScore(paranoia_score),
    trace_summary:
      typeof parsed.trace_summary === "string"
        ? parsed.trace_summary
        : "Not enough grounded evidence to summarize.",
    contradictions: asStringArray(parsed.contradictions),
    latency_ms,
    tokens_in: response.usage?.prompt_tokens ?? 0,
    tokens_out: response.usage?.completion_tokens ?? 0,
    model,
  };
}

