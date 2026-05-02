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

        <Link href={switchedPath}>
          <Button variant="ghost" size="sm">
            <Globe className="mr-2 h-4 w-4" />
            {t("switchLang")}
          </Button>
        </Link>
      </div>
    </nav>
  );
}
