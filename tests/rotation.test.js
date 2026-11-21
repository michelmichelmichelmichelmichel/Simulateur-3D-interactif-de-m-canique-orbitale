import { describe, it, expect } from 'vitest'
import {
  axialTilt,
  rotationPeriodHours,
  bodyToEcliptic,
  northPole,
  multiply,
  transpose,
  apply,
} from '../src/physics/rotation.js'
import { heliocentricPosition, julianDate, J2000 } from '../src/physics/kepler.js'
import { PLANET_NAMES } from '../src/physics/elements.js'

/**
 * Valeurs de référence : fiches détaillées de chaque planète du NASA Planetary
 * Fact Sheet (https://nssdc.gsfc.nasa.gov/planetary/factsheet/), source
 * indépendante du modèle de l'UAI utilisé par le code.
 */
const NASA = {
  mercury: { tilt: 0.034, periodHours: 1407.6 },
  venus: { tilt: 177.36, periodHours: -5832.6 },
  earth: { tilt: 23.44, periodHours: 23.9345 },
  mars: { tilt: 25.19, periodHours: 24.6229 },
  jupiter: { tilt: 3.13, periodHours: 9.925 },
  saturn: { tilt: 26.73, periodHours: 10.656 },
  uranus: { tilt: 97.77, periodHours: -17.24 },
  neptune: { tilt: 28.32, periodHours: 16.11 },
}

const DEG = 180 / Math.PI

describe('Inclinaison de l’axe (pôle UAI + orbite de Standish)', () => {
  it.each(PLANET_NAMES)('%s : conforme au NASA Fact Sheet à 0,05° près', (planet) => {
    expect(Math.abs(axialTilt(planet, J2000) - NASA[planet].tilt)).toBeLessThan(0.05)
  })

  it('la Terre a l’inclinaison de 23,44° et un axe stable sur 1800–2050', () => {
    for (const year of [1800, 1900, 2000, 2050]) {
      const jd = julianDate(new Date(Date.UTC(year, 0, 1)))
      expect(axialTilt('earth', jd)).toBeCloseTo(23.44, 1)
    }
  })

  it('le pôle est un vecteur unitaire', () => {
    for (const planet of PLANET_NAMES) {
      const p = northPole(planet, J2000)
      expect(Math.hypot(p.x, p.y, p.z)).toBeCloseTo(1, 12)
    }
  })
})

describe('Période de rotation', () => {
  it.each(PLANET_NAMES)('%s : conforme au NASA Fact Sheet à 0,1 % près', (planet) => {
    const expected = NASA[planet].periodHours
    expect(Math.abs(rotationPeriodHours(planet) / expected - 1)).toBeLessThan(0.001)
  })

  it('Vénus et Uranus tournent dans le sens rétrograde', () => {
    expect(rotationPeriodHours('venus')).toBeLessThan(0)
    expect(rotationPeriodHours('uranus')).toBeLessThan(0)
  })
})

describe('Matrice d’orientation', () => {
  it('est une rotation (orthogonale)', () => {
    for (const planet of PLANET_NAMES) {
      const M = bodyToEcliptic(planet, J2000 + 1234.5)
      const I = multiply(M, transpose(M))
      for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++) expect(I[i][j]).toBeCloseTo(i === j ? 1 : 0, 12)
    }
  })
})

/**
 * Point subsolaire (latitude et longitude terrestres où le Soleil est au zénith) :
 * vérifie à la fois la direction de l'axe de la Terre et l'angle de rotation W.
 */
function subsolarPoint(iso) {
  const jd = julianDate(new Date(iso))
  const earth = heliocentricPosition('earth', jd)
  const sun = apply(transpose(bodyToEcliptic('earth', jd)), { x: -earth.x, y: -earth.y, z: -earth.z })
  const r = Math.hypot(sun.x, sun.y, sun.z)
  return { latitude: Math.asin(sun.z / r) * DEG, longitude: Math.atan2(sun.y, sun.x) * DEG }
}

describe('Saisons et heure solaire sur Terre', () => {
  // Dates des solstices et équinoxe 2024 : IMCCE / US Naval Observatory
  it('au solstice de juin, le Soleil est au zénith du tropique du Cancer', () => {
    expect(subsolarPoint('2024-06-20T20:51:00Z').latitude).toBeCloseTo(23.44, 1)
  })

  it('au solstice de décembre, au zénith du tropique du Capricorne', () => {
    expect(subsolarPoint('2024-12-21T09:20:00Z').latitude).toBeCloseTo(-23.44, 1)
  })

  it('à l’équinoxe de mars, au zénith de l’équateur', () => {
    expect(Math.abs(subsolarPoint('2024-03-20T03:06:00Z').latitude)).toBeLessThan(0.05)
  })

  it('à 12 h UTC, le Soleil est au-dessus du méridien de Greenwich (à l’équation du temps près)', () => {
    // Le 13 juin et le 25 décembre, l'équation du temps est presque nulle (< 1 min, soit 0,25°)
    expect(Math.abs(subsolarPoint('2024-06-13T12:00:00Z').longitude)).toBeLessThan(0.75)
    expect(Math.abs(subsolarPoint('2024-12-25T12:00:00Z').longitude)).toBeLessThan(0.75)
    // Le 3 novembre, elle vaut +16,4 min : le Soleil a déjà dépassé Greenwich de ≈ 4,1° vers l'ouest
    expect(subsolarPoint('2024-11-03T12:00:00Z').longitude).toBeCloseTo(-4.1, 0)
  })
})
