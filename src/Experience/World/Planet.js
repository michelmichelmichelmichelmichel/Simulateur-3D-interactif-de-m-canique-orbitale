import * as THREE from 'three'
import Experience from '../Experience.js'
import { heliocentricPosition, orbitPath } from '../../physics/kepler.js'
import { eclipticToScene, planetRadius } from './scale.js'

const ORBIT_SEGMENTS = 256
// Les éléments orbitaux évoluent lentement : on ne recalcule l'ellipse qu'une fois par an simulé
const ORBIT_REFRESH_DAYS = 365

export default class Planet {
  /**
   * @param {string} key nom de la planète (clé des éléments orbitaux)
   * @param {number} index rang depuis le Soleil (0 = Mercure), utilisé par certains modes d'échelle
   */
  constructor(key, index, data, jd) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.scale = this.experience.scale
    this.key = key
    this.index = index
    this.label = data.label
    this.radius = planetRadius(data.radiusKm)

    const texture = this.experience.resources.items[data.texture]
    this.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 48, 24),
      new THREE.MeshStandardMaterial({
        // Avec une texture, la couleur doit rester blanche pour ne pas la teinter
        ...(texture ? { map: texture } : { color: data.color }),
        roughness: 1,
        metalness: 0,
      }),
    )
    this.mesh.userData.body = this
    this.scene.add(this.mesh)

    const orbitGeometry = new THREE.BufferGeometry()
    orbitGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array((ORBIT_SEGMENTS + 1) * 3), 3),
    )
    this.orbit = new THREE.Line(
      orbitGeometry,
      new THREE.LineBasicMaterial({ color: data.color, transparent: true, opacity: 0.35 }),
    )
    this.scene.add(this.orbit)

    this.updateOrbit(jd)
    this.update(jd)
  }

  toScene(position) {
    return eclipticToScene(position, this.index, this.scale)
  }

  updateOrbit(jd) {
    const attribute = this.orbit.geometry.attributes.position
    orbitPath(this.key, jd, ORBIT_SEGMENTS).forEach((point, i) => {
      const p = this.toScene(point)
      attribute.setXYZ(i, p.x, p.y, p.z)
    })
    attribute.needsUpdate = true
    this.orbit.geometry.computeBoundingSphere()
    this.orbitJd = jd
  }

  update(jd) {
    this.heliocentric = heliocentricPosition(this.key, jd)
    const p = this.toScene(this.heliocentric)
    this.mesh.position.set(p.x, p.y, p.z)
    if (Math.abs(jd - this.orbitJd) > ORBIT_REFRESH_DAYS) this.updateOrbit(jd)
  }

  /** À appeler quand le mode d'échelle change. */
  applyScale(jd) {
    this.updateOrbit(jd)
    this.update(jd)
  }

  /** Lignes affichées dans le panneau d'information. */
  getInfo() {
    const { x, y, z } = this.heliocentric
    return [`Distance au Soleil : ${Math.hypot(x, y, z).toFixed(3)} AU`]
  }

  destroy() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    this.orbit.geometry.dispose()
    this.orbit.material.dispose()
  }
}
