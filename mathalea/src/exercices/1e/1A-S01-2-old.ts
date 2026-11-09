// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid aebb5 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import AutoQ11AGt2026 from '../EAMPremiere/EAM-AGTechno-2026-Q11'
export const uuid = 'aebb5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Interpréter un diagramme circulaire'
export const dateDePublication = '29/06/2026'
/**
 * @author Jean-Claude Lhote
 * Clone de EAM-AGTechno-2026-Q11 version exclusivement aléatoire.
 */
export default class QcmDiagrammeCirculaireOld extends AutoQ11AGt2026 {
  constructor() {
    super()
    // Ce clone reste un QCM : la case « Version QCM » de la question dont il hérite est masquée.
    this.besoinFormulaire3CaseACocher = false
    this.effectifsDuSujet = false
    this.versionAleatoire()
  }
}
