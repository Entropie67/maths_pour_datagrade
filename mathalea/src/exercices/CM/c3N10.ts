import EcrirePetitsNombresEntiers from '../6e/6N0A-6'
export const titre = 'Écrire un nombre en chiffres ou en lettres'
export const amcReady = true
export const amcType = 'AMCOpen'
export const interactifReady = true

export const dateDeModifImportante = '14/11/2023'
export const uuid = '8561e'
export const refs = {
  'fr-fr': [],
  'fr-2016': ['c3N10'],
  'fr-ch': ['NR'],
}
export default class ÉcrireEntiersCycle3 extends EcrirePetitsNombresEntiers {
  constructor() {
    super()
    this.sup2 = 0
    this.sup = 2
  }
}
