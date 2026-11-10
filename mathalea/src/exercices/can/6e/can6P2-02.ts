import AppliquerUnPourcentage from './can6P2-01'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const titre = 'Appliquer un pourcentage (bis)'
export const dateDePublication = '13/11/2021'
/**
 * @author Jean-claude Lhote
 * Complété par des corrections de Gilles Mora
 */
export const uuid = 'a2bbc'

export const refs = {
  'fr-fr': ['can6P2-02', '6N3Q-flash2', '2I11-flash1'],
  'fr-ch': ['NR'],
}
export default class AppliquerUnPourcentageBis extends AppliquerUnPourcentage {
  constructor() {
    super()
    this.bis = true
  }
}
