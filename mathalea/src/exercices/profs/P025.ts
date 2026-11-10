import {
  ElementIepEditeur,
  ensureElementIepEditeurRegistered,
} from '../../lib/customElements/ElementIepEditeur'
import Exercice from '../Exercice'

export const titre =
  'Créer une animation de construction aux instruments (Instrumenpoche)'

export const refs = {
  'fr-fr': ['P025'],
  'fr-ch': [],
}
export const uuid = 'a9f31'

let prochainIdEditeurP025 = 0

/**
 * Outil du professeur pour créer pas à pas, avec des boutons,
 * un programme de construction aux instruments (règle, compas, équerre,
 * rapporteur) et tester l'animation Instrumenpoche correspondante.
 * @author Rémi Angot
 */
export default class CreateurAnimationInstruments extends Exercice {
  private readonly editorId = `editeur-iep-p025-${prochainIdEditeurP025++}`

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.pasDeVersionLatex = true
    this.pasDeVersionAleatoire = true
  }

  nouvelleVersion() {
    ensureElementIepEditeurRegistered()
    const contenuGenere = ElementIepEditeur.create({
      id: this.editorId,
      loadSaveButtons: true,
      allowFullscreen: true,
    })
    this.contenu = contenuGenere
    this.listeQuestions[0] = contenuGenere
  }
}
