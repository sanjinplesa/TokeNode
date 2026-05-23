import Dexie, { type Table } from "dexie";
import type { TokenGraph } from "../types/tokens";

export interface GraphRecord {
  id: string;
  graph: TokenGraph;
  updatedAt: string;
}

class TokenTraceDB extends Dexie {
  graphs!: Table<GraphRecord, string>;

  constructor() {
    super("tokentrace");
    this.version(1).stores({
      graphs: "id, updatedAt",
    });
  }
}

const db = new TokenTraceDB();
const CURRENT_KEY = "current";

export async function saveGraph(graph: TokenGraph): Promise<void> {
  await db.graphs.put({
    id: CURRENT_KEY,
    graph,
    updatedAt: new Date().toISOString(),
  });
}

export async function loadGraph(): Promise<TokenGraph | null> {
  const record = await db.graphs.get(CURRENT_KEY);
  return record?.graph ?? null;
}

export async function clearGraph(): Promise<void> {
  await db.graphs.delete(CURRENT_KEY);
}
