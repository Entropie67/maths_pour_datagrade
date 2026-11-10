import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Florence Tupin'
export const dateDePublication = '17/07/2026'
export const uuid = 'fe656'
export const refs = {
  'fr-fr': ['Portraits-102'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait102 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Florence Tupin'
    this.photoSrc = '/alea/images/egalite/tupin.jpg'
    this.photoAlt = 'Portrait de Florence Tupin'
    this.source = 'Télécom Paris'
    this.superPouvoir = 'Nettoyeuse d\'images satellites'
    this.ceQuElleFait = 'Répare les images radars depuis l’espace'
    this.leTrucStyle = 'Cartographie les zones inondées sous les nuages'
    this.parcours = 'Mathématiques'
  }
}
