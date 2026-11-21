# Simulateur 3D interactif de mécanique orbitale

[2627-M2IA-Projet] Huynh_Laporte--Marsan_Abouabdellah

Projet intégré du module **IA avancée pour le développement logiciel** (M2, 2026–2027).

## Présentation

Visualiseur 3D du système solaire accessible depuis le navigateur, développé avec
Three.js. Les positions des planètes sont calculées à partir de leurs éléments
orbitaux (modèle képlérien, données JPL) et seront comparées aux éphémérides de
référence JPL Horizons. Le projet sert de support à l'étude d'une collaboration
humain–IA (Claude Code) dans une activité de génie logiciel.

> **Évolution du sujet.** L'inscription initiale (reproduite ci-dessous) annonçait
> une simulation N-corps en TypeScript. Le groupe a choisi un modèle képlérien en
> JavaScript ; la justification figure dans `ai-traces/JOURNAL.md`.

## Lancer le projet

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev     # serveur de développement
npm test        # tests unitaires (Vitest)
npm run lint    # analyse statique (ESLint)
npm run build   # build de production dans dist/
```

Ajouter `#debug` à l'URL pour afficher le panneau de réglages (lil-gui).

## Organisation du dépôt

| Dossier / fichier | Contenu |
|---|---|
| `src/` | Code source (architecture `Experience` de Three.js Journey) |
| `tests/` | Tests Vitest |
| `docs/` | Exigences, choix d'architecture, évaluation |
| `ai-traces/` | Traces complètes des interactions avec l'IA + `JOURNAL.md` |
| `report/` | Rapport final (PDF) |
| `CLAUDE.md` | Contexte fourni à l'IA (versionné) |

## Sources et crédits

- **Éléments orbitaux** : E. M. Standish, *Keplerian Elements for Approximate
  Positions of the Major Planets*, JPL —
  https://ssd.jpl.nasa.gov/planets/approx_pos.html
- **Positions de référence** : JPL Horizons — https://ssd.jpl.nasa.gov/horizons/
- **Rayons des planètes** : NASA Planetary Fact Sheet —
  https://nssdc.gsfc.nasa.gov/planetary/factsheet/
- **Textures** (`public/textures/`) : [Solar System Scope](https://www.solarsystemscope.com/textures/),
  sous licence [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), non modifiées.
- **Architecture du code** : inspirée de la leçon « Code structuring for bigger
  projects » du cours Three.js Journey (Bruno Simon).

## Traces des interactions avec l'IA

Voir [`ai-traces/README.md`](ai-traces/README.md).

## Version de remise

À compléter : tag Git `rendu-final`.

---

## Inscription initiale (texte d'origine)

Dans le cadre du projet intégré du module IA avancée pour le développement logiciel, nous souhaitons inscrire notre groupe avec les informations suivantes :
​Titre du projet : Simulateur 3D interactif de mécanique orbitale (N-Body) en WebGL
​Description : Développement d'une application web de simulation gravitationnelle en 3D utilisant TypeScript et Three.js, permettant de visualiser et manipuler des systèmes planétaires en temps réel. Le projet mobilisera l'IA pour concevoir et comparer différents intégrateurs physiques (Euler, Verlet), optimiser le rendu WebGL (shaders, buffers circulaires) et automatiser les tests de conservation d'énergie.
