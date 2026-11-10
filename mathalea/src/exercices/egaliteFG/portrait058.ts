import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Caroline Hillairet'
export const dateDePublication = '17/07/2026'
export const uuid = 'c192c'
export const refs = {
  'fr-fr': ['Portraits-058'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait058 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Caroline Hillairet'
    this.photoSrc = '/alea/images/egalite/hillairet.jpg'
    this.photoAlt = 'Portrait de Caroline Hillairet'
    this.source = 'CREST'
    this.superPouvoir = 'Assureuse contre les pirates'
    this.ceQuElleFait = 'Chiffre le coût des cyberattaques'
    this.leTrucStyle = 'Invente l\'assurance contre les virus géants'
    this.parcours = 'Mathématiques'
  }
}
