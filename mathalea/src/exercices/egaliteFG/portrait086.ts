import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Claire Pagetti'
export const dateDePublication = '17/07/2026'
export const uuid = '3e2be'
export const refs = {
  'fr-fr': ['Portraits-086'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait086 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Claire Pagetti'
    this.photoSrc = '/alea/images/egalite/pagetti.png'
    this.photoAlt = 'Portrait de Claire Pagetti'
    this.source = 'ONERA'
    this.superPouvoir = 'Contrôleuse technique des IA'
    this.ceQuElleFait = 'Vérifie les logiciels aéronautiques'
    this.leTrucStyle = 'Prouve qu\'une IA de pilotage restera sûre'
    this.parcours = 'Mathématiques'
  }
}
