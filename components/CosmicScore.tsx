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
      <p className="text-sm uppercase tracking-widest text-muted-foreground">
        {tCouple("score")}
      </p>

      {/* Circular progress */}
      <div className="relative h-40 w-40">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-secondary"
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
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold">{score}%</span>
        </div>
      </div>

      <p className="text-xl font-semibold text-primary">{t(labelKey)}</p>
    </div>
  );
}
