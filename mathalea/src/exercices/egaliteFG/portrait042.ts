import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne Etien'
export const dateDePublication = '17/07/2026'
export const uuid = '83cc2'
export const refs = {
  'fr-fr': ['Portraits-042'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait042 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne Etien'
    this.photoSrc = '/alea/images/egalite/etien.jpg'
    this.photoAlt = "Portrait d'Anne Etien"
    this.source = 'Inria'
    this.superPouvoir = 'Médecin des logiciels'
    this.ceQuElleFait = 'Répare les logiciels qui vieillissent'
    this.leTrucStyle = 'Modernise des programmes sans créer de bugs'
    this.parcours = 'Informatique'
  }
}
