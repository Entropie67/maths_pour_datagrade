import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Madeleine Kubasch'
export const dateDePublication = '17/07/2026'
export const uuid = '2e5d5'
export const refs = {
  'fr-fr': ['Portraits-067'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait067 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Madeleine Kubasch'
    this.photoSrc = '/alea/images/egalite/kubasch.jpg'
    this.photoAlt = 'Portrait de Madeleine Kubasch'
    this.source = 'site personnel'
    this.superPouvoir = 'Simulatrice de contagions'
    this.ceQuElleFait = 'Représente la transmission de maladie'
    this.leTrucStyle = 'Teste l\'effet d\'un vaccin virtuellement'
    this.parcours = 'Mathématiques'
  }
}
