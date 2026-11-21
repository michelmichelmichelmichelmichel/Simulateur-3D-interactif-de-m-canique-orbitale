import * as THREE from 'three'
import Experience from '../Experience.js'

/** Fond étoilé : particules réparties sur une coquille sphérique lointaine. */
export default class Stars {
  constructor(count = 5000) {
    this.experience = new Experience()
    this.scene = this.experience.scene

    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Direction uniforme sur la sphère (inversion de la loi de cos θ)
      const theta = 2 * Math.PI * Math.random()
      const phi = Math.acos(2 * Math.random() - 1)
      // Au-delà de la caméra la plus reculée (échelle réelle) pour rester en arrière-plan
      const r = 1800 + Math.random() * 600
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    this.points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, color: '#ffffff' }),
    )
    this.scene.add(this.points)
  }

  destroy() {
    this.points.geometry.dispose()
    this.points.material.dispose()
  }
}
