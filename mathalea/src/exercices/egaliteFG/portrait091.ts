import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Anne Pichon'
export const dateDePublication = '17/07/2026'
export const uuid = '1a27d'
export const refs = {
  'fr-fr': ['Portraits-091'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait091 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Anne Pichon'
    this.photoSrc = '/alea/images/egalite/pichon.jpg'
    this.photoAlt = "Portrait d'Anne Pichon"
    this.source = 'site personnel (I2M, Aix-Marseille Université)'
    this.superPouvoir = 'Exploratrice de formes singulières'
    this.ceQuElleFait = 'Étudie des surfaces géométriques complexes'
    this.leTrucStyle = 'Révèle des propriétés cachées de la géométrie'
    this.parcours = 'Mathématiques'
  }
}
