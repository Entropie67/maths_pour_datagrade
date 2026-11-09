import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Laurence Devillers'
export const dateDePublication = '17/07/2026'
export const uuid = 'ae493'
export const refs = {
  'fr-fr': ['Portraits-035'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait035 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Laurence Devillers'
    this.photoSrc = '/alea/images/egalite/devillers.jpg'
    this.photoAlt = 'Portrait de Laurence Devillers'
    this.source = 'Olivier Ezratty — CC BY-SA 4.0'
    this.superPouvoir = 'Éducatrice de robots'
    this.ceQuElleFait = 'Apprend aux robots à décoder nos émotions'
    this.leTrucStyle = 'Définit les lois éthiques de l\'IA'
    this.parcours = 'Informatique'
  }
}
