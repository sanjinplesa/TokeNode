import {
  colorRamp,
  tailwindOpacity,
  tailwindRadius,
  tailwindSpacing,
} from "./tailwind";
import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  colorRamp,
  tailwindSpacing,
  tailwindRadius,
  tailwindOpacity,
];

export type { GeneratedToken, Preset, PresetInput } from "./types";
