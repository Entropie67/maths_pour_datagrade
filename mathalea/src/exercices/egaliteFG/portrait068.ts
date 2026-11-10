import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Céline Lazorthes'
export const dateDePublication = '17/07/2026'
export const uuid = 'a4c51'
export const refs = {
  'fr-fr': ['Portraits-068'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait068 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Céline Lazorthes'
    this.photoSrc = '/alea/images/egalite/lazorthes.jpg'
    this.photoAlt = 'Portrait de Céline Lazorthes'
    this.source = 'Focus (Suisse)'
    this.superPouvoir = 'Créatrice de monnaie collective'
    this.ceQuElleFait = 'A codé les plateformes de paiement'
    this.leTrucStyle = 'Son système est un standard du web'
    this.parcours = 'Informatique'
  }
}
