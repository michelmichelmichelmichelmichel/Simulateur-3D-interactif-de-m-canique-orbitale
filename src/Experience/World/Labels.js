import * as THREE from 'three'
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js'
import Experience from '../Experience.js'

/**
 * Noms des corps célestes affichés dans la scène (EF12).
 *
 * Éléments HTML positionnés par CSS2DRenderer (exemple officiel Three.js
 * « css2d_label ») : le texte reste net et lisible quelle que soit la distance,
 * contrairement à une texture plaquée dans la scène. La leçon « Mixing HTML and
 * WebGL » de Three.js Journey fait le même calcul à la main.
 *
 * Un clic sur un nom sélectionne le corps, comme un clic sur la sphère.
 */
export default class Labels {
  constructor(bodies) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.camera = this.experience.camera
    this.screenUp = new THREE.Vector3()

    this.items = bodies.map((body) => {
      const element = document.createElement('div')
      element.className = 'label'
      element.textContent = body.label
      element.addEventListener('click', () => this.experience.selection.select(body))

      const object = new CSS2DObject(element)
      // Ancrage en bas au centre : le nom est posé juste au-dessus du corps
      object.center.set(0.5, 1)
      this.scene.add(object)
      return { body, object }
    })
    this.setVisible(this.experience.display.labels)
    this.update()
  }

  setVisible(visible) {
    for (const { object } of this.items) object.visible = visible
  }

  update() {
    // Direction « haut de l'écran » dans la scène : le nom reste au-dessus du corps
    // quel que soit l'angle de vue (même vu de dessus)
    this.screenUp.set(0, 1, 0).applyQuaternion(this.camera.instance.quaternion)
    for (const { body, object } of this.items) {
      // body.radius suit le mode d'échelle (le Soleil rétrécit)
      object.position.copy(body.position).addScaledVector(this.screenUp, body.radius * 1.15)
    }
  }

  destroy() {
    for (const { object } of this.items) {
      this.scene.remove(object)
      object.element.remove()
    }
  }
}
