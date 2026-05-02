"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Check } from "lucide-react";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("result");

  async function handleShare() {
    const fullUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    const shareData = {
      title,
      text: `${text}\n\n#CosmicBirth #NASA #APOD`,
      url: fullUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-gradient-to-r from-primary to-secondary text-on-primary font-heading text-sm font-semibold shadow-[0_0_15px_rgba(208,188,255,0.3)] hover:shadow-[0_0_25px_rgba(208,188,255,0.5)] transition-shadow"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4" />
          {t("copied")}
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          {t("share")}
        </>
      )}
    </button>
  );
}
