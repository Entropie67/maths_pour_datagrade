import { egal, randint } from '../../../../modules/outils'
import { egalOuApprox } from '../../../outils/ecritures'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifsComplexes from './problemesMultiplicatifsComplexes'
/**
 * @author Jean-claude Lhote
 */
export function gourdes(decimal = false): Probleme {
  let nb1Fois = randint(13, 20) * 5 // nombre d'élèves
  const part1 = randint(4, 8) * 5 //  cm de carton par gourde
  const part2 = randint(3, 5) * 100 // nombre de cm par rouleau
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
  const probleme = new ProblemeMultiplicatifsComplexes('gourdes', data)
  probleme.enonce = `Une école distribue des gourdes réutilisables aux $${data.nb1Fois}$ élèves. Chaque gourde est emballée dans $${data.part1}\\text{ cm}$ de carton recyclé.<br>
    Un rouleau de carton mesure $${texNombre(data.part2 / 100, 0)}\\text{ m}$.<br>
    Combien de rouleaux de carton faut-il pour emballer les ${data.nb1Fois} gourdes ?`
  probleme.correction = `Pour emballer $${data.nb1Fois}$ gourdes, il faut $${data.nb1Fois}\\times ${data.part1}=${texNombre(data.nb1Fois * data.part1, 0)}\\text{ cm}$ de carton.<br>
    Un rouleau de carton mesure $${texNombre(data.part2 / 100, 0)}\\text{ m}$, soit $${data.part2}\\text{ cm}$.<br>
    Il faut donc $\\dfrac{${texNombre(data.nb1Fois * data.part1, 0)}}{${data.part2}}
    ../${egalOuApprox((data.nb1Fois * data.part1) / data.part2, 2)} ${texNombre((data.nb1Fois * data.part1) / data.part2, 2)}$ rouleaux.<br>`
  if (!egal(data.nb1Fois * data.part1, nb2Fois * data.part2))
    probleme.correction += `Comme on ne peut pas acheter une fraction de rouleau, il faut acheter : $${miseEnEvidence(Math.ceil((data.nb1Fois * data.part1) / data.part2))}$ rouleaux de carton.`
  if (probleme.schema.rightBraces != null) {
    probleme.schema.rightBraces[0].text =
      probleme.schema.rightBraces[0].text.replace('cm', 'ml')
    probleme.schema.rightBraces[1].text =
      probleme.schema.rightBraces[1].text.replace('cm', 'ml')
  }
  return probleme
}
