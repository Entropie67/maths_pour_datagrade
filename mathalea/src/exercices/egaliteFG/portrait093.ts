import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie-Christine Rousset'
export const dateDePublication = '17/07/2026'
export const uuid = 'e2b02'
export const refs = {
  'fr-fr': ['Portraits-093'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait093 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie-Christine Rousset'
    this.photoSrc = '/alea/images/egalite/rousset.jpg'
    this.photoAlt = 'Portrait de Marie-Christine Rousset'
    this.source = 'Alain Comment — CC BY-SA 4.0'
    this.superPouvoir = 'Bibliothécaire intelligente'
    this.ceQuElleFait = 'Connecte les bases de données mondiales'
    this.leTrucStyle = 'Permet à une IA de deviner la réponse'
    this.parcours = 'Mathématiques'
  }
}
