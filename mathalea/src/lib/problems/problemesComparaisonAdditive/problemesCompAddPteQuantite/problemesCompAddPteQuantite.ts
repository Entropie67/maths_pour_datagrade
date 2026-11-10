import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompAddPteQantite extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nb2: number }) {
    data = data == null ? { nb1: randint(2, 25), nb2: randint(2, 25) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      rightBraces: [],
      lignes: [
        {
          barres: [
            {
              content: `$${miseEnEvidence(texNombre(data.nb1 + data.nb2, 2))}$`,
              length: 10,
              color: 'lightgray',
            },
          ],
        },
        {
          barres: [
            {
              content: `$${miseEnEvidence(texNombre(data.nb1, 2))}$`,
              length: 7,
              color: 'lightgray',
            },
            {
              content: `$${texNombre(data.nb2, 2)}$`,
              length: 3,
              color: 'lightgray',
            },
          ],
        },
      ],
    })

    this.enonce = `On achète deux produits pour un montant de $${texNombre(data.nb1 + data.nb2, 2)}$ €. Le deuxième coûte $${data.nb2}$ de plus que le premier.
<br>Combien le premier produit coûte-t-il ?`
    this.correction = `Le premier produit coûte $\\dfrac{${texNombre(data.nb2 + data.nb1, 2)}-${texNombre(data.nb2, 2)}}{2}=${texNombre(data.nb1, 2)}$ €.`
    this.reponse = texNombre(data.nb1 + data.nb2, 2)
  }
}
