"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  imageUrl1: string;
  imageUrl2: string;
  title1: string;
  title2: string;
  date1: string;
  date2: string;
  score: number;
  labelText: string;
  mediaType1: string;
  mediaType2: string;
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

export function DownloadCoupleCard({
  imageUrl1, imageUrl2, title1, title2, date1, date2, score, labelText, mediaType1, mediaType2,
}: Props) {
  const [generating, setGenerating] = useState(false);
  const t = useTranslations("couple");

  const handleDownload = useCallback(async () => {
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

      // Load and draw both images side by side in top half
      const imgH = H * 0.45;
      const imgW = W / 2;

      const images = [
        { url: imageUrl1, type: mediaType1 },
        { url: imageUrl2, type: mediaType2 },
      ];
      for (let i = 0; i < images.length; i++) {
        const { url, type } = images[i];
        if (type === "video") continue;
        try {
          const img = await loadImage(`/api/image-proxy?url=${encodeURIComponent(url)}`);
          const scale = Math.max(imgW / img.width, imgH / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          ctx.save();
          ctx.beginPath();
          ctx.rect(i * imgW, 0, imgW, imgH);
          ctx.clip();
          ctx.drawImage(img, i * imgW + (imgW - w) / 2, (imgH - h) / 2, w, h);
          ctx.restore();
        } catch {
          // skip
        }
      }

      // Gradient overlay on images
      const imgGrad = ctx.createLinearGradient(0, imgH * 0.6, 0, imgH);
      imgGrad.addColorStop(0, "rgba(14,14,20,0)");
      imgGrad.addColorStop(1, "rgba(14,14,20,1)");
      ctx.fillStyle = imgGrad;
      ctx.fillRect(0, 0, W, imgH);

      // Divider line between images
      ctx.fillStyle = "rgba(208, 188, 255, 0.3)";
      ctx.fillRect(W / 2 - 1, 0, 2, imgH);

      // Date labels on images
      ctx.font = "bold 14px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#d0bcff";
      ctx.fillText(date1.toUpperCase(), 30, imgH - 30);
      ctx.fillStyle = "#fbabff";
      ctx.textAlign = "right";
      ctx.fillText(date2.toUpperCase(), W - 30, imgH - 30);
      ctx.textAlign = "left";

      // Score section (centered)
      const scoreY = imgH + 80;

      // Glow circle background
      const cx = W / 2;
      const cy = scoreY + 120;
      const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 200);
      glowGrad.addColorStop(0, "rgba(208, 188, 255, 0.15)");
      glowGrad.addColorStop(1, "rgba(14, 14, 20, 0)");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(cx - 200, cy - 200, 400, 400);

      // Score circle
      ctx.beginPath();
      ctx.arc(cx, cy, 130, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(208, 188, 255, 0.15)";
      ctx.lineWidth = 4;
      ctx.stroke();

      // Score arc
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + (score / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 130, startAngle, endAngle);
      ctx.strokeStyle = "#d0bcff";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      // Score text
      ctx.textAlign = "center";
      ctx.font = "bold 80px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#e4e1ea";
      ctx.fillText(`${score}%`, cx, cy + 28);

      // Label
      ctx.font = "600 32px 'Space Grotesk', sans-serif";
      const labelGrad = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0);
      labelGrad.addColorStop(0, "#d0bcff");
      labelGrad.addColorStop(1, "#fbabff");
      ctx.fillStyle = labelGrad;
      ctx.fillText(labelText, cx, cy + 200);

      // Titles
      ctx.font = "600 24px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "#cbc3d7";
      const titlesY = cy + 280;
      ctx.fillText(`${title1}  ×  ${title2}`, cx, titlesY);

      // Branding
      ctx.font = "900 28px 'Space Grotesk', sans-serif";
      const brandGrad = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
      brandGrad.addColorStop(0, "#8b5cf6");
      brandGrad.addColorStop(1, "#d946ef");
      ctx.fillStyle = brandGrad;
      ctx.fillText("CosmicBirth", cx, H - 100);

      ctx.font = "400 16px 'Inter', sans-serif";
      ctx.fillStyle = "#958ea0";
      ctx.fillText("Cosmic Match · NASA APOD", cx, H - 60);

      ctx.textAlign = "left";

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `cosmicbirth-match-${date1}-${date2}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Failed to generate couple card:", err);
    } finally {
      setGenerating(false);
    }
  }, [imageUrl1, imageUrl2, title1, title2, date1, date2, score, labelText, mediaType1, mediaType2]);

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 text-label-caps uppercase font-heading text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {generating ? "..." : t("downloadCard")}
    </button>
  );
}
