import { describe, it, expect } from 'vitest'
import {
  SCALE_MODES,
  DEFAULT_SCALE,
  SUN_RADIUS,
  eclipticToScene,
  sceneDistance,
  sunRadius,
} from '../src/Experience/World/scale.js'

const norm = (p) => Math.hypot(p.x, p.y, p.z)
const cosAngle = (p, q) => (p.x * q.x + p.y * q.y + p.z * q.z) / (norm(p) * norm(q))

// Demi-grands axes (AU), de Mercure à Neptune
const SEMI_MAJOR_AXES = [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30.1]

const ALL_SCALES = Object.keys(SCALE_MODES).flatMap((mode) =>
  mode === 'power'
    ? [0.3, 0.5, 0.8, 1].map((exponent) => ({ mode, exponent }))
    : [{ mode, exponent: 0.5 }],
)
const scaleName = (scale) => `${scale.mode} (p = ${scale.exponent})`

describe('eclipticToScene', () => {
  it("place le Soleil à l'origine", () => {
    // toEqual distinguerait 0 et -0 ; on vérifie la distance à l'origine
    expect(norm(eclipticToScene({ x: 0, y: 0, z: 0 }))).toBe(0)
  })

  it('envoie le pôle nord de l’écliptique vers le haut de la scène (+y)', () => {
    const p = eclipticToScene({ x: 0, y: 0, z: 1 })
    expect(p.y).toBeGreaterThan(0)
    expect(p.x).toBeCloseTo(0)
    expect(p.z).toBeCloseTo(0)
  })
})

describe.each(ALL_SCALES.map((scale) => [scaleName(scale), scale]))('Mode %s', (_, scale) => {
  it('conserve la direction de chaque planète vue du Soleil', () => {
    const a = { x: 0.3, y: -0.2, z: 0.05 }
    const b = { x: -4.1, y: 2.7, z: -0.1 }
    const sceneA = eclipticToScene(a, 0, scale)
    const sceneB = eclipticToScene(b, 4, scale)
    expect(cosAngle(sceneA, sceneB)).toBeCloseTo(cosAngle(a, b), 12)
  })

  it("conserve l'ordre des planètes", () => {
    const distances = SEMI_MAJOR_AXES.map((r, i) => sceneDistance(r, i, scale))
    for (let i = 1; i < distances.length; i++) expect(distances[i]).toBeGreaterThan(distances[i - 1])
  })

  it('garde le Soleil plus petit que l’orbite de Mercure', () => {
    expect(sunRadius(scale)).toBeLessThan(sceneDistance(0.3075, 0, scale))
    expect(sunRadius(scale)).toBeLessThanOrEqual(SUN_RADIUS)
  })
})

describe('Propriétés propres à chaque mode', () => {
  it('« Lisible » est le mode par défaut', () => {
    expect(DEFAULT_SCALE.mode).toBe('sqrt')
  })

  it('« Réelle » conserve les rapports de distances', () => {
    const scale = { mode: 'real' }
    expect(sceneDistance(30, 7, scale) / sceneDistance(1, 2, scale)).toBeCloseTo(30)
  })

  it('« Personnalisée » retrouve « Lisible » pour p = 0,5 et « Réelle » pour p = 1', () => {
    for (const r of SEMI_MAJOR_AXES) {
      expect(sceneDistance(r, 0, { mode: 'power', exponent: 0.5 })).toBeCloseTo(sceneDistance(r, 0, { mode: 'sqrt' }))
      expect(sceneDistance(r, 0, { mode: 'power', exponent: 1 })).toBeCloseTo(sceneDistance(r, 0, { mode: 'real' }))
    }
  })

  it('« Rails réguliers » donne des orbites circulaires régulièrement espacées', () => {
    const scale = { mode: 'rails' }
    expect(sceneDistance(0.3, 0, scale)).toBe(sceneDistance(0.47, 0, scale))
    const gaps = [1, 2, 3].map((i) => sceneDistance(1, i, scale) - sceneDistance(1, i - 1, scale))
    expect(new Set(gaps).size).toBe(1)
  })
})
