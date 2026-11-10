import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie-Paule Cani'
export const dateDePublication = '17/07/2026'
export const uuid = '3aba2'
export const refs = {
  'fr-fr': ['Portraits-021'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait021 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie-Paule Cani'
    this.photoSrc = '/alea/images/egalite/cani.jpg'
    this.photoAlt = 'Portrait de Marie-Paule Cani'
    this.source = 'Polytechnique Insights'
    this.superPouvoir = 'Sculptrice de mondes virtuels'
    this.ceQuElleFait = 'Crée des méthodes pour animer des objets en 3D'
    this.leTrucStyle = 'Utile pour le cinéma et les jeux vidéo'
    this.parcours = 'Informatique'
  }
}
