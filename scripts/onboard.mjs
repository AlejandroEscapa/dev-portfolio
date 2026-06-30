import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { existsSync, readFileSync, writeFileSync } from 'fs';

const rl = readline.createInterface({ input, output });

const ask = async (q, def) => {
  const suffix = def ? ` [${def}]: ` : ': ';
  const ans = (await rl.question(q + suffix)).trim();
  return ans || def || '';
};

const askHex = async (q, def) => {
  while (true) {
    const ans = await ask(q, def);
    if (/^#[0-9a-fA-F]{6}$/.test(ans)) return ans;
    console.log('  Invalid hex. Use #RRGGBB format.');
  }
};

const askChoice = async (q, options, def) => {
  while (true) {
    const ans = await ask(`${q} (${options.join('/')})`, def);
    if (options.includes(ans)) return ans;
    console.log(`  Choose one of: ${options.join(', ')}`);
  }
};

const existing = existsSync('portfolio.config.json')
  ? JSON.parse(readFileSync('portfolio.config.json', 'utf8'))
  : {};

const name = await ask('Your name', existing.name || 'Alejandro Olivares');
const tagline = await ask('Tagline', existing.tagline || 'Frontend & Mobile Developer · AI-Assisted Development');
const email = await ask('Email', existing.email || 'alejandro.oliesc97@gmail.com');
const phone = await ask('Phone', existing.phone || '+34601175067');
const linkedin = await ask('LinkedIn URL', existing.linkedin || 'https://www.linkedin.com/in/alejandro-olivares-escapa/');
const github = await ask('GitHub URL', existing.github || 'https://github.com/alejandrooliesc');
const primaryColor = await askHex('Primary color (#RRGGBB)', existing.primaryColor || '#7c5cff');
const accentColor = await askHex('Accent color (#RRGGBB)', existing.accentColor || '#22d3ee');
const displayFont = await askChoice('Display font', ['Space Grotesk', 'Syne', 'JetBrains Mono', 'Sora', 'Geist'], existing.displayFont || 'Space Grotesk');
const keepCli = await askChoice('Keep terminal CLI?', ['yes', 'no'], existing.keepCli ?? 'yes');
const keepBoot = await askChoice('Keep boot sequence?', ['yes', 'no'], existing.keepBoot ?? 'yes');
const aiCoderSection = await askChoice('Enable AI-Coder section?', ['yes', 'no'], existing.aiCoderSection ?? 'yes');

const config = { name, tagline, email, phone, linkedin, github, primaryColor, accentColor, displayFont, keepCli, keepBoot, aiCoderSection };
writeFileSync('portfolio.config.json', JSON.stringify(config, null, 2) + '\n');
console.log('\nSaved to portfolio.config.json');
rl.close();
