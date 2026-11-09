import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Ryl'
export const dateDePublication = '17/07/2026'
export const uuid = '2a54c'
export const refs = {
  'fr-fr': ['Portraits-094'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait094 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Ryl'
    this.photoSrc = '/alea/images/egalite/ryl.jpg'
    this.photoAlt = "Portrait d'Isabelle Ryl"
    this.source = 'PRAIRIE-PSAI'
    this.superPouvoir = 'Bâtisseuse d\'IA'
    this.ceQuElleFait = 'Lie médecine et IA pour sauver des vies'
    this.leTrucStyle = 'Dirige l\'institut PRAIRIE'
    this.parcours = 'Informatique'
  }
}
