import type { Preset } from "./types";

const formatName = (s: string): string =>
  s
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "untitled";

export const tailwindColor: Preset = {
  id: "tailwind-color",
  name: "Color ramp",
  family: "Tailwind",
  category: "color",
  description: "11-step OKLCH color scale (50 → 950)",
  inputs: [
    { key: "name", label: "Color name", type: "text", default: "brand" },
    { key: "hue", label: "Hue (0–360)", type: "number", default: 250, min: 0, max: 360, step: 1 },
    { key: "chroma", label: "Peak chroma (0–0.4)", type: "number", default: 0.18, min: 0, max: 0.4, step: 0.01 },
  ],
  generate: ({ name, hue, chroma }) => {
    const slug = slugify(String(name));
    const display = formatName(slug);
    const h = Number(hue) || 0;
    const c = Number(chroma) || 0;
    const STEPS = [
      { step: "50",  l: 0.97, cMul: 0.30 },
      { step: "100", l: 0.93, cMul: 0.45 },
      { step: "200", l: 0.87, cMul: 0.60 },
      { step: "300", l: 0.79, cMul: 0.75 },
      { step: "400", l: 0.70, cMul: 0.90 },
      { step: "500", l: 0.61, cMul: 1.00 },
      { step: "600", l: 0.53, cMul: 0.95 },
      { step: "700", l: 0.45, cMul: 0.85 },
      { step: "800", l: 0.37, cMul: 0.70 },
      { step: "900", l: 0.27, cMul: 0.50 },
      { step: "950", l: 0.18, cMul: 0.35 },
    ];
    return STEPS.map(({ step, l, cMul }) => ({
      id: `color.${slug}.${step}`,
      name: `${display} ${step}`,
      value: `oklch(${l.toFixed(2)} ${(c * cMul).toFixed(3)} ${h})`,
      $type: "color",
      category: "color",
    }));
  },
};

export const tailwindSpacing: Preset = {
  id: "tailwind-spacing",
  name: "Spacing scale",
  family: "Tailwind",
  category: "spacing",
  description: "Default Tailwind spacing (0 → 96)",
  inputs: [],
  generate: () => {
    const VALUES: Array<[string, string]> = [
      ["0", "0px"],
      ["px", "1px"],
      ["0-5", "0.125rem"],
      ["1", "0.25rem"],
      ["1-5", "0.375rem"],
      ["2", "0.5rem"],
      ["2-5", "0.625rem"],
      ["3", "0.75rem"],
      ["3-5", "0.875rem"],
      ["4", "1rem"],
      ["5", "1.25rem"],
      ["6", "1.5rem"],
      ["7", "1.75rem"],
      ["8", "2rem"],
      ["9", "2.25rem"],
      ["10", "2.5rem"],
      ["11", "2.75rem"],
      ["12", "3rem"],
      ["14", "3.5rem"],
      ["16", "4rem"],
      ["20", "5rem"],
      ["24", "6rem"],
      ["28", "7rem"],
      ["32", "8rem"],
      ["36", "9rem"],
      ["40", "10rem"],
      ["44", "11rem"],
      ["48", "12rem"],
      ["52", "13rem"],
      ["56", "14rem"],
      ["60", "15rem"],
      ["64", "16rem"],
      ["72", "18rem"],
      ["80", "20rem"],
      ["96", "24rem"],
    ];
    return VALUES.map(([step, value]) => ({
      id: `spacing.${step}`,
      name: `Spacing ${step.replace(/-/g, ".")}`,
      value,
      $type: "dimension",
      category: "spacing",
    }));
  },
};

export const tailwindRadius: Preset = {
  id: "tailwind-radius",
  name: "Radius scale",
  family: "Tailwind",
  category: "radius",
  description: "Border radius (none, sm, base, md, lg, xl, 2xl, 3xl, full)",
  inputs: [],
  generate: () => {
    const VALUES: Array<[string, string, string]> = [
      ["none", "0px", "None"],
      ["sm", "0.125rem", "SM"],
      ["base", "0.25rem", "Base"],
      ["md", "0.375rem", "MD"],
      ["lg", "0.5rem", "LG"],
      ["xl", "0.75rem", "XL"],
      ["2xl", "1rem", "2XL"],
      ["3xl", "1.5rem", "3XL"],
      ["full", "9999px", "Full"],
    ];
    return VALUES.map(([step, value, label]) => ({
      id: `radius.${step}`,
      name: `Radius ${label}`,
      value,
      $type: "dimension",
      category: "radius",
    }));
  },
};

export const tailwindOpacity: Preset = {
  id: "tailwind-opacity",
  name: "Opacity scale",
  family: "Tailwind",
  category: "opacity",
  description: "Opacity values from 0 to 100",
  inputs: [],
  generate: () => {
    const STEPS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];
    return STEPS.map((n) => ({
      id: `opacity.${n}`,
      name: `Opacity ${n}`,
      value: n / 100,
      $type: "number",
      category: "opacity" as const,
    }));
  },
};
