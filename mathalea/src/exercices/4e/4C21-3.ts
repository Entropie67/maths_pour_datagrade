import ExoRose from '../6e/_Roses'
export const titre = 'Résoudre une Rose additive avec des fractions'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/08/2022'

/**
 * Travailler les sommes de fractions
 * @author Jean-claude Lhote
 */

export const uuid = '0576d'

export const refs = {
  'fr-fr': ['4C21-3', 'BP2AutoH12'],
  'fr-ch': ['9R3NO4J-10', '10CTNO3A-10', '10LCNO3A-10', '10LSNO3A-10', 'PRQNO12A-8'],
}
export default class RoseAdditive4F2 extends ExoRose {
  // c'est l'ExoRose zéro contenu dans _Roses.js
  constructor() {
    super()
    this.operation = 'addition'
    this.typeDonnees = 'fractions dénominateurs multiples'
    this.besoinFormulaireNumerique = [
      'Valeur maximale (entre 10 et 30) des termes',
      30,
    ]
    this.besoinFormulaire2Numerique = ['Nombre de termes entre 3 et 5', 5]
    this.besoinFormulaire3Numerique = [
      'Type de questions',
      4,
      '1 : Calculer les sommes\n2 : Calculer les termes manquants\n3 : Course aux nombres 1\n4 : Course aux nombres 2',
    ]
  }
}
