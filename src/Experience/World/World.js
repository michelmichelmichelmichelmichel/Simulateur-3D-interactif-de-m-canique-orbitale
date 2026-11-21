import * as THREE from 'three'
import Experience from '../Experience.js'

/**
 * Contenu de la scène.
 * Étape 0 : un simple Soleil provisoire pour vérifier que la chaîne de rendu fonctionne.
 * Les planètes et le calcul orbital arrivent avec la démo (étape 1).
 */
export default class World {
  constructor() {
    this.experience = new Experience()
    this.scene = this.experience.scene

    this.sun = new THREE.Mesh(
      new THREE.SphereGeometry(5, 64, 32),
      new THREE.MeshBasicMaterial({ color: '#ffcc33' }),
    )
    this.scene.add(this.sun)
  }

  update() {}

  destroy() {
    this.sun.geometry.dispose()
    this.sun.material.dispose()
  }
}
