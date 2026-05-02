"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoEmbed({ url }: { url: string }) {
  const t = useTranslations("result");

  useEffect(() => {
    import("lite-youtube-embed/src/lite-yt-embed.js" as string);
  }, []);

  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="aspect-video w-full rounded-lg bg-secondary flex items-center justify-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {t("viewOnNasa")}
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Badge className="absolute top-3 left-3 z-10" variant="secondary">
        {t("video")}
      </Badge>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.css" />
      {/* @ts-expect-error - lite-youtube is a web component */}
      <lite-youtube videoid={videoId} playlabel="Play" style={{ borderRadius: "0.5rem", overflow: "hidden", width: "100%" }} />
    </div>
  );
}
