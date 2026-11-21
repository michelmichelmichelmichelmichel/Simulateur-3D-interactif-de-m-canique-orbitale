import { describe, it, expect } from 'vitest'
import { eclipticToScene, compressDistance } from '../src/Experience/World/scale.js'

const norm = (p) => Math.hypot(p.x, p.y, p.z)

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

  it('conserve la direction : les angles entre deux planètes sont inchangés', () => {
    const a = { x: 0.3, y: -0.2, z: 0.05 }
    const b = { x: -4.1, y: 2.7, z: -0.1 }
    const cosAngle = (p, q) => (p.x * q.x + p.y * q.y + p.z * q.z) / (norm(p) * norm(q))
    expect(cosAngle(eclipticToScene(a), eclipticToScene(b))).toBeCloseTo(cosAngle(a, b), 12)
  })

  it("conserve l'ordre des distances", () => {
    const distances = [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30.1].map(compressDistance)
    expect([...distances].sort((p, q) => p - q)).toEqual(distances)
  })

  it('applique la compression radiale', () => {
    expect(norm(eclipticToScene({ x: 4, y: 0, z: 0 }))).toBeCloseTo(compressDistance(4))
  })
})
