import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Corinne Cipière'
export const dateDePublication = '17/07/2026'
export const uuid = '4ea32'
export const refs = {
  'fr-fr': ['Portraits-025'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait025 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Corinne Cipière'
    this.photoSrc = '/alea/images/egalite/cipiere.jpg'
    this.photoAlt = 'Portrait de Corinne Cipière'
    this.source = 'Groupe BPCE'
    this.superPouvoir = 'Prévisionniste de gros pépins'
    this.ceQuElleFait = 'Modélise les catastrophes pour assurances'
    this.leTrucStyle = 'Empêche la ruine des entreprises cyber-attaquées'
    this.parcours = 'Mathématiques'
  }
}
