export interface Attribution {
  modelKey: 'cooking' | 'gaming' | 'music';
  source: string;
  author: string;
  url: string;
  license: string;
  note?: string;
}

export const ATTRIBUTIONS: Attribution[] = [];

export function getAttribution(key: Attribution['modelKey']): Attribution | undefined {
  return ATTRIBUTIONS.find((a) => a.modelKey === key);
}
