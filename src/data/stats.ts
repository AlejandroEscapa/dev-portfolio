// Stats de autorrevelación declarada: escala 0..16, se pintan como texto ASCII en mono.
export interface StatRow {
  id: string; // "frontend" | "backend" | "mobile" | "erp_legacy" | "ai_tooling"
  value: number; // 0..16
  max: 16;
  captionKey: string; // leyenda cualitativa
}

// Barra ASCII en mono: "█" repite value, "░" rellena hasta max. Sin track de fondo CSS.
export function statBar(value: number, max: number): string {
  return "█".repeat(value) + "░".repeat(max - value);
}

export const stats: StatRow[] = [
  { id: "frontend", value: 13, max: 16, captionKey: "stats.frontend_caption" },
  { id: "backend", value: 10, max: 16, captionKey: "stats.backend_caption" },
  { id: "mobile", value: 15, max: 16, captionKey: "stats.mobile_caption" },
  { id: "erp_legacy", value: 8, max: 16, captionKey: "stats.erp_legacy_caption" },
  { id: "ai_tooling", value: 11, max: 16, captionKey: "stats.ai_tooling_caption" },
];
