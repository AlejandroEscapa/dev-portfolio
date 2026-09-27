export type Category = "experience" | "education" | "certification" | "internship";
export type Variant = "milestone" | "experience";

export interface TrayectoriaItem {
  id: string;
  category: Category;
  startDate: string;
  endDate: string;
  titleKey: string;
  orgKey: string;
  locationKey: string;
  modalityKey?: string;
  detailKey?: string;
  variant: Variant;
  bulletKeys?: string[];
  techTags?: string[];
}

export const trayectoriaItems: TrayectoriaItem[] = [
  {
    id: "alsea",
    category: "experience",
    startDate: "2019-06",
    endDate: "2020-05",
    titleKey: "trayectoria.item_alsea_title",
    orgKey: "trayectoria.item_alsea_org",
    locationKey: "trayectoria.item_alsea_location",
    modalityKey: "trayectoria.item_alsea_modality",
    detailKey: "trayectoria.item_alsea_detail",
    variant: "milestone",
  },
  {
    id: "dam",
    category: "education",
    startDate: "2021-11",
    endDate: "2023-05",
    titleKey: "trayectoria.item_dam_title",
    orgKey: "trayectoria.item_dam_org",
    locationKey: "trayectoria.item_dam_location",
    variant: "experience",
    bulletKeys: [
      "trayectoria.item_dam_bullet_1",
      "trayectoria.item_dam_bullet_2",
      "trayectoria.item_dam_bullet_3",
    ],
  },
  {
    id: "leasba",
    category: "internship",
    startDate: "2023-03",
    endDate: "2023-05",
    titleKey: "trayectoria.item_leasba_title",
    orgKey: "trayectoria.item_leasba_org",
    locationKey: "trayectoria.item_leasba_location",
    modalityKey: "trayectoria.item_leasba_modality",
    variant: "experience",
    bulletKeys: [
      "trayectoria.item_leasba_bullet_1",
      "trayectoria.item_leasba_bullet_2",
      "trayectoria.item_leasba_bullet_3",
    ],
  },
  {
    id: "master",
    category: "education",
    startDate: "2024-01",
    endDate: "2026-03",
    titleKey: "trayectoria.item_master_title",
    orgKey: "trayectoria.item_master_org",
    locationKey: "trayectoria.item_master_location",
    variant: "experience",
    bulletKeys: [
      "trayectoria.item_master_bullet_1",
      "trayectoria.item_master_bullet_2",
      "trayectoria.item_master_bullet_3",
    ],
  },
  {
    id: "pez_tomillo",
    category: "experience",
    startDate: "2024-03",
    endDate: "2024-08",
    titleKey: "trayectoria.item_pez_tomillo_title",
    orgKey: "trayectoria.item_pez_tomillo_org",
    locationKey: "trayectoria.item_pez_tomillo_location",
    modalityKey: "trayectoria.item_pez_tomillo_modality",
    detailKey: "trayectoria.item_pez_tomillo_detail",
    variant: "milestone",
  },
  {
    id: "udon",
    category: "experience",
    startDate: "2025-03",
    endDate: "2026-01",
    titleKey: "trayectoria.item_udon_title",
    orgKey: "trayectoria.item_udon_org",
    locationKey: "trayectoria.item_udon_location",
    modalityKey: "trayectoria.item_udon_modality",
    detailKey: "trayectoria.item_udon_detail",
    variant: "milestone",
  },
  {
    id: "ibm_ai",
    category: "certification",
    startDate: "2026-02",
    endDate: "2026-02",
    titleKey: "trayectoria.item_ibm_ai_title",
    orgKey: "trayectoria.item_ibm_ai_org",
    locationKey: "trayectoria.item_ibm_ai_location",
    detailKey: "trayectoria.item_ibm_ai_detail",
    variant: "milestone",
  },
  {
    id: "mas",
    category: "internship",
    startDate: "2026-03",
    endDate: "2026-06",
    titleKey: "trayectoria.item_mas_title",
    orgKey: "trayectoria.item_mas_org",
    locationKey: "trayectoria.item_mas_location",
    modalityKey: "trayectoria.item_mas_modality",
    variant: "experience",
    bulletKeys: [
      "trayectoria.item_mas_bullet_1",
      "trayectoria.item_mas_bullet_2",
      "trayectoria.item_mas_bullet_3",
    ],
    techTags: ["Angular", "TypeScript", "RxJS"],
  },
  {
    id: "big_school",
    category: "certification",
    startDate: "2026-06",
    endDate: "2026-06",
    titleKey: "trayectoria.item_big_school_title",
    orgKey: "trayectoria.item_big_school_org",
    locationKey: "trayectoria.item_big_school_location",
    detailKey: "trayectoria.item_big_school_detail",
    variant: "milestone",
  },
  {
    id: "creators",
    category: "experience",
    startDate: "2026-07",
    endDate: "present",
    titleKey: "trayectoria.item_creators_title",
    orgKey: "trayectoria.item_creators_org",
    locationKey: "trayectoria.item_creators_location",
    modalityKey: "trayectoria.item_creators_modality",
    variant: "experience",
    bulletKeys: [
      "trayectoria.item_creators_bullet_1",
      "trayectoria.item_creators_bullet_2",
      "trayectoria.item_creators_bullet_3",
    ],
    techTags: ["Laravel", "Slim 3", "Android", "Magento", "Odoo"],
  },
];
