import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Viger'
export const dateDePublication = '17/07/2026'
export const uuid = '127f6'
export const refs = {
  'fr-fr': ['Portraits-105'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait105 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Viger'
    this.photoSrc = '/alea/images/egalite/viger.jpg'
    this.photoAlt = 'Portrait de Sophie Viger'
    this.source = 'photo fournie'
    this.superPouvoir = 'Ouvreuse de portes vers le code'
    this.ceQuElleFait = 'Dirige l\'École 42'
    this.leTrucStyle = 'Révèle des génies du code sans diplômes'
    this.parcours = 'Informatique'
  }
}
