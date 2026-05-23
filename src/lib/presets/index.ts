import {
  tailwindColor,
  tailwindOpacity,
  tailwindRadius,
  tailwindSpacing,
} from "./tailwind";
import type { Preset } from "./types";

export const PRESETS: Preset[] = [
  tailwindColor,
  tailwindSpacing,
  tailwindRadius,
  tailwindOpacity,
];

export type { GeneratedToken, Preset, PresetInput } from "./types";
