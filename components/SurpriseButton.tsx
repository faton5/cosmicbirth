"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const APOD_START = new Date("1995-06-16").getTime();

export function SurpriseButton() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("home");

  function handleClick() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const end = yesterday.getTime();

    const random = new Date(APOD_START + Math.random() * (end - APOD_START));
    const y = random.getFullYear();
    const m = String(random.getMonth() + 1).padStart(2, "0");
    const d = String(random.getDate()).padStart(2, "0");

    router.push(`/${locale}/result/${y}-${m}-${d}`);
  }

  return (
    <button
      onClick={handleClick}
      className="px-6 py-3 rounded-full border border-outline-variant bg-surface-container/50 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-heading text-sm uppercase tracking-widest transition-all duration-300 neon-border"
    >
      {t("surprise")}
    </button>
  );
}
