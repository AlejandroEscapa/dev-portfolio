// Side quests: las tres vocaciones no técnicas. El icono se referencia por nombre (Disc3, AudioWaveform, Gamepad2 de lucide-react).
// `title` es una clave i18n (via titleKey en el brief): "Voz & vídeo" difiere en es/en.
export interface SideQuest {
  id: string; // "dj" | "voz" | "gaming"
  title: string; // clave i18n, resuelve a "DJ" | "Voz & vídeo"/"Voice & video" | "Gaming"
  icon: "Disc3" | "AudioWaveform" | "Gamepad2"; // glyph Lucide
  bodyKey: string;
  transferKey: string;
}

export const sidequests: SideQuest[] = [
  {
    id: "dj",
    title: "sidequests.dj_title",
    icon: "Disc3",
    bodyKey: "sidequests.dj_body",
    transferKey: "sidequests.dj_transfer",
  },
  {
    id: "voz",
    title: "sidequests.voz_title",
    icon: "AudioWaveform",
    bodyKey: "sidequests.voz_body",
    transferKey: "sidequests.voz_transfer",
  },
  {
    id: "gaming",
    title: "sidequests.gaming_title",
    icon: "Gamepad2",
    bodyKey: "sidequests.gaming_body",
    transferKey: "sidequests.gaming_transfer",
  },
];
