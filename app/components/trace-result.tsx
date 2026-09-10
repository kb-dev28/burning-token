import type { TraceFinding, TraceJob, TraceLayer } from "@/lib/trace-job";

const LAYERS: { id: TraceLayer; label: string }[] = [
  { id: "origin", label: "Origin" },
  { id: "mutation", label: "Mutation" },
  { id: "official", label: "Official / check" },
  { id: "social", label: "Social" },
  { id: "alt", label: "Alt" },
];

function findingsByLayer(findings: TraceFinding[], layer: TraceLayer) {
  return findings.filter((item) => item.layer === layer);
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function TraceResult({
  job,
  error,
  onBack,
}: {
  job: TraceJob;
  error: string | null;
  onBack: () => void;
}) {
  const synthesis = job.synthesis;
  const score = synthesis?.paranoia_score ?? 0;
  const latencySec = synthesis
    ? (synthesis.latency_ms / 1000).toFixed(1)
    : null;

  return (
    <div className="flex flex-1 flex-col bg-zinc-950">
      <header className="flex items-center justify-between px-6 py-4">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-zinc-400 hover:text-zinc-200"
        >
          ← Back
        </button>
        <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Trace
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 pb-20">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
          Claim
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          {job.claim}
        </h2>
        {error ? <p className="mt-4 text-sm text-red-400">{error}</p> : null}

        {synthesis ? (
          <section className="mt-8">
            <p className="text-xs uppercase tracking-[0.18em] text-lime-300">
              Paranoia meter
            </p>
            <p className="mt-2 text-3xl font-semibold text-zinc-50">
              {score}%{" "}
              <span className="text-lg font-normal text-zinc-400">
                {synthesis.paranoia_label}
              </span>
            </p>
            <div className="relative mt-4 h-3 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-lime-300 via-yellow-400 to-orange-500"
                style={{ width: `${Math.min(100, Math.max(4, score))}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wide text-zinc-600">
              <span>0% Boring Official Fact</span>
              <span>50% Gossip</span>
              <span>100% Conspiracy</span>
            </div>
          </section>
        ) : null}

        {synthesis ? (
          <section className="mt-10">
            <p className="text-xs uppercase tracking-[0.18em] text-lime-300">
              Trace summary
            </p>
            <p className="mt-3 text-base leading-7 text-zinc-300">
              {synthesis.trace_summary}
            </p>
            {synthesis.uncertainty.length > 0 ? (
              <p className="mt-4 text-sm leading-6 text-zinc-500">
                Unconfirmed: {synthesis.uncertainty.join(" · ")}
              </p>
            ) : null}
            {synthesis.contradictions.length > 0 ? (
              <p className="mt-2 text-sm leading-6 text-zinc-500">
                Contradictions: {synthesis.contradictions.join(" · ")}
              </p>
            ) : null}
          </section>
        ) : null}

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.18em] text-lime-300">
              Live metrics
            </p>
            <p className="text-sm text-zinc-400">
              {latencySec ? `${latencySec}s synthesis` : "No synthesis"}
              {synthesis
                ? ` · ${synthesis.tokens_in} in / ${synthesis.tokens_out} out`
                : ""}
            </p>
          </div>
          {synthesis ? (
            <p className="mt-2 text-xs text-zinc-600">{synthesis.model}</p>
          ) : (
            <p className="mt-2 text-sm text-zinc-500">
              Linkup finished. Nebius did not return a synthesis.
            </p>
          )}
        </section>

        <section className="mt-12">
          <p className="text-xs uppercase tracking-[0.18em] text-lime-300">
            Evidence board
          </p>
          {job.findings.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-zinc-700 px-4 py-5 text-sm text-zinc-400">
              No sources saved for this claim.
            </p>
          ) : (
            <div className="mt-4 space-y-8">
              {LAYERS.map((layer) => {
                const items = findingsByLayer(job.findings, layer.id);
                if (items.length === 0) return null;
                return (
                  <div key={layer.id}>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {layer.label} · {items.length}
                    </p>
                    <ul className="mt-3 grid gap-3">
                      {items.map((finding) => (
                        <li
                          key={`${finding.round}-${finding.source_url}`}
                          className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-4"
                        >
                          <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                            V{finding.round} · {finding.stance}
                          </p>
                          <a
                            href={finding.source_url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 block text-sm font-medium text-lime-300 hover:text-lime-200"
                          >
                            {hostOf(finding.source_url)}
                          </a>
                          <p className="mt-2 text-sm leading-6 text-zinc-400">
                            {finding.snippet.length > 280
                              ? `${finding.snippet.slice(0, 280)}…`
                              : finding.snippet}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-12">
          <p className="text-xs uppercase tracking-[0.18em] text-lime-300">
            Research trail
          </p>
          <ol className="mt-4 space-y-3">
            {(job.memory.trail ?? []).map((step) => (
              <li
                key={step.round}
                className="rounded-xl border border-zinc-800 px-4 py-4"
              >
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                  V{step.round} · {step.goal} · {step.new_result_count} new
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-300">
                  {step.query}
                </p>
                {step.triggered_by_url ? (
                  <p className="mt-3 text-xs leading-5 text-zinc-500">
                    Triggered by {hostOf(step.triggered_by_url)}
                    {step.triggered_by_why ? ` — ${step.triggered_by_why}` : ""}
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-zinc-500">
                    Seed query. No prior finding.
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
