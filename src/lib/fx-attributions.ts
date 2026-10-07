// Procedencia de los componentes de src/components/fx/ (código copiado y
// adaptado de registros shadcn). Complementa attributions.ts (3D).

export interface FxAttribution {
  file: string;
  source: string;
  registryItem: string;
  license: string;
  changes: string;
}

export const FX_ATTRIBUTIONS: FxAttribution[] = [
  {
    file: 'src/components/fx/magic-card.tsx',
    source: 'Magic UI',
    registryItem: '@magicui/magic-card',
    license: 'MIT',
    changes: 'solo modo gradient; next-themes fuera; framer-motion; tokens via props; reduced-motion desactiva el spotlight; innerClassName para cristal',
  },
  {
    file: 'src/components/fx/DecryptedText.tsx',
    source: 'React Bits',
    registryItem: '@react-bits/DecryptedText-TS-TW',
    license: 'MIT',
    changes: 'imports motion/react -> framer-motion; resto intacto',
  },
  {
    file: 'src/components/fx/shimmer-button.tsx',
    source: 'Magic UI',
    registryItem: '@magicui/shimmer-button',
    license: 'MIT',
    changes: 'colores hardcodeados -> tokens semánticos; container-type size (v4); anims con motion-safe:',
  },
  {
    file: 'src/components/fx/Noise.tsx',
    source: 'React Bits',
    registryItem: '@reactbits/Noise-TS-TW',
    license: 'MIT',
    changes: 'reduced-motion -> un solo frame estático (sin rAF); aria-hidden',
  },
  {
    file: 'src/components/fx/ElectricBorder.tsx',
    source: 'React Bits',
    registryItem: '@react-bits/ElectricBorder-TS-TW',
    license: 'MIT',
    changes: 'color por token via useCssColor; hexToRgba tolerante a hsl() via color-mix; reduced-motion -> un frame estático',
  },
];
