# CosmicBirth V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build CosmicBirth V1 — a viral web app where users enter a birth date and get the NASA APOD photo from that day, with couple mode, OG cards, and leaderboard.

**Architecture:** Next.js 14 App Router with `next-intl` for FR/EN i18n (route prefix `[locale]`). API routes proxy NASA with Supabase cache. SSR result pages with dynamic OG images via `@vercel/og`. Dark cosmic theme with Tailwind + shadcn/ui.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, next-intl, Supabase (PostgreSQL), @vercel/og, lite-youtube-embed

---

## File Structure

```
cosmicbirth/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx                          # Homepage (date picker + couple mode)
│   │   ├── layout.tsx                        # Locale layout with i18n provider
│   │   ├── result/
│   │   │   ├── [date]/
│   │   │   │   ├── page.tsx                  # Solo result page (SSR)
│   │   │   │   └── opengraph-image.tsx       # Solo OG card
│   │   │   └── couple/
│   │   │       └── [date1]/[date2]/
│   │   │           ├── page.tsx              # Couple result page (SSR)
│   │   │           └── opengraph-image.tsx   # Couple OG card
│   │   └── leaderboard/
│   │       └── page.tsx                      # Top 50 dates
│   ├── api/
│   │   ├── apod/route.ts                     # NASA proxy + cache
│   │   └── score/route.ts                    # Cosmic Match calculation
│   ├── layout.tsx                            # Root layout (fonts, global metadata)
│   ├── not-found.tsx                         # 404 page
│   └── globals.css                           # Tailwind + global styles
├── components/
│   ├── DatePicker.tsx                        # Date input with validation
│   ├── CoupleForm.tsx                        # Two-date input for couple mode
│   ├── ApodCard.tsx                          # APOD display (image + info)
│   ├── VideoEmbed.tsx                        # lite-youtube-embed wrapper
│   ├── CosmicScore.tsx                       # Score display with label
│   ├── ShareButton.tsx                       # Web Share API + clipboard fallback
│   ├── ReadMore.tsx                          # Expandable text (>600 chars)
│   └── ui/                                   # shadcn components
├── lib/
│   ├── nasa.ts                              # NASA API client
│   ├── supabase.ts                          # Supabase client (server)
│   ├── cosmic-score.ts                      # Scoring algorithm
│   ├── categories.ts                        # APOD keyword categorization
│   └── validators.ts                        # Date validation helpers
├── messages/
│   ├── fr.json                              # French translations
│   └── en.json                              # English translations
├── i18n/
│   ├── request.ts                           # next-intl request config
│   └── routing.ts                           # next-intl routing config
├── middleware.ts                             # next-intl middleware + rate limiting
├── .env.local                               # NASA_API_KEY, SUPABASE_URL, SUPABASE_ANON_KEY
├── next.config.ts                           # next-intl plugin
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

### Task 1: Project Scaffolding + Tailwind + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `.env.local`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd /home/faton/dev/date-apod
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm
```

Expected: Next.js 14 project scaffolded with TypeScript + Tailwind in current directory.

- [ ] **Step 2: Verify project runs**

```bash
cd /home/faton/dev/date-apod
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML output from the Next.js default page.

- [ ] **Step 3: Install core dependencies**

```bash
cd /home/faton/dev/date-apod
npm install next-intl @supabase/supabase-js
npm install -D @types/node
```

- [ ] **Step 4: Create `.env.local`**

```env
NASA_API_KEY=TDCaeP6lstyXdHC3wrILgA5CA2nFuS085YYPWOTP
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Note: Supabase values will be filled once the project is created.

- [ ] **Step 5: Create `.gitignore`**

Verify the generated `.gitignore` includes:

```
node_modules/
.next/
.env.local
```

If not, add these entries.

- [ ] **Step 6: Set up dark cosmic theme in globals.css**

Replace `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 263.4 70% 50.4%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 263.4 70% 50.4%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 263.4 70% 50.4%;
    --radius: 0.75rem;
  }
}

@layer base {
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js 14 project with Tailwind and dependencies"
```

---

### Task 2: shadcn/ui Setup

**Files:**
- Create: `components.json`, `lib/utils.ts`, `components/ui/button.tsx`, `components/ui/calendar.tsx`, `components/ui/popover.tsx`, `components/ui/card.tsx`, `components/ui/badge.tsx`

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd /home/faton/dev/date-apod
npx shadcn@latest init -d
```

When prompted, select: New York style, Slate color, CSS variables: yes.

- [ ] **Step 2: Install required shadcn components**

```bash
cd /home/faton/dev/date-apod
npx shadcn@latest add button calendar popover card badge
```

- [ ] **Step 3: Verify `lib/utils.ts` exists**

It should contain:

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: add shadcn/ui with button, calendar, popover, card, badge"
```

