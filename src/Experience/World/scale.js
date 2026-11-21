/**
 * Passage des coordonnées astronomiques (AU) aux coordonnées de la scène.
 *
 * À l'échelle réelle, Neptune est 77 fois plus loin que Mercure : on ne peut pas
 * tout voir à la fois. Plusieurs modes d'échelle sont proposés ; tous déplacent
 * chaque planète le long de sa direction vue du Soleil, si bien que la DIRECTION
 * (la grandeur vérifiée contre JPL Horizons) est conservée dans tous les cas.
 * Seule la distance au Soleil affichée change.
 *
 * Les tailles des planètes et du Soleil ne sont jamais à l'échelle (elles seraient
 * invisibles : la Terre ferait 0,0005 unité pour une orbite de 12 unités).
 */

/** Unités de scène par AU (échelle de base commune aux modes en puissance). */
export const DISTANCE_SCALE = 12
/** Rayon d'affichage maximal du Soleil. */
export const SUN_RADIUS = 3

// Périhélie de Mercure (AU) : la planète la plus proche du Soleil
const MERCURY_PERIHELION_AU = 0.3075

/**
 * Modes d'échelle. `distance(rAU, planetIndex, exponent)` renvoie la distance au
 * Soleil dans la scène. `planetIndex` va de 0 (Mercure) à 7 (Neptune).
 */
export const SCALE_MODES = {
  sqrt: {
    label: 'Lisible (racine carrée)',
    distance: (r) => DISTANCE_SCALE * Math.sqrt(r),
  },
  real: {
    label: 'Réelle (linéaire)',
    distance: (r) => DISTANCE_SCALE * r,
  },
  log: {
    label: 'Logarithmique',
    // ln(1 + r/r0) : quasi linéaire près du Soleil, très compressé au loin
    distance: (r) => 14 * Math.log(1 + r / 0.2),
  },
  rails: {
    label: 'Rails réguliers',
    // Chaque planète sur un cercle ; les distances réelles sont ignorées
    distance: (r, planetIndex) => 8 + 7 * planetIndex,
  },
  power: {
    label: 'Personnalisée (exposant)',
    // p = 0,5 : identique à « Lisible » ; p = 1 : identique à « Réelle »
    distance: (r, planetIndex, exponent) => DISTANCE_SCALE * r ** exponent,
  },
}

export const DEFAULT_SCALE = { mode: 'sqrt', exponent: 0.5 }

/** Distance dans la scène pour une distance au Soleil en AU. */
export function sceneDistance(rAU, planetIndex = 0, scale = DEFAULT_SCALE) {
  return SCALE_MODES[scale.mode].distance(rAU, planetIndex, scale.exponent)
}

/**
 * Convertit une position écliptique (x, y, z en AU, z vers le pôle nord de l'écliptique)
 * en position de scène Three.js (axe y vers le haut).
 * Rotation de -90° autour de x : (x, y, z) → (x, z, -y), qui conserve l'orientation.
 */
export function eclipticToScene({ x, y, z }, planetIndex = 0, scale = DEFAULT_SCALE) {
  const r = Math.hypot(x, y, z)
  const k = r === 0 ? 0 : sceneDistance(r, planetIndex, scale) / r
  return { x: x * k, y: z * k, z: -y * k }
}

/** Rayon d'affichage du Soleil : réduit si besoin pour ne pas englober Mercure. */
export function sunRadius(scale = DEFAULT_SCALE) {
  return Math.min(SUN_RADIUS, 0.6 * sceneDistance(MERCURY_PERIHELION_AU, 0, scale))
}

/** Rayon d'affichage d'une planète (racine carrée du rayon réel, Terre = 0,6). */
export function planetRadius(radiusKm) {
  return 0.6 * Math.sqrt(radiusKm / 6371)
}
