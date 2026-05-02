import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
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
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="w-full max-w-3xl border-border">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="p-4 w-12">{t("rank")}</th>
                <th className="p-4">{t("date")}</th>
                <th className="p-4">{t("image")}</th>
                <th className="p-4 text-right">{t("views")}</th>
              </tr>
            </thead>
            <tbody>
              {(stats || []).map((stat, i) => (
                <tr key={stat.date} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">{i + 1}</td>
                  <td className="p-4">
                    <Link
                      href={`/${locale}/result/${stat.date}`}
                      className="text-primary hover:underline"
                    >
                      {format(new Date(stat.date + "T00:00:00Z"), "PPP", {
                        locale: dateLocale,
                      })}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {titleMap.get(stat.date) || "—"}
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {stat.views.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
