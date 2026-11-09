import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Guyon'
export const dateDePublication = '17/07/2026'
export const uuid = 'be224'
export const refs = {
  'fr-fr': ['Portraits-054'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait054 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Guyon'
    this.photoSrc = '/alea/images/egalite/guyon.jpg'
    this.photoAlt = "Portrait d'Isabelle Guyon"
    this.source = 'Xuthoria — CC BY-SA 4.0'
    this.superPouvoir = 'Professeure des machines'
    this.ceQuElleFait = 'Invente le tri de données massives'
    this.leTrucStyle = 'A créé des IA qui repèrent les cancers'
    this.parcours = 'Mathématiques'
  }
}
