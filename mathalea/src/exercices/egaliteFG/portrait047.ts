import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Hélyette Geman'
export const dateDePublication = '17/07/2026'
export const uuid = 'f47b8'
export const refs = {
  'fr-fr': ['Portraits-047'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait047 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Hélyette Geman'
    this.photoSrc = '/alea/images/egalite/geman.jpg'
    this.photoAlt = "Portrait d'Hélyette Geman"
    this.source = 'site personnel'
    this.superPouvoir = 'Mathématicienne de l\'énergie'
    this.ceQuElleFait = 'Applique les probabilités aux prix du pétrole'
    this.leTrucStyle = 'Relie risque climatique et risque financier'
    this.parcours = 'Mathématiques'
  }
}
