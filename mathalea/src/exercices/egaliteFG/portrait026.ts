import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Marie-Anne Clair'
export const dateDePublication = '17/07/2026'
export const uuid = 'f3f01'
export const refs = {
  'fr-fr': ['Portraits-026'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait026 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Marie-Anne Clair'
    this.photoSrc = '/alea/images/egalite/clair.jpg'
    this.photoAlt = 'Portrait de Marie-Anne Clair'
    this.source = 'CNES'
    this.superPouvoir = 'Cheffe des satellites'
    this.ceQuElleFait = 'Dirige l\'ingénierie du CNES'
    this.leTrucStyle = 'A construit les satellites surveillant les océans'
    this.parcours = 'Mathématiques'
  }
}
