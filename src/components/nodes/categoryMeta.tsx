import type { TokenCategory } from "../../types/tokens";

export interface CategoryMeta {
  label: string;
  accent: string;
  icon: React.ReactNode;
}

function ColorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.5v13M3.5 10h13" opacity="0.5" />
    </svg>
  );
}
function TypeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M5 6h10M10 6v10" />
    </svg>
  );
}
function SpacingIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h14M5 7v6M15 7v6" />
      <path d="M4 9l-1 1 1 1M16 9l1 1-1 1" />
    </svg>
  );
}
function RadiusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 17V8a4 4 0 0 1 4-4h9" />
    </svg>
  );
}
function ShadowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
      <path d="M16.5 7v9.5H7" opacity="0.45" />
    </svg>
  );
}
function OpacityIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
    </svg>
  );
}
function MotionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14c3 0 4-9 8.5-9S14 13 17 13" />
    </svg>
  );
}
function CustomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="10" cy="10" r="2" />
      <circle cx="4" cy="10" r="1" />
      <circle cx="16" cy="10" r="1" />
    </svg>
  );
}

export const CATEGORY_META: Record<TokenCategory, CategoryMeta> = {
  color:      { label: "Color",      accent: "oklch(0.74 0.18 30)",  icon: <ColorIcon /> },
  typography: { label: "Typography", accent: "oklch(0.74 0.17 145)", icon: <TypeIcon /> },
  spacing:    { label: "Spacing",    accent: "oklch(0.78 0.14 200)", icon: <SpacingIcon /> },
  radius:     { label: "Radius",     accent: "oklch(0.74 0.18 290)", icon: <RadiusIcon /> },
  shadow:     { label: "Shadow",     accent: "oklch(0.72 0.16 50)",  icon: <ShadowIcon /> },
  opacity:    { label: "Opacity",    accent: "oklch(0.78 0.15 170)", icon: <OpacityIcon /> },
  motion:     { label: "Motion",     accent: "oklch(0.78 0.16 90)",  icon: <MotionIcon /> },
  custom:     { label: "Custom",     accent: "oklch(0.65 0 0)",      icon: <CustomIcon /> },
};
