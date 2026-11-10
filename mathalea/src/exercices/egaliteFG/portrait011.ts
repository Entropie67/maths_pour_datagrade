import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Laure Blanc-Féraud'
export const dateDePublication = '17/07/2026'
export const uuid = '3c512'
export const refs = {
  'fr-fr': ['Portraits-011'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait011 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Laure Blanc-Féraud'
    this.photoSrc = '/alea/images/egalite/blanc-feraud.jpg'
    this.photoAlt = 'Portrait de Laure Blanc-Féraud'
    this.source = 'Université Côte d\'Azur'
    this.superPouvoir = 'Ophtalmo pour microscopes'
    this.ceQuElleFait = 'Nettoie les photos biologiques floues'
    this.leTrucStyle = 'Permet de voir l\'infiniment petit'
    this.parcours = 'Informatique'
  }
}
