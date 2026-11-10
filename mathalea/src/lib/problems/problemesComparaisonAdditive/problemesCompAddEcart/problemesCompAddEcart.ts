import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompAddEcart extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nb2: number }) {
    data = data == null ? { nb1: randint(2, 25), nb2: randint(2, 25) } : data
    super(name, data)
    this.schema =
      data.nb1 > data.nb2
        ? new SchemaEnBoite({
            rightBraces: [],
            lignes: [
              {
                barres: [
                  {
                    content: `$${texNombre(data.nb1, 2)}$`,
                    length: 10,
                    color: 'lightgray',
                  },
                ],
              },
              {
                barres: [
                  {
                    content: `$${texNombre(data.nb2, 2)}$`,
                    length: 7,
                    color: 'lightgray',
                  },
                  {
                    content: '?',
                    length: 3,
                    color: 'lightgray',
                  },
                ],
              },
            ],
          })
        : new SchemaEnBoite({
            rightBraces: [],
            lignes: [
              {
                barres: [
                  {
                    content: `$${texNombre(data.nb1, 2)}$`,
                    length: 7,
                    color: 'lightgray',
                  },
                  {
                    content: '?',
                    length: 3,
                    color: 'lightgray',
                  },
                ],
              },
              {
                barres: [
                  {
                    content: `$${texNombre(data.nb2, 2)}$`,
                    length: 10,
                    color: 'lightgray',
                  },
                ],
              },
            ],
          })
    this.enonce = `On achète deux produits : un à $${data.nb1}$ € et un autre à $${data.nb2}$ €.
<br>De combien le 2e produit est-t-il ${data.nb2 > data.nb1 ? 'plus' : 'moins'} cher ?`
    this.correction = `Le deuxième produit est ${data.nb2 > data.nb1 ? 'plus' : 'moins'} cher de $${miseEnEvidence(Math.abs(data.nb2 - data.nb1))}$ €.`
    this.reponse = texNombre(data.nb1 + data.nb2, 2)
  }
}
