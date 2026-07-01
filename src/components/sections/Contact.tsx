import type { ReactElement, ReactNode } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, MapPin } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  LinkedInSvg,
  GitHubSvg,
  PhoneSvg,
  MailSvg,
} from "@/components/brand-icons";

type SocialTone = "primary" | "accent" | "accentAlt";
type BrandIcon = () => ReactElement;

const socialTones: Record<SocialTone, { base: string; glow: string }> = {
  primary: {
    base:
      "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-[0_0_40px_var(--shadow-glow)]",
    glow: "bg-gradient-to-r from-primary to-primary-glow",
  },
  accent: {
    base: "liquid-glass text-foreground hover:border-accent/50",
    glow: "bg-accent/30",
  },
  accentAlt: {
    base: "liquid-glass text-foreground hover:border-primary-glow/50",
    glow: "bg-primary-glow/30",
  },
};

function SocialCircleVisual({
  tone,
  children,
}: {
  tone: SocialTone;
  children: ReactNode;
}) {
  const cls = socialTones[tone];
  return (
    <span
      className={cn(
        "relative inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110",
        cls.base,
      )}
    >
      {children}
      <span
        className={cn(
          "absolute inset-0 -z-10 rounded-full blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-80",
          cls.glow,
        )}
      />
    </span>
  );
}

const inputCls =
  "h-11 bg-white/[0.03] border-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 transition-colors";
const textareaCls =
  "bg-white/[0.03] border-white/10 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 min-h-[120px] resize-none transition-colors";
const formItemCls = "space-y-1.5";
const labelCls = "text-xs text-muted-foreground font-normal";
const messageCls = "text-xs";
const subEyebrowCls =
  "flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground";

export const Contact = () => {
  const { t, lang } = useLanguage();

  const formSchema = z.object({
    name: z.string().min(2, t("contact.form_error_name")),
    email: z.string().email(t("contact.form_error_email")),
    message: z.string().min(10, t("contact.form_error_message")),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const subjectTemplate =
      lang === "es" ? "Nuevo mensaje de {name}" : "New message from {name}";
    const subject = encodeURIComponent(
      subjectTemplate.replace("{name}", values.name),
    );
    const body = encodeURIComponent(
      `Name: ${values.name}\nEmail: ${values.email}\n\n${values.message}`,
    );
    const mailto = `mailto:${portfolioConfig.email}?subject=${subject}&body=${body}`;
    toast(t("contact.form_sending"));
    window.location.href = mailto;
    form.reset();
  }

  const socials: Array<{
    key: string;
    href: string;
    external: boolean;
    tone: SocialTone;
    Icon: BrandIcon;
    label: string;
    aria: string;
  }> = [
    {
      key: "linkedin",
      href: portfolioConfig.linkedin,
      external: true,
      tone: "primary",
      Icon: LinkedInSvg,
      label: t("contact.social_linkedin"),
      aria: t("aria.linkedin"),
    },
    {
      key: "github",
      href: portfolioConfig.github,
      external: true,
      tone: "accent",
      Icon: GitHubSvg,
      label: t("contact.social_github"),
      aria: t("aria.github"),
    },
    {
      key: "phone",
      href: `tel:${portfolioConfig.phone}`,
      external: false,
      tone: "accentAlt",
      Icon: PhoneSvg,
      label: t("contact.social_phone"),
      aria: t("aria.phone"),
    },
    {
      key: "email",
      href: `mailto:${portfolioConfig.email}`,
      external: false,
      tone: "accent",
      Icon: MailSvg,
      label: t("contact.social_email"),
      aria: t("aria.email"),
    },
  ];

  return (
    <section className="relative py-12">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground">
                <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <span>{t("contact.section_label")}</span>
              </div>

              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tighter leading-[1.02]">
                <span className="block text-gradient">
                  {t("contact.heading_line1")}
                </span>
                <span className="block text-gradient-primary">
                  {t("contact.heading_line2")}
                </span>
              </h2>

              <p className="max-w-md text-sm sm:text-base leading-relaxed text-muted-foreground">
                {t("contact.subheading")}
              </p>

              <div className="pt-2 space-y-3">
                <div className={subEyebrowCls}>
                  <span className="h-px w-6 bg-gradient-to-r from-primary to-transparent" />
                  <span>{t("contact.location_label")}</span>
                </div>
                <div className="group inline-flex items-center gap-3">
                  <SocialCircleVisual tone="accent">
                    <MapPin className="h-5 w-5" />
                  </SocialCircleVisual>
                  <span className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                    {t("contact.location_value")}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-10">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-3 rounded-2xl glass-strong border border-white/10 p-5 sm:p-6"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className={formItemCls}>
                          <FormLabel className={labelCls}>
                            {t("contact.form_name")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={t("contact.form_name")}
                              autoComplete="name"
                              className={inputCls}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className={messageCls} />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className={formItemCls}>
                          <FormLabel className={labelCls}>
                            {t("contact.form_email")}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@domain.com"
                              autoComplete="email"
                              className={inputCls}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className={messageCls} />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem className={formItemCls}>
                        <FormLabel className={labelCls}>
                          {t("contact.form_message")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("contact.form_message_placeholder")}
                            className={textareaCls}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={messageCls} />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="group mt-1 h-11 w-full rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-[0_0_40px_var(--shadow-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300"
                  >
                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                    {t("contact.form_submit")}
                  </Button>
                </form>
              </Form>

              <div className="space-y-3">
                <div className={subEyebrowCls}>
                  <span className="h-px w-6 bg-gradient-to-r from-primary to-transparent" />
                  <span>{t("contact.networks_label")}</span>
                </div>
                <div className="flex flex-col gap-2.5">
                  {socials.map((s) => {
                    const Icon = s.Icon;
                    return (
                      <a
                        key={s.key}
                        href={s.href}
                        target={s.external ? "_blank" : undefined}
                        rel={s.external ? "noopener noreferrer" : undefined}
                        aria-label={s.aria}
                        className="group flex items-center gap-3 py-2 transition-colors duration-300"
                      >
                        <SocialCircleVisual tone={s.tone}>
                          <Icon />
                        </SocialCircleVisual>
                        <span className="text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary">
                          {s.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center text-xs text-muted-foreground">
            {t("contact.copyright").replace(
              "{year}",
              String(new Date().getFullYear()),
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
