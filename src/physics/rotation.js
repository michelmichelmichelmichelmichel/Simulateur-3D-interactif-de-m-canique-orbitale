/**
 * Orientation des planètes : direction de l'axe de rotation et angle de rotation.
 *
 * Fonctions pures, indépendantes de Three.js.
 *
 * Modèle de l'UAI : B. A. Archinal et al., « Report of the IAU Working Group on
 * Cartographic Coordinates and Rotational Elements: 2009 », Celestial Mechanics
 * and Dynamical Astronomy 109, p. 101–135 (2011), tableau 1.
 *  - α0, δ0 : ascension droite et déclinaison du pôle nord, dans le repère
 *    équatorial ICRF (le pôle « nord » de l'UAI est celui situé du côté nord
 *    de l'écliptique, même pour les planètes à rotation rétrograde) ;
 *  - W : angle du méridien origine, compté depuis le nœud de l'équateur de la
 *    planète sur l'équateur terrestre. W diminue pour une rotation rétrograde.
 * T : siècles juliens depuis J2000 ; d : jours depuis J2000.
 *
 * Simplification : les termes périodiques de très faible amplitude (Mercure,
 * Mars, Jupiter : moins de 0,01°) sont omis ; ceux de Neptune (≈ 0,7°) sont gardés.
 */
import { centuriesSinceJ2000, elementsAt, J2000 } from './kepler.js'

const DEG = Math.PI / 180

/** Obliquité de l'écliptique à J2000 (IAU 2006) : 23° 26′ 21,406″. */
export const ECLIPTIC_OBLIQUITY = 23.439279 * DEG

/** [valeur à J2000 (°), dérive (°/siècle)] pour α0 et δ0 ; [W0 (°), vitesse (°/jour)] pour W. */
export const ROTATION_ELEMENTS = {
  mercury: { alpha0: [281.0097, -0.0328], delta0: [61.4143, -0.0049], W: [329.5469, 6.1385025] },
  venus: { alpha0: [272.76, 0], delta0: [67.16, 0], W: [160.2, -1.4813688] },
  earth: { alpha0: [0.0, -0.641], delta0: [90.0, -0.557], W: [190.147, 360.9856235] },
  mars: { alpha0: [317.68143, -0.1061], delta0: [52.8865, -0.0609], W: [176.63, 350.89198226] },
  jupiter: { alpha0: [268.056595, -0.006499], delta0: [64.495303, 0.002413], W: [284.95, 870.536] },
  saturn: { alpha0: [40.589, -0.036], delta0: [83.537, -0.004], W: [38.9, 810.7939024] },
  uranus: { alpha0: [257.311, 0], delta0: [-15.175, 0], W: [203.81, -501.1600928] },
  neptune: {
    alpha0: [299.36, 0],
    delta0: [43.46, 0],
    W: [253.18, 536.3128492],
    // Termes périodiques de Neptune : N = 357,85° + 52,316° T
    periodic(T) {
      const N = (357.85 + 52.316 * T) * DEG
      return { alpha0: 0.7 * Math.sin(N), delta0: -0.51 * Math.cos(N), W: -0.48 * Math.sin(N) }
    },
  },
}

function source(planet) {
  const elements = ROTATION_ELEMENTS[planet]
  if (!elements) throw new Error(`Planète inconnue : ${planet}`)
  return elements
}

/** α0, δ0 et W (radians) à la date jd. */
export function rotationAngles(planet, jd) {
  const s = source(planet)
  const T = centuriesSinceJ2000(jd)
  const d = jd - J2000
  const extra = s.periodic ? s.periodic(T) : { alpha0: 0, delta0: 0, W: 0 }
  return {
    alpha0: (s.alpha0[0] + s.alpha0[1] * T + extra.alpha0) * DEG,
    delta0: (s.delta0[0] + s.delta0[1] * T + extra.delta0) * DEG,
    W: (s.W[0] + s.W[1] * d + extra.W) * DEG,
  }
}

/** Période de rotation sidérale (heures), négative si la rotation est rétrograde. */
export function rotationPeriodHours(planet) {
  return (360 / source(planet).W[1]) * 24
}

// --- Matrices 3 × 3 (tableaux de lignes) -------------------------------------

const rotX = (a) => [
  [1, 0, 0],
  [0, Math.cos(a), -Math.sin(a)],
  [0, Math.sin(a), Math.cos(a)],
]
const rotZ = (a) => [
  [Math.cos(a), -Math.sin(a), 0],
  [Math.sin(a), Math.cos(a), 0],
  [0, 0, 1],
]
export const multiply = (A, B) =>
  A.map((row) => [0, 1, 2].map((j) => row[0] * B[0][j] + row[1] * B[1][j] + row[2] * B[2][j]))
export const apply = (M, { x, y, z }) => ({
  x: M[0][0] * x + M[0][1] * y + M[0][2] * z,
  y: M[1][0] * x + M[1][1] * y + M[1][2] * z,
  z: M[2][0] * x + M[2][1] * y + M[2][2] * z,
})
export const transpose = (M) => [0, 1, 2].map((i) => [0, 1, 2].map((j) => M[j][i]))

/**
 * Matrice de passage du repère « équateur de la planète » au repère écliptique J2000,
 * SANS la rotation propre W.
 * Repère de la planète : z vers le pôle nord UAI, x vers le nœud ascendant de
 * l'équateur de la planète sur l'équateur terrestre.
 * Équatorial : Rz(α0 + 90°)·Rx(90° − δ0) ; écliptique : Rx(−ε) appliqué ensuite.
 */
export function poleFrame(planet, jd) {
  const { alpha0, delta0 } = rotationAngles(planet, jd)
  return multiply(
    rotX(-ECLIPTIC_OBLIQUITY),
    multiply(rotZ(alpha0 + Math.PI / 2), rotX(Math.PI / 2 - delta0)),
  )
}

/**
 * Matrice de passage du repère lié à la planète (x vers le méridien origine,
 * z vers le pôle nord UAI) au repère écliptique J2000 : poleFrame · Rz(W).
 */
export function bodyToEcliptic(planet, jd) {
  return multiply(poleFrame(planet, jd), rotZ(rotationAngles(planet, jd).W))
}

/** Direction du pôle nord UAI dans le repère écliptique (vecteur unitaire). */
export function northPole(planet, jd) {
  return apply(poleFrame(planet, jd), { x: 0, y: 0, z: 1 })
}

/** Normale au plan de l'orbite (sens du mouvement orbital), repère écliptique. */
export function orbitNormal(planet, jd) {
  const { I, Omega } = elementsAt(planet, jd)
  return { x: Math.sin(I) * Math.sin(Omega), y: -Math.sin(I) * Math.cos(Omega), z: Math.cos(I) }
}

/**
 * Inclinaison de l'axe (obliquité, degrés) : angle entre la normale à l'orbite et
 * le pôle « positif » (celui autour duquel la planète tourne dans le sens direct).
 * Elle dépasse 90° pour une rotation rétrograde (Vénus, Uranus).
 */
export function axialTilt(planet, jd) {
  const p = northPole(planet, jd)
  const n = orbitNormal(planet, jd)
  const sign = Math.sign(source(planet).W[1])
  const cos = sign * (p.x * n.x + p.y * n.y + p.z * n.z)
  return Math.acos(Math.min(1, Math.max(-1, cos))) / DEG
}
