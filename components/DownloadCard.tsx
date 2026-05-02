"use client";

import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { useTranslations } from "next-intl";
import type { ApodCache } from "@/lib/supabase";

type DownloadCardProps = {
  apod: ApodCache;
  formattedDate: string;
};

export function DownloadCard({ apod, formattedDate }: DownloadCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const t = useTranslations("result");

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    setGenerating(true);

    try {
      // Make the hidden card visible briefly for capture
      cardRef.current.style.display = "flex";

      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        pixelRatio: 1,
        cacheBust: true,
      });

      cardRef.current.style.display = "none";

      const link = document.createElement("a");
      link.download = `cosmicbirth-${apod.date}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate card:", err);
    } finally {
      setGenerating(false);
    }
  }, [apod.date]);

  return (
    <>
      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={generating || apod.media_type === "video"}
        className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-6 py-3 text-label-caps uppercase font-heading text-on-surface-variant hover:text-white hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {generating ? "..." : t("downloadCard")}
      </button>

      {/* Hidden card template for PNG generation (1080x1920 = 9:16 story format) */}
      <div
        ref={cardRef}
        style={{
          display: "none",
          position: "fixed",
          left: "-9999px",
          top: 0,
          width: "1080px",
          height: "1920px",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0e0e14",
          fontFamily: "'Space Grotesk', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Background image */}
        {apod.media_type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={apod.url}
            alt=""
            crossOrigin="anonymous"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(14,14,20,0) 30%, rgba(14,14,20,0.7) 60%, rgba(14,14,20,0.95) 80%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Date chip */}
          <div
            style={{
              display: "inline-flex",
              alignSelf: "flex-start",
              padding: "12px 24px",
              borderRadius: "9999px",
              background: "rgba(208, 188, 255, 0.2)",
              border: "1px solid rgba(208, 188, 255, 0.3)",
            }}
          >
            <span
              style={{
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d0bcff",
              }}
            >
              {formattedDate}
            </span>
          </div>

          {/* Title */}
          <h2
            style={{
              fontSize: "52px",
              fontWeight: 700,
              lineHeight: 1.1,
              color: "#e4e1ea",
              letterSpacing: "-0.02em",
            }}
          >
            {apod.title}
          </h2>

          {/* Branding */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <span
              style={{
                fontSize: "28px",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                background: "linear-gradient(to right, #8b5cf6, #d946ef)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CosmicBirth
            </span>
            <span style={{ color: "#958ea0", fontSize: "16px" }}>·</span>
            <span style={{ color: "#958ea0", fontSize: "16px" }}>NASA APOD</span>
          </div>
        </div>
      </div>
    </>
  );
}
