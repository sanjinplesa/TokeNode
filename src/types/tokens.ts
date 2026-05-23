export type TokenLayer = "primitive" | "semantic" | "component";

export type TokenCategory =
  | "color"
  | "spacing"
  | "typography"
  | "radius"
  | "shadow"
  | "opacity"
  | "motion"
  | "custom";

export interface TypographyComposite {
  fontFamily: string | string[];
  fontSize: string | number;
  fontWeight: string | number;
  lineHeight: string | number;
  letterSpacing?: string | number;
  fontStyle?: string;
}

export interface ShadowComposite {
  offsetX: string | number;
  offsetY: string | number;
  blur: string | number;
  spread: string | number;
  color: string;
  inset?: boolean;
}

export interface GradientStop {
  color: string;
  position: string | number;
}

export interface GradientComposite {
  type: "linear" | "radial" | "conic";
  angle?: string | number;
  stops: GradientStop[];
}

export type TokenValue =
  | string
  | number
  | TypographyComposite
  | ShadowComposite
  | GradientComposite;

export interface TokenUsage {
  file: string;
  line: number;
  column: number;
  context: "template" | "style" | "script" | "config";
  pattern: string;
  raw: string;
}

export type HealthIssueType =
  | "dead"
  | "orphan"
  | "skip-violation"
  | "single-consumer"
  | "theme-gap"
  | "circular-ref";

export type HealthSeverity = "error" | "warning" | "info";

export interface HealthIssue {
  type: HealthIssueType;
  severity: HealthSeverity;
  message: string;
  details?: Record<string, unknown>;
}

export interface TokenHealth {
  status: "healthy" | "dead" | "orphan" | "skip-violation" | "single-consumer";
  issues: HealthIssue[];
}

export interface TokenNode {
  id: string;
  name: string;
  layer: TokenLayer;
  category: TokenCategory;
  value: TokenValue;
  resolvedValue: string;
  references: string[];
  referencedBy: string[];
  position?: { x: number; y: number };
  group?: string;
  $type?: string;
  $description?: string;
  $extensions?: Record<string, unknown>;
  usage?: TokenUsage[];
  health?: TokenHealth;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  overrides: Record<string, string>;
  inheritsFrom?: string;
}

export interface GroupDefinition {
  id: string;
  name: string;
  tokens: string[];
  collapsed: boolean;
  color?: string;
}

export interface TokenGraphMeta {
  name: string;
  version: string;
  created: string;
  modified: string;
  generator: string;
}

export interface TokenGraph {
  meta: TokenGraphMeta;
  tokens: Record<string, TokenNode>;
  themes: Record<string, ThemeDefinition>;
  groups: Record<string, GroupDefinition>;
}
