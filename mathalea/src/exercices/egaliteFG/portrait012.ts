import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Bloch'
export const dateDePublication = '17/07/2026'
export const uuid = 'd2a37'
export const refs = {
  'fr-fr': ['Portraits-012'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait012 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Bloch'
    this.photoSrc = '/alea/images/egalite/bloch.png'
    this.photoAlt = "Portrait d'Isabelle Bloch"
    this.source = 'LIP6'
    this.superPouvoir = 'Radiologue des algorithmes'
    this.ceQuElleFait = 'Aide les ordinateurs à reconnaître des organes'
    this.leTrucStyle = 'Croise IA et expertise médicale'
    this.parcours = 'Informatique'
  }
}
