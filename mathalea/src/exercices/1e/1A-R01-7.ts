import calculAvecPourcentage from '../can/2e/can2I1-03'
export const titre = "Calculer un effectif à partir d'un pourcentage"
export const dateDePublication = '23/03/2026'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2I1-03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '6ffd6'

export const refs = {
  'fr-fr': ['1A-R01-7', '2A-R1-7'],
  'fr-ch': ['10CTFA1C-11', '10LCFA1C-11', '10LSFA1C-11'],
}
export default class Auto1AR1g extends calculAvecPourcentage {
  constructor() {
    super()
    this.versionQcm = false
  }
}
