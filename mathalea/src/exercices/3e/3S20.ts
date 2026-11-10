import { context } from '../../modules/context'
import FonctionsProbabilite2 from '../2e/2P10-5'
export const interactifReady = true
export const titre =
  'Calculer des probabilités dans une expérience aléatoire à deux épreuves'
export const dateDeModifImportante = '04/10/2026'

/**
 * Calculs de probabilités sur une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export const uuid = 'd944a'
export const refs = {
  'fr-fr': [], // Déréférencé car hors programme. Voir 3Z1DNB-19 pour un exercice sur ce thème.
  'fr-ch': ['11LSNO4C-10'],
}

export default class FonctionsProbabilite extends FonctionsProbabilite2 {
  constructor() {
    super()
    this.comment =
      'La correction de cet exercice ne correspond pas au programme de 3e actuel.'
    this.besoinFormulaireTexte = [
      'Type de questions : ',
      'Nombres séparés par des tirets :\n1 : Yaourts\n2 : Cartes\n3 : Chaussettes\n4 : Dé\n5 : Mélange',
    ]
    this.nbQuestions = 2

    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.sup = 1
  }
}
