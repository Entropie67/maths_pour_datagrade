import ExoRose from './_Roses'
export const titre = 'Résoudre une Rose additive'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'
export const dateDePublication = '12/08/2022'
export const dateDeModifImportante = '26/09/2023'
/**
 * Travailler les tables d'addition autrement
 * @author Jean-claude Lhote
 */

export const uuid = '322a0'

export const refs = {
  'fr-fr': ['6N0A-2'],
  'fr-2016': ['6C10-0'],
  'fr-ch': ['9R1NO6H-1', '9R2NO6H-1', '9R3NO6H-1'], // Primaire anciennement :['9NO3-10'],
}
export default class RoseAdditive extends ExoRose {
  // c'est l'ExoRose zéro contenu dans _Roses.js
  constructor() {
    super()
    this.operation = 'addition'
    this.typeDonnees = 'entiers'
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
