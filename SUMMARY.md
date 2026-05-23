# TokenTrace — Project Summary

A visual node-based editor for design token systems, inspired by ComfyUI. Companion CLI analyzer (Phase 3, not yet built) will scan codebases and map token usage back to definitions. Specification lives in chat — this file tracks **current state of the code**.

---

## Stack

| Layer | Choice |
|---|---|
| Bundler | Vite 5 |
| UI | React 18 + TypeScript 5.6 (strict) |
| Graph canvas | @xyflow/react 12 (React Flow) |
| State | Zustand 5 |
| Storage | Dexie 4 (IndexedDB autosave) |
| Styles | Tailwind v4 (`@theme` block, CSS vars) |
| Package mgr | pnpm |

---

## Data model

Canonical type is `TokenGraph` in [src/types/tokens.ts](src/types/tokens.ts):

```
TokenGraph
├── meta            name, version, created, modified, generator
├── tokens          Record<id, TokenNode>
├── themes          Record<id, ThemeDefinition>   (overrides per layer)
└── groups          Record<id, GroupDefinition>   (visual grouping)

TokenNode
├── id              dot-notation: "color.text.primary"
├── name            human-readable
├── layer           "primitive" | "semantic" | "component"
├── category        "color" | "spacing" | "typography" | "radius" | "shadow"
│                   | "opacity" | "motion" | "custom"
├── value           string | number | TypographyComposite | ShadowComposite | GradientComposite
│                   raw value, OR "{some.other.id}" reference syntax
├── resolvedValue   computed string after resolving all {ref} chains
├── references[]    upstream token IDs (what this depends on)
├── referencedBy[]  downstream token IDs (what depends on this)
├── position        { x, y } on canvas
├── $type, $description, $extensions     DTCG-compatible metadata
├── usage[]         (populated by future CLI: file, line, column, raw)
└── health          (populated by future CLI: dead/orphan/skip-violation/etc.)
```

### Layer rules (enforced in [src/lib/validation.ts](src/lib/validation.ts))

- **Primitive** — no inbound references; raw values only
- **Semantic** — references primitives or other semantics
- **Component** — references **only** semantics (component → primitive = "skip violation")
- Cycles are rejected at edge creation time

Validation runs only on edge creation. Imported graphs with existing violations are not (yet) badged.

---

## File map

```
src/
├── App.tsx                          Layout (Toolbar / Canvas+FloatingToolbar+LayerTabs / Inspector)
│                                    IndexedDB hydration + 150ms-debounced autosave
│                                    Save on visibilitychange + beforeunload
├── main.tsx, index.css              Vite entry + Tailwind @theme tokens
├── types/tokens.ts                  Full data model
├── lib/
│   ├── validation.ts                Layer rules + cycle detection
│   ├── resolve.ts                   Recursive {ref} resolution + theme overrides
│   └── ids.ts                       inferLayer, inferCategory, extractReferences, formatName
├── store/
│   ├── graphStore.ts                Zustand store
│   │                                State: graph, selectedTokenId, activeLayer, activeThemeId
│   │                                Actions: load, reset,
│   │                                         addToken, createToken, createGroup, createTheme,
│   │                                         updateToken, deleteToken,
│   │                                         addReference, removeReference,
│   │                                         updatePosition,
│   │                                         selectToken, setActiveLayer, setActiveTheme
│   └── db.ts                        Dexie wrapper (saveGraph, loadGraph, clearGraph)
├── adapters/dtcg/
│   ├── import.ts                    Parses DTCG JSON, builds graph, resolves refs
│   └── export.ts                    Writes DTCG JSON from graph (preserves $type/$description/$extensions)
├── examples/exampleGraph.ts         Hardcoded sample (13 tokens) used by Load Example button
└── components/
    ├── Toolbar.tsx                  Top bar: brand · Load Example · Import DTCG · Export DTCG · Save · Reset
    ├── LayerTabs.tsx                Top-center pill: Primitive · Semantic · Component
    ├── FloatingToolbar.tsx          Left side, vertically centered (w-60)
    │                                Sections: ADD (7 categories) · ADD STRUCTURE (Group/Alias/Collection/Mode)
    ├── Inspector.tsx                Right sidebar, editable Name/Layer/Category/Value/Description + Delete
    ├── Canvas.tsx                   ReactFlow with onConnect, onNodesDelete, onEdgesDelete,
    │                                ZoomIndicator panel (top-right), Background, Controls, MiniMap
    └── nodes/
        ├── PrimitiveNode.tsx        Output handle (right); color swatch when category=color
        ├── SemanticNode.tsx         Target + source handles; shows reference target
        └── ComponentNode.tsx        Target handle only (leaf in graph)
```

---

## What works today

