import { useMemo } from "react";
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

/**
 * Formulario de contacto. Vive aparte de `Contact.tsx` porque arrastra
 * react-hook-form + zod + @hookform/resolvers (~250 KB de fuente) y está al
 * final de la página: se carga en diferido desde `Contact` para que no entre
 * en el bundle inicial (auditoría 2026-10-17).
 *
 * El esquema se construye con `useMemo` sobre `t` en vez de recrearse en cada
 * render, así el resolver no cambia de identidad sin motivo.
 */
const inputCls =
  "h-11 bg-transparent border-neutral-tint/10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 transition-colors";
const textareaCls =
  "bg-transparent border-neutral-tint/10 text-foreground placeholder:text-muted-foreground focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-0 min-h-[80px] resize-none transition-colors";
const messageCls = "text-xs";

const createSchema = (t: (key: string) => string) =>
  z.object({
    name: z.string().min(2, t("contact.form_error_name")),
    email: z.string().email(t("contact.form_error_email")),
    message: z.string().min(10, t("contact.form_error_message")),
  });

export function ContactForm() {
  const { t, lang } = useLanguage();

  const schema = useMemo(() => createSchema(t), [t]);
  const form = useForm<z.infer<ReturnType<typeof createSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", message: "" },
  });

  function onSubmit(values: z.infer<ReturnType<typeof createSchema>>) {
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
                    placeholder={t("contact.form_message_placeholder")}
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
  );
}
