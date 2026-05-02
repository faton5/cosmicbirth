"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { FAMOUS_DATES } from "@/lib/famous-dates";

function formatInput(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
}

function parseDate(input: string): string | null {
  const parts = input.split("/");
  if (parts.length !== 3) return null;
  const [day, month, year] = parts;
  if (!day || !month || !year || year.length !== 4) return null;
  const d = parseInt(day, 10);
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);
  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  const min = new Date("1995-06-16T00:00:00Z");
  const yesterday = new Date();
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (date < min || date > yesterday) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function FamousDates() {
  const [userDate, setUserDate] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("famous");

  function handleCompare(eventApodDate: string) {
    const parsed = parseDate(userDate);
    if (!parsed) {
      setSelectedEvent(eventApodDate);
      return;
    }
    router.push(`/${locale}/result/couple/${parsed}/${eventApodDate}`);
  }

  function handleDateSubmit() {
    if (!selectedEvent) return;
    const parsed = parseDate(userDate);
    if (!parsed) return;
    router.push(`/${locale}/result/couple/${parsed}/${selectedEvent}`);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Date input - shows when an event is selected but no date entered */}
      {selectedEvent && (
        <div className="glass-panel-heavy rounded-xl p-6 neon-border max-w-md mx-auto w-full">
          <div className="flex flex-col gap-4">
            <label className="text-label-caps text-on-surface-variant uppercase font-heading tracking-widest">
              {t("enterYourDate")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="15/06/2007"
              value={userDate}
              onChange={(e) => setUserDate(formatInput(e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") handleDateSubmit(); }}
              maxLength={10}
              autoFocus
              className="w-full bg-surface-container/50 border border-outline-variant rounded-lg py-3 px-4 text-on-surface font-body text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-on-surface-variant/50"
            />
            <button
              onClick={handleDateSubmit}
              disabled={userDate.length < 10}
              className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-container font-heading text-sm font-bold py-3 rounded-full transition-all disabled:opacity-40"
            >
              {t("compare")}
            </button>
          </div>
        </div>
      )}

      {/* Events grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FAMOUS_DATES.map((event) => (
          <button
            key={event.key}
            onClick={() => handleCompare(event.apodDate)}
            className={`glass-panel rounded-xl p-5 text-left transition-all duration-300 hover:bg-white/5 group ${
              selectedEvent === event.apodDate ? "neon-border-glow" : ""
            }`}
          >
            <span className="text-3xl mb-3 block">{event.emoji}</span>
            <h3 className="font-heading text-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
              {t(`events.${event.key}`)}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              {new Date(event.date + "T00:00:00Z").toLocaleDateString(
                locale === "fr" ? "fr-FR" : "en-US",
                { day: "numeric", month: "long", year: "numeric" }
              )}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
