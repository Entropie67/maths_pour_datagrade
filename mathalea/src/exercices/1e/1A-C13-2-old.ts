// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 84f02 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import EquationSecondDegreParticuliere from '../can/1e/can1SD21-07'
export const titre = 'Résoudre une équation $ax^2+bx+c=c$'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

/**
 * Clone de can1L09 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '84f02'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Auto1AC15Old extends EquationSecondDegreParticuliere {
  constructor() {
    super()
    this.versionQcm = true
  }
}
