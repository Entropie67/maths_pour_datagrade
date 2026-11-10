import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Florence Picard'
export const dateDePublication = '17/07/2026'
export const uuid = '0668f'
export const refs = {
  'fr-fr': ['Portraits-090'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait090 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Florence Picard'
    this.photoSrc = '/alea/images/egalite/picard.jpg'
    this.photoAlt = 'Portrait de Florence Picard'
    this.source = 'photo fournie'
    this.superPouvoir = 'Prévisionniste de l\'imprévisible'
    this.ceQuElleFait = 'Mesure les crises financières'
    this.leTrucStyle = 'Intègre l\'IA dans le métier d\'actuaire'
    this.parcours = 'Mathématiques'
  }
}
