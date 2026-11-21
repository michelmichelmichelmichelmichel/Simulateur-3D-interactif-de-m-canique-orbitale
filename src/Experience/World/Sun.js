import * as THREE from 'three'
import Experience from '../Experience.js'
import { SUN_RADIUS } from './scale.js'

export default class Sun {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.label = 'Soleil'
    this.radius = SUN_RADIUS

    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS, 64, 32),
      new THREE.MeshBasicMaterial({ color: '#ffcc33' }),
    )
    this.mesh.userData.body = this
    this.scene.add(this.mesh)

    // Lumière émise depuis le Soleil, sans atténuation avec la distance (decay = 0)
    // pour que les planètes lointaines restent visibles.
    this.light = new THREE.PointLight('#ffffff', 3, 0, 0)
    this.scene.add(this.light)
  }

  getInfo() {
    return ['Centre du repère héliocentrique']
  }

  destroy() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.light.dispose()
  }
}
