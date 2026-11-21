import * as THREE from 'three'
import Experience from './Experience.js'

// Au-delà de ce déplacement (pixels) entre l'appui et le relâchement,
// on considère que l'utilisateur fait tourner la caméra, pas qu'il clique.
const CLICK_TOLERANCE_PX = 5

/**
 * Sélection d'un corps céleste au clic (Raycaster, leçon « Raycaster and Mouse Events »)
 * et suivi par la caméra.
 */
export default class Selection {
  constructor() {
    this.experience = new Experience()
    this.canvas = this.experience.canvas
    this.sizes = this.experience.sizes
    this.camera = this.experience.camera
    this.world = this.experience.world

    this.raycaster = new THREE.Raycaster()
    this.pointer = new THREE.Vector2()
    this.selected = null
    this.previousPosition = new THREE.Vector3()

    this.onPointerDown = (event) => {
      this.downX = event.clientX
      this.downY = event.clientY
    }
    this.onPointerUp = (event) => {
      const moved = Math.hypot(event.clientX - this.downX, event.clientY - this.downY)
      if (moved <= CLICK_TOLERANCE_PX) this.select(this.pick(event))
    }
    this.onPointerMove = (event) => {
      this.canvas.style.cursor = this.pick(event) ? 'pointer' : ''
    }
    this.onKeyDown = (event) => {
      if (event.key === 'Escape') this.select(null)
    }

    this.canvas.addEventListener('pointerdown', this.onPointerDown)
    this.canvas.addEventListener('pointerup', this.onPointerUp)
    this.canvas.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('keydown', this.onKeyDown)
  }

  /** Renvoie le corps céleste sous le pointeur, ou null. */
  pick(event) {
    this.pointer.set(
      (event.clientX / this.sizes.width) * 2 - 1,
      -(event.clientY / this.sizes.height) * 2 + 1,
    )
    this.raycaster.setFromCamera(this.pointer, this.camera.instance)
    const meshes = this.world.bodies.map((body) => body.mesh)
    const [hit] = this.raycaster.intersectObjects(meshes, false)
    return hit ? hit.object.userData.body : null
  }

  select(body) {
    this.selected = body
    if (!body) return

    // On garde l'angle de vue actuel et on se rapproche à une distance adaptée à la taille du corps
    const position = body.mesh.position
    const controls = this.camera.controls
    const offset = this.camera.instance.position.clone().sub(controls.target)
    offset.setLength(Math.max(body.radius * 8, 4))
    controls.target.copy(position)
    this.camera.instance.position.copy(position).add(offset)
    this.previousPosition.copy(position)
  }

  /** À appeler après la mise à jour des positions : la caméra suit le déplacement du corps. */
  update() {
    if (!this.selected) return
    const position = this.selected.mesh.position
    const delta = position.clone().sub(this.previousPosition)
    this.camera.instance.position.add(delta)
    this.camera.controls.target.add(delta)
    this.previousPosition.copy(position)
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('keydown', this.onKeyDown)
  }
}
