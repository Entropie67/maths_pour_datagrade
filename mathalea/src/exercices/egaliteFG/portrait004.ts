import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nalini Anantharaman'
export const dateDePublication = '17/07/2026'
export const uuid = 'b90b3'
export const refs = {
  'fr-fr': ['Portraits-004'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait004 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nalini Anantharaman'
    this.photoSrc = '/alea/images/egalite/anantharaman.jpg'
    this.photoAlt = 'Portrait de Nalini Anantharaman'
    this.source = 'Davi Campana / ICM 2018 — Domaine public'
    this.superPouvoir = 'Cartographe des ondes'
    this.ceQuElleFait = 'Étudie la physique quantique et la propagation des ondes'
    this.leTrucStyle = 'Modélise le chaos quantique'
    this.parcours = 'Mathématiques'
  }
}
