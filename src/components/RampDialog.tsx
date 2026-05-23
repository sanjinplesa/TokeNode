import { useEffect, useMemo, useState } from "react";
import { PRESETS } from "../lib/presets";
import type { Preset } from "../lib/presets";
import { useGraphStore } from "../store/graphStore";

const LAYER_X_PRIMITIVE = 0;

export function RampDialog({ onClose }: { onClose: () => void }) {
  const [presetId, setPresetId] = useState<string>(PRESETS[0].id);
  const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
  const [params, setParams] = useState<Record<string, string | number>>(() =>
    initParams(preset)
  );

  // Reset params when preset changes
  useEffect(() => {
    setParams(initParams(preset));
  }, [preset]);

  const tokens = useGraphStore((s) => s.graph.tokens);
  const addToken = useGraphStore((s) => s.addToken);
  const selectToken = useGraphStore((s) => s.selectToken);

  const generated = useMemo(() => {
    try {
      return preset.generate(params);
    } catch {
      return [];
    }
  }, [preset, params]);

  const conflictCount = generated.filter((g) => tokens[g.id]).length;
  const newCount = generated.length - conflictCount;

  const handleCreate = () => {
    // Find next Y for primitive column
    const primitives = Object.values(tokens).filter((t) => t.layer === "primitive");
    const maxY = primitives.reduce(
      (m, t) => Math.max(m, t.position?.y ?? 0),
      0
    );
    const startY = primitives.length > 0 ? maxY + 140 : 0;

    let i = 0;
    for (const g of generated) {
      if (tokens[g.id]) continue;
      addToken({
        id: g.id,
        name: g.name,
        layer: "primitive",
        category: g.category,
        value: g.value,
        resolvedValue:
          typeof g.value === "string" ? g.value : JSON.stringify(g.value),
        references: [],
        referencedBy: [],
        position: { x: LAYER_X_PRIMITIVE, y: startY + i * 130 },
        $type: g.$type,
      });
      i++;
    }
    if (generated.length > 0) selectToken(generated[0].id);
    onClose();
  };

  // Group presets by family for the select
  const byFamily = useMemo(() => {
    const map = new Map<string, Preset[]>();
    for (const p of PRESETS) {
      if (!map.has(p.family)) map.set(p.family, []);
      map.get(p.family)!.push(p);
    }
    return Array.from(map.entries());
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-panel)] border border-[var(--color-panel-border)] rounded-xl shadow-2xl w-[560px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--color-panel-border)] flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-[var(--color-text-primary)]">
              Generate primitive ramp
            </div>
            <div className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
              Create multiple primitive tokens from a common preset
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-lg leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Preset">
            <select
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="w-full text-sm bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-2 py-1.5 focus:border-[var(--color-accent)] outline-none"
            >
              {byFamily.map(([family, presets]) => (
                <optgroup key={family} label={family}>
                  {presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
              {preset.description}
            </p>
          </Field>

          {preset.inputs.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {preset.inputs.map((input) => (
                <Field key={input.key} label={input.label}>
                  <input
                    type={input.type === "number" ? "number" : "text"}
                    value={params[input.key] ?? ""}
                    onChange={(e) =>
                      setParams((p) => ({
                        ...p,
                        [input.key]:
                          input.type === "number"
                            ? Number(e.target.value)
                            : e.target.value,
                      }))
                    }
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    className="w-full text-sm bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-2 py-1.5 focus:border-[var(--color-accent)] outline-none"
                  />
                </Field>
              ))}
            </div>
          )}

          <Field
            label={`Preview · ${generated.length} tokens${
              conflictCount > 0 ? ` · ${conflictCount} already exist` : ""
            }`}
          >
            <div className="grid grid-cols-1 gap-0.5 max-h-[240px] overflow-y-auto rounded border border-[var(--color-panel-border)] bg-[var(--color-canvas-bg)]/60 p-1.5">
              {generated.map((g) => {
                const exists = !!tokens[g.id];
                return (
                  <div
                    key={g.id}
                    className={`flex items-center gap-2 px-2 py-1 text-[11px] rounded ${
                      exists ? "opacity-40" : ""
                    }`}
                  >
                    {g.category === "color" && typeof g.value === "string" && (
                      <div
                        className="w-4 h-4 rounded border border-[var(--color-panel-border)] shrink-0"
                        style={{ background: g.value }}
                      />
                    )}
                    <code className="text-[var(--color-text-primary)] truncate min-w-0 flex-1">
                      {g.id}
                    </code>
                    <code className="text-[var(--color-text-muted)] truncate min-w-0 max-w-[40%]">
                      {typeof g.value === "string"
                        ? g.value
                        : typeof g.value === "number"
                          ? g.value
                          : "…"}
                    </code>
                    {exists && (
                      <span className="text-[10px] text-[var(--color-text-muted)] shrink-0">
                        exists
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="px-5 py-3 border-t border-[var(--color-panel-border)] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-3 py-1.5 rounded border border-[var(--color-panel-border)] hover:bg-[var(--color-canvas-bg)] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={newCount === 0}
            className="text-xs px-3 py-1.5 rounded bg-[var(--color-accent)]/20 border border-[var(--color-accent)] text-[var(--color-text-primary)] hover:bg-[var(--color-accent)]/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Create {newCount} {newCount === 1 ? "token" : "tokens"}
          </button>
        </div>
      </div>
    </div>
  );
}

function initParams(preset: Preset): Record<string, string | number> {
  const init: Record<string, string | number> = {};
  for (const inp of preset.inputs) {
    init[inp.key] = inp.default ?? (inp.type === "number" ? 0 : "");
  }
  return init;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5">
        {label}
      </div>
      {children}
    </div>
  );
}
