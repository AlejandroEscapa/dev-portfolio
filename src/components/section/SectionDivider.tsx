interface SectionDividerProps {
  index: number;
  total: number;
  label: string;
}

/**
 * SectionDivider — el único ritmo entre secciones de la hoja continua:
 * filete doble + folio mono (`02 / 09 · proyectos`). Estático por diseño
 * (también bajo prefers-reduced-motion: no hay nada que degradar).
 */
export function SectionDivider({ index, total, label }: SectionDividerProps) {
  const folio = `${String(index).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  return (
    <div role="separator" aria-label={`${folio} · ${label}`} className="section-y">
      <div aria-hidden="true" className="rule-double" />
      <p aria-hidden="true" className="folio mt-3">
        {folio} <span aria-hidden="true">·</span> {label.toLowerCase()}
      </p>
    </div>
  );
}
