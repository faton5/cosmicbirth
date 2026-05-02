"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useRecentDates } from "@/lib/use-recent-dates";

export function RecentDates() {
  const dates = useRecentDates();
  const locale = useLocale();
  const t = useTranslations("home");

  if (dates.length === 0) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-label-caps text-on-surface-variant uppercase font-heading tracking-widest">
        {t("recentDates")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {dates.map((date) => (
          <Link
            key={date}
            href={`/${locale}/result/${date}`}
            className="px-4 py-2 rounded-full glass-panel text-sm text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-300 font-body"
          >
            {formatDateDisplay(date, locale)}
          </Link>
        ))}
      </div>
    </div>
  );
}

function formatDateDisplay(dateStr: string, locale: string): string {
  const date = new Date(dateStr + "T00:00:00Z");
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
