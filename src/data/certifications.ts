// Certificaciones verificables. Solo elev8 declara validUntil e IBM/elev8 llevan credentialId.
// La URL apunta al feed de LinkedIn donde se publicó la credencial.
export interface Certification {
  id: string; // "elev8" | "big_school" | "ibm"
  issuer: string; // texto plano
  titleKey: string; // clave i18n del título propio (certifications.<id>_title)
  date: string;
  validUntil?: string;
  credentialId?: string;
  url: string;
}

export const certifications: Certification[] = [
  {
    id: "elev8",
    issuer: "Elev8 School",
    titleKey: "certifications.elev8_title",
    date: "Sept 2026",
    validUntil: "2030",
    credentialId: "e43bf971-c499-4c43-a69a-a546bc3a8be9",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7514304684887826432/",
  },
  {
    id: "big_school",
    issuer: "BIG school",
    titleKey: "certifications.big_school_title",
    date: "Jun 2026",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7476236098143444992/",
  },
  {
    id: "ibm",
    issuer: "IBM",
    titleKey: "certifications.ibm_title",
    date: "Feb 2026",
    credentialId: "1965d5c5-2593-47ca-bed5-a5190bfa7667",
    url: "https://www.linkedin.com/feed/update/urn:li:activity:7429203243265794050/",
  },
];
