import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Mireille Bousquet-Mélou'
export const dateDePublication = '17/07/2026'
export const uuid = 'a0794'
export const refs = {
  'fr-fr': ['Portraits-016'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait016 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Mireille Bousquet-Mélou'
    this.photoSrc = '/alea/images/egalite/bousquet-melou.jpg'
    this.photoAlt = 'Portrait de Mireille Bousquet-Mélou'
    this.source = 'Wikimedia Commons — Ivonne Vetter / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Maîtresse des combinaisons'
    this.ceQuElleFait = 'Compte les configurations complexes'
    this.leTrucStyle = 'Aide au pliage des molécules'
    this.parcours = 'Mathématiques'
  }
}
