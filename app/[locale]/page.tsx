import { getTranslations } from "next-intl/server";
import { DatePicker } from "@/components/DatePicker";
import { CoupleForm } from "@/components/CoupleForm";
import { SurpriseButton } from "@/components/SurpriseButton";
import { RecentDates } from "@/components/RecentDates";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import Image from "next/image";
import Link from "next/link";

export const revalidate = 3600; // Revalidate every hour

async function getTodayApod() {
  const today = new Date();

  // Try today first, fall back to yesterday
  for (const offset of [0, 1]) {
    const d = new Date(today);
    d.setDate(d.getDate() - offset);
    const ds = d.toISOString().split("T")[0];

    const { data: cached } = await supabase
      .from("apod_cache")
      .select("*")
      .eq("date", ds)
      .single();

    if (cached) return cached;

    try {
      const nasa = await fetchApodFromNasa(ds);
      const row = {
        date: nasa.date,
        title: nasa.title,
        explanation: nasa.explanation,
        url: nasa.url,
        hdurl: nasa.hdurl || null,
        media_type: nasa.media_type,
        copyright: nasa.copyright || null,
      };
      await supabase.from("apod_cache").upsert(row);
      return row;
    } catch {
      continue;
    }
  }
  return null;
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });
  const tToday = await getTranslations({ locale, namespace: "today" });

  const todayApod = await getTodayApod();

  return (
    <main className="flex-grow relative">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-container-padding text-center flex flex-col items-center justify-center min-h-[530px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-gutter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel neon-border mb-4">
            <span className="text-label-caps text-on-surface uppercase tracking-widest font-heading">
              {t("subtitle")}
            </span>
          </div>
          <h1 className="font-heading text-h1 text-on-surface mb-6 drop-shadow-2xl">
            {t("title")}
          </h1>

          {/* Solo Date Picker */}
          <div className="glass-panel-heavy rounded-xl p-8 max-w-md w-full neon-border shadow-2xl">
            <div className="flex flex-col gap-6">
              <DatePicker />
            </div>
          </div>

          <div className="mt-6">
            <SurpriseButton />
          </div>
        </div>
      </section>

      {/* Recent Dates */}
      <section className="px-container-padding">
        <div className="max-w-4xl mx-auto">
          <RecentDates />
        </div>
      </section>

      {/* Today's APOD */}
      {todayApod && todayApod.media_type === "image" && (
        <section className="py-16 px-container-padding relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-h2 text-on-surface mb-4">{tToday("title")}</h2>
              <p className="font-body text-body-md text-on-surface-variant">{tToday("subtitle")}</p>
            </div>
            <Link href={`/${locale}/result/${todayApod.date}`} className="block">
              <div className="glass-panel rounded-xl overflow-hidden neon-border group cursor-pointer">
                <div className="relative aspect-video w-full overflow-hidden">
                  <Image
                    src={todayApod.url}
                    alt={todayApod.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 896px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="inline-block px-3 py-1 mb-3 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                      <span className="text-label-caps text-primary uppercase font-heading">{todayApod.date}</span>
                    </div>
                    <h3 className="font-heading text-h3 text-on-surface">{todayApod.title}</h3>
                    <p className="mt-2 text-body-md text-on-surface-variant line-clamp-2 max-w-2xl">{todayApod.explanation.slice(0, 150)}...</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Cosmic Match Section */}
      <section className="py-24 px-container-padding relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-on-surface mb-4">{t("coupleTitle")}</h2>
            <p className="font-body text-body-md text-on-surface-variant">{t("coupleSubtitle")}</p>
          </div>
          <div className="glass-panel rounded-xl p-8 md:p-12 neon-border relative overflow-hidden">
            <CoupleForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent text-zinc-500 font-heading text-xs tracking-tight w-full py-12 mt-20 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-8">
        <div className="font-bold text-zinc-200 text-sm">
          © 2024 CosmicBirth — Celestial Discovery
        </div>
      </footer>
    </main>
  );
}
