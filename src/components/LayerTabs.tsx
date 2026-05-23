import { useGraphStore } from "../store/graphStore";
import type { TokenLayer } from "../types/tokens";

const LAYERS: { key: TokenLayer; label: string; icon: React.ReactNode }[] = [
  { key: "primitive", label: "Primitive", icon: <CubeIcon /> },
  { key: "semantic", label: "Semantic", icon: <LinkIcon /> },
  { key: "component", label: "Component", icon: <LayersIcon /> },
];

export function LayerTabs() {
  const layer = useGraphStore((s) => s.activeLayer);
  const setLayer = useGraphStore((s) => s.setActiveLayer);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-0.5 p-1 rounded-full bg-[var(--color-panel)] border border-[var(--color-panel-border)] shadow-xl">
      {LAYERS.map((l) => {
        const active = layer === l.key;
        return (
          <button
            key={l.key}
            type="button"
            onClick={() => setLayer(l.key)}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              active
                ? "bg-[var(--color-canvas-bg)] text-[var(--color-accent)] shadow-inner"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <span className="shrink-0">{l.icon}</span>
            <span>{l.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function CubeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 3l6 3.5v7L10 17l-6-3.5v-7L10 3z" />
      <path d="M4 6.5L10 10l6-3.5M10 10v7" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8.5 11.5L11.5 8.5" />
      <path d="M9.5 5.5h3.5a3 3 0 0 1 0 6h-1.5" />
      <path d="M10.5 14.5H7a3 3 0 0 1 0-6h1.5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 3l7 3.5L10 10 3 6.5 10 3z" />
      <path d="M3 10l7 3.5L17 10" />
      <path d="M3 13.5L10 17l7-3.5" opacity="0.55" />
    </svg>
  );
}