---

### Task 3: i18n Setup with next-intl

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`, `messages/fr.json`, `messages/en.json`, `next.config.ts` (modify)
- Modify: `app/layout.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`

- [ ] **Step 1: Create routing config**

Create `i18n/routing.ts`:

```typescript
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["fr", "en"],
  defaultLocale: "fr",
});
```

- [ ] **Step 2: Create request config**

Create `i18n/request.ts`:

```typescript
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "fr" | "en")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create middleware**

Create `middleware.ts`:

```typescript
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
```

- [ ] **Step 4: Update `next.config.ts`**

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {};

export default withNextIntl(nextConfig);
```

- [ ] **Step 5: Create translation files**

Create `messages/fr.json`:

```json
{
  "home": {
    "title": "Découvre ton image cosmique",
    "subtitle": "Quelle image la NASA a-t-elle publiée le jour de ta naissance ?",
    "datePlaceholder": "Choisis ta date de naissance",
    "submit": "Découvrir",
    "coupleTitle": "Cosmic Match",
    "coupleSubtitle": "Découvrez votre compatibilité cosmique",
    "date1Placeholder": "Première date de naissance",
    "date2Placeholder": "Deuxième date de naissance",
    "coupleSubmit": "Calculer votre score",
    "minDate": "La date doit être après le 16 juin 1995",
    "maxDate": "La date ne peut pas être dans le futur",
    "invalidDate": "Date invalide"
  },
  "result": {
    "readMore": "Lire la suite",
    "readLess": "Réduire",
    "copyright": "Crédit",
    "viewOnNasa": "Voir sur le site NASA APOD",
    "share": "Partager",
    "shareText": "Découvre l'image que la NASA a publiée le {date} ! {title}",
    "copied": "Lien copié !",
    "video": "Vidéo",
    "birthImage": "L'image cosmique du {date}"
  },
  "couple": {
    "title": "Cosmic Match",
    "score": "Score de compatibilité",
    "category1": "Image de {name}",
    "category2": "Image de {name}",
    "shareText": "Notre score Cosmic Match est de {score}% — {label} ! {url}"
  },
  "cosmicLabels": {
    "parallel": "Univers parallèles",
    "distant": "Voyageurs distants",
    "stardust": "Poussière d'étoiles",
    "crossed": "Orbites croisées",
    "resonance": "Résonance cosmique",
    "linked": "Constellation liée",
    "fusion": "Fusion stellaire",
    "souls": "Âmes cosmiques"
  },
  "leaderboard": {
    "title": "Dates les plus populaires",
    "subtitle": "Les 50 dates les plus consultées sur CosmicBirth",
    "rank": "#",
    "date": "Date",
    "image": "Image NASA",
    "views": "Vues"
  },
  "nav": {
    "home": "Accueil",
    "leaderboard": "Classement",
    "switchLang": "English"
  },
  "notFound": {
    "title": "Page introuvable",
    "back": "Retour à l'accueil"
  }
}
```

Create `messages/en.json`:

```json
{
  "home": {
    "title": "Discover your cosmic image",
    "subtitle": "What image did NASA publish on the day you were born?",
    "datePlaceholder": "Choose your birth date",
    "submit": "Discover",
    "coupleTitle": "Cosmic Match",
    "coupleSubtitle": "Discover your cosmic compatibility",
    "date1Placeholder": "First birth date",
    "date2Placeholder": "Second birth date",
    "coupleSubmit": "Calculate your score",
    "minDate": "Date must be after June 16, 1995",
    "maxDate": "Date cannot be in the future",
    "invalidDate": "Invalid date"
  },
  "result": {
    "readMore": "Read more",
    "readLess": "Show less",
    "copyright": "Credit",
    "viewOnNasa": "View on NASA APOD website",
    "share": "Share",
    "shareText": "Discover the image NASA published on {date}! {title}",
    "copied": "Link copied!",
    "video": "Video",
    "birthImage": "The cosmic image of {date}"
  },
  "couple": {
    "title": "Cosmic Match",
    "score": "Compatibility score",
    "category1": "{name}'s image",
    "category2": "{name}'s image",
    "shareText": "Our Cosmic Match score is {score}% — {label}! {url}"
  },
  "cosmicLabels": {
    "parallel": "Parallel Universes",
    "distant": "Distant Travelers",
    "stardust": "Stardust",
    "crossed": "Crossed Orbits",
    "resonance": "Cosmic Resonance",
    "linked": "Linked Constellation",
    "fusion": "Stellar Fusion",
    "souls": "Cosmic Souls"
  },
  "leaderboard": {
    "title": "Most popular dates",
    "subtitle": "The 50 most viewed dates on CosmicBirth",
    "rank": "#",
    "date": "Date",
    "image": "NASA image",
    "views": "Views"
  },
  "nav": {
    "home": "Home",
    "leaderboard": "Leaderboard",
    "switchLang": "Français"
  },
  "notFound": {
    "title": "Page not found",
    "back": "Back to home"
  }
}
```

- [ ] **Step 6: Update root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CosmicBirth",
  description: "Discover the NASA image from the day you were born",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
```

