import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Fanny Kassel'
export const dateDePublication = '17/07/2026'
export const uuid = 'aa318'
export const refs = {
  'fr-fr': ['Portraits-064'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait064 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Fanny Kassel'
    this.photoSrc = '/alea/images/egalite/kassel.jpg'
    this.photoAlt = 'Portrait de Fanny Kassel'
    this.source = 'Wikimedia Commons — Katrin Schmid / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Sculptrice d\'espaces géométriques'
    this.ceQuElleFait = 'Étudie la géométrie dans des espaces abstraits'
    this.leTrucStyle = 'Indispensable à la théorie des cordes'
    this.parcours = 'Mathématiques'
  }
}
