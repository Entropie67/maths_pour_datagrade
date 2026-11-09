import PortraitExercice from './_PortraitExercice'

export const titre = 'Portrait : Monique Jeanblanc'
export const dateDePublication = '17/07/2026'
export const uuid = '27ff3'
export const refs = {
  'fr-fr': ['Portraits-062'],
  'fr-ch': [],
}

export const tags = ['égalité filles-garçons']

/**
 * @author Femmes et numérique / mathématiques - fiches "super-pouvoirs"
 */
export default class Portrait062 extends PortraitExercice {
  constructor() {
    super()
    this.nom = 'Monique Jeanblanc'
    this.photoSrc = '/alea/images/egalite/jeanblanc.jpg'
    this.photoAlt = 'Portrait de Monique Jeanblanc'
    this.source = 'Renate Schmid / MFO — CC BY-SA 2.0 DE'
    this.superPouvoir = 'Calculatrice du risque de faillite'
    this.ceQuElleFait = 'Modélise le défaut de paiement'
    this.leTrucStyle = 'Évite l\'effondrement des banques'
    this.parcours = 'Mathématiques'
  }
}
