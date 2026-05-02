import { ImageResponse } from "@vercel/og";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";

export const runtime = "edge";
export const alt = "CosmicBirth";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

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
    url: nasaData.url,
    media_type: nasaData.media_type,
  };
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { date } = await params;

  if (!isValidApodDate(date)) {
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
          CosmicBirth
        </div>
      ),
      { ...size }
    );
  }

  const apod = await getApod(date);
  const formattedDate = new Date(date + "T00:00:00Z").toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  const showImage = apod.media_type === "image";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          backgroundColor: "#0a0a1a",
          position: "relative",
        }}
      >
        {showImage && (
          <img
            src={apod.url}
            alt=""
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
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 48,
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          }}
        >
          <div style={{ fontSize: 24, color: "#a78bfa" }}>CosmicBirth</div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "white",
            }}
          >
            {apod.title}
          </div>
          <div style={{ fontSize: 22, color: "#d1d5db" }}>{formattedDate}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
