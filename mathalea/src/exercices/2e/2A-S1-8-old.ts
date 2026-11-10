// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid ac7f3 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import AnalyserDiagrammeSemiCirculaire from './2S20-14'
export const titre = 'Analyser un diagramme semi-circulaire'
export const dateDePublication = '24/08/2026'
export const uuid = 'ac7f3'
export const refs = {
  'fr-fr': ['3AutoS03-3'],
  'fr-ch': ['NR'],
}
export const interactifReady = true
/**
 * @author Jean-Claude Lhote
 */
export default class AnalyserDiagrammeSemiCirculaireQcmOld extends AnalyserDiagrammeSemiCirculaire {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.versionQcm = true
    this.nbQuestions = 1
    this.sup = '4'
    this.besoinFormulaireTexte = false
    this.versionQcmOptions = {
      radio: true,
    }
  }
}
