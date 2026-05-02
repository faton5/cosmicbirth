"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("result");

  async function handleShare() {
    const shareData = {
      title,
      text: `${text}\n\n#CosmicBirth #NASA #APOD`,
      url,
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
    <Button onClick={handleShare} variant="secondary" size="lg">
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {t("copied")}
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          {t("share")}
        </>
      )}
    </Button>
  );
}
