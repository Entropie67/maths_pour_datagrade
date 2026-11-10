import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Claire Mathieu'
export const dateDePublication = '17/07/2026'
export const uuid = '6ae18'
export const refs = {
  'fr-fr': ['Portraits-074'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait074 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Claire Mathieu'
    this.photoSrc = '/alea/images/egalite/mathieu.png'
    this.photoAlt = 'Portrait de Claire Mathieu'
    this.source = 'Collège de France'
    this.superPouvoir = 'Optimiseuse du quotidien'
    this.ceQuElleFait = 'Résout des problèmes géants et complexes'
    this.leTrucStyle = 'Architecte des algos de Parcoursup'
    this.parcours = 'Informatique'
  }
}
