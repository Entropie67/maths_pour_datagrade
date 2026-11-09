import ConvertirDuree from '../ch/10e/10GM3B-6Old'
export const titre = 'Convertir des durées en heures décimales ou en minutes'
export const dateDePublication = '24/09/2025'
export const dateDeModifImportante = '19/03/2026'
export const interactifReady = true

export const uuid = '185f7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Exercice de conversion de durées
 * @author Éric Elter
 */
export default class ConvertirDuree6eV1 extends ConvertirDuree {
  // ConvertirDuree6eV1 et ConvertirDuree6eV2 diffère à cause du nb différent de questions dans l'interactif
  constructor() {
    super()
    this.version = '6M4C-3'
    this.besoinFormulaireNumerique = [
      'Type de conversions',
      4,
      '1 : De heures-minutes vers heures décimales\n2 : De heures-minutes vers minutes\n3 : De minutes vers heures décimales\n4 : Mélange',
    ]
    this.sup2 = true
    this.sup3 = false
  }
}
