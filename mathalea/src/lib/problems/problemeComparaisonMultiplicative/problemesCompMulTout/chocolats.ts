import { randint } from '../../../../modules/outils'
import type Probleme from '../../Probleme'
import ProblemeCompMulTout from './problemeCompMulTout'
/**
 * @author Jean-claude Lhote
 */
export function chocolats6(decimal = false): Probleme {
  const nbFois = randint(4, 6)
  const nb1 = decimal ? randint(81, 159, [100, 120, 140]) / 20 : randint(4, 8)
  const data = { nbFois, nb1 }
  const probleme = new ProblemeCompMulTout('chocolats6', data)
  return probleme
}
