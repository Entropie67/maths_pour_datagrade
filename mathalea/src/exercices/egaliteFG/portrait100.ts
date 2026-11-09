import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie-Luce Taupin'
export const dateDePublication = '17/07/2026'
export const uuid = '511c2'
export const refs = {
  'fr-fr': ['Portraits-100'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait100 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie-Luce Taupin'
    this.photoSrc = '/alea/images/egalite/taupin.jpg'
    this.photoAlt = 'Portrait de Marie-Luce Taupin'
    this.source = 'Christophe Peus / Université Paris-Saclay'
    this.superPouvoir = 'Statisticienne du vivant'
    this.ceQuElleFait = 'Extrait des infos de données biologiques'
    this.leTrucStyle = 'Transforme des mesures brutes en indices vitaux'
    this.parcours = 'Mathématiques'
  }
}
