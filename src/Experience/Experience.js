import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Debug from './Utils/Debug.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'

let instance = null

/**
 * Point d'entrée unique (singleton), selon la structure de la leçon
 * « Code structuring for bigger projects » de Three.js Journey.
 * Toute classe peut récupérer l'instance via `new Experience()`.
 */
export default class Experience {
  constructor(canvas) {
    if (instance) return instance
    instance = this

    // Accès depuis la console du navigateur, pratique pour déboguer
    window.experience = this

    this.canvas = canvas
    this.debug = new Debug()
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()

    this.sizes.on('resize', () => this.resize())
    this.time.on('tick', () => this.update())
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy() {
    this.time.destroy()
    this.sizes.destroy()
    this.world.destroy()
    this.camera.destroy()
    this.renderer.destroy()
    this.debug.destroy()
    instance = null
  }
}
