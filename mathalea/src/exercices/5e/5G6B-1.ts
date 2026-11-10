import TracerQuadrilatèresParticuliers from '../CM2/CM2G3D-2'

export const interactifReady = false
export const titre = 'Construire des parallélogrammes et auto-vérification'
export const dateDePublication = '25/06/2026'

/**
 * Tracer des parallélogrammes et auto-vérificatioon
 *
 * @author Eric Elter
 */

export const uuid = '72e52'

export const refs = {
  'fr-fr': ['5G6B-1'],
  'fr-2016': ['5G41-3'],
  'fr-ch': ['NR'],
}
export default class ConstruireParallélogrammes extends TracerQuadrilatèresParticuliers {
  constructor() {
    super()
    this.sup = '7'
    this.nbQuestions = 1
    this.besoinFormulaireTexte = false
  }
}
