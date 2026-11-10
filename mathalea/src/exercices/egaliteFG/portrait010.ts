import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Manon Blanc'
export const dateDePublication = '17/07/2026'
export const uuid = 'eb3b4'
export const refs = {
  'fr-fr': ['Portraits-010'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait010 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Manon Blanc'
    this.photoSrc = '/alea/images/egalite/blanc.jpg'
    this.photoAlt = 'Portrait de Manon Blanc'
    this.source = 'Clémence Losfeld / CNRS'
    this.superPouvoir = 'Chronométreuse d\'ordinateurs'
    this.ceQuElleFait = 'Calcule le temps nécessaire pour résoudre un problème'
    this.leTrucStyle = 'Rend les ordinateurs moins gourmands en énergie'
    this.parcours = 'Informatique'
  }
}
