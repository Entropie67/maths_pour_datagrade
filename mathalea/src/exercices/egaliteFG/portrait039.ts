import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie Ekeland'
export const dateDePublication = '17/07/2026'
export const uuid = 'ea075'
export const refs = {
  'fr-fr': ['Portraits-039'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait039 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie Ekeland'
    this.photoSrc = '/alea/images/egalite/ekeland.jpg'
    this.photoAlt = 'Portrait de Marie Ekeland'
    this.source = 'OFFICIAL LEWEB PHOTOS — CC BY 2.0'
    this.superPouvoir = 'Détectrice de technos d\'avenir'
    this.ceQuElleFait = 'Analyse les données pour financer les start-ups'
    this.leTrucStyle = 'Finance les algos qui sauveront la santé'
    this.parcours = 'Mathématiques'
  }
}
