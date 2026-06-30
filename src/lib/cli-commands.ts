import { type ThemeId, THEMES } from "./themes";

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
      return "hero/  about/  profile/  stack/  experience/  projects/  education/  contact/";
    case "pwd":
      return "/home/alejandro/portfolio";
    case "date":
      return new Date().toString();
    case "banner":
      return BANNER;
    case "neofetch":
      return NEOFETCH;
    case "sudo":
      return "Nice try. This incident will be reported. 🚨";
    case "rm":
      return "🚫 rm disabled. This is a portfolio, not a server.";
    case "exit":
    case "logout":
      return "👋 See you in the dock. (you can't actually close this tab)";
    default:
      return `command not found: ${cmd}. Type 'help'.`;
  }
}
