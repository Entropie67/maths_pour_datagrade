import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Karine Chemla'
export const dateDePublication = '17/07/2026'
export const uuid = '8bc9f'
export const refs = {
  'fr-fr': ['Portraits-023'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait023 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Karine Chemla'
    this.photoSrc = '/alea/images/egalite/chemla.jpg'
    this.photoAlt = 'Portrait de Karine Chemla'
    this.source = 'Wikimedia Commons — Renate Schmid / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Exploratrice des mathématiques anciennes'
    this.ceQuElleFait = 'Analyse les textes scientifiques chinois'
    this.leTrucStyle = 'A prouvé l\'existence d\'algorithmes dès l\'antiquité'
    this.parcours = 'Mathématiques'
  }
}
