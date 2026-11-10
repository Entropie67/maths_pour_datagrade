import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { touchesDeLaReponse } from '../../lib/interactif/claviers/touchesDeLaReponse'
import ExprimerEnFonction from '../can/2e/can2L12-02'
export const titre =
  'Exprimer une variable en fonction des autres (formules avec sommes/produits/quotients)'
export const dateDePublication = '23/07/2025'
export const dateDeModifImportante = '29/09/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L19 pour les auto 1er
 * @author Gilles Mora
 */

export const uuid = '21338'

export const refs = {
  'fr-fr': ['1A-C11-4', '2A-C4-4'],
  'fr-ch': ['11LCFA4D-7', '11LSFA4D-7'],
}
export default class Auto1AC13 extends ExprimerEnFonction {
  constructor() {
    super()
    this.versionQcm = false
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    super.nouvelleVersion()
    // Clavier allégé : la lettre à exprimer (écrite devant le champ, « X = »)
    // et les lettres de la réponse (et la racine carrée si besoin)
    const lettreAExprimer = String(
      (this.optionsChampTexte as { texteAvant?: string } | undefined)
        ?.texteAvant ?? '',
    ).match(/\$(\\?[a-zA-Z]+)=\$/)?.[1]
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
