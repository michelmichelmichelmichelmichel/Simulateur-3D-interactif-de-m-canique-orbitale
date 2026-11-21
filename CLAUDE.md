# Contexte pour l'assistant IA (Claude Code)

> Ce fichier est versionné volontairement : son historique documente l'évolution
> de notre stratégie d'interaction avec l'IA (exigence du projet).

## Projet
Visualiseur 3D du système solaire dans le navigateur (Three.js), réalisé pour le
projet intégré « IA avancée pour le développement logiciel » (M2, 2026–2027).
Le projet est évalué sur la **démarche de génie logiciel et la collaboration
humain–IA**, pas seulement sur le rendu.

## Choix techniques
- JavaScript (ES modules), **pas de TypeScript**, Vite, Three.js « vanilla », lil-gui.
- Mouvement des planètes : **orbites képlériennes** calculées à partir des éléments
  orbitaux du JPL (pas de simulation N-corps — décision du groupe, voir ai-traces/JOURNAL.md).
- Architecture `Experience` (singleton) de la leçon « Code structuring for bigger projects »
  de Three.js Journey : `Experience`, `Utils/` (Sizes, Time, Debug, EventEmitter),
  `Camera`, `Renderer`, `World/`.
- Le calcul orbital doit rester **indépendant de Three.js** (fonctions pures dans
  `src/physics/`) pour être testable avec Vitest.

## Règles de travail
- Expliquer les choix et les formules : l'équipe doit pouvoir tout défendre en soutenance.
- Citer les sources des données et formules (JPL, ouvrages, leçons du cours).
- Toute formule orbitale doit être accompagnée de tests comparés à des valeurs de référence.
- Petits commits, messages en français, une fonctionnalité par commit.
- Ne jamais pousser sur GitHub sans accord explicite.

## Commandes
- `npm run dev` : serveur de développement
- `npm test` : tests Vitest
- `npm run lint` : ESLint
- `npm run build` : build de production
