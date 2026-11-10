import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Dabo-Niang'
export const dateDePublication = '17/07/2026'
export const uuid = '50c02'
export const refs = {
  'fr-fr': ['Portraits-031'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait031 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Dabo-Niang'
    this.photoSrc = '/alea/images/egalite/dabo-niang.jpg'
    this.photoAlt = 'Portrait de Sophie Dabo-Niang'
    this.source = 'Inria'
    this.superPouvoir = 'Exploratrice de données qui bougent'
    this.ceQuElleFait = 'Analyse des données évoluant dans le temps'
    this.leTrucStyle = 'Aide à suivre les épidémies'
    this.parcours = 'Mathématiques'
  }
}
