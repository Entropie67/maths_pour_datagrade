import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nicole El Karoui'
export const dateDePublication = '17/07/2026'
export const uuid = 'ecd95'
export const refs = {
  'fr-fr': ['Portraits-040'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait040 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nicole El Karoui'
    this.photoSrc = '/alea/images/egalite/el-karoui.jpg'
    this.photoAlt = 'Portrait de Nicole El Karoui'
    this.source = 'Olivier Ezratty — CC BY-SA 3.0'
    this.superPouvoir = 'Dompteuse du hasard financier'
    this.ceQuElleFait = 'Modélise les marchés boursiers'
    this.leTrucStyle = 'A formé tous les mathématiciens de la finance'
    this.parcours = 'Mathématiques'
  }
}
