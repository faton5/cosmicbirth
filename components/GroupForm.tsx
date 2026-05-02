"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

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

export function GroupForm() {
  const [dates, setDates] = useState<string[]>(["", "", ""]);
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("group");

  function updateDate(index: number, value: string) {
    const newDates = [...dates];
    newDates[index] = formatInput(value);
    setDates(newDates);
  }

  function addDate() {
    if (dates.length < 5) setDates([...dates, ""]);
  }

  function removeDate(index: number) {
    if (dates.length <= 3) return;
    setDates(dates.filter((_, i) => i !== index));
  }

  function handleSubmit() {
    const parsed = dates.map(parseDate);
    if (parsed.some((d) => d === null)) return;
    router.push(`/${locale}/result/group?dates=${parsed.join(",")}`);
  }

  const allValid = dates.every((d) => d.length === 10);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="flex flex-col gap-3 w-full">
        {dates.map((date, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-sm font-heading text-on-surface-variant flex-shrink-0">
              {i + 1}
            </span>
            <input
              type="text"
              inputMode="numeric"
              placeholder="15/06/2007"
              value={date}
              onChange={(e) => updateDate(i, e.target.value)}
              maxLength={10}
              className="flex-1 bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 text-on-surface font-body text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-on-surface-variant/50"
            />
            {dates.length > 3 && (
              <button
                onClick={() => removeDate(i)}
                className="text-on-surface-variant hover:text-red-400 transition-colors text-sm font-heading"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {dates.length < 5 && (
        <button
          onClick={addDate}
          className="text-sm text-primary hover:text-secondary transition-colors font-heading uppercase tracking-widest"
        >
          + {t("addDate")}
        </button>
      )}

      <button
        onClick={handleSubmit}
        disabled={!allValid}
        className="px-8 py-3 rounded-full border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface font-heading text-body-lg transition-all duration-300 neon-border inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("calculate")}
      </button>
    </div>
  );
}
