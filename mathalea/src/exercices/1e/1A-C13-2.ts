import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import EquationSecondDegreParticuliere from '../can/1e/can1SD21-07'
export const titre = 'Résoudre une équation $ax^2+bx+c=c$'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can1L09 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '6a9bf'

export const refs = {
  'fr-fr': ['1A-C13-2'],
  'fr-ch': ['11LSQCMFA5-7', '1mQCM-34'],
}
export default class Auto1AC15 extends EquationSecondDegreParticuliere {
  constructor() {
    super()
    this.versionQcm = false
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // Clavier allégé : on ajoute les accolades et le point-virgule
    this.optionsChampTexte = {
      dataKeys: ['\\{#0\\}', ';'],
    }
  }
}
