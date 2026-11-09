import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sophie Adenot'
export const dateDePublication = '17/07/2026'
export const uuid = 'e8c19'
export const refs = {
  'fr-fr': ['Portraits-001'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait001 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sophie Adenot'
    this.photoSrc = '/alea/images/egalite/adenot.jpg'
    this.photoAlt = 'Portrait de Sophie Adenot'
    this.source = 'Helen Arase Vargas et David DeHoyos / NASA — Domaine public'
    this.superPouvoir = 'Ingénieure de l\'extrême'
    this.ceQuElleFait = 'Teste la mécanique des fusées'
    this.leTrucStyle = 'Pilote spatiale maîtrisant chaque trajectoire'
    this.parcours = 'Mathématiques'
  }
}
