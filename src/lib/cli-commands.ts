import { type ThemeId, THEMES, SECRET_THEMES, isSecretTheme } from "./themes";

export interface CommandContext {
  setTheme: (t: ThemeId) => void;
  clear: () => void;
  navigate?: (id: string) => void;
}

const HELP = `Available commands:
  help              Show this help
  whoami            About me
  projects          List projects
  skills            Tech stack
  experience        Work history
  education         Education
  impact            Contributions
  certs             Certifications
  stats             Skill bars
  workbench         AI-assisted workflow
  contact           Get in touch
  theme [name]      Switch theme (indigo|catppuccin|dracula|tokyo-night)
  clear             Clear terminal
  history           Show command history
  neofetch          System info
  ls                List sections
  pwd               Print working dir
  date              Current date
  banner            Show ASCII banner
  sudo              Nice try.`;

const BANNER = `
 ██╗     ███████╗██╗  ██╗
 ██║     ██╔════╝╚██╗██╔╝
 ██║     █████╗   ╚███╔╝
 ██║     ██╔══╝   ██╔██╗
 ███████╗███████╗██╔╝ ██╗
 ╚══════╝╚══════╝╚═╝  ╚═╝
alejandro@dev-portfolio:~$`;

const NEOFETCH = `alejandro@portfolio
-----------------

OS: Web 2026
Host: Vite + React 18
Kernel: 5.15.0
Shell: zsh 5.9
WM: shadcn/ui
Theme: dark
Terminal: alacritty
CPU: TS 5.8
Memory: 64 GiB`;

export function executeCommand(rawInput: string, ctx: CommandContext): string {
  const input = rawInput.trim();
  if (!input) return "";

  const [cmd, ...args] = input.split(/\s+/);
  const arg = args.join(" ");

  switch (cmd.toLowerCase()) {
    case "help":
    case "?":
      return HELP;
    case "whoami":
    case "about":
      return "Alejandro Olivares Escapa — Full-Stack Developer. ES/EN. Madrid, ES.";
    case "projects":
    case "proj":
      return "→ ~/projects (scroll to Projects window)";
    case "skills":
    case "stack":
      return "→ ~/stack";
    case "experience":
    case "exp":
      return "→ ~/experience.log";
    case "education":
      return "→ ~/education.txt";
    case "impact":
      return "→ ~/contributions.log";
    case "certs":
      return "→ ~/certifications.md";
    case "stats":
      return "→ ~/stats.json";
    case "workbench":
      ctx.navigate?.("ai-workbench");
      return "→ ~/workbench (scroll to AI Workbench)";
    case "contact":
      return "alejandro.oliesc97@gmail.com | linkedin.com/in/alejandro-olivares-escapa";
    case "theme":
      if (!arg) return `Current themes: ${Object.keys(THEMES).join(", ")}`;
      if (arg in THEMES) { ctx.setTheme(arg as ThemeId); return `theme → ${arg}`; }
      return `unknown theme: ${arg}`;
    case "clear":
    case "cls":
      ctx.clear();
      return "";
    case "history":
      return "(history is rendered by the terminal host)";
    case "ls":
      return "hero/  about/  profile/  stack/  projects/  workbench/  experience/  education/  contact/";
    case "pwd":
      return "/home/alejandro/portfolio";
    case "date":
      return new Date().toString();
    case "banner":
      return BANNER;
    case "neofetch":
      return NEOFETCH;
    case "sudo": {
      // Easter egg (BRAINSTORM §5 C2): el quinto tema no aparece en el menú
      // del dock ni en Spotlight. Este es su única puerta.
      if (args[0] !== "theme") return "Nice try. This incident will be reported. 🚨";
      const name = args[1];
      if (!name) return "usage: sudo theme <name>";
      if (!isSecretTheme(name)) return `sudo: ${name}: no such theme`;
      ctx.setTheme(name);
      return `🔓 hidden theme unlocked: ${SECRET_THEMES[name].label} (${name}) — keep it to yourself.`;
    }
    case "rm":
      return "🚫 rm disabled. This is a portfolio, not a server.";
    case "exit":
    case "logout":
      return "👋 See you in the dock. (you can't actually close this tab)";
    default:
      return `command not found: ${cmd}. Type 'help'.`;
  }
}
