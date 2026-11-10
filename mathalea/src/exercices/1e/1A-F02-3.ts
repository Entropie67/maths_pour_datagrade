import CalculImageParFonctionAffineFraction from '../can/3e/can3F2-06'
export const titre = "Calculer l'image d'une fraction par une fonction affine"
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3F2-06 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '10e03'

export const refs = {
  'fr-fr': ['1A-F02-3'],
  'fr-ch': ['10LCQCMFA2-3', '10LSQCMFA2-3', '11CTQCMFA2-3', '11LCQCMFA2A-3', '11LSQCMFA2A-3'],
}
export default class Auto1AF1b extends CalculImageParFonctionAffineFraction {
  nouvelleVersion() {
    super.nouvelleVersion()
    if (this.interactif) {
      this.question = (this.question ?? '').replace(
        /Quelle est l\x27image de \$(.*?)\$ par la fonction \$(.*?)\$\s*\?/g,
        (_, x, f) => `L'image de $${x}$ par la fonction $${f}$ est `,
      )
      if (!this.versionQcm)
        this.optionsChampTexte = { texteAvant: '', texteApres: '.' }
    }
  }

  constructor() {
    super()
    this.versionQcm = false
  }
}
