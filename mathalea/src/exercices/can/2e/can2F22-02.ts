import ImageFonctionsRefs from '../../2e/2F22-1'

export const titre = 'Calculer une image avec la fonction inverse'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/08/2026'
export const uuid = '52811'
export const refs = { 'fr-fr': ['can2F22-02', '2F22-flash2'], 'fr-ch': [] }

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Degrange Mathieu et Stéphane Guyon
 */
export default class ImageFonctionInverse extends ImageFonctionsRefs {
  constructor() {
    super()
    this.can = true
    this.nbQuestions = 1
    this.typeQuestionFixe = 'inverse'
    this.besoinFormulaireCaseACocher = false
    this.besoinFormulaire2CaseACocher = false
    this.besoinFormulaire3CaseACocher = false
    this.besoinFormulaire4CaseACocher = false
  }
}
