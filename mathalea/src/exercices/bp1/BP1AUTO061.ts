import CalculerCoordonneesPointsCourbe from '../2e/2F30-2'
export const titre =
  "Calculer l'ordonnée d'un point d'une courbe connaissant son abscisse"
export const interactifReady = true

export const dateDePublication = '30/07/2026'

/**
 * Clone de 2F20-2 pour le Bac Pro Première.
 * Se limiter au calcul de l'ordonnée.
 */

export const uuid = '580b2'

export const refs = {
  'fr-fr': ['BP1AUTO061'],
  'fr-ch': ['NR'],
}
export default class ExerciceBP1AUTO061 extends CalculerCoordonneesPointsCourbe {
  constructor() {
    super()
    this.besoinFormulaire3Texte = false
    this.sup3 = '1'
  }
}
