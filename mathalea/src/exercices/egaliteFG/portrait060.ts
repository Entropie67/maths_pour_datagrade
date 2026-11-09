import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Élise Janvresse'
export const dateDePublication = '17/07/2026'
export const uuid = '0c294'
export const refs = {
  'fr-fr': ['Portraits-060'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait060 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Élise Janvresse'
    this.photoSrc = '/alea/images/egalite/janvresse.jpg'
    this.photoAlt = "Portrait d'Élise Janvresse"
    this.source = 'CNRS INSMI / Université de Picardie Jules-Verne'
    this.superPouvoir = 'Conteuse de probabilités'
    this.ceQuElleFait = 'Étudie les systèmes dynamiques instables'
    this.leTrucStyle = 'Rend les probabilités fascinantes'
    this.parcours = 'Mathématiques'
  }
}
