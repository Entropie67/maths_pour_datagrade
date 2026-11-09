import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Fantoni'
export const dateDePublication = '17/07/2026'
export const uuid = 'a66fb'
export const refs = {
  'fr-fr': ['Portraits-043'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait043 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Fantoni'
    this.photoSrc = '/alea/images/egalite/fantoni.png'
    this.photoAlt = "Portrait d'Isabelle Fantoni"
    this.source = 'site personnel'
    this.superPouvoir = 'Dresseuse de véhicules autonomes'
    this.ceQuElleFait = 'Programme l\'équilibre des drones'
    this.leTrucStyle = 'Permet aux robots d\'éviter les obstacles seuls'
    this.parcours = 'Mathématiques'
  }
}
