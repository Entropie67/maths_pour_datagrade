import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sylvie Benzoni-Gavage'
export const dateDePublication = '17/07/2026'
export const uuid = '7ed8c'
export const refs = {
  'fr-fr': ['Portraits-007'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait007 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sylvie Benzoni-Gavage'
    this.photoSrc = '/alea/images/egalite/benzoni-gavage.jpg'
    this.photoAlt = 'Portrait de Sylvie Benzoni-Gavage'
    this.source = 'Dunod'
    this.superPouvoir = 'Dompteuse d\'ondes de choc'
    this.ceQuElleFait = 'Elle écrit des équations pour comprendre comment la matière passe d\'un état à un autre, notamment lors des changements brutaux'
    this.leTrucStyle = 'Ses recherches permettent de modéliser des phénomènes spectaculaires comme les ondes de choc ou les mascarets'
    this.parcours = 'Mathématiques'
  }
}
