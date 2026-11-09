import PatternIteratif from './5N5autoC'

export const titre =
  'Identifier des régularités et poursuivre une suite de motifs évolutive'
export const interactifReady = true

export const dateDePublication = '26/06/2026'

/**
 *
 * @author Eric Elter
 */

export const uuid = 'e99f1'

export const refs = {
  'fr-fr': ['5N5autoA', 'CM1N7F', 'CM2N7E'],
  'fr-2016': ['5I13-1'],
  'fr-ch': ['NR'],
}
export default class PatternIteratifPoursuite extends PatternIteratif {
  constructor() {
    super()
    this.sup2 = '1'
    this.nbQuestions = 2
  }
}
