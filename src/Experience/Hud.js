import Experience from './Experience.js'

const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
  timeZone: 'UTC',
})

/** Affichage HTML par-dessus la scène : date simulée et fiche du corps sélectionné. */
export default class Hud {
  constructor() {
    this.experience = new Experience()
    this.clock = this.experience.clock
    this.dateElement = document.querySelector('.hud-date')
    this.warningElement = document.querySelector('.hud-warning')
    this.infoElement = document.querySelector('.info')
  }

  /** N'écrit dans le DOM que si le texte change (évite des mises en page inutiles). */
  setText(element, text) {
    if (element.textContent !== text) element.textContent = text
  }

  update() {
    this.setText(this.dateElement, `${dateFormat.format(this.clock.date)} UTC`)
    this.setText(
      this.warningElement,
      this.clock.outOfValidRange
        ? 'Hors de la période 1800–2050 : les positions sont de moins en moins précises.'
        : '',
    )

    const body = this.experience.selection?.selected
    this.infoElement.classList.toggle('hidden', !body)
    if (body) {
      const lines = [body.label, ...body.getInfo(), 'Échap ou clic dans le vide pour libérer la caméra']
      const html = lines.map((line, i) => (i === 0 ? `<strong>${line}</strong>` : `<p>${line}</p>`)).join('')
      if (this.infoElement.innerHTML !== html) this.infoElement.innerHTML = html
    }
  }
}
