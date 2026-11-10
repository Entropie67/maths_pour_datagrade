import { randint } from '../../../../modules/outils'
import type Probleme from '../../Probleme'
import ProblemeCompMulGdeQuantite from './problemeCompMulGdeQuantite'
/**
 * @author Jean-claude Lhote
 */
export function chocolats3(decimal = false): Probleme {
  const nb1 = decimal ? randint(81, 159, [100, 120, 140]) / 20 : randint(4, 8)
  const nbFois = randint(2, 5)
  const data = { nbFois, nb1 }
  const probleme = new ProblemeCompMulGdeQuantite('chocolats3', data)
  return probleme
}
