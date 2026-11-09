import { egal, randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifsComplexes from './problemesMultiplicatifsComplexes'
/**
 * @author Jean-claude Lhote
 */
export function gelHA(decimal = false): Probleme {
  let nb1Fois = randint(3, 7) * 5 // flacons de gel
  const part1 = randint(1, 4) * 100 // ml par flacon
  const part2 = randint(3, 5) * 1000 // nombre de ml par bidon
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
  const probleme = new ProblemeMultiplicatifsComplexes('gel', data)
  probleme.enonce = `Une pharmacie prépare $${data.nb1Fois}$ flacons de gel hydroalcoolique. Il faut $${data.part1}$ ml de gel pour remplir un flacon.<br>
    Un bidon de gel contient $${data.part2 / 1000}$ litres.<br>
    Combien de bidons de gel faut-il pour remplir les ${data.nb1Fois} flacons ?`
  probleme.correction = `Pour remplir $${data.nb1Fois}$ flacons, il faut $${data.nb1Fois}\\times ${data.part1}=${texNombre(data.nb1Fois * data.part1, 0)}$ ml de gel.<br>
    Un bidon de gel contient $${texNombre(data.part2 / 1000, 0)}$ litres, soit $${texNombre(data.part2, 0)}$ ml.<br>
    Il faut donc $\\dfrac{${texNombre(data.nb1Fois * data.part1, 0)}}{${data.part2}}\\approx ${texNombre((data.nb1Fois * data.part1) / data.part2, 2)}$ bidons.<br>`
  if (!egal(data.nb1Fois * data.part1, nb2Fois * data.part2)) {
    probleme.correction += `Comme on ne peut pas acheter une fraction de bidon, il faut acheter : $${miseEnEvidence(Math.ceil((data.nb1Fois * data.part1) / data.part2))}$ bidons de gel.`
  }
  if (probleme.schema.rightBraces != null) {
    probleme.schema.rightBraces[0].text =
      probleme.schema.rightBraces[0].text.replace('cm', 'ml')
    probleme.schema.rightBraces[1].text =
      probleme.schema.rightBraces[1].text.replace('cm', 'ml')
  }
  return probleme
}
