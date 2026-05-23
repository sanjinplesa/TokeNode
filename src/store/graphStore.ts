import { create } from "zustand";
import type {
  TokenCategory,
  TokenGraph,
  TokenLayer,
  TokenNode,
  TokenValue,
} from "../types/tokens";
import { validateEdge } from "../lib/validation";
import { resolveValue } from "../lib/resolve";
import { extractReferences, formatName } from "../lib/ids";

type CategoryDefault = { value: TokenValue; $type: string };

const CATEGORY_DEFAULTS: Record<TokenCategory, CategoryDefault> = {
  color: { value: "oklch(0.65 0.18 250)", $type: "color" },
  spacing: { value: "1rem", $type: "dimension" },
  typography: {
    value: {
      fontFamily: "system-ui",
      fontSize: "1rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    $type: "typography",
  },
  radius: { value: "0.5rem", $type: "dimension" },
  shadow: {
    value: {
      offsetX: 0,
      offsetY: 1,
      blur: 3,
      spread: 0,
      color: "rgb(0 0 0 / 0.1)",
    },
    $type: "shadow",
  },
  opacity: { value: 1, $type: "number" },
  motion: { value: "150ms", $type: "duration" },
  custom: { value: "", $type: "string" },
};

function emptyGraph(): TokenGraph {
  const now = new Date().toISOString();
  return {
    meta: {
      name: "Untitled",
      version: "0.1.0",
      created: now,
      modified: now,
      generator: "tokentrace@0.1.0",
    },
    tokens: {},
    themes: {},
    groups: {},
  };
}

interface GraphStore {
  graph: TokenGraph;
  selectedTokenId: string | null;
  activeThemeId: string | null;
  activeLayer: TokenLayer;

  load: (graph: TokenGraph) => void;
  reset: () => void;

  addToken: (token: TokenNode) => void;
  createToken: (
    category: TokenCategory,
    layer?: TokenLayer,
    position?: { x: number; y: number }
  ) => string;
  createGroup: (name: string) => string;
  createTheme: (name: string) => string;
  updateToken: (id: string, patch: Partial<TokenNode>) => void;
  deleteToken: (id: string) => void;

  addReference: (sourceId: string, targetId: string) => { ok: boolean; error?: string };
  removeReference: (sourceId: string, targetId: string) => void;

  updatePosition: (id: string, position: { x: number; y: number }) => void;
  selectToken: (id: string | null) => void;
  setActiveTheme: (id: string | null) => void;
  setActiveLayer: (layer: TokenLayer) => void;

  resolved: (id: string) => string;
}

function withMetaTouched(graph: TokenGraph): TokenGraph {
  return { ...graph, meta: { ...graph.meta, modified: new Date().toISOString() } };
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  graph: emptyGraph(),
  selectedTokenId: null,
  activeThemeId: null,
  activeLayer: "primitive",

  load: (graph) => set({ graph, selectedTokenId: null }),
  reset: () => set({ graph: emptyGraph(), selectedTokenId: null }),

  addToken: (token) =>
    set((s) => {
      if (s.graph.tokens[token.id]) return s;
      const tokens: Record<string, TokenNode> = {
        ...s.graph.tokens,
        [token.id]: {
          ...token,
          references: [...token.references],
          referencedBy: [...token.referencedBy],
        },
      };
      for (const ref of token.references) {
        const target = tokens[ref];
        if (target) {
          tokens[ref] = {
            ...target,
            referencedBy: Array.from(new Set([...target.referencedBy, token.id])),
          };
        }
      }
      return { graph: withMetaTouched({ ...s.graph, tokens }) };
    }),

  createToken: (category, layer = "primitive", position) => {
    const state = get();
    let n = 1;
    let id = `${category}.new-${n}`;
    while (state.graph.tokens[id]) {
      n++;
      id = `${category}.new-${n}`;
    }
    const defaults = CATEGORY_DEFAULTS[category];
    const newToken: TokenNode = {
      id,
      name: `New ${formatName(category)} ${n}`,
      layer,
      category,
      value: defaults.value,
      resolvedValue:
        typeof defaults.value === "string"
          ? defaults.value
          : JSON.stringify(defaults.value),
      references: [],
      referencedBy: [],
      position,
      $type: defaults.$type,
    };
    set((s) => ({
      graph: withMetaTouched({
        ...s.graph,
        tokens: { ...s.graph.tokens, [id]: newToken },
      }),
      selectedTokenId: id,
    }));
    return id;
  },

  createGroup: (name) => {
    const state = get();
    let n = 1;
    let id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `group-${n}`;
    while (state.graph.groups[id]) {
      n++;
      id = `group-${n}`;
    }
    set((s) => ({
      graph: withMetaTouched({
        ...s.graph,
        groups: {
          ...s.graph.groups,
          [id]: { id, name: name.trim() || id, tokens: [], collapsed: false },
        },
      }),
    }));
    return id;
  },

  createTheme: (name) => {
    const state = get();
    let n = 1;
    let id = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `theme-${n}`;
    while (state.graph.themes[id]) {
      n++;
      id = `theme-${n}`;
    }
    set((s) => ({
      graph: withMetaTouched({
        ...s.graph,
        themes: {
          ...s.graph.themes,
          [id]: { id, name: name.trim() || id, overrides: {} },
        },
      }),
    }));
    return id;
  },

  updateToken: (id, patch) =>
    set((s) => {
      const existing = s.graph.tokens[id];
      if (!existing) return s;
      const next: TokenNode = { ...existing, ...patch };
      const tokens: Record<string, TokenNode> = { ...s.graph.tokens };

      if (patch.value !== undefined) {
        const newRefs = extractReferences(patch.value);
        const oldRefs = new Set(existing.references);
        const newRefSet = new Set(newRefs);
        next.references = newRefs;

        for (const oldRef of oldRefs) {
          if (!newRefSet.has(oldRef) && tokens[oldRef]) {
            tokens[oldRef] = {
              ...tokens[oldRef],
              referencedBy: tokens[oldRef].referencedBy.filter((x) => x !== id),
            };
          }
        }
        for (const newRef of newRefSet) {
          if (!oldRefs.has(newRef) && tokens[newRef]) {
            tokens[newRef] = {
              ...tokens[newRef],
              referencedBy: Array.from(
                new Set([...tokens[newRef].referencedBy, id])
              ),
            };
          }
        }
      }

      tokens[id] = next;
      return { graph: withMetaTouched({ ...s.graph, tokens }) };
    }),

  deleteToken: (id) =>
    set((s) => {
      const existing = s.graph.tokens[id];
      if (!existing) return s;
      const tokens: Record<string, TokenNode> = {};
      for (const [key, value] of Object.entries(s.graph.tokens)) {
        if (key === id) continue;
        tokens[key] = {
          ...value,
          references: value.references.filter((r) => r !== id),
          referencedBy: value.referencedBy.filter((r) => r !== id),
        };
      }
      const nextSelected = s.selectedTokenId === id ? null : s.selectedTokenId;
      return {
        graph: withMetaTouched({ ...s.graph, tokens }),
        selectedTokenId: nextSelected,
      };
    }),

  addReference: (sourceId, targetId) => {
    const s = get();
    const result = validateEdge(s.graph, sourceId, targetId);
    if (!result.valid) return { ok: false, error: result.reason };

    set((state) => {
      const target = state.graph.tokens[targetId];
      const source = state.graph.tokens[sourceId];
      if (!target || !source) return state;
      if (target.references.includes(sourceId)) return state;

      const tokens: Record<string, TokenNode> = { ...state.graph.tokens };

      for (const oldRef of target.references) {
        if (tokens[oldRef]) {
          tokens[oldRef] = {
            ...tokens[oldRef],
            referencedBy: tokens[oldRef].referencedBy.filter((x) => x !== targetId),
          };
        }
      }

      tokens[targetId] = {
        ...target,
        value: `{${sourceId}}`,
        references: [sourceId],
      };

      tokens[sourceId] = {
        ...source,
        referencedBy: Array.from(new Set([...source.referencedBy, targetId])),
      };

      return { graph: withMetaTouched({ ...state.graph, tokens }) };
    });

    return { ok: true };
  },

  removeReference: (sourceId, targetId) =>
    set((s) => {
      const target = s.graph.tokens[targetId];
      const source = s.graph.tokens[sourceId];
      if (!target || !source) return s;
      const tokens: Record<string, TokenNode> = { ...s.graph.tokens };
      tokens[targetId] = {
        ...target,
        references: target.references.filter((r) => r !== sourceId),
        value: "",
      };
      tokens[sourceId] = {
        ...source,
        referencedBy: source.referencedBy.filter((r) => r !== targetId),
      };
      return { graph: withMetaTouched({ ...s.graph, tokens }) };
    }),

  updatePosition: (id, position) =>
    set((s) => {
      const token = s.graph.tokens[id];
      if (!token) return s;
      return {
        graph: {
          ...s.graph,
          tokens: { ...s.graph.tokens, [id]: { ...token, position } },
        },
      };
    }),

  selectToken: (id) => set({ selectedTokenId: id }),
  setActiveTheme: (id) => set({ activeThemeId: id }),
  setActiveLayer: (layer) => set({ activeLayer: layer }),

  resolved: (id) => {
    const s = get();
    return resolveValue(s.graph, id, s.activeThemeId ?? undefined);
  },
}));
