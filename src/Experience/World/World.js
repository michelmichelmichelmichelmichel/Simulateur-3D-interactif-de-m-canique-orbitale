import * as THREE from 'three'
import Experience from '../Experience.js'
import Sun from './Sun.js'
import Planet from './Planet.js'
import Stars from './Stars.js'
import { PLANET_NAMES } from '../../physics/elements.js'
import { PLANET_DATA } from '../../data/planets.js'

export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.clock = this.experience.clock
    this.resources = this.experience.resources
    this.ready = false

    // Les étoiles n'ont pas besoin de texture : elles s'affichent pendant le chargement
    this.stars = new Stars()

    this.resources.on('ready', () => {
      // Faible lumière ambiante pour deviner la face nocturne des planètes
      this.ambient = new THREE.AmbientLight('#ffffff', 0.08)
      this.scene.add(this.ambient)

      this.sun = new Sun()
      this.planets = PLANET_NAMES.map((key) => new Planet(key, PLANET_DATA[key], this.clock.jd))
      this.ready = true
    })
  }

  /** Corps célestes sélectionnables par clic (vide tant que les textures chargent). */
  get bodies() {
    return this.ready ? [this.sun, ...this.planets] : []
  }

  update() {
    if (!this.ready) return
    for (const planet of this.planets) planet.update(this.clock.jd)
  }

  destroy() {
    this.bodies.forEach((body) => body.destroy())
    this.stars.destroy()
  }
}
