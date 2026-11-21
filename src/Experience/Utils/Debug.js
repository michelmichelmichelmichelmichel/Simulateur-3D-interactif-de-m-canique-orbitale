import GUI from 'lil-gui'

/** Panneau lil-gui, actif uniquement avec #debug dans l'URL. */
export default class Debug {
  constructor() {
    this.active = window.location.hash === '#debug'
    if (this.active) this.ui = new GUI()
  }

  destroy() {
    this.ui?.destroy()
  }
}
