import { useRef } from "react";
import { exportDTCG } from "../adapters/dtcg/export";
import { importDTCG } from "../adapters/dtcg/import";
import { exampleGraph } from "../examples/exampleGraph";
import { saveGraph } from "../store/db";
import { useGraphStore } from "../store/graphStore";

export function Toolbar() {
  const graph = useGraphStore((s) => s.graph);
  const load = useGraphStore((s) => s.load);
  const reset = useGraphStore((s) => s.reset);
  const fileInput = useRef<HTMLInputElement>(null);

  const onImport = async (file: File) => {
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      const next = importDTCG(json, {
        name: file.name.replace(/\.tokens\.json$|\.json$/i, ""),
      });
      load(next);
    } catch (e) {
      alert(`Import failed: ${(e as Error).message}`);
    }
  };

  const onExport = () => {
    const json = exportDTCG(graph);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${graph.meta.name || "tokens"}.tokens.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onSave = async () => {
    await saveGraph(graph);
  };

  const onLoadExample = () => {
    load(exampleGraph());
  };

  const onReset = () => {
    if (confirm("Reset the entire graph?")) reset();
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--color-panel-border)] bg-[var(--color-panel)]">
      <span className="font-semibold text-sm">TokenTrace</span>
      <span className="text-xs text-[var(--color-text-muted)]">·</span>
      <span className="text-sm text-[var(--color-text-muted)]">
        {graph.meta.name}{" "}
        <span className="text-xs">v{graph.meta.version}</span>
      </span>
      <div className="flex-1" />
      <Btn onClick={onLoadExample}>Load Example</Btn>
      <Btn onClick={() => fileInput.current?.click()}>Import DTCG</Btn>
      <input
        ref={fileInput}
        type="file"
        accept=".json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
          e.target.value = "";
        }}
      />
      <Btn onClick={onExport}>Export DTCG</Btn>
      <Btn onClick={onSave}>Save</Btn>
      <Btn onClick={onReset}>Reset</Btn>
    </div>
  );
}

function Btn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-3 py-1.5 rounded border border-[var(--color-panel-border)] hover:bg-[var(--color-canvas-bg)] hover:border-[var(--color-accent)] transition-colors"
    >
      {children}
    </button>
  );
}
