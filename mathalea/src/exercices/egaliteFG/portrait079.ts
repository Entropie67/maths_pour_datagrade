import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nathalie Mitton'
export const dateDePublication = '17/07/2026'
export const uuid = '80edf'
export const refs = {
  'fr-fr': ['Portraits-079'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait079 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nathalie Mitton'
    this.photoSrc = '/alea/images/egalite/mitton.jpg'
    this.photoAlt = 'Portrait de Nathalie Mitton'
    this.source = 'Inria'
    this.superPouvoir = 'Tisseuse de réseaux invisibles'
    this.ceQuElleFait = 'Permet à des capteurs de communiquer'
    this.leTrucStyle = 'Réseaux fonctionnant sans téléphone'
    this.parcours = 'Informatique'
  }
}
