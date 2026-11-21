import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import Experience from './Experience.js'

export default class Camera {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.canvas = this.experience.canvas

    this.instance = new THREE.PerspectiveCamera(45, this.sizes.width / this.sizes.height, 0.1, 5000)
    this.instance.position.set(0, 70, 120)
    this.scene.add(this.instance)

    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true
    // En échelle réelle, Neptune est à ~360 unités : il faut pouvoir reculer assez
    this.controls.maxDistance = 1200
  }

  /**
   * Recadre la vue sur tout le système (rayon en unités de scène),
   * en gardant l'angle de vue actuel.
   */
  frame(radius) {
    const offset = this.instance.position.clone().sub(this.controls.target)
    offset.setLength(radius * 2.1)
    this.controls.target.set(0, 0, 0)
    this.instance.position.copy(offset)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }

  destroy() {
    this.controls.dispose()
  }
}
