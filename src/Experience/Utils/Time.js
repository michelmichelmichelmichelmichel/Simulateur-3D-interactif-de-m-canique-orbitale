import EventEmitter from './EventEmitter.js'

/**
 * Horloge de rendu (temps réel, en millisecondes) ; émet 'tick' à chaque image.
 * Le temps *simulé* (date astronomique, vitesse, pause) sera géré séparément.
 */
export default class Time extends EventEmitter {
  constructor() {
    super()
    this.start = performance.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16
    this.frameId = requestAnimationFrame(() => this.tick())
  }

  tick() {
    const now = performance.now()
    this.delta = now - this.current
    this.current = now
    this.elapsed = now - this.start
    this.trigger('tick')
    this.frameId = requestAnimationFrame(() => this.tick())
  }

  destroy() {
    cancelAnimationFrame(this.frameId)
  }
}
