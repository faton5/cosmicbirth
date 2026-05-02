"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReadMore } from "@/components/ReadMore";
import { VideoEmbed } from "@/components/VideoEmbed";
import { ShareButton } from "@/components/ShareButton";
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

  return (
    <Card className="w-full max-w-4xl overflow-hidden border-border">
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
        </div>
      )}

      <CardContent className="space-y-4 p-6">
        {/* Title + date */}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{apod.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("birthImage", { date: formattedDate })}
          </p>
        </div>

        {/* Explanation */}
        <ReadMore text={apod.explanation} />

        {/* Copyright */}
        {apod.copyright && (
          <p className="text-xs text-muted-foreground">
            {t("copyright")}: {apod.copyright}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ShareButton
            title={apod.title}
            text={t("shareText", { date: formattedDate, title: apod.title })}
            url={resultUrl}
          />
          <a
            href={apodArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {t("viewOnNasa")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
