import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Véronique Torner'
export const dateDePublication = '17/07/2026'
export const uuid = 'e93e5'
export const refs = {
  'fr-fr': ['Portraits-101'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait101 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Véronique Torner'
    this.photoSrc = '/alea/images/egalite/torner.jpg'
    this.photoAlt = 'Portrait de Véronique Torner'
    this.source = 'Lamiot — CC BY-SA 4.0'
    this.superPouvoir = 'Bâtisseuse d\'un numérique responsable'
    this.ceQuElleFait = 'Crée des services en code libre'
    this.leTrucStyle = 'Démocratise un code écolo et accessible'
    this.parcours = 'Informatique'
  }
}
