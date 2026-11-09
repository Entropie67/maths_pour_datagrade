import AutoQ11AGt2026 from '../EAMPremiere/EAM-AGTechno-2026-Q11'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
export const dateDeModifImportante = '23/10/2026'

export const uuid = 'f9419'
export const refs = {
  'fr-fr': ['1A-S01-2', '2A-S1-2'],
  'fr-ch': ['10CTFA2A-1', '10LCFA2A-1', '10LSFA2A-1', '9R1FA2B-8', '9R2FA2B-8', '9R3FA2B-8'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = 'Interpréter un diagramme circulaire'
export const dateDePublication = '29/06/2026'
/**
 * @author Jean-Claude Lhote
 * Clone de EAM-AGTechno-2026-Q11 version exclusivement aléatoire.
 */
export default class QcmDiagrammeCirculaire extends AutoQ11AGt2026 {
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Saisie libre par défaut : la case « Version QCM » rétablit le QCM.
    this.sup3 = false
    this.besoinFormulaire3CaseACocher = ['Version QCM', false]
    this.effectifsDuSujet = false
    this.versionAleatoire()
  }
}
