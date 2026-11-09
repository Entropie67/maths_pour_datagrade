import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Aliénor Grandclément'
export const dateDePublication = '17/07/2026'
export const uuid = '9f9f5'
export const refs = {
  'fr-fr': ['Portraits-050'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait050 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Aliénor Grandclément'
    this.photoSrc = '/alea/images/egalite/grandclement.jpg'
    this.photoAlt = "Portrait d'Aliénor Grandclément"
    this.source = 'photo fournie'
    this.superPouvoir = 'Transformeuse de données'
    this.ceQuElleFait = 'Analyse des mesures industrielles'
    this.leTrucStyle = 'Automatise la surveillance des barrages'
    this.parcours = 'Mathématiques'
  }
}
