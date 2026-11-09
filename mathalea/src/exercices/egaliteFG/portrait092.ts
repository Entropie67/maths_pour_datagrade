import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Proust'
export const dateDePublication = '17/07/2026'
export const uuid = 'f3da3'
export const refs = {
  'fr-fr': ['Portraits-092'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait092 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Proust'
    this.photoSrc = '/alea/images/egalite/proust.png'
    this.photoAlt = 'Portrait de Sophie Proust'
    this.source = 'Inria'
    this.superPouvoir = 'Cheffe de supercalculateurs'
    this.ceQuElleFait = 'A orchestré l\'architecture de Tera 100'
    this.leTrucStyle = 'Ses machines font 1 million de milliards d\'opérations/s'
    this.parcours = 'Mathématiques'
  }
}
