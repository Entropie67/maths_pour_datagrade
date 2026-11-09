import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Laurence Nigay'
export const dateDePublication = '17/07/2026'
export const uuid = 'e8a9e'
export const refs = {
  'fr-fr': ['Portraits-084'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait084 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Laurence Nigay'
    this.photoSrc = '/alea/images/egalite/nigay.jpeg'
    this.photoAlt = 'Portrait de Laurence Nigay'
    this.source = 'CNRS INS2I'
    this.superPouvoir = 'Inventrice de nouvelles télécommandes'
    this.ceQuElleFait = 'Commande des appareils avec le regard ou gestes'
    this.leTrucStyle = 'Technologies plus intuitives que la souris'
    this.parcours = 'Informatique'
  }
}
