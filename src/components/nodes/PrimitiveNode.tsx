import { Handle, Position, type NodeProps } from "@xyflow/react";
import { useGraphStore } from "../../store/graphStore";
import { CATEGORY_META } from "./categoryMeta";
import { NodeActions } from "./NodeActions";

export function PrimitiveNode({ data }: NodeProps) {
  const tokenId = (data as { tokenId: string }).tokenId;
  const token = useGraphStore((s) => s.graph.tokens[tokenId]);
  const resolved = useGraphStore((s) => s.resolved(tokenId));

  if (!token) return null;
  const meta = CATEGORY_META[token.category];
  const isColor = token.category === "color";

  return (
    <>
    <NodeActions tokenId={tokenId} />
    <div
      className="rounded-lg border border-[var(--color-panel-border)] bg-[var(--color-panel)] min-w-[220px] shadow-lg overflow-hidden"
      style={{ borderLeft: `3px solid ${meta.accent}` }}
    >
      <div className="px-3 py-2 border-b border-[var(--color-panel-border)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{ color: meta.accent }} className="shrink-0">
            {meta.icon}
          </span>
          <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {meta.label}
          </span>
        </div>
        <span className="text-[9px] uppercase tracking-wider text-[var(--color-text-muted)] px-1.5 py-0.5 rounded border border-[var(--color-panel-border)] shrink-0">
          Primitive
        </span>
      </div>
      <div className="p-3">
        <div className="text-[13px] text-[var(--color-text-primary)]">
          {token.name}
        </div>
        <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">
          {token.id}
        </div>
        <div className="mt-3 flex items-center gap-2">
          {isColor && (
            <div
              className="w-8 h-8 rounded border border-[var(--color-panel-border)] shrink-0"
              style={{ background: resolved }}
            />
          )}
          <code className="text-[11px] text-[var(--color-text-primary)]/80 break-all">
            {resolved}
          </code>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
    </>
  );
}
