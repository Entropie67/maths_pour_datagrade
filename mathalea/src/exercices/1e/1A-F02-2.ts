import CalculImageParFonctionAffine from '../can/3e/can3F2-02'
export const titre = 'Calculer une image par une fonction affine'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can3F2-02 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '30/10/2026'

export const uuid = '4d9ea'

export const refs = {
  'fr-fr': ['1A-F02-2'],
  'fr-ch': ['10LCFA3C-9', '10LSFA3C-9', '11CTFA2B-9'],
}
export default class Auto1AF1a extends CalculImageParFonctionAffine {
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
