import type { TokenGraph, TokenNode, TokenValue } from "../../types/tokens";
import { extractReferences, formatName, inferCategory, inferLayer } from "../../lib/ids";
import { resolveValue } from "../../lib/resolve";

interface ImportOptions {
  name?: string;
  version?: string;
}

export function importDTCG(json: unknown, options: ImportOptions = {}): TokenGraph {
  const tokens: Record<string, TokenNode> = {};

  const walk = (obj: unknown, path: string[]): void => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return;
    const rec = obj as Record<string, unknown>;

    if ("$value" in rec) {
      const id = path.join(".");
      const value = rec.$value as TokenValue;
      const $type = typeof rec.$type === "string" ? rec.$type : undefined;
      const category = inferCategory($type ?? id);
      const layer = inferLayer(id);
      const references = extractReferences(value);

      tokens[id] = {
        id,
        name: formatName(path[path.length - 1] ?? id),
        layer,
        category,
        value,
        resolvedValue: "",
        references,
        referencedBy: [],
        $type,
        $description:
          typeof rec.$description === "string" ? rec.$description : undefined,
        $extensions:
          rec.$extensions && typeof rec.$extensions === "object"
            ? (rec.$extensions as Record<string, unknown>)
            : undefined,
      };
      return;
    }

    for (const [key, child] of Object.entries(rec)) {
      if (key.startsWith("$")) continue;
      walk(child, [...path, key]);
    }
  };

  walk(json, []);

  for (const token of Object.values(tokens)) {
    for (const ref of token.references) {
      const target = tokens[ref];
      if (target) target.referencedBy.push(token.id);
    }
  }

  const now = new Date().toISOString();
  const graph: TokenGraph = {
    meta: {
      name: options.name ?? "Imported",
      version: options.version ?? "0.1.0",
      created: now,
      modified: now,
      generator: "tokentrace@0.1.0",
    },
    tokens,
    themes: {},
    groups: {},
  };

  for (const id of Object.keys(tokens)) {
    tokens[id].resolvedValue = resolveValue(graph, id);
  }

  return graph;
}
