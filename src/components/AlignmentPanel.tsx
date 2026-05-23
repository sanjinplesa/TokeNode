import { Panel } from "@xyflow/react";
import { useState } from "react";
import { useGraphStore } from "../store/graphStore";
import type { TokenLayer } from "../types/tokens";

const LAYERS: TokenLayer[] = ["primitive", "semantic", "component"];

export function AlignmentPanel() {
  const [layer, setLayer] = useState<TokenLayer>("primitive");
  const [gap, setGap] = useState(180);
  const alignLayer = useGraphStore((s) => s.alignLayer);
  const distributeLayer = useGraphStore((s) => s.distributeLayer);

  return (
    <Panel position="bottom-center" className="!m-3">
      <div className="flex items-center rounded-md bg-[var(--color-panel)] border border-[var(--color-panel-border)] shadow text-[11px] overflow-hidden">
        <select
          value={layer}
          onChange={(e) => setLayer(e.target.value as TokenLayer)}
          className="bg-transparent px-2.5 py-1.5 capitalize text-[var(--color-text-primary)] outline-none hover:bg-[var(--color-canvas-bg)] cursor-pointer"
        >
          {LAYERS.map((l) => (
            <option key={l} value={l} className="bg-[var(--color-panel)]">
              {l}
            </option>
          ))}
        </select>

        <span className="w-px h-4 bg-[var(--color-panel-border)]" />

        <button
          type="button"
          onClick={() => alignLayer(layer)}
          title="Align all to layer column X"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-canvas-bg)] transition-colors"
        >
          <AlignIcon />
          Align
        </button>

        <span className="w-px h-4 bg-[var(--color-panel-border)]" />

        <button
          type="button"
          onClick={() => distributeLayer(layer, gap)}
          title="Distribute evenly along Y with the given gap"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-canvas-bg)] transition-colors"
        >
          <DistributeIcon />
          Distribute
        </button>

        <span className="w-px h-4 bg-[var(--color-panel-border)]" />

        <label className="flex items-center gap-1.5 px-2.5 py-1.5">
          <span className="text-[var(--color-text-muted)]">Gap</span>
          <input
            type="number"
            value={gap}
            onChange={(e) => setGap(Math.max(0, Number(e.target.value)))}
            min={0}
            step={10}
            className="w-14 bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-1.5 py-0.5 text-[var(--color-text-primary)] focus:border-[var(--color-accent)] outline-none tabular-nums"
          />
        </label>
      </div>
    </Panel>
  );
}

function AlignIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 3v14M7 6h8M7 10h6M7 14h9" />
    </svg>
  );
}

function DistributeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 4h14M3 10h14M3 16h14" />
    </svg>
  );
}
