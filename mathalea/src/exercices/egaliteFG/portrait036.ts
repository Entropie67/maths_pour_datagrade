import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Léa Douchet'
export const dateDePublication = '17/07/2026'
export const uuid = '3a8a7'
export const refs = {
  'fr-fr': ['Portraits-036'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait036 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Léa Douchet'
    this.photoSrc = '/alea/images/egalite/douchet.jpg'
    this.photoAlt = 'Portrait de Léa Douchet'
    this.source = 'site personnel'
    this.superPouvoir = 'Sentinelle mathématique des épidémies'
    this.ceQuElleFait = 'Prévient l\'apparition de maladies'
    this.leTrucStyle = 'Alerte les hôpitaux avant l’aggravation'
    this.parcours = 'Informatique'
  }
}
