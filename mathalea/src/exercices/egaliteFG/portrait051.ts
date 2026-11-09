import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Christine Guillemot'
export const dateDePublication = '17/07/2026'
export const uuid = 'fb90a'
export const refs = {
  'fr-fr': ['Portraits-051'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait051 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Christine Guillemot'
    this.photoSrc = '/alea/images/egalite/guillemot.png'
    this.photoAlt = 'Portrait de Christine Guillemot'
    this.source = 'site personnel (Inria Rennes)'
    this.superPouvoir = 'Compresseuse d\'images'
    this.ceQuElleFait = 'Invente des algos de transmission vidéo'
    this.leTrucStyle = 'Permet le streaming haute définition'
    this.parcours = 'Mathématiques'
  }
}
