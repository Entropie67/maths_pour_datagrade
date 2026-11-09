import AnalyserDiagrammeSemiCirculaire from './2S20-14'
export const titre = 'Analyser un diagramme semi-circulaire'
export const dateDePublication = '24/08/2026'
export const dateDeModifImportante = '29/09/2026'

export const uuid = '88534'
export const refs = {
  'fr-fr': ['2A-S1-8', '1A-S01-9'],
  'fr-ch': ['10CTFA2A-5', '10LCFA2A-5', '10LSFA2A-5'],
}
export const interactifReady = true
/**
 * @author Jean-Claude Lhote
 */
export default class AnalyserDiagrammeSemiCirculaireQcm extends AnalyserDiagrammeSemiCirculaire {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.nbQuestions = 1
    this.sup = '4'
    this.besoinFormulaireTexte = false
    this.versionQcmOptions = {
      radio: true,
    }
  }
}
