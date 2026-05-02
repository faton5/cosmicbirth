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
    <main className="relative flex min-h-screen flex-col items-center gap-8 p-4 py-12">
      {/* Ambient glows */}
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <h1 className="font-heading text-h1 text-on-surface text-center">{t("title")}</h1>

      {/* Cosmic Score centered */}
      <div className="flex justify-center">
        <CosmicScore score={result.score} labelKey={result.labelKey} />
      </div>

      {/* Two image cards in Stitch couple design */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Card 1 */}
        <div className="relative rounded-xl overflow-hidden bg-surface-container/50 backdrop-blur-[20px] neon-border group aspect-square sm:aspect-video md:aspect-square lg:aspect-video flex flex-col justify-end">
          {apod1.media_type === "video" ? (
            <VideoEmbed url={apod1.url} />
          ) : (
            <>
              <Image
                src={apod1.url}
                alt={apod1.title}
                fill
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/50 to-transparent" />
              <div className="relative p-6 z-10">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                  <span className="text-label-caps text-primary uppercase font-heading">
                    {formatted1}
                  </span>
                </div>
                <h3 className="font-heading text-h3 text-on-surface line-clamp-2">
                  {apod1.title}
                </h3>
              </div>
            </>
          )}
        </div>

        {/* Card 2 */}
        <div className="relative rounded-xl overflow-hidden bg-surface-container/50 backdrop-blur-[20px] neon-border group aspect-square sm:aspect-video md:aspect-square lg:aspect-video flex flex-col justify-end">
          {apod2.media_type === "video" ? (
            <VideoEmbed url={apod2.url} />
          ) : (
            <>
              <Image
                src={apod2.url}
                alt={apod2.title}
                fill
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/50 to-transparent" />
              <div className="relative p-6 z-10">
                <div className="inline-block px-3 py-1 mb-3 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
                  <span className="text-label-caps text-primary uppercase font-heading">
                    {formatted2}
                  </span>
                </div>
                <h3 className="font-heading text-h3 text-on-surface line-clamp-2">
                  {apod2.title}
                </h3>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Share button with gradient */}
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
