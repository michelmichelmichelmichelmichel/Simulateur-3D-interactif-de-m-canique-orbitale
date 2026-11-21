# Exigences et critères d'acceptation

> **Date de rédaction : 21/11/2026, après la démo de faisabilité.**
> Les exigences déjà réalisées par la démo (marquées « Fait ») ont donc été
> formalisées **a posteriori**. Les critères de performance et les extensions
> sont fixés **avant** toute mesure ou développement.

## 1. Objectif et périmètre

Visualiseur 3D du système solaire, dans le navigateur, qui affiche la position
**réelle** des 8 planètes à une date choisie, calculée par le modèle képlérien
à partir des éléments orbitaux du JPL, et vérifiée contre les éphémérides JPL Horizons.

**Hors périmètre :** simulation N-corps (interactions gravitationnelles),
satellites naturels (Lune comprise), planètes naines, astéroïdes, comètes,
dates hors de 1800–2050 (affichées, mais sans garantie de précision).

## 2. Exigences fonctionnelles

| Id | Exigence | Priorité | Critère d'acceptation | Vérification | État |
|---|---|---|---|---|---|
| EF1 | Afficher le Soleil et les 8 planètes à leur position à la date simulée | Indispensable | Les 8 planètes sont visibles et passent par leur orbite tracée | Test automatique + contrôle visuel | Fait |
| EF2 | Tracer l'orbite de chaque planète | Indispensable | La planète se trouve sur l'orbite (écart < 0,01 AU) | `tests/kepler.test.js` | Fait |
| EF3 | Contrôler le temps : vitesse, pause, sens, saut à une date, retour à aujourd'hui | Indispensable | Après *t* secondes à la vitesse *v*, la date a avancé de *v·t* jours | `tests/SimulationClock.test.js` | Fait |
| EF4 | Sélectionner un corps au clic et le suivre avec la caméra | Indispensable | La caméra reste à distance constante du corps suivi ; Échap libère la caméra | Contrôle dans le navigateur | Fait |
| EF5 | Afficher une fiche du corps sélectionné (nom, distance au Soleil) | Indispensable | La distance affichée égale la norme de la position calculée | Contrôle dans le navigateur | Fait |
| EF6 | Choisir l'échelle des distances parmi plusieurs modes | Indispensable | 5 modes disponibles ; chacun conserve la direction des planètes | `tests/scale.test.js` | Fait |
| EF7 | Planètes texturées | Indispensable | 9 textures chargées ; couleur unie si une texture manque | Contrôle dans le navigateur | Fait |
| EF8 | Avertir quand la date sort de 1800–2050 | Indispensable | Message affiché hors de l'intervalle | `tests/SimulationClock.test.js` | Fait |
| EF9 | Rotation des planètes sur elles-mêmes et inclinaison de leur axe | Extension | Périodes (à 0,1 %) et inclinaisons (à 0,05°) conformes au NASA Fact Sheet ; position du Soleil au zénith correcte aux solstices et équinoxe | `tests/rotation.test.js` | Fait |
| EF10 | Anneaux de Saturne | Extension | Anneaux dans le plan équatorial de Saturne | Construction (enfants du repère équatorial) + contrôle visuel | Fait (contrôle visuel à confirmer) |
| EF11 | Terre jour/nuit avec atmosphère | Extension | La face éclairée est tournée vers le Soleil | Contrôle visuel | À faire |
| EF12 | Noms des planètes affichés dans la scène | Extension | Chaque planète a une étiquette lisible | Contrôle visuel | À faire |

## 3. Exigences non fonctionnelles

| Id | Exigence | Critère d'acceptation | Méthode de mesure | État |
|---|---|---|---|---|
| ENF1 | Exactitude des positions (planètes telluriques) | Écart angulaire < 0,1° avec JPL Horizons | 10 dates de 1850 à 2049, `npm test` | Atteint (max 0,98′ ≈ 0,016°) |
| ENF2 | Exactitude des positions (planètes géantes) | Écart angulaire < 0,5° avec JPL Horizons | Idem | Atteint (max 10,25′ ≈ 0,17°) |
| ENF3 | Exactitude des distances au Soleil | Écart relatif < 1 % | Idem | Atteint (max 0,19 %) |
| ENF4 | Fluidité | ≥ 55 images/s en médiane pendant 30 s, sur les deux machines du groupe | `stats.js` ou `renderer.info`, mode « Lisible » puis « Réelle » | À mesurer |
| ENF5 | Coût de rendu | ≤ 30 appels de dessin par image | `renderer.info.render.calls` | Atteint (20 appels avec les anneaux) |
| ENF6 | Temps de chargement | Scène affichée en < 3 s en local | Onglet Réseau des outils de développement | À mesurer |
| ENF7 | Qualité du code | 0 erreur ESLint ; tous les tests passent | `npm run lint`, `npm test` | Atteint |
| ENF8 | Testabilité | Calcul orbital indépendant de Three.js ; couverture de `src/physics/` ≥ 90 % | `vitest --coverage` | Indépendance : atteint ; couverture : à mesurer |
| ENF9 | Compatibilité | Fonctionne sur les dernières versions de Chrome, Firefox et Edge | Contrôle manuel | À vérifier |
| ENF10 | Traçabilité des sources | Données, formules et textures citées | README, commentaires du code | Atteint |

**Origine des seuils d'exactitude :** ils ont été proposés par l'IA en écrivant
les tests. Ils valent environ le double de la précision annoncée par Standish
pour la table 1800–2050. Nous les avons repris tels quels.

## 4. Limites connues

- Le modèle képlérien néglige les perturbations entre planètes ; l'écart est
  le plus grand pour Jupiter et Saturne.
- Les distances affichées ne sont pas à l'échelle, sauf en mode « Réelle ».
  Les tailles des planètes ne le sont jamais.
- Orientation des planètes : seule la texture de la Terre a un méridien origine
  repéré (Greenwich au centre) ; pour les autres, la face visible à une date
  donnée n'est pas garantie. Aux vitesses élevées (1 mois/s, 1 an/s), la rotation
  est trop rapide pour l'affichage et paraît saccadée (effet stroboscopique).
- Les anneaux de Saturne ne projettent pas d'ombre et n'en reçoivent pas.
- La conversion des dates ignore l'écart entre UTC et le temps dynamique
  (environ une minute).
