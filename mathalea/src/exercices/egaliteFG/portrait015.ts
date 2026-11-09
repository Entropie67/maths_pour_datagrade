import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Muriel Boulakia'
export const dateDePublication = '17/07/2026'
export const uuid = 'b4411'
export const refs = {
  'fr-fr': ['Portraits-015'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait015 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Muriel Boulakia'
    this.photoSrc = '/alea/images/egalite/boulakia.jpg'
    this.photoAlt = 'Portrait de Muriel Boulakia'
    this.source = 'Christophe Peus / Université Paris-Saclay'
    this.superPouvoir = 'Traductrice du corps en équations'
    this.ceQuElleFait = 'Modélise les organes pour la médecine'
    this.leTrucStyle = 'Aide à évaluer les traitements virtuellement'
    this.parcours = 'Mathématiques'
  }
}
