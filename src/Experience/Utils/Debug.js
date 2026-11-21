import GUI from 'lil-gui'

/** Panneau lil-gui, actif uniquement avec #debug dans l'URL. */
export default class Debug {
  constructor() {
    this.active = window.location.hash === '#debug'
    if (this.active) {
      this.ui = new GUI({ title: 'Debug' })
      // À gauche, pour ne pas recouvrir le panneau « Temps » placé à droite
      this.ui.domElement.style.right = 'auto'
      this.ui.domElement.style.left = '16px'
    }
  }

  destroy() {
    this.ui?.destroy()
  }
}
