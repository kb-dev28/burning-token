export type TraceMode = "easter_egg" | "research";

export type TraceLayer =
  | "origin"
  | "mutation"
  | "official"
  | "social"
  | "alt";

export type TraceFinding = {
  query: string;
  source_url: string;
  snippet: string;
  published_at?: string;
  stance: "supports" | "contradicts" | "related" | "unknown";
  layer: TraceLayer;
  round: number;
  retrieved_at: string;
};

export type ResearchGoal = "origin" | "mutation" | "check";

export type TraceTrailStep = {
  round: number;
  goal: ResearchGoal;
  query: string;
  triggered_by_url: string | null;
  triggered_by_why: string | null;
  new_result_count: number;
};

export type TraceMemory = {
  origin_hypothesis: string | null;
  open_gaps: string[];
  next_query: string | null;
  stop_reason: string | null;
  trail: TraceTrailStep[];
};

export type TraceJob = {
  id: string;
  claim: string;
  mode: TraceMode;
  created_at: string;
  findings: TraceFinding[];
  memory: TraceMemory;
};
