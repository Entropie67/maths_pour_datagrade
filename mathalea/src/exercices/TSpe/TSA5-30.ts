import DomaineDefFnLog from '../TT/TTE-11'
export const titre =
  "Déterminer le domaine de définition d'une fonction logarithme"
export const dateDePublication = '04/08/2025'
export const interactifReady = true

/**
 * Clone de CanTspeE01 pour les auto 1er
 * @author Stéphane Guyon
 */

export const uuid = 'a3016'

export const refs = {
  'fr-fr': ['TSA5-30', 'TCA4-30'],
  'fr-ch': [],
}
export default class DomaineDefFnLogLn extends DomaineDefFnLog {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup2 = 2
  }
}
