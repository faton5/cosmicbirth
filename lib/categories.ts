const CATEGORY_KEYWORDS: Record<string, string[]> = {
  galaxy: ["galaxy", "galaxies", "galactic", "milky way", "andromeda"],
  nebula: ["nebula", "nebulae", "planetary nebula", "emission nebula"],
  planet: ["planet", "planets", "jupiter", "saturn", "mars", "venus", "mercury", "neptune", "uranus", "pluto"],
  star: ["star", "stars", "stellar", "supernova", "pulsar", "neutron star", "white dwarf"],
  blackhole: ["black hole", "event horizon", "singularity"],
  aurora: ["aurora", "auroral", "northern lights", "southern lights"],
  comet: ["comet", "meteor", "asteroid", "meteorite"],
  sun: ["sun", "solar", "sunspot", "solar flare", "corona", "eclipse"],
};

export type CosmicCategory = keyof typeof CATEGORY_KEYWORDS;

export function detectCategory(title: string, explanation: string): CosmicCategory {
  const text = `${title} ${explanation}`.toLowerCase();

  let bestCategory: CosmicCategory = "star";
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as CosmicCategory;
    }
  }

  return bestCategory;
}
