import * as THREE from 'three'
import Experience from '../Experience.js'
import Sun from './Sun.js'
import Planet from './Planet.js'
import Stars from './Stars.js'
import { PLANET_NAMES } from '../../physics/elements.js'
import { PLANET_DATA } from '../../data/planets.js'
import { sceneDistance } from './scale.js'

// Aphélie de Neptune (AU) : la plus grande distance à afficher
const NEPTUNE_APHELION_AU = 30.33

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
      this.planets = PLANET_NAMES.map(
        (key, index) => new Planet(key, index, PLANET_DATA[key], this.clock.jd),
      )
      this.ready = true
    })
  }

  /** Corps célestes sélectionnables par clic (vide tant que les textures chargent). */
  get bodies() {
    return this.ready ? [this.sun, ...this.planets] : []
  }

  /** Rayon (unités de scène) de l'orbite la plus éloignée, pour cadrer la caméra. */
  get systemRadius() {
    return sceneDistance(NEPTUNE_APHELION_AU, PLANET_NAMES.length - 1, this.experience.scale)
  }

  /** Recalcule positions, orbites et taille du Soleil après un changement d'échelle. */
  applyScale() {
    if (!this.ready) return
    this.sun.applyScale()
    for (const planet of this.planets) planet.applyScale(this.clock.jd)
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
