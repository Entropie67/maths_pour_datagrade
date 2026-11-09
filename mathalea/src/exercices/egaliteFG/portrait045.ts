import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Gallagher'
export const dateDePublication = '17/07/2026'
export const uuid = 'c4e9e'
export const refs = {
  'fr-fr': ['Portraits-045'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait045 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Gallagher'
    this.photoSrc = '/alea/images/egalite/gallagher.jpg'
    this.photoAlt = "Portrait d'Isabelle Gallagher"
    this.source = 'Gérald Garitan — CC BY-SA 4.0'
    this.superPouvoir = 'Dompteuse des turbulences'
    this.ceQuElleFait = 'Étudie les équations du mouvement des fluides'
    this.leTrucStyle = 'S\'attaque à un problème mathématique à 1 million de dollars'
    this.parcours = 'Mathématiques'
  }
}
