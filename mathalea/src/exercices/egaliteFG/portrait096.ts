import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Laure Saint-Raymond'
export const dateDePublication = '17/07/2026'
export const uuid = '0e89e'
export const refs = {
  'fr-fr': ['Portraits-096'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait096 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Laure Saint-Raymond'
    this.photoSrc = '/alea/images/egalite/saint-raymond.png'
    this.photoAlt = 'Portrait de Laure Saint-Raymond'
    this.source = 'Photonquantique / MyScienceWork — CC BY 2.0'
    this.superPouvoir = 'Traductrice des océans'
    this.ceQuElleFait = 'Modélise les courants marins'
    this.leTrucStyle = 'Aide à prédire les phénomènes climatiques extrêmes'
    this.parcours = 'Mathématiques'
  }
}
