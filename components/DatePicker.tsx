"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

export function DatePicker() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");

  function parseAndValidate(input: string): string | null {
    const parts = input.split("/");
    if (parts.length !== 3) return null;

    const [day, month, year] = parts;
    if (!day || !month || !year || year.length !== 4) return null;

    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);

    if (isNaN(d) || isNaN(m) || isNaN(y)) return null;

    const date = new Date(Date.UTC(y, m - 1, d));
    if (
      date.getUTCFullYear() !== y ||
      date.getUTCMonth() !== m - 1 ||
      date.getUTCDate() !== d
    )
      return null;

    const min = new Date("1995-06-16T00:00:00Z");
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    yesterday.setUTCHours(0, 0, 0, 0);

    if (date < min) return "min";
    if (date > yesterday) return "max";

    const iso = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return iso;
  }

  function handleSubmit() {
    const result = parseAndValidate(value);
    if (!result) {
      setError(t("invalidDate"));
      return;
    }
    if (result === "min") {
      setError(t("minDate"));
      return;
    }
    if (result === "max") {
      setError(t("maxDate"));
      return;
    }
    setError("");
    router.push(`/${locale}/result/${result}`);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") handleSubmit();
  }

  function formatInput(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatInput(e.target.value);
    setValue(formatted);
    if (error) setError("");
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2 text-left">
        <label className="text-label-caps text-on-surface-variant uppercase font-heading">
          {t("datePlaceholder")}
        </label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="15/06/2007"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={10}
          className="w-full bg-surface-container/50 border border-outline-variant rounded-lg py-4 px-4 text-on-surface font-body text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none placeholder:text-on-surface-variant/50"
        />
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary-container font-heading text-body-lg font-bold py-4 rounded-full shadow-[0_0_20px_rgba(208,188,255,0.4)] hover:shadow-[0_0_30px_rgba(208,188,255,0.6)] transition-all duration-300 transform hover:-translate-y-1"
      >
        {t("submit")}
      </button>
    </div>
  );
}
