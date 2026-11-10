import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Solenne Gaucher'
export const dateDePublication = '17/07/2026'
export const uuid = '874a2'
export const refs = {
  'fr-fr': ['Portraits-046'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait046 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Solenne Gaucher'
    this.photoSrc = '/alea/images/egalite/gaucher.jpg'
    this.photoAlt = 'Portrait de Solenne Gaucher'
    this.source = 'CREST'
    this.superPouvoir = 'Débiaisatrice d’IA'
    this.ceQuElleFait = 'Empêche les discriminations dans les algos'
    this.leTrucStyle = 'Rend le recrutement par IA plus équitable'
    this.parcours = 'Mathématiques'
  }
}
