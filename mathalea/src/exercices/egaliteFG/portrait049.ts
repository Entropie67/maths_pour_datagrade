import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Eva Girousse'
export const dateDePublication = '17/07/2026'
export const uuid = '0fba1'
export const refs = {
  'fr-fr': ['Portraits-049'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait049 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Eva Girousse'
    this.photoSrc = '/alea/images/egalite/girousse.jpg'
    this.photoAlt = "Portrait d'Eva Girousse"
    this.source = 'photo fournie'
    this.superPouvoir = 'Prédictrice de consommation électrique'
    this.ceQuElleFait = 'Prévoit l\'évolution de la consommation'
    this.leTrucStyle = 'Gère les voitures électriques et le solaire'
    this.parcours = 'Mathématiques'
  }
}
