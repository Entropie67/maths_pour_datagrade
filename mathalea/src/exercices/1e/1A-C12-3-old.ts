// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 8e0cd continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import AutoQ7AGns2026 from '../EAMPremiere/EAM-AGnonSpe-2026-Q7'

export const uuid = '8e0cd'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Effectuer une application numérique'
export const dateDePublication = '06/08/2026'

/**
 * @author Gilles Mora , clone de Stéphane Guyon
 * Clone de EAM-AGnonSpe-2026-Q7 en version exclusivement aléatoire.
 */
export default class CalculerUneResistanceOld extends AutoQ7AGns2026 {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    // Cette archive reste un QCM : la case « Version QCM » de la question dont elle hérite est masquée.
    this.besoinFormulaire3CaseACocher = false
    this.versionAleatoire()
  }
}
