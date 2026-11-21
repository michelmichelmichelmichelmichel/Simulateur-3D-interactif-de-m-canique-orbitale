# Évaluation

## 1. Exactitude des positions (modèle képlérien vs JPL Horizons)

**Protocole**
- Référence : positions héliocentriques renvoyées par l'API JPL Horizons
  (barycentres des systèmes planétaires, écliptique J2000, unités AU),
  récupérées par `scripts/fetch-horizons.mjs` dans `tests/fixtures/horizons.json`.
- 10 dates réparties entre 1850 et 2049, pour les 8 planètes.
- Mesures : écart angulaire entre les directions vues du Soleil, et écart
  relatif sur la distance au Soleil.
- Reproduire : `node scripts/accuracy-report.mjs`.
- Tests automatiques (`tests/kepler.test.js`) : seuil de 0,1° pour les
  planètes telluriques, 0,5° pour les géantes, 1 % sur la distance.

**Résultats (21/11/2026)**

| Planète | Écart angulaire max (′) | Écart angulaire moyen (′) | Écart de distance max (%) |
|---|---|---|---|
| Mercure | 0.27 | 0.11 | 0.002 |
| Vénus | 0.36 | 0.11 | 0.004 |
| Terre (barycentre Terre-Lune) | 0.30 | 0.15 | 0.003 |
| Mars | 0.98 | 0.26 | 0.009 |
| Jupiter | 5.15 | 1.90 | 0.070 |
| Saturne | 10.25 | 5.11 | 0.187 |
| Uranus | 1.73 | 0.78 | 0.043 |
| Neptune | 0.83 | 0.45 | 0.021 |

(′ = minute d'arc = 1/60 de degré)

**Analyse**
- Moins d'une minute d'arc pour les planètes telluriques : c'est cohérent avec
  la précision annoncée par Standish pour la table 1800-2050.
- Les plus grands écarts concernent Jupiter et Saturne : le modèle képlérien
  ignore leurs perturbations mutuelles (grande inégalité Jupiter-Saturne).
- Pour l'affichage, ces écarts sont invisibles : 10′ représentent environ
  0,1 unité de scène sur l'orbite de Saturne.

**Limites**
- 10 dates seulement ; l'échantillon pourra être élargi.
- La conversion de date ignore l'écart UTC/TDB (environ 1 minute).
- Hors de 1800-2050, la précision n'est pas garantie (un avertissement s'affiche).

## 2. Performance

À mesurer : FPS, draw calls (`renderer.info`), temps de chargement, sur deux machines.
