"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { AnimatedScore } from "@/components/AnimatedScore";
import { ShareButton } from "@/components/ShareButton";
import { FadeIn } from "@/components/FadeIn";

type ApodData = {
  date: string;
  title: string;
  url: string;
  media_type: string;
};

type GroupResult = {
  score: number;
  labelKey: string;
  apods: ApodData[];
};

const LABEL_TEXT: Record<string, Record<string, string>> = {
  fr: {
    parallel: "Univers parallèles",
    distant: "Voyageurs distants",
    stardust: "Poussière d'étoiles",
    crossed: "Orbites croisées",
    resonance: "Résonance cosmique",
    linked: "Constellation liée",
    fusion: "Fusion stellaire",
    souls: "Âmes cosmiques",
  },
  en: {
    parallel: "Parallel Universes",
    distant: "Distant Travelers",
    stardust: "Stardust",
    crossed: "Crossed Orbits",
    resonance: "Cosmic Resonance",
    linked: "Linked Constellation",
    fusion: "Stellar Fusion",
    souls: "Cosmic Souls",
  },
};

export default function GroupResultPage() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("group");
  const [result, setResult] = useState<GroupResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const dates = searchParams.get("dates")?.split(",") || [];

  useEffect(() => {
    if (dates.length < 3) {
      setError("Not enough dates");
      setLoading(false);
      return;
    }

    fetch("/api/group-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setResult(data);
        }
      })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-on-surface-variant text-body-lg font-body animate-pulse">
          Loading...
        </div>
      </main>
    );
  }

  if (error || !result) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-400">{error}</p>
      </main>
    );
  }

  const labelText = LABEL_TEXT[locale]?.[result.labelKey] || result.labelKey;
  const pageUrl = `/${locale}/result/group?dates=${dates.join(",")}`;

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-4 py-12 relative">
      <div className="ambient-glow-1" />
      <div className="ambient-glow-2" />

      <h1 className="font-heading text-h2 text-on-surface">{t("title")}</h1>

      <AnimatedScore
        score={result.score}
        labelText={labelText}
        scoreLabel={t("score")}
      />

      <FadeIn delay={800} className="w-full max-w-6xl">
        <div className={`grid gap-4 ${
          result.apods.length <= 3 ? "grid-cols-1 sm:grid-cols-3" :
          result.apods.length === 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"
        }`}>
          {result.apods.map((apod) => (
            <div
              key={apod.date}
              className="relative rounded-xl overflow-hidden neon-border group aspect-square flex flex-col justify-end"
            >
              {apod.media_type === "image" && (
                <Image
                  src={apod.url}
                  alt={apod.title}
                  fill
                  className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/50 to-transparent" />
              <div className="relative p-4 z-10">
                <div className="inline-block px-2 py-1 mb-2 rounded-full bg-primary/20 border border-primary/30">
                  <span className="text-[10px] text-primary uppercase font-heading tracking-widest">{apod.date}</span>
                </div>
                <h3 className="font-heading text-sm font-semibold text-on-surface line-clamp-2">{apod.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={1200}>
        <ShareButton
          title="CosmicBirth Group"
          text={t("shareText", { score: result.score, label: labelText, url: pageUrl })}
          url={pageUrl}
        />
      </FadeIn>
    </main>
  );
}
