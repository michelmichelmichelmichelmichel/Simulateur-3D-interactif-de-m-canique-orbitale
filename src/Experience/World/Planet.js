import * as THREE from 'three'
import Experience from '../Experience.js'
import { heliocentricPosition, orbitPath } from '../../physics/kepler.js'
import { poleFrame, rotationAngles, rotationPeriodHours, axialTilt } from '../../physics/rotation.js'
import { eclipticToScene, eclipticMatrixToScene, planetRadius } from './scale.js'

const ORBIT_SEGMENTS = 256
// Les éléments orbitaux évoluent lentement : on ne recalcule l'ellipse qu'une fois par an simulé
const ORBIT_REFRESH_DAYS = 365

const poleMatrix = new THREE.Matrix4()

export default class Planet {
  /**
   * @param {string} key nom de la planète (clé des éléments orbitaux)
   * @param {number} index rang depuis le Soleil (0 = Mercure), utilisé par certains modes d'échelle
   */
  constructor(key, index, data, jd) {
    this.experience = new Experience()
    this.scene = this.experience.scene
    this.scale = this.experience.scale
    this.display = this.experience.display
    this.key = key
    this.index = index
    this.label = data.label
    this.radius = planetRadius(data.radiusKm)

    // Groupe positionné sur l'orbite et orienté selon l'axe de la planète (axe y local = pôle nord) ;
    // la sphère y tourne sur elle-même, les anneaux restent dans le plan équatorial.
    this.group = new THREE.Group()
    this.position = this.group.position
    this.scene.add(this.group)

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
    this.group.add(this.mesh)

    if (data.rings) this.createRings(data)

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

  /**
   * Anneaux dans le plan équatorial. La texture est une bande : sa largeur va du bord
   * intérieur au bord extérieur, on remplace donc les coordonnées UV planes de
   * RingGeometry par u = (r − rintérieur) / (rextérieur − rintérieur).
   */
  createRings({ rings }) {
    const kmToScene = this.radius / rings.equatorialRadiusKm
    const inner = rings.innerKm * kmToScene
    const outer = rings.outerKm * kmToScene
    const geometry = new THREE.RingGeometry(inner, outer, 128, 1)
    const position = geometry.attributes.position
    const uv = geometry.attributes.uv
    for (let i = 0; i < position.count; i++) {
      const r = Math.hypot(position.getX(i), position.getY(i))
      uv.setXY(i, (r - inner) / (outer - inner), 0.5)
    }

    const texture = this.experience.resources.items[rings.texture]
    this.rings = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        ...(texture ? { map: texture } : { color: '#c8b89a', opacity: 0.6 }),
        transparent: true,
        side: THREE.DoubleSide,
        roughness: 1,
        metalness: 0,
        depthWrite: false,
      }),
    )
    // RingGeometry est dans le plan xy : on la couche dans le plan xz (équateur, perpendiculaire au pôle y)
    this.rings.rotation.x = -Math.PI / 2
    this.group.add(this.rings)
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
    this.jd = jd
    this.heliocentric = heliocentricPosition(this.key, jd)
    const p = this.toScene(this.heliocentric)
    this.group.position.set(p.x, p.y, p.z)

    // Orientation de l'axe (modèle UAI), puis rotation propre d'un angle W autour de cet axe
    const [a, b, c, d, e, f, g, h, i] = eclipticMatrixToScene(poleFrame(this.key, jd))
    poleMatrix.set(a, b, c, 0, d, e, f, 0, g, h, i, 0, 0, 0, 0, 1)
    this.group.quaternion.setFromRotationMatrix(poleMatrix)
    // Option « Rotation des planètes » désactivée : la planète garde sa dernière orientation
    // (l'axe reste incliné). Réactivée, elle reprend l'angle réel de la date simulée.
    if (this.display.rotation) this.mesh.rotation.y = rotationAngles(this.key, jd).W % (2 * Math.PI)

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
    const hours = rotationPeriodHours(this.key)
    const period =
      Math.abs(hours) > 48
        ? `${(Math.abs(hours) / 24).toFixed(1)} jours`
        : `${Math.floor(Math.abs(hours))} h ${String(Math.round((Math.abs(hours) % 1) * 60)).padStart(2, '0')} min`
    return [
      `Distance au Soleil : ${Math.hypot(x, y, z).toFixed(3)} AU`,
      `Rotation sidérale : ${period}${hours < 0 ? ' (rétrograde)' : ''}`,
      `Inclinaison de l'axe : ${axialTilt(this.key, this.jd).toFixed(1)}°`,
    ]
  }

  destroy() {
    this.mesh.geometry.dispose()
    this.mesh.material.dispose()
    if (this.rings) {
      this.rings.geometry.dispose()
      this.rings.material.dispose()
    }
    this.orbit.geometry.dispose()
    this.orbit.material.dispose()
  }
}
