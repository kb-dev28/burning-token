import { LinkupClient, LinkupNoResultError } from "linkup-sdk";
import type { TraceFinding, TraceLayer } from "./trace-job";

function getClient() {
  const apiKey = process.env.LINKUP_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("LINKUP_API_KEY is missing on the server.");
  }
  return new LinkupClient({ apiKey });
}

export async function searchWithQuery(input: {
  query: string;
  round: number;
  layer: TraceLayer;
  seenUrls: Set<string>;
}): Promise<TraceFinding[]> {
  const client = getClient();

  try {
    const response = await client.search({
      query: input.query,
      depth: "standard",
      outputType: "searchResults",
      maxResults: 8,
    });

    const retrievedAt = new Date().toISOString();
    const findings: TraceFinding[] = [];

    for (const result of response.results) {
      if (result.type !== "text") continue;
      if (input.seenUrls.has(result.url)) continue;
      input.seenUrls.add(result.url);
      findings.push({
        query: input.query,
        source_url: result.url,
        snippet: result.content,
        stance: "unknown",
        layer: input.layer,
        round: input.round,
        retrieved_at: retrievedAt,
      });
    }

    return findings;
  } catch (caught) {
    if (caught instanceof LinkupNoResultError) {
      return [];
    }
    throw caught;
  }
}
