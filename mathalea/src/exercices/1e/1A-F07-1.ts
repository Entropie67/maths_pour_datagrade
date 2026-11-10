import CoeffDirecteurDroite from '../can/2e/can2G30-01'
export const titre =
  "Déterminer le coefficient directeur d'une droite à partir de son équation réduite"
export const dateDePublication = '25/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2G30-01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '3da78'

export const refs = {
  'fr-fr': ['1A-F07-1'],
  'fr-ch': [],
}
export default class Auto1AF6a extends CoeffDirecteurDroite {
  constructor() {
    super()
    // Réponse fraction ou nombre selon le tirage
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.versionQcm = false
  }

  // En saisie libre interactive, la question est portée par le texte placé avant le champ
  questionReprise(equation: string) {
    if (this.versionQcm || !this.interactif) {
      return super.questionReprise(equation)
    }
    this.optionsChampTexte = {
      texteAvant: '<br>Le coefficient directeur de cette droite est $m=$',
    }
    return `On considère la droite d'équation $${equation}$.`
  }
}
