import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne Bouverot'
export const dateDePublication = '17/07/2026'
export const uuid = '1ba70'
export const refs = {
  'fr-fr': ['Portraits-017'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait017 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne Bouverot'
    this.photoSrc = '/alea/images/egalite/bouverot.jpg'
    this.photoAlt = "Portrait d'Anne Bouverot"
    this.source = 'ITU / Rowan Farrell — CC BY 2.0'
    this.superPouvoir = 'Ambassadrice de l\'IA'
    this.ceQuElleFait = 'Conseil mondial sur l\'éthique de l\'IA'
    this.leTrucStyle = 'Voix de la France sur les algos internationaux'
    this.parcours = 'Mathématiques'
  }
}
