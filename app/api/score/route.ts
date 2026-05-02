import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { isValidApodDate } from "@/lib/validators";
import { calculateCosmicScore } from "@/lib/cosmic-score";

async function getApod(date: string) {
  const { data: cached } = await supabase
    .from("apod_cache")
    .select("*")
    .eq("date", date)
    .single();

  if (cached) return cached;

  const nasaData = await fetchApodFromNasa(date);
  const row = {
    date: nasaData.date,
    title: nasaData.title,
    explanation: nasaData.explanation,
    url: nasaData.url,
    hdurl: nasaData.hdurl || null,
    media_type: nasaData.media_type,
    copyright: nasaData.copyright || null,
  };

  await supabase.from("apod_cache").upsert(row);
  return row;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date1, date2 } = body;

  if (!date1 || !date2 || !isValidApodDate(date1) || !isValidApodDate(date2)) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  try {
    const [apod1, apod2] = await Promise.all([getApod(date1), getApod(date2)]);

    const result = calculateCosmicScore(
      date1,
      apod1.title,
      apod1.explanation,
      date2,
      apod2.title,
      apod2.explanation
    );

    return NextResponse.json({
      ...result,
      apod1,
      apod2,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to calculate score" },
      { status: 502 }
    );
  }
}
