# Journal des interactions avec l'IA

Format de chaque entrée : contexte → demande → proposition de l'IA →
examen → décision → justification.

---

## Session 01 — 2026-11-21 — Cadrage du projet et mise en place du dépôt

**Auteur :** Laporte--Marsan
**Outil :** Claude Code
**Trace :** `sessions/2026-11-21_01_cadrage.md`

### Objectif
Comprendre les consignes, définir le sujet et le périmètre, initialiser le dépôt.

### Contexte fourni à l'IA
L'énoncé complet du projet, l'idée d'un visualiseur du système solaire en
Three.js, et le fait que je suis le cours Three.js Journey (arrêté à la leçon
« Code structuring for bigger projects »).

### Déroulé
1. L'IA a souligné que le projet est évalué sur la démarche (génie logiciel,
   collaboration avec l'IA), et pas seulement sur le rendu. Elle a proposé de
   centrer le sujet sur l'**exactitude physique vérifiable** (comparaison avec
   JPL Horizons), un périmètre minimal et des extensions, et un plan d'évaluation.
2. Elle a produit une marche à suivre en 6 étapes (du 21 novembre au 6 décembre).
3. Pendant la mise en place du dépôt, l'IA a lu le README existant et a relevé
   une **incohérence** : l'inscription annonçait une simulation N-corps en
   TypeScript (intégrateurs Euler et Verlet, tests de conservation de l'énergie),
   alors que le plan préparé reposait sur des orbites képlériennes en JavaScript.

### Interaction significative n°1 — Recommandation de l'IA écartée
- **Proposition de l'IA :** suivre l'inscription (N-corps). Arguments : c'est
  ce qui a été annoncé à l'enseignant, et la conservation de l'énergie se mesure
  facilement.
- **Décision du groupe :** garder le modèle **képlérien** en JavaScript.
- **Justification :** _à compléter par le groupe_ (par exemple : maîtrise de
  JavaScript grâce au cours, périmètre compatible avec 15 jours, exactitude
  vérifiable directement contre JPL Horizons).
- **Conséquence :** signaler le changement à l'enseignant ; le README garde
  le texte d'inscription d'origine et une note sur l'évolution du sujet.

### Résultat
Structure du projet créée : Vite, Three.js, lil-gui, Vitest, ESLint,
architecture `Experience`, premier test, `CLAUDE.md`, README, dossier des traces.