- [ ] **Step 7: Create locale layout**

Replace `app/[locale]/layout.tsx`:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Create placeholder homepage**

Replace `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">{t("title")}</h1>
      <p className="mt-4 text-muted-foreground">{t("subtitle")}</p>
    </main>
  );
}
```

- [ ] **Step 9: Verify i18n works**

```bash
cd /home/faton/dev/date-apod
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with routes for `/fr` and `/en`.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add next-intl i18n with FR/EN translations"
```

---

### Task 4: Supabase Client + Database Schema

**Files:**
- Create: `lib/supabase.ts`, `lib/validators.ts`, `supabase/migrations/001_initial.sql`

- [ ] **Step 1: Create Supabase server client**

Create `lib/supabase.ts`:

```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
```

- [ ] **Step 2: Create date validators**

Create `lib/validators.ts`:

```typescript
const APOD_START_DATE = "1995-06-16";

export function isValidApodDate(dateStr: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;

  const date = new Date(dateStr + "T00:00:00Z");
  if (isNaN(date.getTime())) return false;

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  if (`${year}-${month}-${day}` !== dateStr) return false;

  const minDate = new Date(APOD_START_DATE + "T00:00:00Z");
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  yesterday.setUTCHours(0, 0, 0, 0);

  return date >= minDate && date <= yesterday;
}

export function getApodMinDate(): string {
  return APOD_START_DATE;
}

export function getApodMaxDate(): string {
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  return yesterday.toISOString().split("T")[0];
}
```

- [ ] **Step 3: Create migration SQL**

Create `supabase/migrations/001_initial.sql`:

```sql
create table if not exists apod_cache (
  date        date primary key,
  title       text not null,
  explanation text not null,
  url         text not null,
  hdurl       text,
  media_type  text not null check (media_type in ('image', 'video')),
  copyright   text,
  fetched_at  timestamptz default now()
);

create table if not exists date_stats (
  date     date primary key,
  views    integer default 0,
  shares   integer default 0
);
```

Note: Run this migration in Supabase SQL editor or via MCP once connected.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add Supabase client, date validators, and DB migration"
```

---

### Task 5: NASA API Proxy + Cache

**Files:**
- Create: `lib/nasa.ts`, `app/api/apod/route.ts`

- [ ] **Step 1: Create NASA client**

Create `lib/nasa.ts`:

```typescript
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
```

- [ ] **Step 2: Create API route with cache logic**

Create `app/api/apod/route.ts`:

```typescript
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
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch APOD data" },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 3: Add the `increment_views` RPC to migration**

Update `supabase/migrations/001_initial.sql` — append:

```sql
create or replace function increment_views(target_date date)
returns void as $$
begin
  insert into date_stats (date, views, shares)
  values (target_date, 1, 0)
  on conflict (date)
  do update set views = date_stats.views + 1;
end;
$$ language plpgsql;

create or replace function increment_shares(target_date date)
returns void as $$
begin
  insert into date_stats (date, views, shares)
  values (target_date, 0, 1)
  on conflict (date)
  do update set shares = date_stats.shares + 1;
end;
$$ language plpgsql;
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add NASA API proxy with Supabase cache"
```

---

### Task 6: DatePicker Component

**Files:**
- Create: `components/DatePicker.tsx`

- [ ] **Step 1: Create DatePicker component**

