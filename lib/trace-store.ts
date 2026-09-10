import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { TraceJob } from "./trace-job";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "burn-faike")
  : path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "traces.json");

type Store = {
  jobs: TraceJob[];
};

async function readStore(): Promise<Store> {
  try {
    const raw = await readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Store;
    return { jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [] };
  } catch {
    return { jobs: [] };
  }
}

async function writeStore(store: Store): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function saveResearchJob(job: TraceJob): Promise<TraceJob> {
  const store = await readStore();
  const index = store.jobs.findIndex((item) => item.id === job.id);
  if (index >= 0) {
    store.jobs[index] = job;
  } else {
    store.jobs.push(job);
  }
  await writeStore(store);
  return job;
}
