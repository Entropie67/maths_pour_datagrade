import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Virginie Ehrlacher'
export const dateDePublication = '17/07/2026'
export const uuid = 'b2849'
export const refs = {
  'fr-fr': ['Portraits-038'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait038 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Virginie Ehrlacher'
    this.photoSrc = '/alea/images/egalite/ehrlacher.jpg'
    this.photoAlt = 'Portrait de Virginie Ehrlacher'
    this.source = 'Tatjana Ruf / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Bâtisseuse de matériaux moléculaires'
    this.ceQuElleFait = 'Modélise la matière à l\'échelle atomique'
    this.leTrucStyle = 'Évite des expériences coûteuses en labo'
    this.parcours = 'Mathématiques'
  }
}
