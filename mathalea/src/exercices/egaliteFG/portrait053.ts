import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Céline Guivarch'
export const dateDePublication = '17/07/2026'
export const uuid = '053f9'
export const refs = {
  'fr-fr': ['Portraits-053'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait053 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Céline Guivarch'
    this.photoSrc = '/alea/images/egalite/guivarch.jpg'
    this.photoAlt = 'Portrait de Céline Guivarch'
    this.source = 'École des Ponts'
    this.superPouvoir = 'Simulatrice de futurs climatiques'
    this.ceQuElleFait = 'Relie économie, pollution et climat'
    this.leTrucStyle = 'Calcule l’impact de chaque loi sur le thermomètre'
    this.parcours = 'Mathématiques'
  }
}