### Creation
- 7 categories × 3 layers via FloatingToolbar (click any row → token created at viewport center, auto-selected)
- Group and Mode creation via prompt (stored in `graph.groups` / `graph.themes` — no UI panel yet to manage them)

### Editing
- Inspector: rename, change layer/category, edit value (raw or JSON for composites), add description, delete
- DELETE/Backspace key on selected node: properly syncs to store (fixed earlier — was being lost)
- Drag handle → handle: creates a reference, validates layer rules, rejects invalid

### Import/Export
- DTCG JSON import: parses nested `$value`/`$type`/`$description`/`$extensions`, infers layer from naming
- DTCG JSON export: roundtrip-faithful

### Persistence
- IndexedDB autosave 150ms after every store change
- Save on `visibilitychange` and `beforeunload` (no data loss on tab close)
- Hydration race guarded (initial IndexedDB load skipped if user has already created tokens)

### Canvas UX
- Zoom indicator (top-right): live percentage + Reset to 100% + Fit view
- Default viewport: `{ x: 0, y: 0, zoom: 1 }`
- Layer tabs (top-center) drive the "next created token" layer via shared store state

---

## What's NOT implemented

- **Semantic creation flow** — clicking Semantic + Color creates a token with a *raw value*, not a reference. Architecturally broken on creation. Open UX design (popover to pick a primitive, modal for empty-state, "promote raw → primitive" action) discussed but not built.
- **Alias and Collection** structures — placeholder `alert("coming soon")` on click
- **Theme UI** — themes can be created but there's no panel to set per-token overrides, and `activeThemeId` doesn't yet drive resolved values on the canvas
- **Group UI** — groups created but not visualized on canvas
- **Composite editors** — typography and shadow values are edited as raw JSON in the Inspector
- **Color picker** — color values are plain text inputs
- **Health badges on nodes** — no visual indicators for dead/orphan/skip-violation
- **Scale generator** — OKLCH 50–950 generator (Phase 2 spec deliverable)
- **CLI analyzer** — Phase 3 of spec, not started
- **Other import/export adapters** — CSS, Figma Variables, Tailwind v4 `@theme` export, Style Dictionary, TS definitions
- **Health dashboard** panel (bottom)
- **Reference picker popover** — clicking a semantic node's empty input would ideally show compatible primitives

---

## Open UX questions

### Semantic creation flow (highest priority)

**Scenario A — no primitives exist:** clicking Semantic + Color should prompt:
- Generate a color scale first (creates 11 primitives), OR
- Create one primitive inline with custom value, OR
- Continue unlinked (flagged as orphan, fixable later)

**Scenario B — primitives exist:** should show a popover next to the toolbar:
- List of category-matching primitives with search
- Click → semantic created with that reference
- Drag-and-drop on the canvas still works as alt path

Discussed but not built. This is the biggest UX gap.

---

## How to run

```bash
# Dev server (avoid `pnpm dev` — corepack dep-check errors on ignored esbuild build script)
./node_modules/.bin/vite

# Type check
./node_modules/.bin/tsc --noEmit

# Production build
./node_modules/.bin/vite build
```

Dev URL: http://127.0.0.1:5173

To reset everything (wipe IndexedDB + start fresh): click **Reset** in the top toolbar, OR in browser DevTools → Application → IndexedDB → delete `tokentrace` database.

---

## Suggested next steps (in priority order)

1. **Semantic creation flow** — popover for selecting a source primitive when creating semantic tokens; empty-state modal; "promote raw value to primitive" action in Inspector
2. **Theme management UI** — panel for editing overrides per theme; theme switcher in top Toolbar; resolved values on canvas should change when a theme is active
3. **Composite editors** — proper fields for typography (font/size/weight/line-height) and shadow (x/y/blur/spread/color)
4. **Color picker** — replace text input with OKLCH or HSL picker for color tokens
5. **Group and Collection** UI — visualize groups on canvas; figure out what Collection means in our model (Figma Variables uses "collection = named set with modes")
6. **Health badges on nodes** — implement `validateGraph()` that finds dead/orphan/skip-violation tokens, surface them as inline badges + a health dashboard panel

---

## Decisions worth remembering

- **Data model is DTCG-compatible by design.** All token IDs are dot-notation. Reference syntax is `{some.id}`. This means import-edit-export is roundtrip-faithful and users can leave for any DTCG tool.
- **Layer is data, not just UI.** Each token's `layer` field is stored. Validation uses it. Auto-layout uses it. Inspector lets you change it (though changing layer of a token with existing references may produce inconsistencies — not yet validated).
- **Position is persistent per-token.** Dragging a node updates `position` in the store; reload restores layout.
- **No StrictMode race risks.** Hydration only loads from IndexedDB if the store is still empty when the load promise resolves — so fast user interactions can't be overwritten by a late hydration.