Create `components/DatePicker.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const APOD_START = new Date("1995-06-16");

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function DatePicker() {
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");
  const dateLocale = locale === "fr" ? fr : enUS;

  function handleSelect(selected: Date | undefined) {
    if (!selected) return;
    setDate(selected);
    setOpen(false);

    const formatted = format(selected, "yyyy-MM-dd");
    router.push(`/${locale}/result/${formatted}`);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-72 justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date
            ? format(date, "PPP", { locale: dateLocale })
            : t("datePlaceholder")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          disabled={(d) => d < APOD_START || d > getYesterday()}
          defaultMonth={date || new Date(2000, 0)}
          fromDate={APOD_START}
          toDate={getYesterday()}
          locale={dateLocale}
          captionLayout="dropdown-buttons"
        />
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 2: Install date-fns and lucide-react**

```bash
cd /home/faton/dev/date-apod
npm install date-fns lucide-react
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add DatePicker component with calendar and validation"
```

---

### Task 7: Homepage

**Files:**
- Modify: `app/[locale]/page.tsx`
- Create: `components/CoupleForm.tsx`

- [ ] **Step 1: Create CoupleForm component**

Create `components/CoupleForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { CalendarIcon, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const APOD_START = new Date("1995-06-16");

function getYesterday(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function CoupleForm() {
  const [date1, setDate1] = useState<Date>();
  const [date2, setDate2] = useState<Date>();
  const [open1, setOpen1] = useState(false);
  const [open2, setOpen2] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");
  const dateLocale = locale === "fr" ? fr : enUS;

  function handleSubmit() {
    if (!date1 || !date2) return;
    const d1 = format(date1, "yyyy-MM-dd");
    const d2 = format(date2, "yyyy-MM-dd");
    router.push(`/${locale}/result/couple/${d1}/${d2}`);
  }

  const disabledDays = (d: Date) => d < APOD_START || d > getYesterday();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Popover open={open1} onOpenChange={setOpen1}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-64 justify-start text-left font-normal",
                !date1 && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date1
                ? format(date1, "PPP", { locale: dateLocale })
                : t("date1Placeholder")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date1}
              onSelect={(d) => {
                setDate1(d);
                setOpen1(false);
              }}
              disabled={disabledDays}
              defaultMonth={new Date(2000, 0)}
              fromDate={APOD_START}
              toDate={getYesterday()}
              locale={dateLocale}
              captionLayout="dropdown-buttons"
            />
          </PopoverContent>
        </Popover>

        <Heart className="h-6 w-6 text-primary" />

        <Popover open={open2} onOpenChange={setOpen2}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-64 justify-start text-left font-normal",
                !date2 && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date2
                ? format(date2, "PPP", { locale: dateLocale })
                : t("date2Placeholder")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={date2}
              onSelect={(d) => {
                setDate2(d);
                setOpen2(false);
              }}
              disabled={disabledDays}
              defaultMonth={new Date(2000, 0)}
              fromDate={APOD_START}
              toDate={getYesterday()}
              locale={dateLocale}
              captionLayout="dropdown-buttons"
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={!date1 || !date2}
        size="lg"
        className="mt-2"
      >
        <Heart className="mr-2 h-4 w-4" />
        {t("coupleSubmit")}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Build the homepage**

Replace `app/[locale]/page.tsx`:

```tsx
import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/DatePicker";
import { CoupleForm } from "@/components/CoupleForm";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-16 p-4">
      {/* Hero — Solo mode */}
      <section className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
          {t("title")}
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          {t("subtitle")}
        </p>
        <DatePicker />
      </section>

      {/* Divider */}
      <div className="w-full max-w-xs border-t border-border" />

      {/* Couple mode */}
      <section className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-3xl font-bold">{t("coupleTitle")}</h2>
        <p className="max-w-md text-muted-foreground">
          {t("coupleSubtitle")}
        </p>
        <CoupleForm />
      </section>
    </main>
  );
}
```

- [ ] **Step 3: Verify build**

```bash
cd /home/faton/dev/date-apod
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: build homepage with date picker and couple form"
```

---

### Task 8: ReadMore + VideoEmbed + ShareButton Components

**Files:**
- Create: `components/ReadMore.tsx`, `components/VideoEmbed.tsx`, `components/ShareButton.tsx`

- [ ] **Step 1: Create ReadMore component**

Create `components/ReadMore.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const CHAR_LIMIT = 600;

export function ReadMore({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const t = useTranslations("result");

  if (text.length <= CHAR_LIMIT) {
    return <p className="text-muted-foreground leading-relaxed">{text}</p>;
  }

  return (
    <div>
      <p className="text-muted-foreground leading-relaxed">
        {expanded ? text : text.slice(0, CHAR_LIMIT) + "..."}
      </p>
      <Button
        variant="link"
        onClick={() => setExpanded(!expanded)}
        className="mt-1 h-auto p-0 text-primary"
      >
        {expanded ? t("readLess") : t("readMore")}
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Create VideoEmbed component**

```bash
cd /home/faton/dev/date-apod
npm install lite-youtube-embed
```

Create `components/VideoEmbed.tsx`:

```tsx
"use client";

import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /youtube\.com\/embed\/([^?&/]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoEmbed({ url }: { url: string }) {
  const t = useTranslations("result");

  useEffect(() => {
    import("lite-youtube-embed/src/lite-yt-embed.js");
  }, []);

  const videoId = extractYouTubeId(url);

  if (!videoId) {
    return (
      <div className="aspect-video w-full rounded-lg bg-secondary flex items-center justify-center">
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
          {t("viewOnNasa")}
        </a>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <Badge className="absolute top-3 left-3 z-10" variant="secondary">
        {t("video")}
      </Badge>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/lite-youtube-embed@0.3.3/src/lite-yt-embed.min.css" />
      <lite-youtube videoid={videoId} playlabel="Play" className="rounded-lg overflow-hidden w-full" />
    </div>
  );
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lite-youtube": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { videoid: string; playlabel?: string },
        HTMLElement
      >;
    }
  }
}
```

- [ ] **Step 3: Create ShareButton component**

Create `components/ShareButton.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type ShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("result");

  async function handleShare() {
    const shareData = {
      title,
      text: `${text}\n\n#CosmicBirth #NASA #APOD`,
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(`${shareData.text}\n${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available
    }
  }

  return (
    <Button onClick={handleShare} variant="secondary" size="lg">
      {copied ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          {t("copied")}
        </>
      ) : (
        <>
          <Share2 className="mr-2 h-4 w-4" />
          {t("share")}
        </>
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add ReadMore, VideoEmbed, and ShareButton components"
```

---

### Task 9: ApodCard Component

**Files:**
- Create: `components/ApodCard.tsx`

- [ ] **Step 1: Create ApodCard component**

Create `components/ApodCard.tsx`:

```tsx
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ReadMore } from "@/components/ReadMore";
import { VideoEmbed } from "@/components/VideoEmbed";
import { ShareButton } from "@/components/ShareButton";
import type { ApodCache } from "@/lib/supabase";

type ApodCardProps = {
  apod: ApodCache;
  locale: string;
  formattedDate: string;
};

export function ApodCard({ apod, locale, formattedDate }: ApodCardProps) {
  const t = useTranslations("result");
  const apodArchiveUrl = `https://apod.nasa.gov/apod/ap${apod.date.replace(/-/g, "").slice(2)}.html`;
  const resultUrl =
    typeof window !== "undefined"
      ? window.location.href
      : `/${locale}/result/${apod.date}`;

  return (
    <Card className="w-full max-w-4xl overflow-hidden border-border">
      {/* Media */}
      {apod.media_type === "video" ? (
        <VideoEmbed url={apod.url} />
      ) : (
        <div className="relative aspect-video w-full">
          <Image
            src={apod.url}
            alt={apod.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 896px"
          />
        </div>
      )}

      <CardContent className="space-y-4 p-6">
        {/* Title + date */}
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">{apod.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("birthImage", { date: formattedDate })}
          </p>
        </div>

        {/* Explanation */}
        <ReadMore text={apod.explanation} />

        {/* Copyright */}
        {apod.copyright && (
          <p className="text-xs text-muted-foreground">
            {t("copyright")}: {apod.copyright}
          </p>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">
          <ShareButton
            title={apod.title}
            text={t("shareText", { date: formattedDate, title: apod.title })}
            url={resultUrl}
          />
          <a
            href={apodArchiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            {t("viewOnNasa")}
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add ApodCard component with image/video display and sharing"
```

---

### Task 10: Solo Result Page (SSR)

**Files:**
- Create: `app/[locale]/result/[date]/page.tsx`

- [ ] **Step 1: Create solo result page**

Create `app/[locale]/result/[date]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { ApodCard } from "@/components/ApodCard";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; date: string }>;
};

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
  await supabase
    .from("date_stats")
    .upsert({ date, views: 1, shares: 0 }, { onConflict: "date" });

  return row;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date } = await params;
  if (!isValidApodDate(date)) return {};

  const apod = await getApod(date);
  const dateLocale = locale === "fr" ? fr : enUS;
  const formattedDate = format(new Date(date + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  return {
    title: `${apod.title} — NASA, ${formattedDate} · CosmicBirth`,
    description: apod.explanation.slice(0, 160),
    alternates: {
      languages: {
        fr: `/fr/result/${date}`,
        en: `/en/result/${date}`,
      },
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { locale, date } = await params;

  if (!isValidApodDate(date)) notFound();

  const apod = await getApod(date);
  const dateLocale = locale === "fr" ? fr : enUS;
  const formattedDate = format(new Date(date + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  // Increment views
  supabase.rpc("increment_views", { target_date: date }).then();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <ApodCard apod={apod} locale={locale} formattedDate={formattedDate} />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/faton/dev/date-apod
npm run build 2>&1 | tail -20
```

Expected: Build succeeds with dynamic route `/[locale]/result/[date]`.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add solo result page with SSR and metadata"
```

---

### Task 11: OG Image — Solo

**Files:**
- Create: `app/[locale]/result/[date]/opengraph-image.tsx`

- [ ] **Step 1: Install @vercel/og**

```bash
cd /home/faton/dev/date-apod
npm install @vercel/og
```

- [ ] **Step 2: Create solo OG image route**

Create `app/[locale]/result/[date]/opengraph-image.tsx`:

```tsx
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
              lineClamp: 2,
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
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add dynamic OG image for solo result pages"
```

---

### Task 12: Cosmic Score Algorithm

**Files:**
- Create: `lib/categories.ts`, `lib/cosmic-score.ts`

- [ ] **Step 1: Create category detection**

Create `lib/categories.ts`:

```typescript
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  galaxy: ["galaxy", "galaxies", "galactic", "milky way", "andromeda"],
  nebula: ["nebula", "nebulae", "planetary nebula", "emission nebula"],
  planet: ["planet", "planets", "jupiter", "saturn", "mars", "venus", "mercury", "neptune", "uranus", "pluto"],
  star: ["star", "stars", "stellar", "supernova", "pulsar", "neutron star", "white dwarf"],
  blackhole: ["black hole", "event horizon", "singularity"],
  aurora: ["aurora", "auroral", "northern lights", "southern lights"],
  comet: ["comet", "meteor", "asteroid", "meteorite"],
  sun: ["sun", "solar", "sunspot", "solar flare", "corona", "eclipse"],
};

export type CosmicCategory = keyof typeof CATEGORY_KEYWORDS;

export function detectCategory(title: string, explanation: string): CosmicCategory {
  const text = `${title} ${explanation}`.toLowerCase();

  let bestCategory: CosmicCategory = "star";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as CosmicCategory;
    }
  }

  return bestCategory;
}
```

- [ ] **Step 2: Create scoring algorithm**

Create `lib/cosmic-score.ts`:

```typescript
import { detectCategory, type CosmicCategory } from "./categories";

type CosmicLabel =
  | "parallel"
  | "distant"
  | "stardust"
  | "crossed"
  | "resonance"
  | "linked"
  | "fusion"
  | "souls";

const LABELS: { max: number; key: CosmicLabel }[] = [
  { max: 55, key: "parallel" },
  { max: 61, key: "distant" },
  { max: 67, key: "stardust" },
  { max: 73, key: "crossed" },
  { max: 79, key: "resonance" },
  { max: 85, key: "linked" },
  { max: 91, key: "fusion" },
  { max: 99, key: "souls" },
];

function hashDates(date1: string, date2: string): number {
  const sorted = [date1, date2].sort();
  const combined = sorted[0] + sorted[1];

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return Math.abs(hash);
}

export type CosmicMatchResult = {
  score: number;
  labelKey: CosmicLabel;
  category1: CosmicCategory;
  category2: CosmicCategory;
};

export function calculateCosmicScore(
  date1: string,
  title1: string,
  explanation1: string,
  date2: string,
  title2: string,
  explanation2: string
): CosmicMatchResult {
  const category1 = detectCategory(title1, explanation1);
  const category2 = detectCategory(title2, explanation2);

  const hash = hashDates(date1, date2);
  let score = 50 + (hash % 45); // 50-94

  if (category1 === category2) {
    score += 5;
  }

  score = Math.min(score, 99);

  const labelKey = LABELS.find((l) => score <= l.max)!.key;

  return { score, labelKey, category1, category2 };
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add cosmic score algorithm with category detection"
```

---

### Task 13: Score API Route

**Files:**
- Create: `app/api/score/route.ts`

- [ ] **Step 1: Create score API route**

Create `app/api/score/route.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add cosmic score API route"
```

---

### Task 14: CosmicScore Display Component

**Files:**
- Create: `components/CosmicScore.tsx`

- [ ] **Step 1: Create CosmicScore component**

Create `components/CosmicScore.tsx`:

```tsx
import { useTranslations } from "next-intl";
import type { CosmicLabel } from "@/lib/cosmic-score";

type CosmicScoreProps = {
  score: number;
  labelKey: string;
};

export function CosmicScore({ score, labelKey }: CosmicScoreProps) {
  const t = useTranslations("cosmicLabels");
  const tCouple = useTranslations("couple");

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        {tCouple("score")}
      </p>

      {/* Circular progress */}
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">{score}%</span>
        </div>
      </div>

      <p className="text-xl font-semibold text-primary">{t(labelKey)}</p>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add CosmicScore display component with circular progress"
```

---

### Task 15: Couple Result Page (SSR)

**Files:**
- Create: `app/[locale]/result/couple/[date1]/[date2]/page.tsx`

- [ ] **Step 1: Create couple result page**

Create `app/[locale]/result/couple/[date1]/[date2]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import Image from "next/image";
import { isValidApodDate } from "@/lib/validators";
import { supabase } from "@/lib/supabase";
import { fetchApodFromNasa } from "@/lib/nasa";
import { calculateCosmicScore } from "@/lib/cosmic-score";
import { CosmicScore } from "@/components/CosmicScore";
import { ShareButton } from "@/components/ShareButton";
import { VideoEmbed } from "@/components/VideoEmbed";
import { Card, CardContent } from "@/components/ui/card";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string; date1: string; date2: string }>;
};

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, date1, date2 } = await params;
  if (!isValidApodDate(date1) || !isValidApodDate(date2)) return {};

  const t = await getTranslations({ locale, namespace: "couple" });

  return {
    title: `Cosmic Match — ${date1} & ${date2} · CosmicBirth`,
    description: t("title"),
    alternates: {
      languages: {
        fr: `/fr/result/couple/${date1}/${date2}`,
        en: `/en/result/couple/${date1}/${date2}`,
      },
    },
  };
}

export default async function CouplePage({ params }: Props) {
  const { locale, date1, date2 } = await params;

  if (!isValidApodDate(date1) || !isValidApodDate(date2)) notFound();

  const [apod1, apod2] = await Promise.all([getApod(date1), getApod(date2)]);

  const result = calculateCosmicScore(
    date1,
    apod1.title,
    apod1.explanation,
    date2,
    apod2.title,
    apod2.explanation
  );

  const dateLocale = locale === "fr" ? fr : enUS;
  const formatted1 = format(new Date(date1 + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });
  const formatted2 = format(new Date(date2 + "T00:00:00Z"), "PPP", {
    locale: dateLocale,
  });

  const t = await getTranslations({ locale, namespace: "couple" });
  const tLabels = await getTranslations({ locale, namespace: "cosmicLabels" });
  const label = tLabels(result.labelKey);
  const pageUrl = `/${locale}/result/couple/${date1}/${date2}`;

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-4 py-12">
      <h1 className="text-4xl font-bold">{t("title")}</h1>

      {/* Score */}
      <CosmicScore score={result.score} labelKey={result.labelKey} />

      {/* Two images side by side */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
        {/* Date 1 */}
        <Card className="overflow-hidden border-border">
          {apod1.media_type === "video" ? (
            <VideoEmbed url={apod1.url} />
          ) : (
            <div className="relative aspect-video w-full">
              <Image
                src={apod1.url}
                alt={apod1.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <CardContent className="p-4">
            <h2 className="font-semibold">{apod1.title}</h2>
            <p className="text-sm text-muted-foreground">{formatted1}</p>
          </CardContent>
        </Card>

        {/* Date 2 */}
        <Card className="overflow-hidden border-border">
          {apod2.media_type === "video" ? (
            <VideoEmbed url={apod2.url} />
          ) : (
            <div className="relative aspect-video w-full">
              <Image
                src={apod2.url}
                alt={apod2.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          )}
          <CardContent className="p-4">
            <h2 className="font-semibold">{apod2.title}</h2>
            <p className="text-sm text-muted-foreground">{formatted2}</p>
          </CardContent>
        </Card>
      </div>

      {/* Share */}
      <ShareButton
        title="Cosmic Match"
        text={t("shareText", {
          score: result.score,
          label,
          url: pageUrl,
        })}
        url={pageUrl}
      />
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

```bash
cd /home/faton/dev/date-apod
npm run build 2>&1 | tail -20
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add couple result page with cosmic score and side-by-side display"
```

---

### Task 16: OG Image — Couple

**Files:**
- Create: `app/[locale]/result/couple/[date1]/[date2]/opengraph-image.tsx`

- [ ] **Step 1: Create couple OG image route**

Create `app/[locale]/result/couple/[date1]/[date2]/opengraph-image.tsx`:

```tsx
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
        {/* Left image */}
        <div style={{ width: "50%", height: "100%", position: "relative", display: "flex" }}>
          {showImage1 && (
            <img src={apod1.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        {/* Right image */}
        <div style={{ width: "50%", height: "100%", position: "relative", display: "flex" }}>
          {showImage2 && (
            <img src={apod2.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>

        {/* Overlay */}
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
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add dynamic OG image for couple result pages"
```

---

### Task 17: Leaderboard Page

**Files:**
- Create: `app/[locale]/leaderboard/page.tsx`

- [ ] **Step 1: Create leaderboard page**

Create `app/[locale]/leaderboard/page.tsx`:

```tsx
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export const revalidate = 3600; // ISR: 1 hour

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });

  return {
    title: `${t("title")} · CosmicBirth`,
    description: t("subtitle"),
  };
}

export default async function LeaderboardPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leaderboard" });
  const dateLocale = locale === "fr" ? fr : enUS;

  const { data: stats } = await supabase
    .from("date_stats")
    .select("date, views")
    .order("views", { ascending: false })
    .limit(50);

  // Fetch titles for all dates
  const dates = (stats || []).map((s) => s.date);
  const { data: apods } = await supabase
    .from("apod_cache")
    .select("date, title")
    .in("date", dates);

  const titleMap = new Map((apods || []).map((a) => [a.date, a.title]));

  return (
    <main className="flex min-h-screen flex-col items-center gap-8 p-4 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
      </div>

      <Card className="w-full max-w-3xl border-border">
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-sm text-muted-foreground">
                <th className="p-4 w-12">{t("rank")}</th>
                <th className="p-4">{t("date")}</th>
                <th className="p-4">{t("image")}</th>
                <th className="p-4 text-right">{t("views")}</th>
              </tr>
            </thead>
            <tbody>
              {(stats || []).map((stat, i) => (
                <tr key={stat.date} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">{i + 1}</td>
                  <td className="p-4">
                    <Link
                      href={`/${locale}/result/${stat.date}`}
                      className="text-primary hover:underline"
                    >
                      {format(new Date(stat.date + "T00:00:00Z"), "PPP", {
                        locale: dateLocale,
                      })}
                    </Link>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">
                    {titleMap.get(stat.date) || "—"}
                  </td>
                  <td className="p-4 text-right tabular-nums">
                    {stat.views.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: add leaderboard page with top 50 most viewed dates"
```

---

### Task 18: Navigation + Language Switcher

**Files:**
- Create: `components/Navbar.tsx`
- Modify: `app/[locale]/layout.tsx`

- [ ] **Step 1: Create Navbar component**

Create `components/Navbar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const otherLocale = locale === "fr" ? "en" : "fr";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href={`/${locale}`} className="text-lg font-bold">
            CosmicBirth
          </Link>
          <Link
            href={`/${locale}/leaderboard`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("leaderboard")}
          </Link>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link href={switchedPath}>
            <Globe className="mr-2 h-4 w-4" />
            {t("switchLang")}
          </Link>
        </Button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Add Navbar to locale layout**

Update `app/[locale]/layout.tsx` — add Navbar import and render it inside the body, before `{children}`. Also add `pt-14` to body content to account for fixed navbar:

```tsx
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter } from "next/font/google";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className="dark">
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <div className="pt-14">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add navbar with language switcher"
```

---

### Task 19: 404 Page + Next.js Image Config

**Files:**
- Create: `app/not-found.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Create 404 page**

Create `app/not-found.tsx`:

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 bg-background text-foreground">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground">Page not found</p>
      <Link href="/" className="text-primary hover:underline">
        Back to home
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Update next.config.ts for external images**

Update `next.config.ts`:

```typescript
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "apod.nasa.gov",
      },
      {
        protocol: "https" as const,
        hostname: "*.gsfc.nasa.gov",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add 404 page and configure Next.js image remote patterns"
```

---

### Task 20: Final Build Verification + Git Init

**Files:** None new

- [ ] **Step 1: Initialize git if not done**

```bash
cd /home/faton/dev/date-apod
git init 2>/dev/null || true
git add -A
git status
```

- [ ] **Step 2: Full build check**

```bash
cd /home/faton/dev/date-apod
npm run build 2>&1
```

Expected: Build succeeds with no errors. Routes should include:
- `/[locale]` (homepage)
- `/[locale]/result/[date]` (solo result)
- `/[locale]/result/couple/[date1]/[date2]` (couple result)
- `/[locale]/leaderboard`

- [ ] **Step 3: Fix any build issues**

If there are TypeScript or build errors, fix them before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify full build passes"
```

- [ ] **Step 5: Push to GitHub**

```bash
cd /home/faton/dev/date-apod
git remote add origin https://github.com/faton5/cosmicbirth.git 2>/dev/null || true
git branch -M main
git push -u origin main
```
