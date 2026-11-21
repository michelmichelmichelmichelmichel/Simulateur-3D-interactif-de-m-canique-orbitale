# Journal des interactions avec l'IA

Format de chaque entrée : contexte → demande → proposition de l'IA →
examen → décision → justification.

---

## Session 01 — 2026-11-21 — Cadrage du projet et mise en place du dépôt

**Auteur :** Laporte--Marsan
**Outil :** Claude Code
**Trace :** `sessions/2026-11-21_01_cadrage-et-demo.md` (lisible) et `.jsonl` (brut)

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
- **Déroulé de la décision :** l'IA a d'abord proposé un choix entre trois
  options (N-corps, hybride, képlérien). J'ai demandé quelle était la
  différence ; l'IA l'a expliquée (orbites imposées par une formule ou
  calculées pas à pas à partir des forces) et a recommandé le N-corps.
  J'ai choisi de garder le képlérien.
- **Justification (raisons du groupe, choisies parmi celles proposées par l'IA) :**
  1. *Objectif de départ* : notre idée était un visualiseur du système solaire
     **réel**, qui montre où sont les planètes à une date donnée. Le modèle
     képlérien, avec les éléments orbitaux publiés par le JPL, répond
     directement à cette question.
  2. *Maîtrise du langage* : je connais JavaScript grâce au cours Three.js
     Journey ; TypeScript et l'écriture d'intégrateurs numériques auraient
     ajouté des apprentissages supplémentaires.
- **Arguments de l'IA non retenus comme raisons :** la vérification directe
  contre JPL Horizons et le délai de 15 jours. La vérification contre JPL a
  néanmoins été mise en place par la suite (voir `docs/evaluation.md`).
- **Ce que l'on perd :** pas d'interaction gravitationnelle entre les corps, donc
  pas de « manipulation de systèmes planétaires » comme annoncé à
  l'inscription ; perturbations entre planètes négligées.
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

### Interaction significative n°3 — Choix de l'échelle : de l'option unique aux presets
- **Question posée à l'IA :** quelles autres échelles que la racine carrée ?
- **Proposition de l'IA :** un tableau comparant 5 options (racine carrée,
  réelle, logarithmique, rails réguliers, exposant réglable), avec avantages
  et inconvénients. Elle recommandait le curseur d'exposant seul.
- **Décision du groupe :** proposer **tous les modes sous forme de presets**
  sélectionnables, ce qui va plus loin que la recommandation de l'IA.
- **Justification :** l'utilisateur peut comparer les compromis entre
  lisibilité et réalisme ; utile aussi en soutenance pour montrer pourquoi
  une compression est nécessaire.
- **Mise en œuvre (IA) :** `SCALE_MODES` dans `World/scale.js` ; tous les modes
  conservent la direction des planètes vues du Soleil (vérifié par des tests
  pour chaque mode) ; le Soleil rétrécit si Mercure s'en approche trop ; la
  caméra recadre le système à chaque changement. 130 tests au total.
- **Vérifié par l'IA dans la page :** distances de Mercure et de Neptune, taille du
  Soleil et recul de la caméra pour chaque mode. Rendu visuel non vu par l'IA.

### Extensions EF9 et EF10 — Rotation, inclinaison des axes, anneaux de Saturne
**Demande :** ajouter la rotation des planètes sur elles-mêmes avec l'inclinaison
de leur axe (23,4° pour la Terre), et les anneaux de Saturne (texture Solar System Scope).

**Choix de l'IA : orienter les axes avec le modèle de l'UAI.** Incliner
chaque planète de son obliquité aurait donné le bon angle, mais pas la bonne
**direction** de l'axe dans l'espace : les saisons auraient été fausses. L'IA a
utilisé la direction du pôle (α0, δ0) et l'angle de rotation W publiés par le groupe
de travail de l'UAI (Archinal et al., rapport 2009), en fonctions pures dans
`src/physics/rotation.js`. L'inclinaison de l'axe n'est pas saisie : elle est
**calculée** (angle entre le pôle UAI et la normale à l'orbite de Standish).

**Vérification (24 tests, `tests/rotation.test.js`)** contre une source
indépendante, le NASA Fact Sheet :
- inclinaisons des 8 planètes à 0,05° près (dont Vénus 177,4° et Uranus 97,8°,
  qui tournent « à l'envers ») ; périodes de rotation à 0,1 % près ;
- Terre : Soleil au zénith du tropique du Cancer au solstice de juin 2024, du
  Capricorne en décembre, de l'équateur à l'équinoxe ; à 12 h UTC, Soleil
  au-dessus du méridien de Greenwich, à l'équation du temps près.

**Interaction significative n°4 — Choix de version des données par l'IA.**
L'IA a écarté le rapport UAI 2015, plus récent, au profit de celui de 2009 :
- pour Mars, la valeur 2015 de α0 n'est juste qu'avec ses termes périodiques
  (un terme de 0,42° sinon oublié) ;
- pour Neptune, la vitesse de rotation 2015 donne 15,97 h, contre 16,11 h dans le
  NASA Fact Sheet (deux mesures différentes de la période, publiées par des
  équipes différentes).
Les valeurs ont été écrites par l'IA de mémoire ; ce sont les tests contre le
NASA Fact Sheet qui les valident. **À vérifier par le groupe** dans la publication
d'origine avant la soutenance.

**Anneaux :** la texture est une bande allant du bord intérieur au bord extérieur.
L'IA a mesuré sa transparence pour retrouver les rayons qu'elle couvre
(69 300 à 140 900 km : le début de l'anneau B, la division de Cassini et le bord de
l'anneau A tombent aux bons endroits). Les anneaux sont rattachés au repère de
l'équateur de Saturne : ils suivent automatiquement l'inclinaison de l'axe.

**Fiche d'information :** affiche désormais la période de rotation et
l'inclinaison de l'axe.

**Non vérifié par l'IA :** le rendu visuel (le panneau navigateur ne permettait
pas de capture). Vérifié dans la page : chargement sans erreur, texture des anneaux
chargée, axe de la Terre incliné de 23,44° dans la scène, 20 appels de dessin.
