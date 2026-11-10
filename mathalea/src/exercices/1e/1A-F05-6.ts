import ReadCurveSign from './1A-F05-5'

export const titre =
  "Déterminer graphiquement le signe d'une fonction du second degré"
export const dateDePublication = '06/10/2026'
/**
 * @author Rémi Angot
 */
export const uuid = '80460'
export const refs = { 'fr-fr': ['1A-F05-6'], 'fr-ch': [] }
export const interactifReady = true

export default class ReadParabolaSign extends ReadCurveSign {
  protected quadratic = true
}
