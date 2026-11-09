import CalculImageSecondDegre from '../can/2e/can2F11-02'
export const titre = 'Calculer une image avec une fonction'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2F11-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '98ca2'

export const refs = {
  'fr-fr': ['1A-F02-1'],
  'fr-ch': ['10LCFA3C-8', '10LSFA3C-8', '11CTFA2B-8', '1mQCM-38'],
}
export default class Auto1AF1 extends CalculImageSecondDegre {
  nouvelleVersion() {
    super.nouvelleVersion()
    if (this.interactif) {
      this.question = (this.question ?? '').replace(
        /Calculer \$f\((.*?)\)\$\./g,
        (_, x) => `L'image de $${x}$ par la fonction $f$ est égale à `,
      )
      if (!this.versionQcm) this.optionsChampTexte = { texteApres: '.' }
    }
  }

  constructor() {
    super()
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.versionQcm = false
  }
}
