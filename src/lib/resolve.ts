import type { TokenGraph, TokenValue } from "../types/tokens";

export function resolveValue(
  graph: TokenGraph,
  tokenId: string,
  themeId?: string,
  visited: Set<string> = new Set()
): string {
  if (visited.has(tokenId)) return "<circular>";
  visited.add(tokenId);

  const token = graph.tokens[tokenId];
  if (!token) return "<undefined>";

  const themeOverride = themeId ? graph.themes[themeId]?.overrides[tokenId] : undefined;
  if (themeOverride !== undefined) {
    return resolveString(graph, themeOverride, themeId, visited);
  }

  return resolveTokenValue(graph, token.value, themeId, visited);
}

function resolveTokenValue(
  graph: TokenGraph,
  value: TokenValue,
  themeId: string | undefined,
  visited: Set<string>
): string {
  if (typeof value === "string") return resolveString(graph, value, themeId, visited);
  if (typeof value === "number") return String(value);
  return JSON.stringify(value);
}

function resolveString(
  graph: TokenGraph,
  value: string,
  themeId: string | undefined,
  visited: Set<string>
): string {
  return value.replace(/\{([^}]+)\}/g, (_, ref: string) =>
    resolveValue(graph, ref, themeId, new Set(visited))
  );
}
