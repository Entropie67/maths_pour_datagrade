import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Sylvia Serfaty'
export const dateDePublication = '17/07/2026'
export const uuid = '47757'
export const refs = {
  'fr-fr': ['Portraits-098'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait098 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Sylvia Serfaty'
    this.photoSrc = '/alea/images/egalite/serfaty.jpg'
    this.photoAlt = 'Portrait de Sylvia Serfaty'
    this.source = 'Olivier Boulanger / New York University'
    this.superPouvoir = 'Architecte des forces'
    this.ceQuElleFait = 'Étudie comment des millions de particules s\'organisent'
    this.leTrucStyle = 'Comprend la supraconductivité'
    this.parcours = 'Mathématiques'
  }
}
