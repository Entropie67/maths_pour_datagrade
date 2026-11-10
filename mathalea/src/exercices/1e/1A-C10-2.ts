import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import EquationsCarree from '../can/2e/can2L2-05'
export const titre = 'Résoudre une équation du type $(x+a)^2=k$'
export const dateDePublication = '27/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L14 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'ad00a'

export const refs = {
  'fr-fr': ['1A-C10-2', '2A-C3-2'],
  'fr-ch': ['11LSQCMFA5-2', '1mQCM-26'],
}
export default class Auto1AC10b extends EquationsCarree {
  constructor() {
    super()
    this.versionQcm = false
    this.versionAutomatisme = true
    this.formatChampTexte = KeyboardType.clavierDeBase
    // Clavier allégé : accolades, point-virgule, racine carrée et ensemble vide
    this.optionsChampTexte = {
      dataKeys: ['\\{#0\\}', ';', 'SQRT', '\\emptyset'],
    }
  }
}
