# CosmicBirth V1 — Design Spec

## Scope

V1 Core + V1 Viral (semaines 1-2 de la roadmap). Pas d'auth, pas de profils, pas de monétisation.

## Stack

| Couche | Techno |
|---|---|
| Frontend | Next.js 14 App Router |
| Styling | Tailwind CSS + shadcn/ui |
| i18n | next-intl (route prefix `/fr/...`, `/en/...`) |
| Backend | API Routes Next.js |
| BDD / Cache | Supabase (PostgreSQL) |
| Images OG | @vercel/og (Satori) |
| Deploy | Vercel |

## Identité visuelle

Dark mode spatial (fond sombre, ambiance cosmos). Cible 18-35 ans, mobile-first, esthétique forte.

## Structure du projet

```
app/
├── [locale]/
│   ├── page.tsx                          # Homepage
│   ├── result/
│   │   ├── [date]/
│   │   │   ├── page.tsx                  # Résultat solo (SSR)
│   │   │   └── opengraph-image.tsx       # Carte OG solo
│   │   └── couple/
│   │       └── [date1]/[date2]/
│   │           ├── page.tsx              # Résultat couple (SSR)
│   │           └── opengraph-image.tsx   # Carte OG couple
│   ├── leaderboard/
│   │   └── page.tsx
│   └── layout.tsx                        # Layout avec providers i18n
├── api/
│   ├── apod/route.ts                     # Proxy NASA + cache
│   └── score/route.ts                    # Calcul Cosmic Match
├── layout.tsx                            # Root layout
└── not-found.tsx
components/
├── DatePicker.tsx
├── ApodCard.tsx
├── CosmicScore.tsx
├── ShareButton.tsx
├── VideoEmbed.tsx
└── ui/                                   # shadcn
lib/
├── nasa.ts
├── supabase.ts
├── cosmic-score.ts
└── utils.ts
messages/
├── fr.json
└── en.json
```

Les routes API restent hors du `[locale]` — pas d'i18n nécessaire. Le middleware `next-intl` gère la détection de langue et la redirection automatique.

## Fonctionnalités V1 Core

### Recherche par date

- Champ de saisie avec datepicker (shadcn `DatePicker`)
- Validation client : format ISO, plage 1995-06-16 → hier
- Soumission via Entrée ou bouton
- Pas de compte requis
- Navigation vers `/[locale]/result/[date]`

### Page résultat solo

- URL canonique `/[locale]/result/1998-03-12`
- SSR pour les métadonnées OG
- Contenu : photo APOD pleine largeur, titre, date formatée, explication scientifique (bouton "Lire la suite" si >600 chars), copyright, lien archive APOD officielle
- SEO : title pattern `"[Titre image] — NASA, [date] · CosmicBirth"`, hreflang FR/EN

### Gestion vidéo

- ~5% des APOD sont des vidéos YouTube
- Détection via `media_type === 'video'`
- Embed via `lite-youtube-embed` (chargement paresseux, performant)
- Badge "Vidéo" visible
- Carte OG : fallback branded (logo + titre + date sur fond spatial)

### Proxy NASA + cache

- `GET /api/apod?date=1998-03-12`
- Vérifie `apod_cache` dans Supabase
- Cache hit → retour direct (< 100ms)
- Cache miss → appel NASA API → stocke en cache → retour
- Incrémente `date_stats.views` à chaque requête
- Clé NASA API uniquement côté serveur (env var `NASA_API_KEY`)

### Partage natif

- Web Share API en priorité (mobile)
- Fallback `navigator.clipboard` + toast de confirmation (desktop)
- Texte localisé FR/EN : titre, date, lien vers la page résultat, hashtags `#CosmicBirth #NASA #APOD`

## Fonctionnalités V1 Viral

### Carte OG dynamique

- Fichier `opengraph-image.tsx` par route résultat
- `@vercel/og` (Satori), image 1200x630px
- Contenu : photo APOD en fond, titre, date formatée, logo CosmicBirth
- Sert la viralité passive (aperçu riche sur WhatsApp, Twitter, Discord, iMessage)

### Mode Couple — Cosmic Match

- Saisie de deux dates sur la homepage
- URL dédiée : `/[locale]/result/couple/[date1]/[date2]`
- Affichage des deux images côte à côte + score de compatibilité
- Carte OG couple dédiée

### Algorithme Cosmic Match

Score déterministe (même couple = même score à vie) :

1. Catégorisation par mots-clés du titre et de l'explication :
   - galaxy, nebula, planet, star, black hole, aurora, comet, sun
2. Hash des deux dates combinées → base pseudo-aléatoire 50-94
3. Bonus +5 si même catégorie
4. Plafonné à 99
5. 8 niveaux de label :
   - 50-55 : "Univers parallèles"
   - 56-61 : "Voyageurs distants"
   - 62-67 : "Poussière d'étoiles"
   - 68-73 : "Orbites croisées"
   - 74-79 : "Résonance cosmique"
   - 80-85 : "Constellation liée"
   - 86-91 : "Fusion stellaire"
   - 92-99 : "Âmes cosmiques"

### Leaderboard

- Page SSR : top 50 dates les plus consultées
- Source : `date_stats` trié par `views` DESC
- Revalidation ISR toutes les heures
- Objectif : SEO passif + curiosité sociale

## Base de données (Supabase)

### Table `apod_cache`

```sql
create table apod_cache (
  date        date primary key,
  title       text not null,
  explanation text not null,
  url         text not null,
  hdurl       text,
  media_type  text not null,  -- 'image' | 'video'
  copyright   text,
  fetched_at  timestamptz default now()
);
```

### Table `date_stats`

```sql
create table date_stats (
  date     date primary key,
  views    integer default 0,
  shares   integer default 0
);
```

Tables V2 (profiles, saved_dates, purchases) non incluses dans ce scope.

## Performance

- SSR pour toutes les pages résultat (métadonnées OG)
- Top 1000 dates pré-rendues via `generateStaticParams` (ISR 24h)
- Next.js Image avec `priority` sur l'APOD principal, lazy loading ailleurs
- `lite-youtube-embed` pour les vidéos (pas de chargement YouTube inutile)
- Cache Supabase : < 100ms pour les dates déjà consultées

## Sécurité

- Clé NASA API jamais exposée côté client
- Validation des dates côté serveur (format, plage)
- Rate limiting via Vercel Edge Middleware (20 req/min par IP)

## i18n

- `next-intl` avec route prefix (`/fr/...`, `/en/...`)
- Fichiers de traduction dans `messages/fr.json` et `messages/en.json`
- Middleware de détection automatique de la langue (header `Accept-Language`)
- Français par défaut
- Balises `hreflang` sur chaque page pour le SEO
