import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Bernadette Perrin-Riou'
export const dateDePublication = '17/07/2026'
export const uuid = 'f2b63'
export const refs = {
  'fr-fr': ['Portraits-089'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait089 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Bernadette Perrin-Riou'
    this.photoSrc = '/alea/images/egalite/perrin-riou.jpg'
    this.photoAlt = 'Portrait de Bernadette Perrin-Riou'
    this.source = 'MacTutor History of Mathematics'
    this.superPouvoir = 'Archéologue des nombres'
    this.ceQuElleFait = 'Travaille sur les nombres p-adiques'
    this.leTrucStyle = 'Résout des énigmes mathématiques historiques'
    this.parcours = 'Mathématiques'
  }
}
