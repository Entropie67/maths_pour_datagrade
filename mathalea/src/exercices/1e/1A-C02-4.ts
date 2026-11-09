import NombreInverse from '../can/2e/can2N3-03'
export const titre = 'Calculer un nombre connaissant son inverse'
export const dateDePublication = '04/08/2025'
export const amcReady = true
export const interactifReady = true

/**
 * Clone de can2N3-03 pour les auto 1er
 * @author Gilles Mora
 */

export const dateDeModifImportante = '29/09/2026'

export const uuid = '2373f'

export const refs = {
  'fr-fr': ['1A-C02-4', '2A-N2-4'],
  'fr-ch': ['10LSNO3B-8', '11CTNO2A-8', '11LCNO2A-8', '1mQCM-14'],
}
export default class Auto1AC2a extends NombreInverse {
  constructor() {
    super()
    // Réponse fraction ou nombre selon le tirage
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
   Il est plus facile de travailler avec une égalité de fractions.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Effectuer d'abord les calculs de fractions dans le membre de droite pour obtenir une égalité de fractions.</li>
    <li>Comparer ensuite les deux membres de l'égalité obtenue.</li>
  </ul>`
    this.versionQcm = false
  }
}
