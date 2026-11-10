// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 1c981 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import AutoQ4AGt2026 from '../EAMPremiere/EAM-AGTechno-2026-Q4'

export const uuid = '1c981'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Convertir des degrés Celsius en degrés Fahrenheit'
export const dateDePublication = '06/08/2026'

/**
 * @author Jean-Claude Lhote, clone de Stéphane Guyon
 * Clone de EAM-AGTechno-2026-Q4 en version exclusivement aléatoire.
 */
export default class ConvertirCelsiusEnFahrenheitOld extends AutoQ4AGt2026 {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    // Cette archive reste un QCM : la case « Version QCM » de la question dont elle hérite est masquée.
    this.besoinFormulaire3CaseACocher = false
    this.versionAleatoire()
  }
}
