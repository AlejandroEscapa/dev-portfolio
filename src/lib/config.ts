import config from '../../portfolio.config.json';

export interface PortfolioConfig {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  primaryColor: string;
  accentColor: string;
  displayFont: 'Space Grotesk' | 'Syne' | 'JetBrains Mono';
  keepCli: 'yes' | 'no';
  keepBoot: 'yes' | 'no';
  aiCoderSection: 'yes' | 'no';
}

export const portfolioConfig: PortfolioConfig = config as PortfolioConfig;
