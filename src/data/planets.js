/**
 * Données d'affichage des planètes.
 * Rayons moyens : NASA Planetary Fact Sheet
 * https://nssdc.gsfc.nasa.gov/planetary/factsheet/
 * `color` sert à tracer l'orbite (et de couleur de secours si la texture manque) ;
 * `texture` est le nom de la ressource déclarée dans Experience/sources.js.
 */
export const PLANET_DATA = {
  mercury: { label: 'Mercure', radiusKm: 2439.7, color: '#a8a8a8', texture: 'mercuryTexture' },
  venus: { label: 'Vénus', radiusKm: 6051.8, color: '#e8cda2', texture: 'venusTexture' },
  earth: { label: 'Terre', radiusKm: 6371.0, color: '#3a7bd5', texture: 'earthTexture' },
  mars: { label: 'Mars', radiusKm: 3389.5, color: '#c1440e', texture: 'marsTexture' },
  jupiter: { label: 'Jupiter', radiusKm: 69911, color: '#d8ca9d', texture: 'jupiterTexture' },
  saturn: {
    label: 'Saturne',
    radiusKm: 58232,
    color: '#ead6b8',
    texture: 'saturnTexture',
    rings: {
      texture: 'saturnRingTexture',
      // Rayon équatorial (NASA Fact Sheet) : les anneaux sont exprimés par rapport à lui
      equatorialRadiusKm: 60268,
      // Rayons couverts par la texture, déduits de sa transparence : le début de
      // l'anneau B (92 000 km), la division de Cassini (117 580 km) et le bord de
      // l'anneau A (136 775 km) tombent à 32 %, 67 % et 94 % de sa largeur.
      innerKm: 69300,
      outerKm: 140900,
    },
  },
  uranus: { label: 'Uranus', radiusKm: 25362, color: '#a6e1e8', texture: 'uranusTexture' },
  neptune: { label: 'Neptune', radiusKm: 24622, color: '#4b70dd', texture: 'neptuneTexture' },
}
