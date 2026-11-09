import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { touchesDeLaReponse } from '../../lib/interactif/claviers/touchesDeLaReponse'
import ExprimerVariable from '../can/2e/can2L12-01'
export const titre = "Exprimer une variable en fonction d'une autre"
export const dateDePublication = '26/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L11 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '4541f'

export const refs = {
  'fr-fr': ['1A-C11-1', '2A-C4-1'],
  'fr-ch': ['11LCFA4D-4', '11LSFA4D-4', '1mCL1-15', '1mQCM-30'],
}
export default class Auto1AC13a extends ExprimerVariable {
  constructor() {
    super()
    this.versionQcm = false
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    super.nouvelleVersion()
    // Clavier allégé : la lettre à exprimer et celles de la réponse
    const lettreAExprimer = String(this.question).match(
      /Exprimer\s+\$([a-zA-Z])\$/,
    )?.[1]
    const touches = touchesDeLaReponse(this.reponse)
    this.optionsChampTexte = {
      ...this.optionsChampTexte,
      dataKeys:
        lettreAExprimer == null || touches.includes(lettreAExprimer)
          ? touches
          : [lettreAExprimer, ...touches],
    }
  }
}
