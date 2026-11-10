import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sylvie Buglioni'
export const dateDePublication = '17/07/2026'
export const uuid = '5184d'
export const refs = {
  'fr-fr': ['Portraits-019'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait019 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sylvie Buglioni'
    this.photoSrc = '/alea/images/egalite/buglioni.jpg'
    this.photoAlt = 'Portrait de Sylvie Buglioni'
    this.source = 'Wikimedia Commons — Huboio — CC BY-SA 4.0'
    this.superPouvoir = 'Cheffe du métro numérique'
    this.ceQuElleFait = 'Pilote l\'innovation RATP'
    this.leTrucStyle = 'Conceptrice des systèmes Navigo'
    this.parcours = 'Informatique'
  }
}
