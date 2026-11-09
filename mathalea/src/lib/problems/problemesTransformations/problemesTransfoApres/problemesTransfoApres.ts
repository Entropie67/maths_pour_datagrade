import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeTransfoApres extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nb2: number }) {
    data = data == null ? { nb1: randint(2, 25), nb2: randint(2, 25) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 11,
          text: 'Maintenant',
        },
      ],
      bottomBraces: [],
      rightBraces: [],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.nb1, 2)}$`,
              length: 8,
              color: 'lightgray',
            },
            {
              content: `$${texNombre(data.nb2, 2)}$`,
              length: 2,
              color: 'lightgray',
            },
          ],
        },
      ],
    })
    this.enonce = `On dispose d'une somme de $${texNombre(data.nb1, 2)}$ € et on vient de toucher un remboursement de $${texNombre(data.nb2, 2)}$ €.
<br>Quelle somme d'argent a-t-on maintenant ?`
    this.correction = `Maintenant on a $${miseEnEvidence(data.nb1 + data.nb2)}$ €.`
    this.reponse = texNombre(data.nb1 + data.nb2, 2)
  }
}
