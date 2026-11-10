import { randint } from '../../../../modules/outils'
import type Probleme from '../../Probleme'
import ProblemeCompMulPteQuantite from './problemeCompMulPteQuantite'
/**
 * @author Jean-claude Lhote
 */
export function chocolats4(decimal = false): Probleme {
  const nbFois = randint(2, 5)

  const nb2 =
    (decimal ? randint(81, 159, [100, 120, 140]) / 20 : randint(4, 8)) * nbFois
  const data = { nbFois, nb2 }
  const probleme = new ProblemeCompMulPteQuantite('chocolats4', data)
  return probleme
}
