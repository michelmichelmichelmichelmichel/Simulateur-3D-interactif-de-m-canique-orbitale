import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'

/**
 * Charge toutes les ressources déclarées dans sources.js ; émet 'ready' quand tout est chargé.
 * Les ressources sont ensuite accessibles par leur nom : resources.items.earthTexture
 */
export default class Resources extends EventEmitter {
  constructor(sources) {
    super()
    this.sources = sources
    this.items = {}
    this.loaded = 0
    this.loaders = { texture: new THREE.TextureLoader() }

    // Émission différée : laisse aux autres classes le temps de s'abonner à 'ready'
    queueMicrotask(() => this.startLoading())
  }

  startLoading() {
    if (this.sources.length === 0) this.trigger('ready')
    for (const source of this.sources) {
      this.loaders[source.type].load(
        source.path,
        (file) => this.sourceLoaded(source, file),
        undefined,
        () => {
          // Une texture manquante ne doit pas bloquer l'application : le matériau garde sa couleur
          console.warn(`Ressource introuvable : ${source.path}`)
          this.sourceLoaded(source, null)
        },
      )
    }
  }

  sourceLoaded(source, file) {
    if (file && source.type === 'texture') file.colorSpace = THREE.SRGBColorSpace
    this.items[source.name] = file
    this.loaded++
    this.trigger('progress', this.loaded / this.sources.length)
    if (this.loaded === this.sources.length) this.trigger('ready')
  }
}
