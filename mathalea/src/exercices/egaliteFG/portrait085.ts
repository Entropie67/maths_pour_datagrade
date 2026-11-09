import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne-Cécile Orgerie'
export const dateDePublication = '17/07/2026'
export const uuid = '0ef44'
export const refs = {
  'fr-fr': ['Portraits-085'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait085 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne-Cécile Orgerie'
    this.photoSrc = '/alea/images/egalite/orgerie.jpg'
    this.photoAlt = "Portrait d'Anne-Cécile Orgerie"
    this.source = 'Xavier Pierre / CNRS'
    this.superPouvoir = 'Économiseuse de watts numériques'
    this.ceQuElleFait = 'Modélise l\'énergie des serveurs'
    this.leTrucStyle = 'Rend les serveurs internet plus écologiques'
    this.parcours = 'Informatique'
  }
}
