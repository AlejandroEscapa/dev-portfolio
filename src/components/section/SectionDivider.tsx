interface SectionDividerProps {
  index: number;
  total: number;
  label: string;
  showFolio?: boolean;
}

/**
 * SectionDivider — separador entre secciones de la hoja continua.
 * Por defecto filete sencillo sin folio (cada sección da su propio contexto);
 * si se pasa showFolio, vuelve a mostrar el folio numérico (filete doble + folio)
 * para las secciones que lo requieran (p.ej. Projects).
 * Estático por diseño (también bajo prefers-reduced-motion: no hay nada que degradar).
 */
export function SectionDivider({ index, total, label, showFolio }: SectionDividerProps) {
  void index; void total; // compat: aquí solo para el cálculo del folio cuando showFolio=true
  if (showFolio) {

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
  return (
    <div role="separator" aria-label={label} className="section-y">
      <div aria-hidden="true" className="rule-single" />
    </div>
  );
}
