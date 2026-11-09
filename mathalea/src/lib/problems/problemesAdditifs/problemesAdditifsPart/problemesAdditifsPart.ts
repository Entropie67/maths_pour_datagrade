import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeAdditifPart extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nb2: number }) {
    data = data == null ? { nb1: randint(2, 25), nb2: randint(2, 25) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 11,
          text: 'Total',
        },
      ],
      bottomBraces: [],
      rightBraces: [],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.nb1 + data.nb2, 2)}$`,
              length: 10,
              color: 'lightgray',
            },
          ],
        },
        {
          barres: [
            {
              content: `$${texNombre(data.nb1, 2)}$`,
              length: 5,
              color: 'lightgray',
            },
            {
              content: `$${miseEnEvidence(texNombre(data.nb2, 2))}$`,
              length: 5,
              color: 'lightgray',
            },
          ],
        },
      ],
    })
    this.enonce = `On achète deux produits : un à $${data.nb1}$ € et un autre à $${data.nb2}$ €.
<br>Combien cela coûte-t-il au total ?`
    this.correction = `Le coût total est de $${miseEnEvidence(data.nb1 + data.nb2)}$ €.`
    this.reponse = texNombre(data.nb1 + data.nb2, 2)
  }
}
