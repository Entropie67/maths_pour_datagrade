// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7433c continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import PerimetreOuAireDeFiguresComposees from '../5e/5G2E-5'

export const titre = 'Calculer périmètre de figures composées'
export const dateDePublication = '27/07/2025'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/**
 * Calculer périmètre de figures composées
 * @author Éric Elter (comme clone de 6M11-2 de Rémi Angot)
 */

export const uuid = '7433c'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': ['NR'],
}
export default class PerimetreDeFiguresComposeesOld extends PerimetreOuAireDeFiguresComposees {
  constructor() {
    super()
    this.besoinFormulaire4Numerique = false
    this.sup4 = 1
    this.sup = '4-5-6'
  }
}
