import type { ReactElement } from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import { portfolioConfig } from "@/lib/config";
import { toast } from "@/components/ui/sonner";
import {
  Form,
  FormField,
  FormItem,
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

type BrandIcon = () => ReactElement;

const inputCls =
  "h-11 bg-transparent border-neutral-tint/10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 transition-colors";
const textareaCls =
  "bg-transparent border-neutral-tint/10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 min-h-[80px] resize-none transition-colors";
const messageCls = "text-xs";

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
    Icon: BrandIcon;
    aria: string;
  }> = [
    {
      key: "linkedin",
      href: portfolioConfig.linkedin,
      external: true,
      Icon: LinkedInSvg,
      aria: t("aria.linkedin"),
    },
    {
      key: "github",
      href: portfolioConfig.github,
      external: true,
      Icon: GitHubSvg,
      aria: t("aria.github"),
    },
    {
      key: "phone",
      href: `tel:${portfolioConfig.phone}`,
      external: false,
      Icon: PhoneSvg,
      aria: t("aria.phone"),
    },
    {
      key: "email",
      href: `mailto:${portfolioConfig.email}`,
      external: false,
      Icon: MailSvg,
      aria: t("aria.email"),
    },
  ];

  return (
    /* Asymmetric section padding: keeps top breathing (large subhead) and tightens
       bottom so the divider + signature sit very close to the container's base. */
    <section className="relative min-h-[60vh] flex flex-col justify-between pt-7 md:pt-10 pb-3 md:pb-2 gap-4 md:gap-6">
      {/* No internal reveal: the content rides the WindowChrome entry moment. */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Left: 5/12 — Title + 2nd phrase (slightly smaller, no 3rd phrase) + Location */}
          <div className="lg:col-span-5 flex flex-col justify-center gap-8 pl-16 md:pl-24 lg:pl-36">
            <div className="space-y-3">
              <h2 className="text-display font-display font-bold tracking-heading leading-none">
                {t("contact.heading")}
              </h2>

              {/* 2nd phrase — slightly reduced now that 3rd phrase is gone */}
              <p className="text-lg sm:text-xl md:text-2xl leading-snug text-muted-foreground">
                {t("contact.heading_line1")} {t("contact.heading_line2")}
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="text-label uppercase tracking-label text-muted-foreground">
                {t("contact.location_label")}
              </p>
              <p className="font-sans text-sm text-foreground">
                {t("contact.location_value")}
              </p>
            </div>
          </div>

          {/* Right: 7/12 — translucent card */}
          <div className="lg:col-span-7 flex flex-col justify-center items-center">
            <div className="relative w-full max-w-2xl rounded-lg glass border border-neutral-tint/[0.08] overflow-hidden transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5">
              {/* Primary accent border */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-primary"
              />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-3 p-4"
                >
                  {/* Row 1: name + email — placeholders + aria-label for a11y */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={t("contact.form_name")}
                              aria-label={t("contact.form_name")}
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
                        <FormItem>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="you@domain.com"
                              aria-label={t("contact.form_email")}
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

                  {/* Row 2: message + submit button — items-stretch */}
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-stretch">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder={t(
                                "contact.form_message_placeholder",
                              )}
                              aria-label={t("contact.form_message")}
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
                      className="group h-auto min-h-[80px] py-2 px-5 w-full sm:w-44 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-[0_0_40px_var(--shadow-glow)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                      <span className="hidden sm:inline">
                        {t("contact.form_submit")}
                      </span>
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Divider + signed social icons (no chip wrapper, larger icons) */}
              <div className="border-t border-neutral-tint/10 px-5 py-3 flex flex-wrap items-center justify-center gap-5">
                {socials.map((s) => {
                  const Icon = s.Icon;
                  return (
                    <a
                      key={s.key}
                      href={s.href}
                      target={s.external ? "_blank" : undefined}
                      rel={s.external ? "noopener noreferrer" : undefined}
                      aria-label={s.aria}
                      className="inline-flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-0 [&_svg]:h-7 [&_svg]:w-7"
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom divider + signature line — pushed to the very bottom of the
            container via flex-1 on the grid above; signature sits tight on it. */}
        <div className="mt-auto pt-3 border-t border-neutral-tint/10">
          <p className="text-center text-xs sm:text-[11px] font-medium text-muted-foreground/90">
            {t("contact.signature")}
          </p>
        </div>
      </div>
    </section>
  );
};
