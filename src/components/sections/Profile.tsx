import { motion, type Variants } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { ChefHat, ArrowRight, Code2 } from "lucide-react";
import { SectionContainer } from "@/components/ui/SectionContainer";
import { useLanguage } from "@/context/LanguageContext";

interface ProfileProps {
  id?: string;
  innerRef?: React.RefObject<HTMLElement>;
  motionStyle?: {
    scale?: MotionValue<number>;
    y?: MotionValue<number>;
    opacity?: MotionValue<number>;
  };
}

const SECTION_ID = "profile";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: EASE },
  }),
};

export const Profile = ({ id = SECTION_ID, innerRef, motionStyle }: ProfileProps) => {
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
          <span>{t("profile.section_label")}</span>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-1">
          {/* Asymmetric: left big text */}
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-1"
          >
            <motion.h2
              custom={0}
              variants={fadeUp}
              className="text-4xl font-bold leading-tight tracking-tighter sm:text-5xl md:text-6xl"
            >
              <span className="text-gradient">{t("profile.heading_before")}</span>
              <br />
              <span className="text-gradient-primary">{t("profile.heading_after")}</span>
            </motion.h2>

            <motion.p
              custom={1}
              variants={fadeUp}
              className="mt-8 text-lg leading-relaxed text-muted-foreground"
            >
              {t("profile.bio_p1_before")} <span className="text-foreground font-medium">{t("profile.bio_p1_highlight")}</span> {t("profile.bio_p1_middle")} <span className="text-foreground font-medium">{t("profile.bio_p1_title")}</span>{t("profile.bio_p1_after")} <span className="text-foreground font-medium">{t("profile.bio_p1_term")}</span>{t("profile.bio_p1_final")}
            </motion.p>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 text-lg leading-relaxed text-muted-foreground"
            >
              {t("profile.bio_p2_before")} <span className="text-foreground font-medium">{t("profile.bio_p2_highlight")}</span>{t("profile.bio_p2_after")} <span className="text-foreground font-medium">{t("profile.bio_p2_tagline")}</span>
            </motion.p>
          </motion.div>

          {/* Asymmetric: right transition card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-1 lg:pt-0"
          >
            <div className="glass-strong relative overflow-hidden rounded-3xl p-8 liquid-glass">
              <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />

              <div className="relative flex items-center justify-between">
                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl glass">
                    <ChefHat className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("profile.from_label")}
                  </span>
                </div>

                <ArrowRight className="h-6 w-6 text-primary" />

                <div className="flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow glow-primary">
                    <Code2 className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {t("profile.to_label")}
                  </span>
                </div>
              </div>

              <div className="relative mt-8 border-t border-white/10 pt-6">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("profile.card_heading")}</span> {t("profile.card_body")}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
    </SectionContainer>
  );
};

