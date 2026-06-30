import { describe, it, expect } from 'vitest';
import { portfolioConfig } from '@/lib/config';

describe('portfolioConfig', () => {
  it('has required fields', () => {
    expect(portfolioConfig.name).toBeTypeOf('string');
    expect(portfolioConfig.primaryColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(portfolioConfig.accentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
    expect(['Space Grotesk', 'Syne', 'JetBrains Mono', 'Sora', 'Geist']).toContain(portfolioConfig.displayFont);
  });
});
