import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send } from "lucide-react";
import { RevealStagger } from "@/components/fx/RevealStagger";
import { Reveal } from "@/components/fx/Reveal";

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

  return (
    /* The section keeps its asymmetric vertical padding so the two-column
       composition sits centred inside the window; data + socials + signature
       live in the site footer (src/components/Footer.tsx). */
    <section className="relative min-h-[60vh] flex flex-col pt-7 md:pt-10 pb-4">
      {/* The sheet section owns the entry; reveals only orchestrate its contents. */}
      {/* Same content inset as Projects/Education (container max-w-6xl):
          the window stays full-bleed, the content floats inside it. */}
      <div className="flex-1 flex flex-col container mx-auto max-w-6xl">
        <RevealStagger className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] gap-10 lg:gap-12">
          {/* Left column — numbered label + title, vertically centred; the
              narrower column defers to the form */}
          <Reveal variant="fadeUpSm" className="flex flex-col justify-center">
            <div className="space-y-3">
              <div className="mb-4 flex items-center gap-3 font-mono text-sm uppercase tracking-label text-muted-foreground">
                <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
                <span>{t("contact.section_label")}</span>
              </div>
              <h2 className="text-h1 font-bold tracking-heading leading-tight">
                {t("contact.heading")}
              </h2>

              {/* 2nd phrase — one step under the display heading so the
                  hierarchy heading > subhead > label stays readable */}
              <p className="text-base sm:text-lg md:text-xl leading-snug text-muted-foreground">
                {t("contact.heading_line1")} {t("contact.heading_line2")}
              </p>
            </div>
          </Reveal>

          {/* Right column — the form card takes the wider column (~55%)
              so it leads the composition */}
          <Reveal variant="fadeUpSm" className="flex flex-col justify-center">
            <div className="relative w-full rounded-lg glass border border-neutral-tint/[0.08] overflow-hidden transition-[transform,border-color,background] duration-300 hover:-translate-y-0.5">
              {/* Primary accent border */}
              <div
                aria-hidden="true"
                className="absolute top-0 left-0 right-0 h-[3px] bg-primary"
              />

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="grid gap-5 p-6 md:p-8"
                >
                  {/* Row 1: name + email — visible mono labels, placeholders as examples */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormControl>
                            <Input
                              data-cursor="text"
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
                        <FormItem className="grid gap-2">
                          <FormControl>
                            <Input
                              data-cursor="text"
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
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-5 items-stretch">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="grid gap-2">
                          <FormControl>
                            <Textarea
                              data-cursor="text"
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
            </div>
          </Reveal>
        </RevealStagger>
      </div>
    </section>
  );
};
