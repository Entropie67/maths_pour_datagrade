import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Mireille Bossy'
export const dateDePublication = '17/07/2026'
export const uuid = 'baad2'
export const refs = {
  'fr-fr': ['Portraits-014'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait014 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Mireille Bossy'
    this.photoSrc = '/alea/images/egalite/bossy.jpg'
    this.photoAlt = 'Portrait de Mireille Bossy'
    this.source = 'Inria'
    this.superPouvoir = 'Maîtresse des vents numériques'
    this.ceQuElleFait = 'Elle utilise des algorithmes de probabilités pour modéliser le comportement des fluides et des courants d\'air'
    this.leTrucStyle = 'Ses calculs permettent d\'optimiser le placement des éoliennes pour maximiser leur production d\'énergie'
    this.parcours = 'Mathématiques'
  }
}
