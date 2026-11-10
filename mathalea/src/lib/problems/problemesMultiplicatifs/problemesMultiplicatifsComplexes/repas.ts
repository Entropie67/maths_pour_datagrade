import { egal, randint } from '../../../../modules/outils'
import { egalOuApprox } from '../../../outils/ecritures'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifsComplexes from './problemesMultiplicatifsComplexes'
/**
 * @author Jean-claude Lhote
 */
export function repas(decimal = false): Probleme {
  let nb1Fois = randint(13, 20) * 5 // nombre de repas
  const part1 = randint(4, 8) * 50 //  g de légumes/repas
  const part2 = randint(3, 5) * 1000 // g de légumes par sac
  let nb2Fois: number
  do {
    nb2Fois = Math.ceil((nb1Fois * part1) / part2)
    if (nb2Fois < 2) {
      nb1Fois++
    } else if (nb2Fois > 6) {
      nb1Fois--
    }
  } while (nb2Fois < 2 || nb2Fois > 6)
  const data = { nb1Fois, part1, part2 }
  const probleme = new ProblemeMultiplicatifsComplexes('repas', data)
  probleme.enonce = `Un service de cantine prépare $${data.nb1Fois}$ repas équilibrés. Chaque repas contient $${data.part1}$ grammes de légumes frais.<br>
    Un sac de légumes frais pèse $${texNombre(data.part2 / 1000, 0)}$ kg.<br>
    Combien de sacs de légumes frais faut-il pour préparer les ${data.nb1Fois} repas ?`
  probleme.correction = `Pour préparer les ${data.nb1Fois} repas, il faut $${nb1Fois}\\times ${data.part1}=${texNombre(data.nb1Fois * data.part1, 0)}$, soit $${texNombre(data.nb1Fois * data.part1, 0)}$ g de légumes frais.<br>
  Chaque sac contient $${texNombre(data.part2 / 1000, 0)}$ kg, soit $${texNombre(data.part2, 0)}$ g.<br>
  Il faut donc $\\dfrac{${texNombre(data.nb1Fois * data.part1, 0)}}{${texNombre(data.part2, 0)}}${egalOuApprox((data.nb1Fois * data.part1) / data.part2, 2)}${texNombre((data.nb1Fois * data.part1) / data.part2, 2)}$ sacs.<br>`
  if (!egal(data.nb1Fois * data.part1, nb2Fois * data.part2)) {
    probleme.correction += `Comme on ne peut pas acheter une fraction de sac, il faut ${miseEnEvidence(Math.ceil((data.nb1Fois * data.part1) / data.part2))} sacs de légumes frais.`
  }
  if (probleme.schema.rightBraces != null) {
    probleme.schema.rightBraces[0].text =
      probleme.schema.rightBraces[0].text.replace('cm', 'ml')
    probleme.schema.rightBraces[1].text =
      probleme.schema.rightBraces[1].text.replace('cm', 'ml')
  }
  return probleme
}
