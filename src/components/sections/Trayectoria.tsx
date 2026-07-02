import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Linkedin } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { trayectoriaItems, type TrayectoriaItem } from "@/data/trayectoria";
import styles from "./Trayectoria.module.css";

gsap.registerPlugin(ScrollTrigger);

const formatDate = (yyyymm: string): string => {
  const [y, m] = yyyymm.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(m) - 1]} ${y}`;
};

const formatPeriod = (item: TrayectoriaItem, presentLabel: string): string => {
  const start = formatDate(item.startDate);
  if (item.endDate === item.startDate) return start;
  const end = item.endDate === "present" ? presentLabel : formatDate(item.endDate);
  return `${start} \u2013 ${end}`;
};

const CategoryLabel = ({ category, t }: { category: TrayectoriaItem["category"]; t: (k: string) => string }) => (
  <span className="inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-accent">
    {t(`trayectoria.cat_${category}`)}
  </span>
);

const MilestoneCard = ({ item, t, presentLabel }: { item: TrayectoriaItem; t: (k: string) => string; presentLabel: string }) => (
  <article className={`${styles.card} ${styles.cardMilestone}`} aria-label={`${t(item.titleKey)} \u2014 ${t(item.orgKey)}`}>
    <div className={styles.cardTop}>
      <CategoryLabel category={item.category} t={t} />
      <span className={styles.cardDate}>{formatPeriod(item, presentLabel)}</span>
    </div>
    <h3 className={styles.cardTitle}>{t(item.titleKey)}</h3>
    <p className={styles.cardOrg}>{t(item.orgKey)}</p>
    <p className={styles.cardLocation}>
      {t(item.locationKey)}
      {item.modalityKey && <span className={styles.cardModality}>{` \u00b7 ${t(item.modalityKey)}`}</span>}
    </p>
    {item.detailKey && <p className={styles.cardDetail}>{t(item.detailKey)}</p>}
  </article>
);

const ExperienceCard = ({ item, t, presentLabel }: { item: TrayectoriaItem; t: (k: string) => string; presentLabel: string }) => (
  <article className={`${styles.card} ${styles.cardExperience}`} aria-label={`${t(item.titleKey)} \u2014 ${t(item.orgKey)}`}>
    <div className={styles.cardTop}>
      <CategoryLabel category={item.category} t={t} />
      <span className={styles.cardDate}>{formatPeriod(item, presentLabel)}</span>
    </div>
    <h3 className={styles.cardTitle}>{t(item.titleKey)}</h3>
    <p className={styles.cardOrg}>{t(item.orgKey)}</p>
    <p className={styles.cardLocation}>
      {t(item.locationKey)}
      {item.modalityKey && <span className={styles.cardModality}>{` \u00b7 ${t(item.modalityKey)}`}</span>}
    </p>
    {item.bulletKeys && (
      <ul className={styles.cardBullets}>
        {item.bulletKeys.map((k) => (
          <li key={k} className={styles.cardBullet}>
            <span className={styles.bulletDot} />
            <span>{t(k)}</span>
          </li>
        ))}
      </ul>
    )}
    {item.techTags && item.techTags.length > 0 && (
      <div className={styles.techTags}>
        {item.techTags.map((tag) => (
          <span key={tag} className={styles.techTag}>{tag}</span>
        ))}
      </div>
    )}
  </article>
);

const ItemWrapper = ({ item, index, t, presentLabel, isLatest }: { item: TrayectoriaItem; index: number; t: (k: string) => string; presentLabel: string; isLatest: boolean }) => {
  const position = index % 2 === 0 ? "top" : "bottom";
  const Card = item.variant === "milestone" ? MilestoneCard : ExperienceCard;
  return (
    <div className={styles.itemWrapper} data-position={position}>
      <div className={styles.connectorDot} data-latest={isLatest ? "true" : undefined} />
      <div className={styles.itemContent}>
        {position === "top" ? (
          <>
            <div className={styles.cardSlot}><Card item={item} t={t} presentLabel={presentLabel} /></div>
            <div className={styles.connectorLine} />
          </>
        ) : (
          <>
            <div className={styles.connectorLine} />
            <div className={styles.cardSlot}><Card item={item} t={t} presentLabel={presentLabel} /></div>
          </>
        )}
      </div>
    </div>
  );
};

const CtaCard = ({ t }: { t: (k: string) => string }) => (
  <a
    href="https://www.linkedin.com/in/carlos-alejandro-bolivar"
    target="_blank"
    rel="noopener noreferrer"
    className={`${styles.card} ${styles.cardCta}`}
    aria-label={t("trayectoria.cta_title")}
  >
    <Linkedin className="h-10 w-10 text-primary" />
    <span className={styles.ctaTitle}>{t("trayectoria.cta_title")}</span>
    <span className={styles.ctaSubtitle}>{t("trayectoria.cta_subtitle")}</span>
  </a>
);

const TitleCard = ({ t }: { t: (k: string) => string }) => (
  <h2 className={styles.titleCard} aria-hidden="true">
    <span className={styles.titleMi}>{t("trayectoria.heading_before")}</span>
    <span className={styles.titleTrayectoria}>{t("trayectoria.heading_after")}</span>
  </h2>
);

const DesktopTrayectoria = ({ t, presentLabel }: { t: (k: string) => string; presentLabel: string }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState({ current: 1, total: trayectoriaItems.length });

  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const total = trayectoriaItems.length;

    const ctx = gsap.context(() => {
      const getTarget = () => {
        const cta = track?.querySelector<HTMLAnchorElement>('a');
        if (!cta) return 0;
        const r = cta.getBoundingClientRect();
        return Math.min(0, window.innerWidth / 2 - (r.left + r.width / 2));
      };

      gsap.to(track, {
        x: getTarget,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${Math.max(0, Math.abs(getTarget()))}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.min(total, Math.max(1, Math.floor(self.progress * total) + 1));
            setProgress((prev) => (prev.current === idx ? prev : { current: idx, total }));
          },
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="trayectoria" aria-label={t("trayectoria.heading_after")} className={styles.section}>
      <div className={styles.trackArea}>
        <div ref={trackRef} className={styles.track}>
          <TitleCard t={t} />
          <div className={styles.itemsGroup}>
            <div className={styles.axis} />
            {trayectoriaItems.map((item, i) => (
              <ItemWrapper
                key={item.id}
                item={item}
                index={i}
                t={t}
                presentLabel={presentLabel}
                isLatest={i === trayectoriaItems.length - 1}
              />
            ))}
          </div>
          <CtaCard t={t} />
        </div>
      </div>
    </section>
  );
};

const MobileTrayectoria = ({ t, presentLabel }: { t: (k: string) => string; presentLabel: string }) => (
  <section id="trayectoria" aria-label={t("trayectoria.heading_after")} className={styles.mobileSection}>
    <div className={styles.mobileTimeline}>
      <div className={styles.mobileLine} />
      {trayectoriaItems.map((item) => (
        <div key={item.id} className={styles.mobileItem}>
          <div className={styles.mobileDot} />
          <div className={styles.mobileCardWrap}>
            {item.variant === "milestone"
              ? <MilestoneCard item={item} t={t} presentLabel={presentLabel} />
              : <ExperienceCard item={item} t={t} presentLabel={presentLabel} />}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const Trayectoria = () => {
  const { t } = useLanguage();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const presentLabel = t("trayectoria.present");

  if (isMobile) return <MobileTrayectoria t={t} presentLabel={presentLabel} />;
  return <DesktopTrayectoria t={t} presentLabel={presentLabel} />;
};
