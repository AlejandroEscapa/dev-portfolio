import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone, Download, ExternalLink, Terminal, MessageSquare } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export const SidePanel = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="sticky top-24 space-y-6"
    >
      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/10 glass-strong p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Terminal className="h-4 w-4 text-primary" />
          <span>Quick Actions</span>
        </div>
        <div className="space-y-3">
          <a
            href="https://www.linkedin.com/in/alejandro-olivares-escapa/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
              <Linkedin className="h-5 w-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">LinkedIn</p>
              <p className="text-xs text-muted-foreground">Connect with me</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="https://github.com/alejandrooliesc"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500/20">
              <Github className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">GitHub</p>
              <p className="text-xs text-muted-foreground">View my repos</p>
            </div>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </a>

          <a
            href="mailto:alejandro.oliesc97@gmail.com"
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
              <Mail className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">alejandro.oliesc97@gmail.com</p>
            </div>
          </a>

          <a
            href="tel:+34601175067"
            className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
              <Phone className="h-5 w-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Phone</p>
              <p className="text-xs text-muted-foreground">+34 601 175 067</p>
            </div>
          </a>
        </div>
      </div>

      {/* Quick Terminal */}
      <div className="rounded-2xl border border-white/10 glass-strong p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <MessageSquare className="h-4 w-4 text-accent" />
          <span>Quick Terminal</span>
        </div>
        <div className="rounded-xl bg-black/30 p-4 font-mono text-sm">
          <div className="text-muted-foreground">
            <span className="text-green-400">$</span> whoami
          </div>
          <div className="mt-1 text-foreground">alejandro-olivares</div>
          <div className="mt-3 text-muted-foreground">
            <span className="text-green-400">$</span> cat skills.txt
          </div>
          <div className="mt-1 text-foreground">React • TypeScript • Node.js</div>
          <div className="mt-3 text-muted-foreground">
            <span className="text-green-400">$</span> echo $STATUS
          </div>
          <div className="mt-1 text-green-400">Open to opportunities</div>
        </div>
      </div>

      {/* Download CV */}
      <div className="rounded-2xl border border-white/10 glass-strong p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <Download className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Download CV</p>
            <p className="text-xs text-muted-foreground">Get my resume</p>
          </div>
          <button className="rounded-lg bg-primary/20 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/30">
            PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
};
