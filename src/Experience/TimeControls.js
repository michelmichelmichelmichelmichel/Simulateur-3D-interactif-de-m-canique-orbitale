import GUI from 'lil-gui'
import Experience from './Experience.js'
import { SPEEDS } from './Utils/SimulationClock.js'

/** Panneau de contrôle du temps simulé (lil-gui), toujours visible. Barre d'espace = pause. */
export default class TimeControls {
  constructor() {
    this.experience = new Experience()
    this.clock = this.experience.clock

    this.gui = new GUI({ title: 'Temps' })
    this.params = {
      speed: '1 jour / s',
      goTo: this.clock.date.toISOString().slice(0, 10),
      today: () => this.clock.setDate(new Date()),
    }

    this.gui
      .add(this.params, 'speed', Object.keys(SPEEDS))
      .name('Vitesse')
      .onChange((label) => (this.clock.daysPerSecond = SPEEDS[label]))
    this.gui.add(this.clock, 'reversed').name('Remonter le temps')
    this.gui.add(this.clock, 'paused').name('Pause (espace)')
    this.gui
      .add(this.params, 'goTo')
      .name('Aller au (AAAA-MM-JJ)')
      .onFinishChange((value) => {
        const date = new Date(`${value}T00:00:00Z`)
        if (!Number.isNaN(date.getTime())) this.clock.setDate(date)
      })
    this.gui.add(this.params, 'today').name("Revenir à aujourd'hui")

    this.onKeyDown = (event) => {
      if (event.code !== 'Space' || event.target.tagName === 'INPUT') return
      event.preventDefault()
      this.clock.paused = !this.clock.paused
      this.gui.controllersRecursive().forEach((controller) => controller.updateDisplay())
    }
    window.addEventListener('keydown', this.onKeyDown)
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown)
    this.gui.destroy()
  }
}
