import { addDiagramBuilder } from '../../lib/customElements/DiagramBuilderElement'
import Exercice from '../Exercice'

export const titre = 'Produire un diagramme'

export const refs = {
  'fr-fr': ['P026'],
  'fr-ch': [],
}
export const uuid = 'a9f71'

let prochainIdEditeurP026 = 0

/**
 * Outil du professeur pour créer pas à pas, avec des boutons,
 * un programme de construction aux instruments (règle, compas, équerre,
 * rapporteur) et tester l'animation Instrumenpoche correspondante.
 * @author Rémi Angot
 */
export default class CreateurAnimationInstruments extends Exercice {
  private readonly editorId = `editeur-iep-p026-${prochainIdEditeurP026++}`

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.pasDeVersionLatex = true
    this.pasDeVersionAleatoire = true
  }

  nouvelleVersion() {
    const contenuGenere = addDiagramBuilder(this, 0, {
      id: this.editorId,
    })
    this.contenu = contenuGenere
    this.listeQuestions[0] = contenuGenere
  }
}
