"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { ReadMore } from "@/components/ReadMore";
import { VideoEmbed } from "@/components/VideoEmbed";
import { ShareButton } from "@/components/ShareButton";
import { DownloadCard } from "@/components/DownloadCard";
import { addRecentDate } from "@/lib/use-recent-dates";
import type { ApodCache } from "@/lib/supabase";

type ApodCardProps = {
  apod: ApodCache;
  locale: string;
  formattedDate: string;
};

export function ApodCard({ apod, locale, formattedDate }: ApodCardProps) {
  const t = useTranslations("result");
  const apodArchiveUrl = `https://apod.nasa.gov/apod/ap${apod.date.replace(/-/g, "").slice(2)}.html`;
  const resultUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/${locale}/result/${apod.date}`;

  useEffect(() => {
    addRecentDate(apod.date);
  }, [apod.date]);

  return (
    <article className="glass-panel rounded-xl overflow-hidden neon-border w-full max-w-4xl">
      {/* Media */}
      {apod.media_type === "video" ? (
        <VideoEmbed url={apod.url} />
      ) : (
        <div className="relative aspect-video w-full">
          <Image
            src={apod.url}
            alt={apod.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/50 to-transparent pointer-events-none" />

          {/* Floating date chip */}
          <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30">
            <span className="text-label-caps text-primary uppercase font-heading">
              {formattedDate}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-4 p-6">
        {/* Title */}
        <div>
          <h1 className="font-heading text-h1 text-on-surface">{apod.title}</h1>
          <p className="mt-2 text-body-md text-on-surface-variant">
            {t("birthImage", { date: formattedDate })}
          </p>
        </div>

        {/* Explanation */}
        <ReadMore text={apod.explanation} />

        {/* Copyright */}
        {apod.copyright && (
          <p className="text-xs text-on-surface-variant">
            {t("copyright")}: {apod.copyright}
          </p>
        )}

        {/* Actions footer */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-white/5">
          <ShareButton
            title={apod.title}
            text={t("shareText", { date: formattedDate, title: apod.title })}
            url={resultUrl}
          />
          <DownloadCard apod={apod} formattedDate={formattedDate} />
          <a
            href={apodArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm text-on-surface-variant hover:text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {t("viewOnNasa")}
          </a>
        </div>
      </div>
    </article>
  );
}
