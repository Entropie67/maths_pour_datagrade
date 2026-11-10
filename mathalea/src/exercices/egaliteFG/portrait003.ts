import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Clémence Allietta'
export const dateDePublication = '17/07/2026'
export const uuid = 'b66f1'
export const refs = {
  'fr-fr': ['Portraits-003'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait003 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Clémence Allietta'
    this.photoSrc = '/alea/images/egalite/allietta.jpg'
    this.photoAlt = 'Portrait de Clémence Allietta'
    this.source = 'ENAC'
    this.superPouvoir = 'Décrypteuse de fumées vues de l’espace'
    this.ceQuElleFait = 'Analyse les panaches de mégafeux'
    this.leTrucStyle = 'Prévoit les orages de propagation de feu'
    this.parcours = 'Mathématiques'
  }
}
