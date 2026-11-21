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

### Suite de la session — Démo de faisabilité
**Demande :** réaliser la démo prévue à l'étape 1 (calcul képlérien testé contre
JPL Horizons, 8 planètes, contrôle du temps, clic et suivi d'une planète).

**Ce que l'IA a produit**
- `src/physics/` : éléments orbitaux de Standish (JPL) et calcul des positions
  (équation de Kepler résolue par la méthode de Newton).
- Un script qui interroge l'API JPL Horizons et enregistre les positions de
  référence ; 105 tests Vitest.
- La scène : Soleil, planètes (couleurs provisoires), orbites, étoiles,
  panneau « Temps », date, sélection au clic avec suivi de la caméra.

**Interaction significative n°2 — Erreurs de l'IA détectées par les tests**
- Dans un test, l'IA avait écrit à la main l'aphélie de Mercure arrondi
  (0,4667 AU) au lieu de le calculer ; la valeur exacte est 0,466700788 AU,
  et le test échouait. Correction : calculer a(1 ± e) à partir des éléments.
- Un autre test comparait `{z: -0}` et `{z: 0}` ; JavaScript les distingue
  avec `toEqual`. Correction : vérifier la distance à l'origine.
- Enseignement : le code de calcul était juste, mais les tests écrits par
  l'IA contenaient des erreurs. Les tests doivent eux-mêmes être relus.

**Décisions de conception proposées par l'IA (à valider par le groupe)**
- Échelle des distances en racine carrée : elle conserve la direction des
  planètes vues du Soleil (la grandeur vérifiée) mais déforme un peu les
  ellipses. Les tailles des planètes ne sont pas à l'échelle.
- Utilisation de la table 1 de Standish (1800-2050) ; un avertissement
  s'affiche hors de cette période.

**Évaluation :** voir `docs/evaluation.md`. Écart maximal avec JPL Horizons :
moins de 1′ pour les planètes telluriques, 10′ pour Saturne.

**Non vérifié par l'IA :** l'aspect visuel (le panneau navigateur de Claude Code
était masqué, aucune capture n'a pu être faite) et les performances (FPS).

**Vérification humaine :** j'ai lancé `npm run dev` et contrôlé que les planètes
sont visibles et éclairées côté Soleil, que les orbites passent par les
planètes et que le clic sur Mercure est facile. Les trois points sont validés.
L'échelle des distances en racine carrée est acceptée.

### Textures
- Accord donné pour les textures Solar System Scope (CC BY 4.0).
- L'IA a téléchargé 9 textures 2k (4,2 Mo), vérifié qu'il s'agit bien d'images
  JPEG 2048 × 1024, ajouté un chargeur de ressources (`Utils/Resources.js`,
  structure de la leçon « Code structuring ») et les crédits dans le README.
- Choix de l'IA : pour Vénus, la texture de l'atmosphère (ce qu'on voit
  réellement) plutôt que celle de la surface.
- Si une texture manque, la planète garde sa couleur unie au lieu de bloquer
  l'application.
