import { importDTCG } from "../adapters/dtcg/import";
import type { TokenGraph } from "../types/tokens";

const exampleJson = {
  color: {
    neutral: {
      "50": { $value: "oklch(0.98 0 0)", $type: "color" },
      "100": { $value: "oklch(0.94 0 0)", $type: "color" },
      "500": { $value: "oklch(0.55 0 0)", $type: "color" },
      "900": { $value: "oklch(0.20 0 0)", $type: "color" },
    },
    primary: {
      "500": { $value: "oklch(0.65 0.18 250)", $type: "color" },
      "600": { $value: "oklch(0.55 0.20 250)", $type: "color" },
    },
    text: {
      primary: { $value: "{color.neutral.900}", $type: "color" },
      secondary: { $value: "{color.neutral.500}", $type: "color" },
      "on-accent": { $value: "{color.neutral.50}", $type: "color" },
    },
    bg: {
      base: { $value: "{color.neutral.50}", $type: "color" },
      surface: { $value: "{color.neutral.100}", $type: "color" },
      accent: { $value: "{color.primary.500}", $type: "color" },
      "accent-hover": { $value: "{color.primary.600}", $type: "color" },
    },
  },
  button: {
    bg: {
      default: { $value: "{color.bg.accent}", $type: "color" },
      hover: { $value: "{color.bg.accent-hover}", $type: "color" },
    },
    text: {
      default: { $value: "{color.text.on-accent}", $type: "color" },
    },
  },
};

export function exampleGraph(): TokenGraph {
  return importDTCG(exampleJson, { name: "Example System", version: "0.1.0" });
}
