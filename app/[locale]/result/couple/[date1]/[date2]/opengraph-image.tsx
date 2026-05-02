import { ImageResponse } from "@vercel/og";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { calculateCosmicScore } from "@/lib/cosmic-score";

export const runtime = "edge";
export const alt = "Cosmic Match — CosmicBirth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LABEL_DISPLAY: Record<string, string> = {
  parallel: "Parallel Universes",
  distant: "Distant Travelers",
  stardust: "Stardust",
  crossed: "Crossed Orbits",
  resonance: "Cosmic Resonance",
  linked: "Linked Constellation",
  fusion: "Stellar Fusion",
  souls: "Cosmic Souls",
};

async function getApod(date: string) {
  const { data: cached } = await supabase
    .from("apod_cache")
    .select("*")
    .eq("date", date)
    .single();

  if (cached) return cached;

  const nasaData = await fetchApodFromNasa(date);
  return {
    title: nasaData.title,
    explanation: nasaData.explanation,
    url: nasaData.url,
    media_type: nasaData.media_type,
  };
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; date1: string; date2: string }>;
}) {
  const { date1, date2 } = await params;

  if (!isValidApodDate(date1) || !isValidApodDate(date2)) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a1a",
            color: "white",
            fontSize: 48,
          }}
        >
          Cosmic Match — CosmicBirth
        </div>
      ),
      { ...size }
    );
  }

  const [apod1, apod2] = await Promise.all([getApod(date1), getApod(date2)]);

  const result = calculateCosmicScore(
    date1,
    apod1.title,
    apod1.explanation,
    date2,
    apod2.title,
    apod2.explanation
  );

  const showImage1 = apod1.media_type === "image";
  const showImage2 = apod2.media_type === "image";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor: "#0a0a1a",
          position: "relative",
        }}
      >
        <div style={{ width: "50%", height: "100%", position: "relative", display: "flex" }}>
          {showImage1 && (
            <img src={apod1.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        <div style={{ width: "50%", height: "100%", position: "relative", display: "flex" }}>
          {showImage2 && (
            <img src={apod2.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>

        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 24, color: "#a78bfa" }}>CosmicBirth</div>
          <div style={{ fontSize: 80, fontWeight: 700, color: "white" }}>
            {result.score}%
          </div>
          <div style={{ fontSize: 28, color: "#d1d5db" }}>
            {LABEL_DISPLAY[result.labelKey]}
          </div>
          <div style={{ fontSize: 18, color: "#9ca3af", marginTop: 8 }}>
            {date1} & {date2}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
