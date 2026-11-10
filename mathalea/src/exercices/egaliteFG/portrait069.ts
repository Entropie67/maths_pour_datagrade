import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Pauline Leclerc-Glorieux'
export const dateDePublication = '17/07/2026'
export const uuid = '01809'
export const refs = {
  'fr-fr': ['Portraits-069'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait069 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Pauline Leclerc-Glorieux'
    this.photoSrc = '/alea/images/egalite/leclerc-glorieux.jpg'
    this.photoAlt = 'Portrait de Pauline Leclerc-Glorieux'
    this.source = 'BNP Paribas Cardif'
    this.superPouvoir = 'Architecte des assurances'
    this.ceQuElleFait = 'Dirige les modèles d\'assurance'
    this.leTrucStyle = 'Protège les assurés sur 50 ans'
    this.parcours = 'Mathématiques'
  }
}
