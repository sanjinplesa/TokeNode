import { ReactFlowProvider } from "@xyflow/react";
import { useEffect, useRef } from "react";
import { Canvas } from "./components/Canvas";
import { FloatingToolbar } from "./components/FloatingToolbar";
import { Inspector } from "./components/Inspector";
import { LayerTabs } from "./components/LayerTabs";
import { Toolbar } from "./components/Toolbar";
import { loadGraph, saveGraph } from "./store/db";
import { useGraphStore } from "./store/graphStore";

export default function App() {
  const graph = useGraphStore((s) => s.graph);
  const load = useGraphStore((s) => s.load);
  const hydrated = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadGraph().then((g) => {
      if (cancelled) {
        hydrated.current = true;
        return;
      }
      const current = useGraphStore.getState().graph.tokens;
      if (g && Object.keys(g.tokens).length > 0 && Object.keys(current).length === 0) {
        load(g);
      }
      hydrated.current = true;
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => {
      saveGraph(graph).catch(() => {});
    }, 150);
    return () => clearTimeout(t);
  }, [graph]);

  useEffect(() => {
    const onHide = () => {
      if (hydrated.current) saveGraph(useGraphStore.getState().graph).catch(() => {});
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onHide);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onHide);
    };
  }, []);

  return (
    <ReactFlowProvider>
      <div className="h-full flex flex-col">
        <Toolbar />
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 min-w-0 relative">
            <Canvas />
            <FloatingToolbar />
            <LayerTabs />
          </div>
          <aside className="w-80 border-l border-[var(--color-panel-border)] bg-[var(--color-panel)] overflow-y-auto">
            <Inspector />
          </aside>
        </div>
      </div>
    </ReactFlowProvider>
  );
}
