import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import SolutionInequation from '../can/2e/can2L3-01'
export const titre = 'Résoudre une inéquation $ax+b>0$'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L05 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '1282d'

export const refs = {
  'fr-fr': ['1A-C10-13', '2A-C3-9'],
  'fr-ch': [],
}
export default class Auto1AC12 extends SolutionInequation {
  constructor() {
    super()
    this.versionQcm = false
    this.versionAutomatisme = true
    this.formatChampTexte = KeyboardType.clavierDeBase
    // Clavier allégé : crochets, point-virgule et infini
    this.optionsChampTexte = {
      dataKeys: ['[', ']', ';', '\\infty'],
    }
  }
}
