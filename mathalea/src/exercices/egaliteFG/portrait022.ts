import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne Canteaut'
export const dateDePublication = '17/07/2026'
export const uuid = '2f45d'
export const refs = {
  'fr-fr': ['Portraits-022'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait022 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne Canteaut'
    this.photoSrc = '/alea/images/egalite/canteaut.jpg'
    this.photoAlt = "Portrait d'Anne Canteaut"
    this.source = 'Wikimedia Commons — Lucile Moreno / Inria — CC BY 4.0'
    this.superPouvoir = 'Gardienne des secrets'
    this.ceQuElleFait = 'Analyse les codes qui protègent nos données'
    this.leTrucStyle = 'Détecte les failles avant les pirates'
    this.parcours = 'Informatique'
  }
}
