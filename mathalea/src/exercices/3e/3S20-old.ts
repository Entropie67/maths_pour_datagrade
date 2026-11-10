// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 04f53 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { context } from '../../modules/context'
import FonctionsProbabilite2 from '../2e/2P10-5-old'
export const interactifReady = true
export const titre =
  'Calculer des probabilités dans une expérience aléatoire à deux épreuves'
export const dateDeModifImportante = '20/06/2024'

/**
 * Calculs de probabilités sur une expérience aléatoire à deux épreuves
 * @author Jean-claude Lhote
 */
export const uuid = '04f53'
export const refs = {
  'fr-fr': [], // Déréférencé car hors programme. Voir 3Z1DNB-19 pour un exercice sur ce thème.
  'fr-ch': ['NR'],
}

export default class FonctionsProbabiliteOld extends FonctionsProbabilite2 {
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
