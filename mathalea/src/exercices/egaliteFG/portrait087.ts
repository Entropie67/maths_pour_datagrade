import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Katia Parodi'
export const dateDePublication = '17/07/2026'
export const uuid = '80ac9'
export const refs = {
  'fr-fr': ['Portraits-087'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait087 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Katia Parodi'
    this.photoSrc = '/alea/images/egalite/parodi.webp'
    this.photoAlt = 'Portrait de Katia Parodi'
    this.source = 'IOP Publishing'
    this.superPouvoir = 'Mathématicienne de la précision médicale'
    this.ceQuElleFait = 'Elle développe des algorithmes de traitement d\'images pour guider les thérapies contre le cancer'
    this.leTrucStyle = 'Ses modèles permettent de viser les tumeurs avec une précision chirurgicale millimétrique'
    this.parcours = 'Mathématiques'
  }
}
