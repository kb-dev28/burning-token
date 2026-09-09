export type TraceMode = "easter_egg" | "research";

export type TraceFinding = {
  query: string;
  source_url: string;
  snippet: string;
  published_at?: string;
  stance: "supports" | "contradicts" | "related" | "unknown";
  layer: "origin" | "mutation" | "official" | "social" | "alt";
  retrieved_at: string;
};

export type TraceMemory = {
  origin_hypothesis: string | null;
  open_gaps: string[];
  next_query: string | null;
  stop_reason: string | null;
};

export type TraceJob = {
  id: string;
  claim: string;
  mode: TraceMode;
  created_at: string;
  findings: TraceFinding[];
  memory: TraceMemory;
};
