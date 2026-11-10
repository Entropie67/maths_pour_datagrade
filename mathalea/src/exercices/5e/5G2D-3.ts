import ExerciceConversions from '../6e/_Exercice_conversions'
export const titre =
  'Utiliser les préfixes multiplicateurs et diviseurs (milli à kilo)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Rémi Angot

 * Relecture : Novembre 2021 par EE
 */
export const uuid = 'ae35d'

export const refs = {
  'fr-fr': ['5G2D-3'],
  'fr-2016': ['6N24', '5N15-1'],
  'fr-ch': ['9R1GM4A-3', '9R2GM4A-3', '9R3GM4A-3', 'PRQMG04A-3', '9R1GM4B-1', '9R2GM4B-1', '9R3GM4B-1', 'PRQMG04B-4'],
}
export default class Exercice6N24 extends ExerciceConversions {
  constructor() {
    super()
    this.sup = 3
    this.correction_avec_des_fractions = true
    this.spacingCorr = 2
  }
}
