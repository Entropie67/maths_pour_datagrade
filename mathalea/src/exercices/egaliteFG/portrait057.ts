import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Christel Heydemann'
export const dateDePublication = '17/07/2026'
export const uuid = 'e5833'
export const refs = {
  'fr-fr': ['Portraits-057'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait057 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Christel Heydemann'
    this.photoSrc = '/alea/images/egalite/heydemann.jpg'
    this.photoAlt = 'Portrait de Christel Heydemann'
    this.source = 'Jérémy Barande / École polytechnique — CC BY-SA 2.0'
    this.superPouvoir = 'Connecteuse de millions'
    this.ceQuElleFait = 'Dirige Orange et ses réseaux'
    this.leTrucStyle = 'Garantit la 5G pour des continents entiers'
    this.parcours = 'Mathématiques'
  }
}
