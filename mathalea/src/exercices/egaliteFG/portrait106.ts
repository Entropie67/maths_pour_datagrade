import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Claire Voisin'
export const dateDePublication = '17/07/2026'
export const uuid = 'b390a'
export const refs = {
  'fr-fr': ['Portraits-106'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait106 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Claire Voisin'
    this.photoSrc = '/alea/images/egalite/voisin.jpg'
    this.photoAlt = 'Portrait de Claire Voisin'
    this.source = 'Wikimedia Commons — Gert-Martin Greuel / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Maîtresse des formes abstraites'
    this.ceQuElleFait = 'Experte en géométrie algébrique'
    this.leTrucStyle = 'Médaille d\'or du CNRS, référence mondiale'
    this.parcours = 'Mathématiques'
  }
}
