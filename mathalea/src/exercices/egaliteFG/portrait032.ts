import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Julie Delon'
export const dateDePublication = '17/07/2026'
export const uuid = 'c2935'
export const refs = {
  'fr-fr': ['Portraits-032'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait032 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Julie Delon'
    this.photoSrc = '/alea/images/egalite/delon.png'
    this.photoAlt = 'Portrait de Julie Delon'
    this.source = 'Institut Henri-Poincaré'
    this.superPouvoir = 'Débruiteuse d’images'
    this.ceQuElleFait = 'Corrige des photographies floues'
    this.leTrucStyle = 'Utilisée par les smartphones et satellites'
    this.parcours = 'Mathématiques'
  }
}
