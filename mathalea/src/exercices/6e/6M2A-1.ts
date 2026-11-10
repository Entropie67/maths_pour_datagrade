/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/view.capytale.review.1.test.ts ⚠️
 */

import ExerciceConversionsAires from './_Exercice_conversions_aires'
export const titre = 'Convertir des aires'
export const amcReady = true
export const amcType = 'qcmMono'
export const interactifReady = true

export const dateDeModifImportante = '30/04/2023'
/**
 * @author Rémi Angot
 *
 */
export const uuid = '6225c'

export const refs = {
  'fr-fr': ['6M2A-1', '3AutoM03', '6AutoA2'],
  'fr-2016': ['6M23'],
  'fr-ch': ['9R1GM4C-2', '9R2GM4C-2', '9R3GM4C-2', 'PRQMG04B-2'],
}
export default class Reglages6M2A1 extends ExerciceConversionsAires {
  constructor() {
    super()
    this.interactif = false
    this.sup = 3
  }
}
