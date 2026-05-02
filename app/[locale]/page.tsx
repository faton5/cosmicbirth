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
