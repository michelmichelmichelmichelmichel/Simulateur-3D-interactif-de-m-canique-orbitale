import * as THREE from 'three'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import Experience from './Experience.js'

export default class Renderer {
  constructor() {
    this.experience = new Experience()
    this.sizes = this.experience.sizes
    this.scene = this.experience.scene
    this.camera = this.experience.camera

    this.instance = new THREE.WebGLRenderer({ canvas: this.experience.canvas, antialias: true })
    this.instance.setClearColor('#000000')

    // Couche HTML superposée au canvas pour les noms des corps (voir World/Labels.js)
    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.domElement.className = 'labels'
    document.body.appendChild(this.labelRenderer.domElement)
    this.resize()
  }

  resize() {
    this.instance.setSize(this.sizes.width, this.sizes.height)
    this.instance.setPixelRatio(this.sizes.pixelRatio)
    this.labelRenderer.setSize(this.sizes.width, this.sizes.height)
  }

  update() {
    this.instance.render(this.scene, this.camera.instance)
    this.labelRenderer.render(this.scene, this.camera.instance)
  }

  destroy() {
    this.instance.dispose()
    this.labelRenderer.domElement.remove()
  }
}
