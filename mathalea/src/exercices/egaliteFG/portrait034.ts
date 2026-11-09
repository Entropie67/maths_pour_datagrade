import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Catherine Devic'
export const dateDePublication = '17/07/2026'
export const uuid = '8b395'
export const refs = {
  'fr-fr': ['Portraits-034'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait034 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Catherine Devic'
    this.photoSrc = '/alea/images/egalite/devic.jpg'
    this.photoAlt = 'Portrait de Catherine Devic'
    this.source = 'EDF'
    this.superPouvoir = 'Architecte numérique des centrales'
    this.ceQuElleFait = 'Modernise l\'informatique nucléaire'
    this.leTrucStyle = 'Utilise des jumeaux numériques pour piloter'
    this.parcours = 'Mathématiques'
  }
}
