import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Collet'
export const dateDePublication = '17/07/2026'
export const uuid = 'eb7dd'
export const refs = {
  'fr-fr': ['Portraits-028'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait028 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Collet'
    this.photoSrc = '/alea/images/egalite/collet.jpg'
    this.photoAlt = "Portrait d'Isabelle Collet"
    this.source = 'Wikimedia Commons — DeuxPlusQuatre — CC BY-SA 4.0'
    this.superPouvoir = 'Débugueuse de stéréotypes'
    this.ceQuElleFait = 'Analyse la masculinisation du code'
    this.leTrucStyle = 'Rouvre les portes de la tech aux femmes'
    this.parcours = 'Informatique'
  }
}
