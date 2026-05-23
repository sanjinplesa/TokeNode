import type { TokenCategory, TokenValue } from "../../types/tokens";

export interface PresetInput {
  key: string;
  label: string;
  type: "text" | "number";
  default?: string | number;
  min?: number;
  max?: number;
  step?: number;
}

export interface GeneratedToken {
  id: string;
  name: string;
  value: TokenValue;
  $type: string;
  category: TokenCategory;
}

export interface Preset {
  id: string;
  name: string;
  family: string;
  category: TokenCategory;
  description: string;
  inputs: PresetInput[];
  generate: (params: Record<string, string | number>) => GeneratedToken[];
}
