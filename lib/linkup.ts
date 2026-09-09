import { LinkupClient, LinkupNoResultError } from "linkup-sdk";
import type { TraceFinding } from "./trace-job";

function getClient() {
  const apiKey = process.env.LINKUP_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("LINKUP_API_KEY is missing on the server.");
  }
  return new LinkupClient({ apiKey });
}

export function originSearchQuery(claim: string): string {
  return `Find web sources that discuss this exact claim: "${claim}". Prefer origin or first mention, forums, news, and scientific or official pages. Return source URLs and short snippets. If the exact claim is not covered, return the closest related sources and say they are related, not confirming. If none exist, say none found.`;
}

export async function searchClaimSources(claim: string): Promise<{
  query: string;
  findings: TraceFinding[];
}> {
  const query = originSearchQuery(claim);
  const client = getClient();

  try {
    const response = await client.search({
      query,
      depth: "standard",
      outputType: "searchResults",
      maxResults: 8,
    });

    const retrievedAt = new Date().toISOString();
    const findings: TraceFinding[] = [];
    const seen = new Set<string>();

    for (const result of response.results) {
      if (result.type !== "text") continue;
      if (seen.has(result.url)) continue;
      seen.add(result.url);
      findings.push({
        query,
        source_url: result.url,
        snippet: result.content,
        stance: "unknown",
        layer: "origin",
        retrieved_at: retrievedAt,
      });
    }

    return { query, findings };
  } catch (caught) {
    if (caught instanceof LinkupNoResultError) {
      return { query, findings: [] };
    }
    throw caught;
  }
}
