import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });

  return {
    title: `${t("title")} · CosmicBirth`,
    description: t("subtitle"),
  };
}

export default async function LeaderboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  const dateLocale = locale === "fr" ? fr : enUS;

  const { data: stats } = await supabase
    .from("date_stats")
    .select("date, views")
    .order("views", { ascending: false })
    .limit(50);

  const dates = (stats || []).map((s) => s.date);
  const { data: apods } = await supabase
    .from("apod_cache")
    .select("date, title")
    .in("date", dates);

  const titleMap = new Map((apods || []).map((a) => [a.date, a.title]));

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-4 py-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-heading text-h1 text-on-surface">{t("title")}</h1>
        <p className="mt-3 text-body-lg text-on-surface-variant">{t("subtitle")}</p>
      </div>

      {/* Table container with glassmorphism */}
      <div className="w-full max-w-3xl rounded-xl border border-white/20 bg-surface-container/40 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        <table className="w-full">
          <thead className="border-b border-white/10 bg-surface-container/60">
            <tr className="text-left">
              <th className="p-4 w-12">
                <span className="font-heading text-label-caps text-primary uppercase">
                  {t("rank")}
                </span>
              </th>
              <th className="p-4">
                <span className="font-heading text-label-caps text-on-surface-variant uppercase">
                  {t("date")}
                </span>
              </th>
              <th className="p-4">
                <span className="font-heading text-label-caps text-on-surface-variant uppercase">
                  {t("image")}
                </span>
              </th>
              <th className="p-4 text-right">
                <span className="font-heading text-label-caps text-on-surface-variant uppercase">
                  {t("views")}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {(stats || []).map((stat, i) => (
              <tr
                key={stat.date}
                className={`border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                  i === 0 ? "bg-primary/5" : ""
                }`}
              >
                <td className="p-4">
                  {i === 0 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(208,188,255,0.5)]">
                      {i + 1}
                    </span>
                  ) : (
                    <span
                      className={`font-semibold ${
                        i === 1
                          ? "text-secondary"
                          : i === 2
                          ? "text-tertiary"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <Link
                    href={`/${locale}/result/${stat.date}`}
                    className="text-primary hover:text-primary-fixed transition-colors"
                  >
                    {format(new Date(stat.date + "T00:00:00Z"), "PPP", {
                      locale: dateLocale,
                    })}
                  </Link>
                </td>
                <td className="p-4 text-sm text-on-surface-variant">
                  {titleMap.get(stat.date) || "—"}
                </td>
                <td className="p-4 text-right font-heading tabular-nums text-on-surface">
                  {stat.views.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
