import { detectCategory, type CosmicCategory } from "./categories";

export type CosmicLabel =
  | "parallel"
  | "distant"
  | "stardust"
  | "crossed"
  | "resonance"
  | "linked"
  | "fusion"
  | "souls";

const LABELS: { max: number; key: CosmicLabel }[] = [
  { max: 55, key: "parallel" },
  { max: 61, key: "distant" },
  { max: 67, key: "stardust" },
  { max: 73, key: "crossed" },
  { max: 79, key: "resonance" },
  { max: 85, key: "linked" },
  { max: 91, key: "fusion" },
  { max: 99, key: "souls" },
];

function hashDates(date1: string, date2: string): number {
  const sorted = [date1, date2].sort();
  const combined = sorted[0] + sorted[1];

  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  return Math.abs(hash);
}

export type CosmicMatchResult = {
  score: number;
  labelKey: CosmicLabel;
  category1: CosmicCategory;
  category2: CosmicCategory;
};

export function calculateCosmicScore(
  date1: string,
  title1: string,
  explanation1: string,
  date2: string,
  title2: string,
  explanation2: string
): CosmicMatchResult {
  const category1 = detectCategory(title1, explanation1);
  const category2 = detectCategory(title2, explanation2);

  const hash = hashDates(date1, date2);
  let score = 50 + (hash % 45); // 50-94

  if (category1 === category2) {
    score += 5;
  }

  score = Math.min(score, 99);

  const labelKey = LABELS.find((l) => score <= l.max)!.key;

  return { score, labelKey, category1, category2 };
}
