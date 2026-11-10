import ConstructionsParallelogrammesParticuliers from './ConstructionsParallelogrammesParticuliers'

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre =
  'Construire un parallélogramme particulier et auto-vérification'
export const dateDePublication = '25/06/2026'

/**
 * Tracer des parallélogrammes et auto-vérificatioon
 *
 * @author Eric Elter
 */

export const uuid = '3d1bd'

export const refs = {
  'fr-fr': ['5G6F-2'],
  'fr-2016': ['5G41-5'],
  'fr-ch': ['NR'],
}
export default class ConstruireParallélogrammesCaracteristiques extends ConstructionsParallelogrammesParticuliers {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de parallélogrammes',
      [
        'Nombres séparés par des tirets  :',
        '1 : Rectangle (2 côtés et une diagonale donnés) ',
        '2 : Losange (2 côtés et une diagonale donnés) ',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
    this.nbQuestions = 2
    this.exo = '5G6F-2'
    this.correctionDetaillee = true
  }
}
