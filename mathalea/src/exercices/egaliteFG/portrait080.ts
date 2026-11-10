import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Morel'
export const dateDePublication = '17/07/2026'
export const uuid = '2841d'
export const refs = {
  'fr-fr': ['Portraits-080'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait080 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Morel'
    this.photoSrc = '/alea/images/egalite/morel.jpg'
    this.photoAlt = 'Portrait de Sophie Morel'
    this.source = 'Theodore Ehrenborg / DongA Science'
    this.superPouvoir = 'Exploratrice de l\'infini'
    this.ceQuElleFait = 'Étudie la géométrie algébrique'
    this.leTrucStyle = 'Relie les nombres premiers aux formes géométriques'
    this.parcours = 'Mathématiques'
  }
}
