import type { TokenGraph } from "../../types/tokens";

export function exportDTCG(graph: TokenGraph): Record<string, unknown> {
  const root: Record<string, unknown> = {};

  for (const token of Object.values(graph.tokens)) {
    const parts = token.id.split(".");
    let cursor: Record<string, unknown> = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const next = cursor[part];
      if (!next || typeof next !== "object") {
        cursor[part] = {};
      }
      cursor = cursor[part] as Record<string, unknown>;
    }
    const leaf: Record<string, unknown> = { $value: token.value };
    if (token.$type) leaf.$type = token.$type;
    if (token.$description) leaf.$description = token.$description;
    if (token.$extensions) leaf.$extensions = token.$extensions;
    cursor[parts[parts.length - 1]] = leaf;
  }

  return root;
}
