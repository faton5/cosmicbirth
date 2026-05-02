import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);

export type ApodCache = {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl: string | null;
  media_type: "image" | "video";
  copyright: string | null;
  fetched_at: string;
};

export type DateStats = {
  date: string;
  views: number;
  shares: number;
};
