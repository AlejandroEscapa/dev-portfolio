export interface Contribution {
  id: string; // "leasba" | "mas" | "creators"
  hash: string; // 7 hex fake, estilo git log
  companyKey: string; // nombre de empresa como clave i18n
  period: string; // clave i18n del período: difiere es/en en el caso "hoy"/"now"
  type: "feat" | "fix" | "perf"; // los 3 son "feat"
  stack: string[];
  titleKey: string; // línea resumen
  storyKeys: { problema: string; hilo: string; resolucion: string };
}

export const contributions: Contribution[] = [
  {
    id: "leasba",
    hash: "a3f9c21",
    companyKey: "trayectoria.item_leasba_org",
    period: "contributions.leasba_period",
    type: "feat",
    stack: ["AL", "Business Central", "M365"],
    titleKey: "contributions.leasba_title",
    storyKeys: {
      problema: "contributions.leasba_problema",
      hilo: "contributions.leasba_hilo",
      resolucion: "contributions.leasba_resolucion",
    },
  },
  {
    id: "mas",
    hash: "f72e0b4",
    companyKey: "trayectoria.item_mas_org",
    period: "contributions.mas_period",
    type: "feat",
    stack: ["Angular", "TypeScript", "RxJS"],
    titleKey: "contributions.mas_title",
    storyKeys: {
      problema: "contributions.mas_problema",
      hilo: "contributions.mas_hilo",
      resolucion: "contributions.mas_resolucion",
    },
  },
  {
    id: "creators",
    hash: "c81d9aa",
    companyKey: "trayectoria.item_creators_org",
    period: "contributions.creators_period",
    type: "feat",
    stack: ["Laravel", "Slim 3", "SQL Server", "Android", "Magento", "Odoo"],
    titleKey: "contributions.creators_title",
    storyKeys: {
      problema: "contributions.creators_problema",
      hilo: "contributions.creators_hilo",
      resolucion: "contributions.creators_resolucion",
    },
  },
];
