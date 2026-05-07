import { motion, type Variants } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { User, ChefHat, Sparkles } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";

interface AboutProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "about";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const About = ({ id = SECTION_ID, innerRef, motionStyle }: AboutProps) => {
  const { t } = useLanguage();

  return (
    <SectionContainer maxWidth="lg" id={id} innerRef={innerRef} motionStyle={motionStyle}>
      <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="mb-12 flex items-center gap-3 text-sm uppercase tracking-[0.3em] text-muted-foreground"
        >
          <span className="h-px w-12 bg-gradient-to-r from-primary to-transparent" />
          <span>{t("about.section_label")}</span>
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          custom={0}
          variants={fadeUp}
          className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl"
        >
          <span className="text-gradient">{t("about.heading_before")}</span>{" "}
          <span className="text-gradient-primary">{t("about.heading_after")}</span>
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-10 grid gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-8">
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 sm:p-10">
              <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />

              <div className="relative space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                <p>
                  {t("about.bio_p1")} <span className="font-medium text-foreground">{t("about.bio_p1_highlight")}</span>{t("about.bio_p1_after")}
                </p>
                <p>
                  {t("about.bio_p2")} <span className="font-medium text-foreground">{t("about.bio_p2_highlight")}</span> {t("about.bio_p2_after")} <span className="font-medium text-foreground">{t("about.bio_p2_tech")}</span>.
                </p>
                <p>
                  {t("about.bio_p3")} <span className="font-medium text-foreground">{t("about.bio_p3_highlight")}</span>{t("about.bio_p3_after")}
                </p>
                <p>
                  {t("about.bio_p4")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <div className="glass relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 pr-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass">
                <User className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("about.role_label")}
                </p>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {t("about.role_value")}
                </p>
                <p className="text-sm text-primary">{t("about.role_detail")}</p>
              </div>
            </div>

            <div className="glass relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 pr-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass">
                <ChefHat className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("about.background_label")}
                </p>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {t("about.background_value")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("about.background_detail")}
                </p>
              </div>
            </div>

            <div className="glass relative flex items-center gap-4 overflow-hidden rounded-3xl p-5 pr-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl glass">
                <Sparkles className="h-7 w-7 text-accent" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("about.edge_label")}
                </p>
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {t("about.edge_value")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("about.edge_detail")}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
    </SectionContainer>
  );
};

