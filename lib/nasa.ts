const NASA_API_URL = "https://api.nasa.gov/planetary/apod";

type NasaApodResponse = {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
};

export async function fetchApodFromNasa(
  date: string
): Promise<NasaApodResponse> {
  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) throw new Error("NASA_API_KEY not configured");

  const res = await fetch(`${NASA_API_URL}?api_key=${apiKey}&date=${date}`, {
    next: { revalidate: false },
  });

  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
