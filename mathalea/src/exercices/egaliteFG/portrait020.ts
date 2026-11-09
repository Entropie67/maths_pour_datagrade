import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Claire Calmejane'
export const dateDePublication = '17/07/2026'
export const uuid = '040ed'
export const refs = {
  'fr-fr': ['Portraits-020'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait020 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Claire Calmejane'
    this.photoSrc = '/alea/images/egalite/calmejane.jpg'
    this.photoAlt = 'Portrait de Claire Calmejane'
    this.source = 'Claire Calmejane — David Fitzgerald / Web Summit via Sportsfile — CC BY 2.0'
    this.superPouvoir = 'Transformatrice de banques'
    this.ceQuElleFait = 'Modernise la cybersécurité financière'
    this.leTrucStyle = 'Migre des millions de transactions vers le Cloud'
    this.parcours = 'Informatique'
  }
}
