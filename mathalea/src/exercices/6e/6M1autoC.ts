import ExerciceConversions from './_Exercice_conversions'
export const titre =
  'Effectuer des conversions avec tous les préfixes de milli à kilo, voire tera'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '28/07/2025' // Rajout du paramètre this.sup3 et de la correction détaillée

/**
 * @author Rémi Angot

 * Relecture : Novembre 2021 par EE
 */

export const uuid = 'c57cf'

export const refs = {
  'fr-fr': ['6M1autoC'],
  'fr-2016': ['6N34'],
  'fr-ch': ['NR'],
}
export default class Reglages6N34 extends ExerciceConversions {
  constructor() {
    super()
    this.sup = 3
    this.sup3 = true
    this.sup4 = false
    this.correctionDetailleeDisponible = true
  }
}
