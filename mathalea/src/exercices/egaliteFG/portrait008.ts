import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Karine Berger'
export const dateDePublication = '17/07/2026'
export const uuid = '151fa'
export const refs = {
  'fr-fr': ['Portraits-008'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait008 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Karine Berger'
    this.photoSrc = '/alea/images/egalite/berger.jpg'
    this.photoAlt = 'Portrait de Karine Berger'
    this.source = 'Berger — CC BY 2.0'
    this.superPouvoir = 'Pilote de l\'économie en chiffres'
    this.ceQuElleFait = 'Analyse les prévisions économiques'
    this.leTrucStyle = 'Modélise les faillites pour sauver les entreprises'
    this.parcours = 'Mathématiques'
  }
}
