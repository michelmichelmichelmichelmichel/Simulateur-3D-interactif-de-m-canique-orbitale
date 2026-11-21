import * as THREE from 'three'
import Experience from '../Experience.js'
import { SUN_RADIUS, sunRadius } from './scale.js'

export default class Sun {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.label = 'Soleil'

    const texture = this.experience.resources.items.sunTexture
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS, 64, 32),
      // MeshBasicMaterial : le Soleil émet sa propre lumière, il n'est pas éclairé
      new THREE.MeshBasicMaterial(texture ? { map: texture } : { color: '#ffcc33' }),
    )
    this.mesh.userData.body = this
    this.scene.add(this.mesh)
    this.position = this.mesh.position

    // Lumière émise depuis le Soleil, sans atténuation avec la distance (decay = 0)
    // pour que les planètes lointaines restent visibles.
    this.light = new THREE.PointLight('#ffffff', 3, 0, 0)
    this.scene.add(this.light)

    this.applyScale()
  }

  /** Réduit le Soleil si le mode d'échelle rapproche Mercure. */
  applyScale() {
    this.radius = sunRadius(this.experience.scale)
    this.mesh.scale.setScalar(this.radius / SUN_RADIUS)
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
