import { useTranslations } from "next-intl";
import { DatePicker } from "@/components/DatePicker";
import { CoupleForm } from "@/components/CoupleForm";

export default function HomePage() {
  const t = useTranslations("home");

  return (
    <main className="flex-grow relative">
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-container-padding text-center flex flex-col items-center justify-center min-h-[530px]">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-gutter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel neon-border mb-4">
            <span className="text-label-caps text-on-surface uppercase tracking-widest font-heading">
              {t("subtitle")}
            </span>
          </div>
          <h1 className="font-heading text-h1 text-on-surface mb-6 drop-shadow-2xl">
            {t("title")}
          </h1>

          {/* Solo Date Picker */}
          <div className="glass-panel-heavy rounded-xl p-8 max-w-md w-full neon-border shadow-2xl">
            <div className="flex flex-col gap-6">
              <DatePicker />
            </div>
          </div>
        </div>
      </section>

      {/* Cosmic Match Section */}
      <section className="py-24 px-container-padding relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-h2 text-on-surface mb-4">{t("coupleTitle")}</h2>
            <p className="font-body text-body-md text-on-surface-variant">{t("coupleSubtitle")}</p>
          </div>
          <div className="glass-panel rounded-xl p-8 md:p-12 neon-border relative overflow-hidden">
            <CoupleForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent text-zinc-500 font-heading text-xs tracking-tight w-full py-12 mt-20 border-t border-white/5 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 px-8">
        <div className="font-bold text-zinc-200 text-sm">
          © 2024 CosmicBirth — Celestial Discovery
        </div>
      </footer>
    </main>
  );
}
