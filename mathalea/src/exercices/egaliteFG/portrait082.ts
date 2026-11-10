import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Hélène Morlon'
export const dateDePublication = '17/07/2026'
export const uuid = '423d0'
export const refs = {
  'fr-fr': ['Portraits-082'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait082 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Hélène Morlon'
    this.photoSrc = '/alea/images/egalite/morlon.jpg'
    this.photoAlt = "Portrait d'Hélène Morlon"
    this.source = 'Ryan Lash / TED'
    this.superPouvoir = 'Détective de l\'arbre du vivant'
    this.ceQuElleFait = 'Analyse les liens de parenté entre les espèces'
    this.leTrucStyle = 'Reconstitue l\'histoire de la biodiversité'
    this.parcours = 'Mathématiques'
  }
}
