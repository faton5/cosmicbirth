"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function Navbar() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("nav");

  const otherLocale = locale === "fr" ? "en" : "fr";
  const switchedPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  const isLeaderboard = pathname.includes("/leaderboard");

  return (
    <header className="fixed top-0 w-full z-50 bg-zinc-950/70 backdrop-blur-[20px] border-b border-white/10 shadow-[0_0_30px_rgba(139,92,246,0.15)] flex justify-between items-center px-8 h-20">
      <Link href={`/${locale}`} className="flex items-center gap-2 hover:bg-white/5 transition-all duration-300 p-2 rounded-lg">
        <span className="text-2xl font-black tracking-tighter font-heading bg-gradient-to-r from-violet-500 to-fuchsia-400 bg-clip-text text-transparent">
          CosmicBirth
        </span>
      </Link>
      <nav className="hidden md:flex gap-6 items-center font-heading uppercase tracking-widest text-sm">
        <Link
          href={`/${locale}`}
          className={`px-4 py-2 rounded-full transition-all duration-300 ${
            !isLeaderboard
              ? "text-violet-400 font-bold"
              : "text-zinc-400 font-medium hover:text-white hover:bg-white/5"
          }`}
        >
          {t("home")}
        </Link>
        <Link
          href={`/${locale}/leaderboard`}
          className={`px-4 py-2 transition-all duration-300 ${
            isLeaderboard
              ? "text-violet-400 font-bold border-b-2 border-violet-500 pb-1"
              : "text-zinc-400 font-medium hover:text-white hover:bg-white/5 rounded-full"
          }`}
        >
          {t("leaderboard")}
        </Link>
      </nav>
      <Link
        href={switchedPath}
        className="font-heading uppercase tracking-widest text-sm text-violet-500 hover:text-violet-400 transition-colors font-bold hover:bg-white/5 px-4 py-2 rounded-lg border border-white/10"
      >
        {t("switchLang")}
      </Link>
    </header>
  );
}
