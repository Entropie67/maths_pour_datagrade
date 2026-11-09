import ExoRose from '../6e/_Roses'
export const titre = 'Résoudre une Rose additive avec des relatifs'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/08/2022'
export const dateDeModifImportante = '26/09/2023'

/**
 * Travailler les tables de multiplication autrement
 * @author Jean-claude Lhote
 */

export const uuid = '3e4d9'

export const refs = {
  'fr-fr': ['5N2G-6'],
  'fr-2016': ['5R20-7'],
  'fr-ch': ['9R2NO3C-8', '9R3NO3C-8', '10CTNO2A-8', '10LCNO2D-3', '10LSNO2D-3', '11CTNO1C-3'],
}
export default class RoseAdditive5R extends ExoRose {
  // c'est l'ExoRose zéro contenu dans _Roses.js
  constructor() {
    super()
    this.operation = 'addition'
    this.typeDonnees = 'entiers relatifs'
    this.besoinFormulaireNumerique = [
      'Valeur maximale (entre 10 et 30) des termes',
      30,
    ]
    this.besoinFormulaire2Numerique = ['Nombre de termes (entre 3 et 9)', 9]
    this.besoinFormulaire3Numerique = [
      'Type de questions',
      4,
      '1 : Calculer les sommes\n2 : Calculer les termes manquants\n3 : Course aux nombres 1\n4 : Course aux nombres 2',
    ]
  }
}
