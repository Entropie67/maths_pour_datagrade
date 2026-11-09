import { randint } from '../../../../modules/outils'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifParts from '../problemesMultiplicatifsPart/problemesMultiplicatifsPart'
/**
 * @author Jean-claude Lhote
 */
export function centreLoisir(decimal = false): Probleme {
  const nbFois = randint(5, 12)
  const quotité = randint(10, 40)
  const data = { nbFois, quotité }
  const probleme = new ProblemeMultiplicatifParts('centreLoisir', data)
  return probleme
}
