import ConvertirDuree from '../ch/10e/10GM3B-6'
export const titre = 'Convertir des durées en heures décimales ou en minutes'
export const dateDePublication = '24/09/2025'
export const dateDeModifImportante = '19/03/2026'
export const interactifReady = true

export const uuid = '8013e'
export const refs = {
  'fr-fr': ['6M4C-4', '6AutoT1-6'],
  'fr-ch': ['NR'],
}
/**
 * Exercice de conversion de durées
 * @author Éric Elter
 */
export default class ConvertirDuree6eV2 extends ConvertirDuree {
  // ConvertirDuree6eV1 et ConvertirDuree6eV2 diffère à cause du nb différent de questions dans l'interactif
  constructor() {
    super()
    this.version = '6M4C-4'
    this.besoinFormulaireNumerique = [
      'Type de conversions',
      3,
      '1 : De heures décimales vers heures-minutes-secondes\n2 : De minutes décimales vers heures-minutes-secondes\n3 : Mélange',
    ]

    this.sup2 = true
    this.sup3 = false
  }
}
