import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import {
  J2000,
  julianDate,
  dateFromJulian,
  normalizeAngle,
  solveKepler,
  elementsAt,
  heliocentricPosition,
  orbitPath,
} from '../src/physics/kepler.js'
import { PLANET_NAMES } from '../src/physics/elements.js'

const horizons = JSON.parse(readFileSync(new URL('./fixtures/horizons.json', import.meta.url), 'utf8'))

const norm = (p) => Math.hypot(p.x, p.y, p.z)

/** Angle (degrés) entre deux directions vues depuis le Soleil. */
function angularSeparationDeg(p, q) {
  const cos = (p.x * q.x + p.y * q.y + p.z * q.z) / (norm(p) * norm(q))
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI
}

describe('Dates juliennes', () => {
  it('J2000.0 correspond au 1er janvier 2000 à 12 h', () => {
    expect(julianDate(new Date('2000-01-01T12:00:00Z'))).toBe(J2000)
  })

  it('la conversion est réversible', () => {
    const date = new Date('2026-11-21T08:30:00Z')
    expect(dateFromJulian(julianDate(date)).getTime()).toBeCloseTo(date.getTime(), -1)
  })
})

describe('normalizeAngle', () => {
  it('ramène les angles dans [-π, π[', () => {
    expect(normalizeAngle(3 * Math.PI)).toBeCloseTo(-Math.PI)
    expect(normalizeAngle(-3.5 * Math.PI)).toBeCloseTo(0.5 * Math.PI)
    expect(normalizeAngle(0.25)).toBeCloseTo(0.25)
  })
})

describe('solveKepler', () => {
  it('donne E = M pour une orbite circulaire', () => {
    expect(solveKepler(1.234, 0)).toBeCloseTo(1.234, 12)
  })

  it.each([0.0167, 0.2056, 0.5, 0.9])('vérifie M = E − e·sin(E) pour e = %f', (e) => {
    for (let M = -Math.PI; M < Math.PI; M += 0.1) {
      const E = solveKepler(M, e)
      expect(E - e * Math.sin(E)).toBeCloseTo(M, 10)
    }
  })
})

/**
 * Précision attendue selon Standish (table 1) : de l'ordre de la minute d'arc pour
 * les planètes telluriques, jusqu'à une dizaine de minutes d'arc pour Saturne.
 * Seuils retenus : 0,1° (telluriques) et 0,5° (géantes), soit environ le double
 * des erreurs annoncées, et 1 % sur la distance au Soleil.
 */
const MAX_ANGLE_DEG = {
  mercury: 0.1,
  venus: 0.1,
  earth: 0.1,
  mars: 0.1,
  jupiter: 0.5,
  saturn: 0.5,
  uranus: 0.5,
  neptune: 0.5,
}

describe('Comparaison avec JPL Horizons', () => {
  it('couvre les 8 planètes', () => {
    expect(Object.keys(horizons.positions).sort()).toEqual([...PLANET_NAMES].sort())
  })

  describe.each(PLANET_NAMES)('%s', (planet) => {
    it.each(horizons.positions[planet].map((ref, i) => [horizons.dates[i], ref]))(
      'position au %s',
      (_, ref) => {
        const computed = heliocentricPosition(planet, ref.jd)
        expect(angularSeparationDeg(computed, ref)).toBeLessThan(MAX_ANGLE_DEG[planet])
        expect(Math.abs(norm(computed) - norm(ref)) / norm(ref)).toBeLessThan(0.01)
      },
    )
  })
})

describe('orbitPath', () => {
  it('produit une courbe fermée dont la distance reste entre périhélie et aphélie', () => {
    const points = orbitPath('mercury', J2000, 128)
    expect(points).toHaveLength(129)
    expect(points[0].x).toBeCloseTo(points[128].x, 10)
    // Périhélie a(1 − e) et aphélie a(1 + e), calculés à partir des éléments
    const { a, e } = elementsAt('mercury', J2000)
    const epsilon = 1e-12
    for (const p of points) {
      expect(norm(p)).toBeGreaterThanOrEqual(a * (1 - e) - epsilon)
      expect(norm(p)).toBeLessThanOrEqual(a * (1 + e) + epsilon)
    }
  })

  it('contient la position de la planète', () => {
    const position = heliocentricPosition('mars', J2000)
    const distances = orbitPath('mars', J2000, 2048).map((p) =>
      Math.hypot(p.x - position.x, p.y - position.y, p.z - position.z),
    )
    expect(Math.min(...distances)).toBeLessThan(0.01)
  })
})
