import { notFound } from "next/navigation";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { ApodCard } from "@/components/ApodCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; date: string }>;
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
  await supabase
    .from("date_stats")
    .upsert({ date, views: 1, shares: 0 }, { onConflict: "date" });

  return row;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isValidApodDate(date)) return {};

  const apod = await getApod(date);
  const dateLocale = locale === "fr" ? fr : enUS;
  const formattedDate = format(new Date(date + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  return {
    title: `${apod.title} — NASA, ${formattedDate} · CosmicBirth`,
    description: apod.explanation.slice(0, 160),
    alternates: {
      languages: {
        fr: `/fr/result/${date}`,
        en: `/en/result/${date}`,
      },
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { locale, date } = await params;

  if (!isValidApodDate(date)) notFound();

  const apod = await getApod(date);
  const dateLocale = locale === "fr" ? fr : enUS;
  const formattedDate = format(new Date(date + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  // Increment views (fire-and-forget)
  supabase.rpc("increment_views", { target_date: date }).then();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <ApodCard apod={apod} locale={locale} formattedDate={formattedDate} />
    </main>
  );
}
