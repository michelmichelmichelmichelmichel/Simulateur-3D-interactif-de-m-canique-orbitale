/**
 * Calcul des positions héliocentriques des planètes par le modèle képlérien.
 *
 * Fonctions pures, indépendantes de Three.js, pour pouvoir être testées avec Vitest.
 * Algorithme : E. M. Standish, « Keplerian Elements for Approximate Positions
 * of the Major Planets », section « Computing the position » (JPL).
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 */
import { ELEMENTS } from './elements.js'

const DEG = Math.PI / 180
const TAU = 2 * Math.PI

/** Date julienne de l'époque J2000.0 (1er janvier 2000, 12 h TT). */
export const J2000 = 2451545.0

/**
 * Convertit une date JavaScript en date julienne.
 * Approximation : on ignore l'écart entre UTC et le temps dynamique (≈ 1 minute),
 * ce qui déplace Mercure, la planète la plus rapide, d'environ 0,003°.
 */
export function julianDate(date) {
  return date.getTime() / 86400000 + 2440587.5
}

/** Convertit une date julienne en date JavaScript. */
export function dateFromJulian(jd) {
  return new Date((jd - 2440587.5) * 86400000)
}

/** Nombre de siècles juliens écoulés depuis J2000. */
export function centuriesSinceJ2000(jd) {
  return (jd - J2000) / 36525
}

/** Ramène un angle (radians) dans l'intervalle [-π, π[. */
export function normalizeAngle(angle) {
  return angle - TAU * Math.floor((angle + Math.PI) / TAU)
}

/**
 * Résout l'équation de Kepler M = E − e·sin(E) par la méthode de Newton.
 * @param {number} M anomalie moyenne (radians)
 * @param {number} e excentricité (0 ≤ e < 1)
 * @returns {number} anomalie excentrique E (radians)
 */
export function solveKepler(M, e, tolerance = 1e-12, maxIterations = 50) {
  // Départ conseillé par Standish : E0 = M + e·sin(M)
  let E = M + e * Math.sin(M)
  for (let i = 0; i < maxIterations; i++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E))
    E -= delta
    if (Math.abs(delta) < tolerance) break
  }
  return E
}

/**
 * Éléments orbitaux d'une planète à une date donnée.
 * Les angles sont renvoyés en radians.
 */
export function elementsAt(planet, jd) {
  const source = ELEMENTS[planet]
  if (!source) throw new Error(`Planète inconnue : ${planet}`)

  const T = centuriesSinceJ2000(jd)
  const value = ([v0, rate]) => v0 + rate * T

  const a = value(source.a)
  const e = value(source.e)
  const I = value(source.I) * DEG
  const L = value(source.L) * DEG
  const varpi = value(source.varpi) * DEG
  const Omega = value(source.Omega) * DEG

  return {
    a,
    e,
    I,
    Omega,
    omega: varpi - Omega, // argument du périhélie ω = ϖ − Ω
    M: normalizeAngle(L - varpi), // anomalie moyenne M = L − ϖ
  }
}

/**
 * Passe des coordonnées dans le plan de l'orbite (x', y') au repère écliptique J2000.
 * Composition des rotations Rz(Ω)·Rx(I)·Rz(ω).
 */
export function orbitalPlaneToEcliptic(xp, yp, { omega, Omega, I }) {
  const cw = Math.cos(omega)
  const sw = Math.sin(omega)
  const cO = Math.cos(Omega)
  const sO = Math.sin(Omega)
  const cI = Math.cos(I)
  const sI = Math.sin(I)

  return {
    x: (cw * cO - sw * sO * cI) * xp + (-sw * cO - cw * sO * cI) * yp,
    y: (cw * sO + sw * cO * cI) * xp + (-sw * sO + cw * cO * cI) * yp,
    z: sw * sI * xp + cw * sI * yp,
  }
}

/** Position dans le plan de l'orbite pour une anomalie excentrique E. */
function positionInOrbitalPlane(a, e, E) {
  return {
    xp: a * (Math.cos(E) - e),
    yp: a * Math.sqrt(1 - e * e) * Math.sin(E),
  }
}

/**
 * Position héliocentrique d'une planète (AU, repère écliptique J2000).
 * @param {string} planet nom de la planète (clé de ELEMENTS)
 * @param {number} jd date julienne
 * @returns {{x: number, y: number, z: number}}
 */
export function heliocentricPosition(planet, jd) {
  const elements = elementsAt(planet, jd)
  const E = solveKepler(elements.M, elements.e)
  const { xp, yp } = positionInOrbitalPlane(elements.a, elements.e, E)
  return orbitalPlaneToEcliptic(xp, yp, elements)
}

/**
 * Points de l'ellipse de l'orbite à une date donnée (pour le tracé).
 * @returns {Array<{x: number, y: number, z: number}>}
 */
export function orbitPath(planet, jd, segments = 256) {
  const elements = elementsAt(planet, jd)
  const points = []
  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * TAU
    const { xp, yp } = positionInOrbitalPlane(elements.a, elements.e, E)
    points.push(orbitalPlaneToEcliptic(xp, yp, elements))
  }
  return points
}
