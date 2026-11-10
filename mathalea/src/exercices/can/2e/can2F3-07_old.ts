import ImageFonctionsRefs from '../../2e/2F22-1'
export const titre =
  'Déterminer l’image d’un nombre par une fonction de référence'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '18/01/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const uuid = '1afde'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class CANImageFonctionsRefs extends ImageFonctionsRefs {
  constructor() {
    super()
    this.can = true
    this.nbQuestions = 1
  }
}
