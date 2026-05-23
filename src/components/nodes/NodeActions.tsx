import { NodeToolbar, Position } from "@xyflow/react";
import { useGraphStore } from "../../store/graphStore";
import type { TokenLayer } from "../../types/tokens";

const NEXT_LAYER: Record<TokenLayer, TokenLayer> = {
  primitive: "semantic",
  semantic: "component",
  component: "primitive",
};

export function NodeActions({ tokenId }: { tokenId: string }) {
  const selected = useGraphStore((s) => s.selectedTokenId === tokenId);
  const layer = useGraphStore((s) => s.graph.tokens[tokenId]?.layer);
  const deleteToken = useGraphStore((s) => s.deleteToken);
  const duplicateToken = useGraphStore((s) => s.duplicateToken);
  const updateToken = useGraphStore((s) => s.updateToken);

  if (!layer) return null;

  return (
    <NodeToolbar isVisible={selected} position={Position.Top} offset={8}>
      <div className="flex items-center p-1 rounded-lg bg-[var(--color-panel)] border border-[var(--color-panel-border)] shadow-xl">
        <Btn
          title="Duplicate (⌘D)"
          onClick={() => duplicateToken(tokenId)}
        >
          <DuplicateIcon />
        </Btn>
        <Btn
          title={`Cycle layer → ${NEXT_LAYER[layer]}`}
          onClick={() => updateToken(tokenId, { layer: NEXT_LAYER[layer] })}
        >
          <LayerIcon />
        </Btn>
        <span className="w-px h-4 bg-[var(--color-panel-border)] mx-0.5" />
        <Btn
          title="Delete (⌫)"
          onClick={() => deleteToken(tokenId)}
          danger
        >
          <TrashIcon />
        </Btn>
      </div>
    </NodeToolbar>
  );
}

function Btn({
  title,
  onClick,
  children,
  danger,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
        danger
          ? "text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-500/10"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-bg)]"
      }`}
    >
      {children}
    </button>
  );
}

function DuplicateIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <rect x="3" y="3" width="11" height="11" rx="1.5" />
      <path d="M7 17h10V7" opacity="0.6" />
    </svg>
  );
}

function LayerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 3l7 3.5L10 10 3 6.5 10 3z" />
      <path d="M3 10l7 3.5L17 10" opacity="0.6" />
      <path d="M3 13.5L10 17l7-3.5" opacity="0.35" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h12M8 6V4h4v2M6 6l1 11h6l1-11M9 10v4M11 10v4" />
    </svg>
  );
}
