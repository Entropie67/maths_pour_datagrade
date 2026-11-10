import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Amandine Aftalion'
export const dateDePublication = '17/07/2026'
export const uuid = '3befd'
export const refs = {
  'fr-fr': ['Portraits-002'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait002 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Amandine Aftalion'
    this.photoSrc = '/alea/images/egalite/aftalion.jpg'
    this.photoAlt = "Portrait d'Amandine Aftalion"
    this.source = 'CNRS'
    this.superPouvoir = 'Entraîneuse mathématique'
    this.ceQuElleFait = 'Calcule les meilleures stratégies pour les athlètes'
    this.leTrucStyle = 'Optimise l\'effort des champions'
    this.parcours = 'Mathématiques'
  }
}
