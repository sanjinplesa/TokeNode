import type { TokenGraph, TokenLayer } from "../types/tokens";

export type EdgeValidation = { valid: true } | { valid: false; reason: string };

const LAYER_ORDER: Record<TokenLayer, number> = {
  primitive: 0,
  semantic: 1,
  component: 2,
};

export function validateEdge(
  graph: TokenGraph,
  sourceId: string,
  targetId: string
): EdgeValidation {
  if (sourceId === targetId) {
    return { valid: false, reason: "Self-reference is not allowed" };
  }

  const source = graph.tokens[sourceId];
  const target = graph.tokens[targetId];
  if (!source) return { valid: false, reason: `Source '${sourceId}' not found` };
  if (!target) return { valid: false, reason: `Target '${targetId}' not found` };

  if (target.layer === "primitive") {
    return { valid: false, reason: "Primitives cannot have inbound references" };
  }

  if (source.layer === "primitive" && target.layer === "component") {
    return {
      valid: false,
      reason: "Components must go through the semantic layer (skip violation)",
    };
  }

  if (LAYER_ORDER[source.layer] > LAYER_ORDER[target.layer]) {
    return {
      valid: false,
      reason: `Invalid layer flow: ${source.layer} -> ${target.layer}`,
    };
  }

  if (wouldCreateCycle(graph, sourceId, targetId)) {
    return { valid: false, reason: "This connection would create a circular dependency" };
  }

  return { valid: true };
}

function wouldCreateCycle(graph: TokenGraph, sourceId: string, targetId: string): boolean {
  const visited = new Set<string>();
  const stack = [sourceId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (current === targetId) return true;
    if (visited.has(current)) continue;
    visited.add(current);
    const node = graph.tokens[current];
    if (!node) continue;
    for (const ref of node.references) stack.push(ref);
  }
  return false;
}
