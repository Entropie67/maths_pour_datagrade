import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Myriam Saadé'
export const dateDePublication = '17/07/2026'
export const uuid = 'ada00'
export const refs = {
  'fr-fr': ['Portraits-095'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait095 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Myriam Saadé'
    this.photoSrc = '/alea/images/egalite/saade.png'
    this.photoAlt = 'Portrait de Myriam Saadé'
    this.source = 'École des Ponts ParisTech'
    this.superPouvoir = 'Architecte numérique de l\'environnement'
    this.ceQuElleFait = 'Elle utilise l\'informatique pour simuler l\'impact des bâtiments sur les ressources naturelles'
    this.leTrucStyle = 'Elle conçoit des outils qui aident à rendre les grandes villes plus durables et intelligentes'
    this.parcours = 'Informatique'
  }
}
