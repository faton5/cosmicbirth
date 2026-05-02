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
  yesterday.setUTCHours(0, 0, 0, 0);

  if (date < min || date > yesterday) return null;

  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CoupleForm() {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");

  function handleSubmit() {
    const d1 = parseDate(value1);
    const d2 = parseDate(value2);
    if (!d1 || !d2) {
      setError(t("invalidDate"));
      return;
    }
    setError("");
    router.push(`/${locale}/result/couple/${d1}/${d2}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  const isValid = value1.length === 10 && value2.length === 10;

  return (
    <div className="flex flex-col items-center gap-8 relative z-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 w-full">
        {/* Person 1 */}
        <div className="flex-1 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-primary uppercase text-center md:text-left font-heading">
              {t("date1Placeholder")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="15/06/2007"
              value={value1}
              onChange={(e) => { setValue1(formatInput(e.target.value)); if (error) setError(""); }}
              onKeyDown={handleKeyDown}
              maxLength={10}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 text-on-surface font-body text-body-md focus:border-tertiary focus:ring-1 focus:ring-tertiary transition-all outline-none placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Heart */}
        <div className="flex-shrink-0 relative">
          <div className="w-16 h-16 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center shadow-[0_0_15px_rgba(251,171,255,0.2)]">
            <span className="text-3xl text-secondary">&#10084;</span>
          </div>
        </div>

        {/* Person 2 */}
        <div className="flex-1 w-full">
          <div className="flex flex-col gap-2">
            <label className="text-label-caps text-secondary uppercase text-center md:text-right font-heading">
              {t("date2Placeholder")}
            </label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="22/03/2005"
              value={value2}
              onChange={(e) => { setValue2(formatInput(e.target.value)); if (error) setError(""); }}
              onKeyDown={handleKeyDown}
              maxLength={10}
              className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg py-3 px-4 text-on-surface font-body text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary transition-all outline-none text-right placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={!isValid}
        className="px-8 py-3 rounded-full border border-outline-variant bg-surface-container hover:bg-surface-container-high text-on-surface font-heading text-body-lg transition-all duration-300 neon-border inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t("coupleSubmit")}
      </button>
    </div>
  );
}
