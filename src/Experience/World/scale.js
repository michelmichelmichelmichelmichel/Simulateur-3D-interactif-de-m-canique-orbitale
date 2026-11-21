/**
 * Passage des coordonnées astronomiques (AU) aux coordonnées de la scène.
 *
 * Choix de conception : à l'échelle réelle, Neptune est 77 fois plus loin que
 * Mercure et les planètes seraient invisibles. On applique donc une compression
 * radiale (racine carrée de la distance) qui :
 *  - conserve la DIRECTION de chaque planète vue du Soleil, c'est-à-dire
 *    la grandeur vérifiée contre JPL Horizons ;
 *  - conserve l'ordre des distances ;
 *  - déforme légèrement la forme des ellipses.
 * Les tailles des planètes et du Soleil ne sont pas à l'échelle non plus.
 */

export const DISTANCE_SCALE = 12
export const SUN_RADIUS = 3

/** Distance dans la scène pour une distance au Soleil en AU. */
export function compressDistance(rAU) {
  return DISTANCE_SCALE * Math.sqrt(rAU)
}

/**
 * Convertit une position écliptique (x, y, z en AU, z vers le pôle nord de l'écliptique)
 * en position de scène Three.js (axe y vers le haut).
 * Rotation de -90° autour de x : (x, y, z) → (x, z, -y), qui conserve l'orientation.
 */
export function eclipticToScene({ x, y, z }) {
  const r = Math.hypot(x, y, z)
  const k = r === 0 ? 0 : compressDistance(r) / r
  return { x: x * k, y: z * k, z: -y * k }
}

/** Rayon d'affichage d'une planète (racine carrée du rayon réel, Terre = 0,6). */
export function planetRadius(radiusKm) {
  return 0.6 * Math.sqrt(radiusKm / 6371)
}
