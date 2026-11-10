import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Catherine Pelachaud'
export const dateDePublication = '17/07/2026'
export const uuid = '058db'
export const refs = {
  'fr-fr': ['Portraits-088'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait088 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Catherine Pelachaud'
    this.photoSrc = '/alea/images/egalite/pelachaud.jpg'
    this.photoAlt = 'Portrait de Catherine Pelachaud'
    this.source = 'Catherine Pelachaud — Nicolas Loubet — CC BY-NC 2.0'
    this.superPouvoir = 'Créatrice d\'avatars'
    this.ceQuElleFait = 'Programme des humains virtuels'
    this.leTrucStyle = 'Ses avatars rassurent les patients stressés'
    this.parcours = 'Informatique'
  }
}
