import { useReactFlow } from "@xyflow/react";
import { useState } from "react";
import { useGraphStore } from "../store/graphStore";
import type { TokenCategory } from "../types/tokens";
import { RampDialog } from "./RampDialog";

type CategoryDef = {
  key: TokenCategory;
  label: string;
  description: string;
  icon: React.ReactNode;
};

type StructureKey = "group" | "alias" | "collection" | "mode";

type StructureDef = {
  key: StructureKey;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const CATEGORIES: CategoryDef[] = [
  { key: "color", label: "Color", description: "Color tokens", icon: <ColorIcon /> },
  { key: "typography", label: "Typography", description: "Text styles", icon: <TypeIcon /> },
  { key: "spacing", label: "Spacing", description: "Sizing & spacing", icon: <SpacingIcon /> },
  { key: "radius", label: "Radius", description: "Border radius", icon: <RadiusIcon /> },
  { key: "shadow", label: "Shadow", description: "Drop shadows", icon: <ShadowIcon /> },
  { key: "opacity", label: "Opacity", description: "Opacity values", icon: <OpacityIcon /> },
  { key: "motion", label: "Motion", description: "Duration & easing", icon: <MotionIcon /> },
];

const STRUCTURE: StructureDef[] = [
  { key: "group", label: "Group", description: "Organize tokens", icon: <FolderIcon /> },
  { key: "alias", label: "Alias", description: "Reference another token", icon: <LinkIcon /> },
  { key: "collection", label: "Collection", description: "Create a token set", icon: <LayersIcon /> },
  { key: "mode", label: "Mode", description: "Add a mode (Light, Dark…)", icon: <ModeIcon /> },
];

export function FloatingToolbar() {
  const createToken = useGraphStore((s) => s.createToken);
  const createGroup = useGraphStore((s) => s.createGroup);
  const createTheme = useGraphStore((s) => s.createTheme);
  const layer = useGraphStore((s) => s.activeLayer);
  const rf = useReactFlow();
  const [rampOpen, setRampOpen] = useState(false);

  const onCreate = (category: TokenCategory) => {
    const canvasEl = document.querySelector(".react-flow");
    let pos: { x: number; y: number } | undefined;
    if (canvasEl) {
      const rect = canvasEl.getBoundingClientRect();
      pos = rf.screenToFlowPosition({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    }
    createToken(category, layer, pos);
  };

  const onStructure = (key: StructureKey) => {
    switch (key) {
      case "group": {
        const name = prompt("Group name?");
        if (name && name.trim()) createGroup(name);
        break;
      }
      case "mode": {
        const name = prompt("Mode name (e.g. Light, Dark, High Contrast)?");
        if (name && name.trim()) createTheme(name);
        break;
      }
      case "alias":
      case "collection":
        alert(`"${key}" — coming soon`);
        break;
    }
  };

  return (
    <>
    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-0.5 p-1.5 rounded-full bg-[var(--color-panel)] border border-[var(--color-panel-border)] shadow-2xl">
      <IconButton
        label="Ramp"
        description="Generate a token scale (Tailwind, etc.)"
        onClick={() => setRampOpen(true)}
      >
        <RampIcon />
      </IconButton>

      <div className="h-px w-7 bg-[var(--color-panel-border)] my-1" />

      {CATEGORIES.map((c) => (
        <IconButton
          key={c.key}
          label={c.label}
          description={c.description}
          onClick={() => onCreate(c.key)}
        >
          {c.icon}
        </IconButton>
      ))}

      <div className="h-px w-7 bg-[var(--color-panel-border)] my-1" />

      {STRUCTURE.map((s) => (
        <IconButton
          key={s.key}
          label={s.label}
          description={s.description}
          onClick={() => onStructure(s.key)}
        >
          {s.icon}
        </IconButton>
      ))}
    </div>
    {rampOpen && <RampDialog onClose={() => setRampOpen(false)} />}
    </>
  );
}

function IconButton({
  label,
  description,
  onClick,
  children,
}: {
  label: string;
  description: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative group w-10 h-10 flex items-center justify-center rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-canvas-bg)] transition-colors"
    >
      {children}
      <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 rounded-lg bg-[var(--color-panel)] border border-[var(--color-panel-border)] shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left">
        <span className="block text-xs font-medium text-[var(--color-text-primary)]">
          {label}
        </span>
        <span className="block text-[10px] text-[var(--color-text-muted)] mt-0.5">
          {description}
        </span>
      </span>
    </button>
  );
}

/* ──────────────── Icons (monochrome, currentColor) ──────────────── */

function RampIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 16h2v-3h3v-3h3V7h3V4h3" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M8.5 11.5L11.5 8.5" />
      <path d="M9.5 5.5h3.5a3 3 0 0 1 0 6h-1.5" />
      <path d="M10.5 14.5H7a3 3 0 0 1 0-6h1.5" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M10 3l7 3.5L10 10 3 6.5 10 3z" />
      <path d="M3 10l7 3.5L17 10" />
      <path d="M3 13.5L10 17l7-3.5" opacity="0.55" />
    </svg>
  );
}

function ColorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.5v13M3.5 10h13" opacity="0.5" />
    </svg>
  );
}

function TypeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M5 6h10M10 6v10" />
    </svg>
  );
}

function SpacingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10h14M5 7v6M15 7v6" />
      <path d="M4 9l-1 1 1 1M16 9l1 1-1 1" />
    </svg>
  );
}

function RadiusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M4 17V8a4 4 0 0 1 4-4h9" />
    </svg>
  );
}

function ShadowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="10" height="10" rx="1.5" />
      <path d="M16.5 7v9.5H7" opacity="0.45" />
    </svg>
  );
}

function OpacityIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="10" cy="10" r="6.5" />
      <path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" />
    </svg>
  );
}

function MotionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 14c3 0 4-9 8.5-9S14 13 17 13" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d="M3 6.5a1 1 0 0 1 1-1h3l2 2h7a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6.5z" />
    </svg>
  );
}

function ModeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7.5" cy="10" r="3" />
      <path d="M12 6.5a3.5 3.5 0 0 1 0 7" />
      <path d="M7.5 4.5v1M7.5 14.5v1M3.5 10h1M11.5 10h1" />
    </svg>
  );
}
