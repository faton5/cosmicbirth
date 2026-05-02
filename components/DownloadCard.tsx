"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { ApodCache } from "@/lib/supabase";

type DownloadCardProps = {
  apod: ApodCache;
  formattedDate: string;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function DownloadCard({ apod, formattedDate }: DownloadCardProps) {
  const [generating, setGenerating] = useState(false);
  const t = useTranslations("result");

  const handleDownload = useCallback(async () => {
    if (apod.media_type === "video") return;
    setGenerating(true);

    try {
      const W = 1080;
      const H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;

      // Background
      ctx.fillStyle = "#0e0e14";
      ctx.fillRect(0, 0, W, H);

      // Load and draw APOD image via proxy
      try {
        const img = await loadImage(`/api/image-proxy?url=${encodeURIComponent(apod.url)}`);
        const scale = Math.max(W / img.width, H / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      } catch {
        // Image failed to load — continue with dark background
      }

      // Gradient overlay
      const grad = ctx.createLinearGradient(0, H * 0.3, 0, H);
      grad.addColorStop(0, "rgba(14,14,20,0)");
      grad.addColorStop(0.5, "rgba(14,14,20,0.7)");
      grad.addColorStop(0.8, "rgba(14,14,20,0.95)");
      grad.addColorStop(1, "rgba(14,14,20,1)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Date chip
      const chipY = H - 420;
      ctx.font = "bold 16px 'Space Grotesk', sans-serif";
      ctx.letterSpacing = "2px";
      const dateText = formattedDate.toUpperCase();
      const dateW = ctx.measureText(dateText).width;
      const chipPadX = 24;
      const chipPadY = 12;
      const chipW = dateW + chipPadX * 2;
      const chipH = 16 + chipPadY * 2;

      ctx.fillStyle = "rgba(208, 188, 255, 0.2)";
      ctx.beginPath();
      ctx.roundRect(60, chipY, chipW, chipH, chipH / 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(208, 188, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(60, chipY, chipW, chipH, chipH / 2);
      ctx.stroke();

      ctx.fillStyle = "#d0bcff";
      ctx.fillText(dateText, 60 + chipPadX, chipY + chipPadY + 14);

      // Title
      ctx.letterSpacing = "0px";
      ctx.font = "bold 52px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#e4e1ea";
      const titleY = chipY + chipH + 40;
      const maxTitleWidth = W - 120;

      // Word wrap title
      const words = apod.title.split(" ");
      let line = "";
      let y = titleY;
      const lineHeight = 60;

      for (const word of words) {
        const testLine = line ? `${line} ${word}` : word;
        if (ctx.measureText(testLine).width > maxTitleWidth && line) {
          ctx.fillText(line, 60, y);
          line = word;
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 60, y);

      // Branding
      const brandY = y + 60;

      // CosmicBirth gradient text
      ctx.font = "900 28px 'Space Grotesk', sans-serif";
      const brandGrad = ctx.createLinearGradient(60, 0, 280, 0);
      brandGrad.addColorStop(0, "#8b5cf6");
      brandGrad.addColorStop(1, "#d946ef");
      ctx.fillStyle = brandGrad;
      ctx.fillText("CosmicBirth", 60, brandY);

      const cbWidth = ctx.measureText("CosmicBirth").width;
      ctx.fillStyle = "#958ea0";
      ctx.font = "400 16px 'Inter', sans-serif";
      ctx.fillText("  ·  NASA APOD", 60 + cbWidth, brandY);

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `cosmicbirth-${apod.date}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Failed to generate card:", err);
    } finally {
      setGenerating(false);
    }
  }, [apod, formattedDate]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating || apod.media_type === "video"}
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 text-label-caps uppercase font-heading text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {generating ? "..." : t("downloadCard")}
    </button>
  );
}
