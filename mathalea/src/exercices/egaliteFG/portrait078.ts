import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Julie Meunier'
export const dateDePublication = '17/07/2026'
export const uuid = '732f8'
export const refs = {
  'fr-fr': ['Portraits-078'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait078 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Julie Meunier'
    this.photoSrc = '/alea/images/egalite/meunier.webp'
    this.photoAlt = 'Portrait de Julie Meunier'
    this.source = 'ENSTA'
    this.superPouvoir = 'Traqueuse de tourbillons'
    this.ceQuElleFait = 'Modélise le transport océanique'
    this.leTrucStyle = 'Améliore la précision des modèles climatiques'
    this.parcours = 'Mathématiques'
  }
}
