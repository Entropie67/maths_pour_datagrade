import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne Siegel'
export const dateDePublication = '17/07/2026'
export const uuid = 'cdbe4'
export const refs = {
  'fr-fr': ['Portraits-099'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait099 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne Siegel'
    this.photoSrc = '/alea/images/egalite/siegel.png'
    this.photoAlt = "Portrait d'Anne Siegel"
    this.source = 'Xavier Pierre / CNRS'
    this.superPouvoir = 'Décodeuse d\'algues'
    this.ceQuElleFait = 'Modélise le métabolisme marin'
    this.leTrucStyle = 'Aide à repérer des algues dépolluantes'
    this.parcours = 'Informatique'
  }
}
