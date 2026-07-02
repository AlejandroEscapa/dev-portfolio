import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Vinyl, ChefHat, Controller } from '@/components/ui/PassionArt';

const accent = 'hsl(270 80% 65%)';
const accentSoft = 'hsl(270 50% 85%)';

describe('PassionArt — Vinyl', () => {
  it('renders an SVG', () => {
    const { container } = render(<Vinyl accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('exposes vinyl-spinner, vinyl-play, and vinyl-tonearm data-testids', () => {
    const { getByTestId } = render(<Vinyl accentColor={accent} accentSoft={accentSoft} />);
    expect(getByTestId('vinyl-spinner')).toBeInTheDocument();
    expect(getByTestId('vinyl-play')).toBeInTheDocument();
    expect(getByTestId('vinyl-tonearm')).toBeInTheDocument();
  });
});

describe('PassionArt — ChefHat', () => {
  it('renders an SVG', () => {
    const { container } = render(<ChefHat accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('exposes chef-breather and 3 chef-vapor data-testids', () => {
    const { getByTestId } = render(<ChefHat accentColor={accent} accentSoft={accentSoft} />);
    expect(getByTestId('chef-breather')).toBeInTheDocument();
    expect(getByTestId('chef-vapor-1')).toBeInTheDocument();
    expect(getByTestId('chef-vapor-2')).toBeInTheDocument();
    expect(getByTestId('chef-vapor-3')).toBeInTheDocument();
  });
});

describe('PassionArt — Controller', () => {
  it('renders an SVG', () => {
    const { container } = render(<Controller accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('exposes 4 ctrl-dpad-* data-testids (one per direction)', () => {
    const { getByTestId } = render(<Controller accentColor={accent} accentSoft={accentSoft} />);
    expect(getByTestId('ctrl-dpad-up')).toBeInTheDocument();
    expect(getByTestId('ctrl-dpad-right')).toBeInTheDocument();
    expect(getByTestId('ctrl-dpad-down')).toBeInTheDocument();
    expect(getByTestId('ctrl-dpad-left')).toBeInTheDocument();
  });

  it('exposes both sticks and both center LEDs', () => {
    const { getByTestId } = render(<Controller accentColor={accent} accentSoft={accentSoft} />);
    expect(getByTestId('ctrl-stick-left')).toBeInTheDocument();
    expect(getByTestId('ctrl-stick-right')).toBeInTheDocument();
    expect(getByTestId('ctrl-led-up')).toBeInTheDocument();
    expect(getByTestId('ctrl-led-down')).toBeInTheDocument();
  });
});

describe('PassionArt — motion gating', () => {
  it('emits data-motion=enabled on Vinyl when no static prop is passed', () => {
    const { container } = render(<Vinyl accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('enabled');
  });

  it('emits data-motion=reduced on ChefHat when no static prop is passed', () => {
    const { container } = render(<ChefHat accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('enabled');
  });

  it('emits data-motion=reduced on Controller when no static prop is passed', () => {
    const { container } = render(<Controller accentColor={accent} accentSoft={accentSoft} />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('enabled');
  });

  it('forces data-motion=reduced when static prop is true (Vinyl)', () => {
    const { container } = render(<Vinyl accentColor={accent} accentSoft={accentSoft} static />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('reduced');
  });

  it('forces data-motion=reduced when static prop is true (ChefHat)', () => {
    const { container } = render(<ChefHat accentColor={accent} accentSoft={accentSoft} static />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('reduced');
  });

  it('forces data-motion=reduced when static prop is true (Controller)', () => {
    const { container } = render(<Controller accentColor={accent} accentSoft={accentSoft} static />);
    expect(container.querySelector('svg')?.getAttribute('data-motion')).toBe('reduced');
  });
});
