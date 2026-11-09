import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Amandine Véber'
export const dateDePublication = '17/07/2026'
export const uuid = 'a67b1'
export const refs = {
  'fr-fr': ['Portraits-103'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait103 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Amandine Véber'
    this.photoSrc = '/alea/images/egalite/veber.jpg'
    this.photoAlt = "Portrait d'Amandine Véber"
    this.source = 'iMPT / CNRS'
    this.superPouvoir = 'Modélisatrice de populations'
    this.ceQuElleFait = 'Simule la transmission de gènes chez les animaux'
    this.leTrucStyle = 'Aide à sauver les espèces menacées'
    this.parcours = 'Mathématiques'
  }
}
