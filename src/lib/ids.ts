import type { TokenCategory, TokenLayer } from "../types/tokens";

const NUMERIC_STEP = /^(0|50|100|200|300|400|500|600|700|800|900|950)$/;
const NAMED_STEP = /^(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl)$/;

const KNOWN_COMPONENTS = new Set([
  "button",
  "input",
  "card",
  "modal",
  "dialog",
  "tooltip",
  "badge",
  "alert",
  "tab",
  "menu",
  "select",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "progress",
  "spinner",
  "avatar",
  "chip",
  "table",
  "list",
  "nav",
  "header",
  "footer",
]);

const SEMANTIC_CONTEXTS = new Set([
  "text",
  "bg",
  "background",
  "border",
  "surface",
  "accent",
  "icon",
  "fg",
  "foreground",
  "component",
  "interactive",
]);

export function inferLayer(id: string): TokenLayer {
  const parts = id.split(".");
  const first = parts[0] ?? "";
  const last = parts[parts.length - 1] ?? "";

  if (KNOWN_COMPONENTS.has(first)) return "component";
  if (NUMERIC_STEP.test(last) || NAMED_STEP.test(last)) return "primitive";
  if (parts.length >= 2 && SEMANTIC_CONTEXTS.has(parts[1])) return "semantic";
  if (parts.length === 2 && first === "spacing") return "primitive";
  if (parts.length === 2 && first === "radius") return "primitive";
  return "semantic";
}

export function inferCategory(typeOrId: string): TokenCategory {
  const lower = typeOrId.toLowerCase();
  if (lower.startsWith("color")) return "color";
  if (lower.startsWith("dimension") || lower.startsWith("spacing")) return "spacing";
  if (lower.startsWith("radius") || lower.includes("borderradius")) return "radius";
  if (lower.startsWith("shadow") || lower.includes("boxshadow")) return "shadow";
  if (
    lower.startsWith("typography") ||
    lower.startsWith("fontfamily") ||
    lower.startsWith("fontsize") ||
    lower.startsWith("fontweight") ||
    lower.startsWith("lineheight") ||
    lower.startsWith("letterspacing")
  )
    return "typography";
  if (lower.startsWith("opacity")) return "opacity";
  if (
    lower.startsWith("motion") ||
    lower.startsWith("duration") ||
    lower.startsWith("cubicbezier") ||
    lower.startsWith("transition")
  )
    return "motion";
  return "custom";
}

export function formatName(slug: string): string {
  return slug
    .replace(/[-_]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function extractReferences(value: unknown): string[] {
  const refs = new Set<string>();
  const stack: unknown[] = [value];
  while (stack.length > 0) {
    const v = stack.pop();
    if (typeof v === "string") {
      const matches = v.match(/\{([^}]+)\}/g);
      if (matches) {
        for (const m of matches) {
          refs.add(m.slice(1, -1));
        }
      }
    } else if (Array.isArray(v)) {
      for (const item of v) stack.push(item);
    } else if (v && typeof v === "object") {
      for (const val of Object.values(v as Record<string, unknown>)) stack.push(val);
    }
  }
  return Array.from(refs);
}
