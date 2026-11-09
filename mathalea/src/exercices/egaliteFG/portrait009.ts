import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Florence Bertails-Descoubes'
export const dateDePublication = '17/07/2026'
export const uuid = '566be'
export const refs = {
  'fr-fr': ['Portraits-009'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait009 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Florence Bertails-Descoubes'
    this.photoSrc = '/alea/images/egalite/bertails-descoubes.jpg'
    this.photoAlt = 'Portrait de Florence Bertails-Descoubes'
    this.source = 'Inria'
    this.superPouvoir = 'Coiffeuse numérique'
    this.ceQuElleFait = 'Simule le mouvement des cheveux virtuels'
    this.leTrucStyle = 'Rend les chevelures ultra-réalistes'
    this.parcours = 'Informatique'
  }
}
