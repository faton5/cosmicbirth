import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import Image from "next/image";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { calculateCosmicScore } from "@/lib/cosmic-score";
import { CosmicScore } from "@/components/CosmicScore";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; date1: string; date2: string }>;
};

async function getApod(date: string) {
  const { data: cached } = await supabase
    .from("apod_cache")
    .select("*")
    .eq("date", date)
    .single();

  if (cached) return cached;

  const nasaData = await fetchApodFromNasa(date);
  const row = {
    date: nasaData.date,
    title: nasaData.title,
    explanation: nasaData.explanation,
    url: nasaData.url,
    hdurl: nasaData.hdurl || null,
    media_type: nasaData.media_type,
    copyright: nasaData.copyright || null,
  };

  await supabase.from("apod_cache").upsert(row);
  return row;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date1, date2 } = await params;
  if (!isValidApodDate(date1) || !isValidApodDate(date2)) return {};

  const t = await getTranslations({ locale, namespace: "couple" });

  return {
    title: `Cosmic Match — ${date1} & ${date2} · CosmicBirth`,
    description: t("title"),
    alternates: {
      languages: {
        fr: `/fr/result/couple/${date1}/${date2}`,
        en: `/en/result/couple/${date1}/${date2}`,
      },
    },
  };
}

export default async function CouplePage({ params }: Props) {
  const { locale, date1, date2 } = await params;

  if (!isValidApodDate(date1) || !isValidApodDate(date2)) notFound();

  const [apod1, apod2] = await Promise.all([getApod(date1), getApod(date2)]);

  const result = calculateCosmicScore(
    date1,
    apod1.title,
    apod1.explanation,
    date2,
    apod2.title,
    apod2.explanation
  );

  const dateLocale = locale === "fr" ? fr : enUS;
  const formatted1 = format(new Date(date1 + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });
  const formatted2 = format(new Date(date2 + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  const t = await getTranslations({ locale, namespace: "couple" });
  const tLabels = await getTranslations({ locale, namespace: "cosmicLabels" });
  const label = tLabels(result.labelKey);
  const pageUrl = `/${locale}/result/couple/${date1}/${date2}`;

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-4 py-12">
      <h1 className="text-4xl font-bold">{t("title")}</h1>

      <CosmicScore score={result.score} labelKey={result.labelKey} />

      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="overflow-hidden border-border">
          {apod1.media_type === "video" ? (
            <VideoEmbed url={apod1.url} />
          ) : (
            <div className="relative aspect-video w-full">
              <Image
                src={apod1.url}
                alt={apod1.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <CardContent className="p-4">
            <h2 className="font-semibold">{apod1.title}</h2>
            <p className="text-sm text-muted-foreground">{formatted1}</p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border">
          {apod2.media_type === "video" ? (
            <VideoEmbed url={apod2.url} />
          ) : (
            <div className="relative aspect-video w-full">
              <Image
                src={apod2.url}
                alt={apod2.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <CardContent className="p-4">
            <h2 className="font-semibold">{apod2.title}</h2>
            <p className="text-sm text-muted-foreground">{formatted2}</p>
          </CardContent>
        </Card>
      </div>

      <ShareButton
        title="Cosmic Match"
        text={t("shareText", {
          score: result.score,
          label,
          url: pageUrl,
        })}
        url={pageUrl}
      />
    </main>
  );
}
