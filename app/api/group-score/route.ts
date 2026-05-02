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
  const { dates } = body;

  if (!dates || !Array.isArray(dates) || dates.length < 3 || dates.length > 5) {
    return NextResponse.json({ error: "Need 3-5 valid dates" }, { status: 400 });
  }

  for (const d of dates) {
    if (!isValidApodDate(d)) {
      return NextResponse.json({ error: `Invalid date: ${d}` }, { status: 400 });
    }
  }

  try {
    const apods = await Promise.all(dates.map(getApod));

    // Calculate average of all pair scores
    let totalScore = 0;
    let pairs = 0;

    for (let i = 0; i < apods.length; i++) {
      for (let j = i + 1; j < apods.length; j++) {
        const result = calculateCosmicScore(
          dates[i], apods[i].title, apods[i].explanation,
          dates[j], apods[j].title, apods[j].explanation
        );
        totalScore += result.score;
        pairs++;
      }
    }

    const groupScore = Math.round(totalScore / pairs);

    // Determine label
    const labels = [
      { max: 55, key: "parallel" },
      { max: 61, key: "distant" },
      { max: 67, key: "stardust" },
      { max: 73, key: "crossed" },
      { max: 79, key: "resonance" },
      { max: 85, key: "linked" },
      { max: 91, key: "fusion" },
      { max: 99, key: "souls" },
    ];
    const labelKey = labels.find((l) => groupScore <= l.max)?.key || "souls";

    return NextResponse.json({
      score: groupScore,
      labelKey,
      apods,
      pairs,
    });
  } catch {
    return NextResponse.json({ error: "Failed to calculate group score" }, { status: 502 });
  }
}
