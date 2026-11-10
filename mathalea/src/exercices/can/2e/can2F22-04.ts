import ImageFonctionsRefs from '../../2e/2F22-1'

export const titre =
  'Calculer une image avec la fonction racine carrée (année de transition)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/08/2026'
export const uuid = 'b3db7'
export const refs = { 'fr-fr': ['can2F22-04'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Degrange Mathieu et Stéphane Guyon
 */
export default class ImageFonctionRacineCarree extends ImageFonctionsRefs {
  constructor() {
    super()
    this.can = true
    this.nbQuestions = 1
    this.typeQuestionFixe = 'racine carrée'
    this.besoinFormulaireCaseACocher = false
    this.besoinFormulaire2CaseACocher = false
    this.besoinFormulaire3CaseACocher = false
    this.besoinFormulaire4CaseACocher = false
  }
}
