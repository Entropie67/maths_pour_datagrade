import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Isabelle Hébert'
export const dateDePublication = '17/07/2026'
export const uuid = '97246'
export const refs = {
  'fr-fr': ['Portraits-055'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait055 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Isabelle Hébert'
    this.photoSrc = '/alea/images/egalite/hebert.webp'
    this.photoAlt = "Portrait d'Isabelle Hébert"
    this.source = 'ENSAE Alumni'
    this.superPouvoir = 'Calculatrice de risques santé'
    this.ceQuElleFait = 'Prévoit les dépenses de santé'
    this.leTrucStyle = 'Anticipe les besoins médicaux sur 50 ans'
    this.parcours = 'Mathématiques'
  }
}
