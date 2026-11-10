import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sarah Cohen-Boulakia'
export const dateDePublication = '17/07/2026'
export const uuid = '9015c'
export const refs = {
  'fr-fr': ['Portraits-027'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait027 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sarah Cohen-Boulakia'
    this.photoSrc = '/alea/images/egalite/cohen-boulakia.jpg'
    this.photoAlt = 'Portrait de Sarah Cohen-Boulakia'
    this.source = 'Elio Duclos / DATAIA'
    this.superPouvoir = 'Navigatrice des données biologiques'
    this.ceQuElleFait = 'Lie des bases de données mondiales'
    this.leTrucStyle = 'Croise les découvertes mondiales lors d’épidémies'
    this.parcours = 'Informatique'
  }
}
