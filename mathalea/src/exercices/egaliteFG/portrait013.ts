import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Justine Bonnot'
export const dateDePublication = '17/07/2026'
export const uuid = 'ae812'
export const refs = {
  'fr-fr': ['Portraits-013'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait013 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Justine Bonnot'
    this.photoSrc = '/alea/images/egalite/bonnot.jpg'
    this.photoAlt = 'Portrait de Justine Bonnot'
    this.source = 'Inria'
    this.superPouvoir = 'Allégeuse de logiciels'
    this.ceQuElleFait = 'Optimise les programmes embarqués'
    this.leTrucStyle = 'Réduit la consommation d\'énergie des objets'
    this.parcours = 'Mathématiques'
  }
}
