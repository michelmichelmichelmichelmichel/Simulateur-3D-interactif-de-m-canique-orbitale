import GUI from 'lil-gui'
import Experience from './Experience.js'
import { SPEEDS } from './Utils/SimulationClock.js'
import { SCALE_MODES } from './World/scale.js'

/**
 * Panneau de commandes (lil-gui), toujours visible :
 * - « Temps » : vitesse, sens, pause (barre d'espace), saut à une date ;
 * - « Échelle » : mode d'affichage des distances ;
 * - « Affichage » : noms des corps, rotation des planètes sur elles-mêmes.
 */
export default class Controls {
  constructor() {
    this.experience = new Experience()
    this.clock = this.experience.clock
    this.scale = this.experience.scale

    this.gui = new GUI({ title: 'Commandes' })
    this.setTimeFolder()
    this.setScaleFolder()
    this.setDisplayFolder()

    this.onKeyDown = (event) => {
      if (event.code !== 'Space' || event.target.tagName === 'INPUT') return
      event.preventDefault()
      this.clock.paused = !this.clock.paused
      this.gui.controllersRecursive().forEach((controller) => controller.updateDisplay())
    }
    window.addEventListener('keydown', this.onKeyDown)
  }

  setTimeFolder() {
    const folder = this.gui.addFolder('Temps')
    const params = {
      speed: '1 jour / s',
      goTo: this.clock.date.toISOString().slice(0, 10),
      today: () => this.clock.setDate(new Date()),
    }

    folder
      .add(params, 'speed', Object.keys(SPEEDS))
      .name('Vitesse')
      .onChange((label) => (this.clock.daysPerSecond = SPEEDS[label]))
    folder.add(this.clock, 'reversed').name('Remonter le temps')
    folder.add(this.clock, 'paused').name('Pause (espace)')
    folder
      .add(params, 'goTo')
      .name('Aller au (AAAA-MM-JJ)')
      .onFinishChange((value) => {
        const date = new Date(`${value}T00:00:00Z`)
        if (!Number.isNaN(date.getTime())) this.clock.setDate(date)
      })
    folder.add(params, 'today').name("Revenir à aujourd'hui")
  }

  setScaleFolder() {
    const folder = this.gui.addFolder('Échelle des distances')
    // lil-gui accepte un objet { libellé affiché: valeur }
    const modes = Object.fromEntries(Object.entries(SCALE_MODES).map(([key, mode]) => [mode.label, key]))

    folder
      .add(this.scale, 'mode', modes)
      .name('Mode')
      .onChange((mode) => {
        this.exponentController.show(mode === 'power')
        this.applyScale()
      })

    // L'exposant n'apparaît qu'en mode « Personnalisée »
    this.exponentController = folder
      .add(this.scale, 'exponent', 0.2, 1, 0.01)
      .name('Exposant p')
      .onChange(() => this.applyScale())
      .show(this.scale.mode === 'power')
  }

  setDisplayFolder() {
    const folder = this.gui.addFolder('Affichage')
    const display = this.experience.display
    folder
      .add(display, 'labels')
      .name('Noms des planètes')
      // Le monde n'existe qu'une fois les textures chargées
      .onChange((visible) => this.experience.world.labels?.setVisible(visible))
    // Lue à chaque image par Planet.update
    folder.add(display, 'rotation').name('Rotation des planètes')
  }

  applyScale() {
    const { world, selection, camera } = this.experience
    world.applyScale()
    // Si une planète est suivie, la caméra suit son déplacement ; sinon on recadre tout le système
    if (!selection.selected) camera.frame(world.systemRadius)
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    this.gui.destroy()
  }
}
