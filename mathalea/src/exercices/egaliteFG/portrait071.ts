import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Florence Lustman'
export const dateDePublication = '17/07/2026'
export const uuid = '52312'
export const refs = {
  'fr-fr': ['Portraits-071'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait071 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Florence Lustman'
    this.photoSrc = '/alea/images/egalite/lustman.jpg'
    this.photoAlt = 'Portrait de Florence Lustman'
    this.source = 'France Assureurs'
    this.superPouvoir = 'Bouclier contre les risques'
    this.ceQuElleFait = 'Prévoit les crises financières'
    this.leTrucStyle = 'Garantit la solidité des assurances'
    this.parcours = 'Mathématiques'
  }
}
