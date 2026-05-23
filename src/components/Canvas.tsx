import { useCallback, useEffect } from "react";
import {
  Background,
  ConnectionMode,
  Controls,
  Panel,
  ReactFlow,
  applyNodeChanges,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  useEdgesState,
  useNodesState,
  useReactFlow,
  useViewport,
} from "@xyflow/react";
import { LAYER_X } from "../lib/layout";
import { useGraphStore } from "../store/graphStore";
import type { TokenLayer } from "../types/tokens";
import { AlignmentPanel } from "./AlignmentPanel";
import { ComponentNode } from "./nodes/ComponentNode";
import { PrimitiveNode } from "./nodes/PrimitiveNode";
import { SemanticNode } from "./nodes/SemanticNode";

const nodeTypes = {
  primitive: PrimitiveNode,
  semantic: SemanticNode,
  component: ComponentNode,
};

function ZoomIndicator() {
  const { zoom } = useViewport();
  const { zoomTo, fitView } = useReactFlow();
  const pct = Math.round(zoom * 100);
  return (
    <Panel position="top-right" className="!m-3">
      <div className="flex items-center rounded-md bg-[var(--color-panel)] border border-[var(--color-panel-border)] text-[11px] font-medium text-[var(--color-text-primary)] shadow overflow-hidden">
        <button
          type="button"
          onClick={() => zoomTo(1, { duration: 150 })}
          title="Reset to 100%"
          className="px-2.5 py-1 hover:text-[var(--color-accent)] tabular-nums transition-colors"
        >
          {pct}%
        </button>
        <span className="w-px h-4 bg-[var(--color-panel-border)]" />
        <button
          type="button"
          onClick={() => fitView({ padding: 0.2, duration: 200 })}
          title="Fit view"
          className="px-2.5 py-1 hover:text-[var(--color-accent)] transition-colors"
        >
          Fit
        </button>
      </div>
    </Panel>
  );
}

const SNAP_THRESHOLD = 14;

function snapToNearest(
  selfId: string,
  position: { x: number; y: number },
  tokens: Record<string, { position?: { x: number; y: number } }>
): { x: number; y: number } {
  let { x, y } = position;
  let bestDx = SNAP_THRESHOLD;
  let bestDy = SNAP_THRESHOLD;
  for (const [id, t] of Object.entries(tokens)) {
    if (id === selfId || !t.position) continue;
    const dx = Math.abs(t.position.x - position.x);
    if (dx < bestDx) {
      bestDx = dx;
      x = t.position.x;
    }
    const dy = Math.abs(t.position.y - position.y);
    if (dy < bestDy) {
      bestDy = dy;
      y = t.position.y;
    }
  }
  return { x, y };
}

type TokenNodeData = { tokenId: string };

export function Canvas() {
  const graph = useGraphStore((s) => s.graph);
  const selectedTokenId = useGraphStore((s) => s.selectedTokenId);
  const addReference = useGraphStore((s) => s.addReference);
  const removeReference = useGraphStore((s) => s.removeReference);
  const updatePosition = useGraphStore((s) => s.updatePosition);
  const selectToken = useGraphStore((s) => s.selectToken);
  const deleteToken = useGraphStore((s) => s.deleteToken);
  const duplicateToken = useGraphStore((s) => s.duplicateToken);
  const undo = useGraphStore((s) => s.undo);
  const redo = useGraphStore((s) => s.redo);

  const [rfNodes, setRfNodes, onNodesChangeInternal] =
    useNodesState<Node<TokenNodeData>>([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Sync nodes/edges from the graph store
  useEffect(() => {
    const counters: Record<TokenLayer, number> = { primitive: 0, semantic: 0, component: 0 };
    const tokens = Object.values(graph.tokens);
    const nodes: Node<TokenNodeData>[] = tokens.map((token) => {
      const pos =
        token.position ?? {
          x: LAYER_X[token.layer],
          y: counters[token.layer]++ * 140,
        };
      return {
        id: token.id,
        type: token.layer,
        position: pos,
        data: { tokenId: token.id },
        selected: token.id === selectedTokenId,
      };
    });

    const edges: Edge[] = [];
    for (const token of tokens) {
      for (const ref of token.references) {
        edges.push({
          id: `${ref}->${token.id}`,
          source: ref,
          target: token.id,
        });
      }
    }

    setRfNodes(nodes);
    setRfEdges(edges);
  }, [graph.tokens, selectedTokenId, setRfNodes, setRfEdges]);

  const onNodesChange = useCallback(
    (changes: NodeChange<Node<TokenNodeData>>[]) => {
      onNodesChangeInternal(changes);
      for (const change of changes) {
        if (
          change.type === "position" &&
          change.dragging === false &&
          change.position
        ) {
          const snapped = snapToNearest(
            change.id,
            change.position,
            useGraphStore.getState().graph.tokens
          );
          updatePosition(change.id, snapped);
        }
      }
    },
    [onNodesChangeInternal, updatePosition]
  );

  const onConnect = useCallback(
    (conn: Connection) => {
      if (!conn.source || !conn.target) return;
      const result = addReference(conn.source, conn.target);
      if (!result.ok) {
        console.warn("Connection rejected:", result.error);
      }
    },
    [addReference]
  );

  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      for (const edge of edgesToDelete) {
        removeReference(edge.source, edge.target);
      }
    },
    [removeReference]
  );

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) {
        deleteToken(node.id);
      }
    },
    [deleteToken]
  );

  const onNodeClick = useCallback(
    (_: unknown, node: Node) => selectToken(node.id),
    [selectToken]
  );

  const onPaneClick = useCallback(() => selectToken(null), [selectToken]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);
      if (isInput) return;

      const cmd = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      if (cmd && key === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }
      if (cmd && key === "y") {
        e.preventDefault();
        redo();
        return;
      }
      if (cmd && key === "d" && selectedTokenId) {
        e.preventDefault();
        duplicateToken(selectedTokenId);
        return;
      }
      if (!cmd && (e.key === "Backspace" || e.key === "Delete") && selectedTokenId) {
        e.preventDefault();
        deleteToken(selectedTokenId);
        return;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTokenId, duplicateToken, deleteToken, undo, redo]);

  // Surface applyNodeChanges so it's tree-shaken-friendly even if unused directly.
  void applyNodeChanges;

  return (
    <ReactFlow
      nodes={rfNodes}
      edges={rfEdges}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onEdgesDelete={onEdgesDelete}
      onNodesDelete={onNodesDelete}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      connectionMode={ConnectionMode.Strict}
      deleteKeyCode={["Backspace", "Delete"]}
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      minZoom={0.1}
      maxZoom={2}
      selectionOnDrag
      panOnDrag={[1, 2]}
      panActivationKeyCode="Space"
    >
      <Background gap={24} color="var(--color-canvas-grid)" />
      <Controls />
      <ZoomIndicator />
      <AlignmentPanel />
    </ReactFlow>
  );
}
