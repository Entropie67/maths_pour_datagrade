import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Nathalie Ayi'
export const dateDePublication = '17/07/2026'
export const uuid = '0cf2e'
export const refs = {
  'fr-fr': ['Portraits-005'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait005 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Nathalie Ayi'
    this.photoSrc = '/alea/images/egalite/ayi.jpg'
    this.photoAlt = 'Portrait de Nathalie Ayi'
    this.source = 'Nathalie Ayi — photographie Marie-Pierre Dieterlé — exposition «\u00a0Mathématiques, informatique… avec elles !\u00a0» — CC BY-ND 4.0 (reproduction autorisée sans modification)'
    this.superPouvoir = 'Architecte des modèles de particules'
    this.ceQuElleFait = 'Elle utilise les mathématiques pour étudier comment des systèmes composés de milliards de particules (comme des gaz ou des plasmas) se comportent à grande échelle'
    this.leTrucStyle = 'Elle aide à comprendre mathématiquement comment le désordre microscopique se transforme en mouvement fluide macroscopique'
    this.parcours = 'Mathématiques'
  }
}
