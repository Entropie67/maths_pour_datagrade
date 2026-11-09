import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Christine Morin'
export const dateDePublication = '17/07/2026'
export const uuid = '7aae4'
export const refs = {
  'fr-fr': ['Portraits-081'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait081 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Christine Morin'
    this.photoSrc = '/alea/images/egalite/morin.jpg'
    this.photoAlt = 'Portrait de Christine Morin'
    this.source = 'site personnel (Inria Rennes)'
    this.superPouvoir = 'Dompteuse de nuages'
    this.ceQuElleFait = 'Invente le code du Cloud'
    this.leTrucStyle = 'Garantit le fonctionnement sans interruption'
    this.parcours = 'Informatique'
  }
}
