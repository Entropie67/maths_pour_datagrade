import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompMulGdeQuantite extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nbFois: number }) {
    data = data == null ? { nb1: randint(4, 8), nbFois: randint(2, 5) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      rightBraces: [],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
              length: data.nbFois > 2 ? 3 : 6,
              color: 'lightgray',
            },
          ],
        },
        {
          barres:
            data.nbFois > 2
              ? [
                  {
                    content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
                    length: 3,
                    color: 'lightgray',
                  },
                  {
                    content: '\\ldots',
                    length: 6,
                    color: 'lightgray',
                    options: {
                      justify: 'start',
                    },
                  },
                  {
                    content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
                    length: 3,
                    color: 'lightgray',
                  },
                ]
              : [
                  {
                    content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
                    length: 6,
                    color: 'lightgray',
                  },
                  {
                    content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
                    length: 6,
                    color: 'lightgray',
                  },
                ],
        },
      ],
      bottomBraces: [
        {
          start: 1,
          end: 13,
          text: `$${miseEnEvidence(texNombre(data.nb1 * data.nbFois, 2))}\\text{\\,€}$`,
        },
      ],
    })

    this.enonce = `Un chocolatier vend ses chocolats selon deux types de conditionnement : en sachets à $${texNombre(data.nb1, 2, true)}$ € et en boites qui coûtent $${data.nbFois}$ fois plus cher.
<br>Quel est le prix d'une boite ?`
    this.correction = `Le prix d'une boite est : $${data.nbFois} \\times ${texNombre(data.nb1, 2, true)}$ € = $${miseEnEvidence(texNombre(data.nb1 * data.nbFois, 2, true))}$ €.`
    this.reponse = texNombre(data.nb1 * data.nbFois, 2)
    this.optionsChampTexteMathlive = { texteApres: ' €' }
  }
}
