import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { isValidApodDate } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");

  if (!date || !isValidApodDate(date)) {
    return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  }

  // Check cache
  const { data: cached } = await supabase
    .from("apod_cache")
    .select("*")
    .eq("date", date)
    .single();

  if (cached) {
    // Increment views in background (don't await)
    supabase.rpc("increment_views", { target_date: date }).then();

    return NextResponse.json(cached);
  }

  // Fetch from NASA
  try {
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

    // Store in cache
    await supabase.from("apod_cache").upsert(row);

    // Upsert stats and increment views
    await supabase
      .from("date_stats")
      .upsert({ date, views: 1, shares: 0 }, { onConflict: "date" });

    return NextResponse.json(row);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch APOD data" },
      { status: 502 }
    );
  }
}
