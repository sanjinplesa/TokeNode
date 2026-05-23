import type { ReactNode } from "react";
import { useGraphStore } from "../store/graphStore";
import type { TokenCategory, TokenLayer, TokenValue } from "../types/tokens";

const LAYERS: TokenLayer[] = ["primitive", "semantic", "component"];
const CATEGORIES: TokenCategory[] = [
  "color",
  "spacing",
  "typography",
  "radius",
  "shadow",
  "opacity",
  "motion",
  "custom",
];

export function Inspector() {
  const selectedId = useGraphStore((s) => s.selectedTokenId);
  const token = useGraphStore((s) =>
    selectedId ? s.graph.tokens[selectedId] : null
  );
  const resolved = useGraphStore((s) => (selectedId ? s.resolved(selectedId) : ""));
  const updateToken = useGraphStore((s) => s.updateToken);
  const deleteToken = useGraphStore((s) => s.deleteToken);

  if (!token) {
    return (
      <div className="p-4 text-sm text-[var(--color-text-muted)]">
        Select a token to inspect, or add one from the toolbar on the left.
      </div>
    );
  }

  const valueText =
    typeof token.value === "object"
      ? JSON.stringify(token.value, null, 2)
      : String(token.value);

  const onValueChange = (v: string) => {
    let parsed: TokenValue = v;
    const trimmed = v.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        parsed = JSON.parse(trimmed);
      } catch {
        parsed = v;
      }
    } else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
      parsed = Number(trimmed);
    }
    updateToken(token.id, { value: parsed });
  };

  return (
    <div className="p-4 space-y-3">
      <EditableField
        label="Name"
        value={token.name}
        onChange={(v) => updateToken(token.id, { name: v })}
      />

      <Field label="ID">
        <code className="text-xs break-all text-[var(--color-text-primary)]/80">
          {token.id}
        </code>
      </Field>

      <div className="grid grid-cols-2 gap-2">
        <SelectField
          label="Layer"
          value={token.layer}
          options={LAYERS}
          onChange={(v) => updateToken(token.id, { layer: v as TokenLayer })}
        />
        <SelectField
          label="Category"
          value={token.category}
          options={CATEGORIES}
          onChange={(v) =>
            updateToken(token.id, { category: v as TokenCategory })
          }
        />
      </div>

      <EditableField
        label="Value"
        value={valueText}
        onChange={onValueChange}
        multiline={typeof token.value === "object"}
        rows={typeof token.value === "object" ? 5 : 1}
        mono
      />

      <Field label="Resolved">
        <div className="flex items-center gap-2">
          {token.category === "color" && (
            <div
              className="w-6 h-6 rounded border border-[var(--color-panel-border)] shrink-0"
              style={{ background: resolved }}
            />
          )}
          <code className="text-xs break-all">{resolved}</code>
        </div>
      </Field>

      <EditableField
        label="Description"
        value={token.$description ?? ""}
        onChange={(v) =>
          updateToken(token.id, { $description: v || undefined })
        }
        multiline
        rows={2}
        placeholder="What is this token for?"
      />

      {token.references.length > 0 && (
        <Field label="References">
          <ul className="text-xs space-y-0.5">
            {token.references.map((r) => (
              <li key={r}>
                <code>{r}</code>
              </li>
            ))}
          </ul>
        </Field>
      )}

      {token.referencedBy.length > 0 && (
        <Field label={`Used by (${token.referencedBy.length})`}>
          <ul className="text-xs space-y-0.5">
            {token.referencedBy.map((r) => (
              <li key={r}>
                <code>{r}</code>
              </li>
            ))}
          </ul>
        </Field>
      )}

      <div className="pt-3 border-t border-[var(--color-panel-border)]">
        <button
          type="button"
          onClick={() => {
            if (confirm(`Delete token "${token.id}"?`)) deleteToken(token.id);
          }}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Delete token
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

interface EditableFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}

function EditableField({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
  mono,
  placeholder,
}: EditableFieldProps) {
  const fontClass = mono ? "font-mono" : "";
  return (
    <Field label={label}>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className={`w-full text-xs bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-2 py-1.5 focus:border-[var(--color-accent)] outline-none resize-y placeholder:text-[var(--color-text-muted)]/50 ${fontClass}`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full text-xs bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-2 py-1.5 focus:border-[var(--color-accent)] outline-none placeholder:text-[var(--color-text-muted)]/50 ${fontClass}`}
        />
      )}
    </Field>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs bg-[var(--color-canvas-bg)] border border-[var(--color-panel-border)] rounded px-2 py-1.5 focus:border-[var(--color-accent)] outline-none capitalize"
      >
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-[var(--color-panel)]">
            {opt}
          </option>
        ))}
      </select>
    </Field>
  );
}
