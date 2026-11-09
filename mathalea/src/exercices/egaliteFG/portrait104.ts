import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Michèle Vergne'
export const dateDePublication = '17/07/2026'
export const uuid = '806bc'
export const refs = {
  'fr-fr': ['Portraits-104'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait104 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Michèle Vergne'
    this.photoSrc = '/alea/images/egalite/vergne.jpg'
    this.photoAlt = 'Portrait de Michèle Vergne'
    this.source = 'Wikimedia Commons — Gert-Martin Greuel / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Exploratrice des symétries'
    this.ceQuElleFait = 'Étudie les liens entre algèbre et géométrie'
    this.leTrucStyle = 'Ses découvertes sont fondamentales pour la physique'
    this.parcours = 'Mathématiques'
  }
}
