import { julianDate, dateFromJulian } from '../../physics/kepler.js'

/** Vitesses proposées, en jours simulés par seconde réelle. */
export const SPEEDS = {
  'Temps réel': 1 / 86400,
  '1 heure / s': 1 / 24,
  '1 jour / s': 1,
  '1 semaine / s': 7,
  '1 mois / s': 30,
  '1 an / s': 365.25,
}

/** Intervalle de validité des éléments orbitaux de Standish (table 1). */
export const VALID_RANGE = {
  start: julianDate(new Date('1800-01-01T00:00:00Z')),
  end: julianDate(new Date('2050-12-31T23:59:59Z')),
}

// Au-delà, on considère que l'onglet était en arrière-plan : on ne saute pas dans le temps
const MAX_DELTA_MS = 100

/**
 * Temps simulé (date julienne), distinct du temps réel de rendu (Utils/Time).
 * Sans dépendance au navigateur : testable avec Vitest.
 */
export default class SimulationClock {
  constructor(date = new Date()) {
    this.jd = julianDate(date)
    this.daysPerSecond = SPEEDS['1 jour / s']
    this.paused = false
    this.reversed = false
  }

  /** Avance le temps simulé de deltaMs millisecondes réelles. */
  update(deltaMs) {
    if (this.paused) return
    const seconds = Math.min(deltaMs, MAX_DELTA_MS) / 1000
    this.jd += seconds * this.daysPerSecond * (this.reversed ? -1 : 1)
  }

  setDate(date) {
    this.jd = julianDate(date)
  }

  get date() {
    return dateFromJulian(this.jd)
  }

  /** Vrai si la date sort de l'intervalle où les éléments orbitaux sont valides. */
  get outOfValidRange() {
    return this.jd < VALID_RANGE.start || this.jd > VALID_RANGE.end
  }
}
