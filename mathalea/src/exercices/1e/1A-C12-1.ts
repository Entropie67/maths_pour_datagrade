import CalculExpAvecValeurs from '../can/2e/can2L10-01'
export const titre = 'Calculer une expression avec des valeurs'
export const dateDePublication = '23/07/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2L10-01 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = 'cd2b3'

export const refs = {
  'fr-fr': ['1A-C12-1', '2A-C5-1'],
  'fr-ch': ['10CTFA4B-10', '10LCFA4B-10', '10LSFA4B-10', '9R2FA3A-9', '9R3FA3A-9', '11CTFA3B-10', '11LCFA3B-10', '11LSFA3B-10'],
}
export default class Auto1AC14 extends CalculExpAvecValeurs {
  constructor() {
    super()
    this.versionQcm = false
  }

  nouvelleVersion() {
    super.nouvelleVersion()
    this.question = (this.question ?? '').replace(
      /Lorsque (.*?),\s*(?:<br>)?\s*la valeur de \$F\$ est égale à :\s*(?:\$\\ldots\$)?/s,
      (_match: string, valeurs: string) =>
        `Calculer la valeur de $F$ lorsque ${valeurs}.`,
    )
    this.optionsChampTexte = { texteAvant: '<br>$F=$' }
  }
}
