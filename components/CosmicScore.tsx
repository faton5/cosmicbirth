import { useTranslations } from "next-intl";

type CosmicScoreProps = {
  score: number;
  labelKey: string;
};

export function CosmicScore({ score, labelKey }: CosmicScoreProps) {
  const t = useTranslations("cosmicLabels");
  const tCouple = useTranslations("couple");

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-label-caps uppercase text-on-surface-variant font-heading">
        {tCouple("score")}
      </p>

      {/* Circular progress with glow */}
      <div className="relative flex items-center justify-center w-64 h-64 sm:w-80 sm:h-80 mb-8">
        {/* Blurred glow behind */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-2xl" />

        {/* SVG Circle */}
        <svg className="relative h-full w-full -rotate-90 drop-shadow-[0_0_20px_rgba(208,188,255,0.6)]" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-surface-variant opacity-30"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary"
          />
        </svg>

        {/* Score text with gradient */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl sm:text-7xl font-heading font-bold bg-gradient-to-br from-white to-primary-fixed bg-clip-text text-transparent">
            {score}%
          </span>
        </div>
      </div>

      <p className="text-h3 font-heading text-gradient">{t(labelKey)}</p>
    </div>
  );
}
