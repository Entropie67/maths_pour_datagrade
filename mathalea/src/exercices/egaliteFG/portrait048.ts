import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Élodie Germani'
export const dateDePublication = '17/07/2026'
export const uuid = '67400'
export const refs = {
  'fr-fr': ['Portraits-048'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait048 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Élodie Germani'
    this.photoSrc = '/alea/images/egalite/germani.jpg'
    this.photoAlt = "Portrait d'Élodie Germani"
    this.source = 'Fondation L\'Oréal / Richard Pak'
    this.superPouvoir = 'Détective numérique du cerveau'
    this.ceQuElleFait = 'Analyse des images médicales complexes'
    this.leTrucStyle = 'Garantit la fiabilité des diagnostics par IA'
    this.parcours = 'Informatique'
  }
}
