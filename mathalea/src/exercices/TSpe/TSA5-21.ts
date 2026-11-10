import InequationsLog from '../TT/TTE-3'

export const titre = 'Résoudre des inéquations du type $a^x \\leqslant b$'
export const dateDePublication = '4/5/2024'
export const dateDeModifImportante = '18/07/2024'
export const uuid = 'e7929'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TSA5-21', 'TCA4-21'],
  'fr-ch': [],
}

/**
 *
 * @author clone de TSpeAN1-0 de Claire Rousset réalisé par Jean-claude Lhote

 */
export default class InequationsLn extends InequationsLog {
  constructor() {
    super()
    this.consigne =
      "Résoudre dans $\\R$ les inéquations suivantes. Les solutions devront être écrites sous la forme d'un intervalle."
    this.nbQuestions = 2
    this.spacingCorr = 3
    this.sup = '4'
    this.sup2 = 2
  }
}
