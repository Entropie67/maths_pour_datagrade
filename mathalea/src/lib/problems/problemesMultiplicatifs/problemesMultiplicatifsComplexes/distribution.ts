import { randint } from '../../../../modules/outils'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { premiereLettreEnMajuscule } from '../../../outils/outilString'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifsComplexes from './problemesMultiplicatifsComplexes'
/**
 * @author Jean-claude Lhote
 */
export function distribution(decimal = false): Probleme {
  const nb1Fois = 20 + randint(3, 7) // nombre d'éléves
  const part1 = randint(3, 7) // nombre de sucreries par élève
  const part2 = randint(3, 5) * 10 // nombre d'élément par paquet
  const data = { nb1Fois, part1, part2 }
  const probleme = new ProblemeMultiplicatifsComplexes('distribution', data)
  const personne = choice([
    "l'enseignant",
    "l'enseignante",
    'le professeur',
    'la professeure',
    'le prof de maths',
    'la maîtresse',
  ])
  const pronom = personne.endsWith('e') ? 'elle' : 'il'
  const sucrerie = choice([
    'chocolats',
    'bonbons',
    'friandises',
    'gâteaux',
    'caramels',
    'sucettes',
    'barres chocolatées',
    'barres de céréales',
    'pâtes de fruits',
  ])
  probleme.enonce =
    `Dans une classe, il y a $${nb1Fois}$ élèves. ${premiereLettreEnMajuscule(personne)} distribue à chaque élève $${part1}$ sucreries. Les sucreries sont achétées par paquets en contenant chacun $${part2}$.<br>
Combien de paquets de sucreries ${personne} doit-${pronom} acheter pour contenter tous les élèves ?`.replaceAll(
      'sucreries',
      sucrerie,
    )
  probleme.correction =
    `Pour contenter $${nb1Fois}$ élèves, ${personne} devra distribuer $${nb1Fois}\\times ${part1}=${nb1Fois * part1}$ sucreries.<br>
Pour cela, ${pronom} doit acheter $\\dfrac{${nb1Fois * part1}}{ ${part2}}\\approx ${texNombre((nb1Fois * part1) / part2, 1)}$ paquets.<br>
Comme ${pronom} ne peut pas acheter une fraction de paquet, ${pronom} doit acheter : $${miseEnEvidence(Math.ceil((nb1Fois * part1) / part2))}$ paquets de sucreries.`.replaceAll(
      'sucreries',
      sucrerie,
    )
  if (probleme.schema.rightBraces != null) {
    probleme.schema.rightBraces[0].text =
      probleme.schema.rightBraces[0].text.replace('cm', sucrerie)
    probleme.schema.rightBraces[1].text =
      probleme.schema.rightBraces[1].text.replace('cm', sucrerie)
  }
  return probleme
}
