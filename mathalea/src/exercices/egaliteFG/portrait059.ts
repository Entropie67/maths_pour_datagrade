import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Céline Hudelot'
export const dateDePublication = '17/07/2026'
export const uuid = '544b5'
export const refs = {
  'fr-fr': ['Portraits-059'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait059 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Céline Hudelot'
    this.photoSrc = '/alea/images/egalite/hudelot.png'
    this.photoAlt = 'Portrait de Céline Hudelot'
    this.source = 'Institut DATAIA'
    this.superPouvoir = 'Traductrice d\'images en idées'
    this.ceQuElleFait = 'Analyse des images par IA et textes'
    this.leTrucStyle = 'Oblige les IA médicales à justifier leurs décisions'
    this.parcours = 'Informatique'
  }
}
