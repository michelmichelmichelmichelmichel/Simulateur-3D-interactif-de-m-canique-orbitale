import * as THREE from 'three'
import Sizes from './Utils/Sizes.js'
import Time from './Utils/Time.js'
import Debug from './Utils/Debug.js'
import SimulationClock from './Utils/SimulationClock.js'
import Resources from './Utils/Resources.js'
import sources from './sources.js'
import Camera from './Camera.js'
import Renderer from './Renderer.js'
import World from './World/World.js'
import Controls from './Controls.js'
import { DEFAULT_SCALE } from './World/scale.js'
import Selection from './Selection.js'
import Hud from './Hud.js'

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
    this.clock = new SimulationClock()
    // Réglages d'échelle partagés (modifiés par le panneau « Commandes »)
    this.scale = { ...DEFAULT_SCALE }
    // Options d'affichage partagées (panneau « Affichage ») ; activées par défaut
    this.display = { labels: true, rotation: true }
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()
    this.controls = new Controls()
    this.selection = new Selection()
    this.hud = new Hud()

    this.sizes.on('resize', () => this.resize())
    this.time.on('tick', () => this.update())
  }

  resize() {
    this.camera.resize()
    this.renderer.resize()
  }

  update() {
    // Ordre important : positions → suivi de caméra → contrôles → affichage
    this.clock.update(this.time.delta)
    this.world.update()
    this.selection.update()
    this.camera.update()
    this.hud.update()
    this.renderer.update()
  }

  destroy() {
    this.time.destroy()
    this.sizes.destroy()
    this.world.destroy()
    this.camera.destroy()
    this.renderer.destroy()
    this.debug.destroy()
    this.controls.destroy()
    this.selection.destroy()
    instance = null
  }
}
