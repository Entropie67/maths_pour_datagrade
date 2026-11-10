import { egal, randint } from '../../../../modules/outils'
import { egalOuApprox } from '../../../outils/ecritures'
import { miseEnEvidence } from '../../../outils/embellissements'
import { range1 } from '../../../outils/nombres'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeMultiplicatifsComplexes extends Probleme {
  constructor(
    name: string = '',
    data?: { nb1Fois: number; part1: number; part2: number },
  ) {
    data =
      data == null
        ? {
            nb1Fois: randint(2, 5),
            part1: randint(3, 4) * 10,
            part2: randint(3, 4) * 100,
          }
        : data
    let nb2Fois: number
    do {
      nb2Fois = Math.ceil((data.nb1Fois * data.part1) / data.part2)
      if (nb2Fois < 2) {
        data.nb1Fois++
      } else if (nb2Fois > 6) {
        data.nb1Fois--
      }
    } while (nb2Fois < 2 || nb2Fois > 6)
    super(name, data)
    const longueurs = (nb2Fois: number): [number, number, number] => {
      // la longueur de la flèche si < puis la longueur de chaque part2 puis la longueur de la flèche si =
      if (nb2Fois === 2) return [10, 6, 11]
      if (nb2Fois === 3) return [10, 4, 11]
      if (nb2Fois === 4) return [10, 3, 11]
      if (nb2Fois === 5) return [8, 2, 9]
      if (nb2Fois === 6) return [10, 2, 11]
      return [10, 2, 11]
    }
    const lengths = longueurs(nb2Fois)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end:
            data.nb1Fois * data.part1 === data.part2 * nb2Fois
              ? lengths[2] + 2
              : lengths[0] + 2,
          text: `$${data.nb1Fois}$ fois`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.part1, 0)}$`,
              length: 2,
              color: 'lightgray',
            },
            {
              content: '',
              length:
                (data.nb1Fois * data.part1 === data.part2 * nb2Fois
                  ? lengths[2]
                  : lengths[0]) - 1,
              color: 'lightgray',
              type: 'flèche',
            },
          ],
        },
        {
          barres: range1(nb2Fois).map(() => ({
            content: `$${texNombre(data.part2, 0)}$`,
            length: lengths[1],
            color: 'lightgray',
          })),
        },
      ],
      rightBraces: [
        {
          start: 2,
          end: 3,
          text: `$${texNombre(data.nb1Fois * data.part1, 0)}\\text{ cm}$`,
        },
        {
          start: 3,
          end: 4,
          text: `$${texNombre(data.part2 * nb2Fois, 0)}\\text{ cm}$`,
        },
      ],
    })

    this.enonce = `La documentaliste du collège doit couvrir $${data.nb1Fois}$ livres. Il faut $${data.part1}\\text{ cm}$ de papier kraft pour couvrir un livre.<br>
    Un rouleau de papier kraft mesure $${data.part2}\\text{ m}$.<br>
    Combien de rouleaux de papier kraft faut-il pour couvrir les ${data.nb1Fois} livres ?`
    this.correction = `Pour couvrir ${data.nb1Fois} livres, il en faut $${data.nb1Fois}\\times ${data.part1}$, soit $${data.nb1Fois * data.part1}\\text{ cm}$ de papier kraft.<br>
    Un rouleau de papier kraft mesure $${data.part2}\\text{ m}$.<br>
    Donc, il faut $\\dfrac{${texNombre(data.nb1Fois * data.part1, 0)}}{${texNombre(data.part2, 0)}}${egalOuApprox((data.nb1Fois * data.part1) / data.part2, 2)}${texNombre((data.nb1Fois * data.part1) / data.part2, 2)}$ rouleaux de papier kraft.<br>`
    if (!egal(data.nb1Fois * data.part1, nb2Fois * data.part2)) {
      this.correction += `Comme on ne peut pas acheter une fraction de rouleau, il faut ${miseEnEvidence(Math.ceil((data.nb1Fois * data.part1) / data.part2))} rouleaux de papier kraft.`
    }
    this.reponse = texNombre(
      Math.ceil((data.nb1Fois * data.part1) / data.part2),
      0,
    )
  }
}
