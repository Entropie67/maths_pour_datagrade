import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Émilie Chouzenoux'
export const dateDePublication = '17/07/2026'
export const uuid = 'd3182'
export const refs = {
  'fr-fr': ['Portraits-024'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait024 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Émilie Chouzenoux'
    this.photoSrc = '/alea/images/egalite/chouzenoux.jpg'
    this.photoAlt = "Portrait d'Émilie Chouzenoux"
    this.source = 'Inria'
    this.superPouvoir = 'Réparatrice d’images médicales'
    this.ceQuElleFait = 'Reconstruit des images précises'
    this.leTrucStyle = 'Améliore les diagnostics des médecins'
    this.parcours = 'Mathématiques'
  }
}
