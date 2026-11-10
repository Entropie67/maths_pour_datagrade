import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Hélène Kirchner'
export const dateDePublication = '17/07/2026'
export const uuid = 'b0497'
export const refs = {
  'fr-fr': ['Portraits-066'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait066 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Hélène Kirchner'
    this.photoSrc = '/alea/images/egalite/kirchner.jpg'
    this.photoAlt = "Portrait d'Hélène Kirchner"
    this.source = 'Inria'
    this.superPouvoir = 'Avocate des logiciels'
    this.ceQuElleFait = 'Vérifie les règles des programmes'
    this.leTrucStyle = 'Détecte les failles avant utilisation'
    this.parcours = 'Informatique'
  }
}
