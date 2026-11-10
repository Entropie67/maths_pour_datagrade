import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sylvie Méléard'
export const dateDePublication = '17/07/2026'
export const uuid = '86fb3'
export const refs = {
  'fr-fr': ['Portraits-077'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait077 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sylvie Méléard'
    this.photoSrc = '/alea/images/egalite/meleard.jpg'
    this.photoAlt = 'Portrait de Sylvie Méléard'
    this.source = 'Jérémy Barande / École polytechnique — CC BY-SA 2.0'
    this.superPouvoir = 'Mathématicienne du vivant'
    this.ceQuElleFait = 'Modélise l\'évolution des espèces'
    this.leTrucStyle = 'Anticipe l\'impact de la pollution'
    this.parcours = 'Mathématiques'
  }
}
