import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Véronique Maume-Deschamps'
export const dateDePublication = '17/07/2026'
export const uuid = 'd03f2'
export const refs = {
  'fr-fr': ['Portraits-075'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait075 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Véronique Maume-Deschamps'
    this.photoSrc = '/alea/images/egalite/maume-deschamps.jpg'
    this.photoAlt = 'Portrait de Véronique Maume-Deschamps'
    this.source = 'photo fournie'
    this.superPouvoir = 'Relieuse de risques'
    this.ceQuElleFait = 'Étudie le cumul des risques'
    this.leTrucStyle = 'Aide les assurances face aux crises multiples'
    this.parcours = 'Mathématiques'
  }
}
