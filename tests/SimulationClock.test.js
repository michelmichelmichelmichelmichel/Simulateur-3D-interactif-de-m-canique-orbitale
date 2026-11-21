import { describe, it, expect } from 'vitest'
import SimulationClock, { SPEEDS } from '../src/Experience/Utils/SimulationClock.js'
import { J2000 } from '../src/physics/kepler.js'

const start = new Date('2000-01-01T12:00:00Z')

describe('SimulationClock', () => {
  it('démarre à la date donnée', () => {
    expect(new SimulationClock(start).jd).toBe(J2000)
  })

  it('avance de « vitesse × durée »', () => {
    const clock = new SimulationClock(start)
    clock.daysPerSecond = SPEEDS['1 semaine / s']
    clock.update(50) // 0,05 s
    expect(clock.jd).toBeCloseTo(J2000 + 0.35, 10)
  })

  it('recule quand le temps est inversé', () => {
    const clock = new SimulationClock(start)
    clock.reversed = true
    clock.update(100)
    expect(clock.jd).toBeCloseTo(J2000 - 0.1, 10)
  })

  it("n'avance pas en pause", () => {
    const clock = new SimulationClock(start)
    clock.paused = true
    clock.update(100)
    expect(clock.jd).toBe(J2000)
  })

  it('limite les grands sauts (onglet en arrière-plan)', () => {
    const clock = new SimulationClock(start)
    clock.update(10_000)
    expect(clock.jd).toBeCloseTo(J2000 + 0.1, 10)
  })

  it("signale les dates hors de l'intervalle de validité 1800-2050", () => {
    const clock = new SimulationClock(start)
    expect(clock.outOfValidRange).toBe(false)
    clock.setDate(new Date('2100-01-01T00:00:00Z'))
    expect(clock.outOfValidRange).toBe(true)
    clock.setDate(new Date('1750-01-01T00:00:00Z'))
    expect(clock.outOfValidRange).toBe(true)
  })
})
