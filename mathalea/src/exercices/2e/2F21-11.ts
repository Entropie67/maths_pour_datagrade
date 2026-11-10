import FonctionsAffinesOuLineaires from '../3e/3F20-2'
export const titre = 'Faire un bilan sur les fonctions affines et/ou linéaires'

export const interactifReady = true
export const dateDePublication = '17/05/2023'
export const dateDeModifImportante = '21/05/2023'
export const uuid = 'c1961'
export const refs = {
  'fr-fr': ['2F21-11'],
  'fr-ch': ['11CTFA2D-7', '11LCFA2D-7', '11LSFA2D-7'],
}
export default class FonctionsAffinesS extends FonctionsAffinesOuLineaires {
  constructor() {
    super()
    this.lycee = true
  }
}
