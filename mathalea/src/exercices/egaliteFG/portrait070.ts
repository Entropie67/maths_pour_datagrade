import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Aline Lefebvre-Lepot'
export const dateDePublication = '17/07/2026'
export const uuid = '370ef'
export const refs = {
  'fr-fr': ['Portraits-070'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait070 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Aline Lefebvre-Lepot'
    this.photoSrc = '/alea/images/egalite/lefebvre-lepot.jpg'
    this.photoAlt = "Portrait d'Aline Lefebvre-Lepot"
    this.source = 'site personnel'
    this.superPouvoir = 'Simulatrice de grains'
    this.ceQuElleFait = 'Étudie le mouvement de grains dans un liquide'
    this.leTrucStyle = 'Comprend comment naissent les avalanches'
    this.parcours = 'Mathématiques'
  }
}
