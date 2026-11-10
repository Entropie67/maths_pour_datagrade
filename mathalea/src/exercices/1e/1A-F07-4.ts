import EquationDroite from '../can/2e/can2G30-03'
export const titre = "Lire graphiquement l'équation réduite d’une droite"
export const dateDePublication = '22/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2G30-03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '9f86b'

export const refs = {
  'fr-fr': ['1A-F07-4'],
  'fr-ch': ['11LCQCMFA2C-4', '11LSQCMFA2C-4', '1mQCM-11'],
}
export default class Auto1AF6 extends EquationDroite {
  constructor() {
    super()
    this.optionsDeComparaison = { egaliteExpression: true }
    this.versionQcm = false
  }

  // En saisie libre interactive, la question est portée par le texte placé avant le champ
  nouvelleVersion() {
    super.nouvelleVersion()
    if (this.interactif && !this.versionQcm) {
      this.question = (this.question ?? '').replace(
        "Donner l'équation réduite de la droite.<br>",
        '',
      )
      this.optionsChampTexte = {
        texteAvant: "<br>L'équation réduite de la droite représentée est : ",
      }
    }
  }
}
