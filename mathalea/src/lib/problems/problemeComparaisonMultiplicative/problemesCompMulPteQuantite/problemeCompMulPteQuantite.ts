import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'

/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompMulPteQuantite extends Probleme {
  constructor(name: string = '', data?: { nb2: number; nbFois: number }) {
    data = data == null ? { nb2: randint(4, 8), nbFois: randint(2, 5) } : data
    const nb1 = data.nb2 / data.nbFois
    super(name, data)
    this.schema = new SchemaEnBoite({
      bottomBraces: [
        {
          start: 1,
          end: 13,
          text: `$${texNombre(data.nbFois, 0)}$ sachets`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.nb2, 2)}\\text{\\,€}$`,
              length: 12,
              color: 'lightgray',
            },
          ],
        },
        {
          barres:
            data.nbFois > 2
              ? [
                  {
                    content: `$${miseEnEvidence(texNombre(nb1, 2))}$`,
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
                    content: `$${miseEnEvidence(texNombre(nb1, 2))}$`,
                    length: 3,
                    color: 'lightgray',
                  },
                ]
              : [
                  {
                    content: `$${miseEnEvidence(texNombre(nb1, 2))}$`,
                    length: 6,
                    color: 'lightgray',
                  },
                  {
                    content: `$${miseEnEvidence(texNombre(nb1, 2))}$`,
                    length: 6,
                    color: 'lightgray',
                  },
                ],
        },
      ],
    })

    this.enonce = `Un chocolatier vend ses chocolats selon deux types de conditionnement : en sachets ou en boites qui coûtent $${texNombre(data.nbFois, 0)}$ fois plus cher qu'un sachet. Le prix des boites est de $${texNombre(data.nb2, 2, true)}$ €.
<br>Quel est le prix d'un sachet ?`
    this.correction = `Le prix d'un sachet est : $${texNombre(data.nb2, 2, true)}$ € $\\div ${texNombre(data.nbFois, 0)}=${miseEnEvidence(texNombre(nb1, 2, true))}$ €.`
    this.reponse = texNombre(nb1, 2)
    this.optionsChampTexteMathlive = { texteApres: ' €' }
  }
}
