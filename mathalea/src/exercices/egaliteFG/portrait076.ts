import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Clémentine Maurice'
export const dateDePublication = '17/07/2026'
export const uuid = '1d631'
export const refs = {
  'fr-fr': ['Portraits-076'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait076 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Clémentine Maurice'
    this.photoSrc = '/alea/images/egalite/maurice.gif'
    this.photoAlt = 'Portrait de Clémentine Maurice'
    this.source = 'Inria'
    this.superPouvoir = 'Espionne des processeurs'
    this.ceQuElleFait = 'Identifie les failles de sécurité des ordinateurs'
    this.leTrucStyle = 'Détecte des piratages via des signaux infimes'
    this.parcours = 'Informatique'
  }
}
