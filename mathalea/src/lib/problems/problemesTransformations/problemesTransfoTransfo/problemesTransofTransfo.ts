import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeTransfoTransfo extends Probleme {
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
              content: `$${texNombre(data.nb1, 2)}$`,
              length: 8,
              color: 'lightgray',
            },
            {
              content: `$${miseEnEvidence(texNombre(data.nb2, 2))}$`,
              length: 2,
              color: 'lightgray',
            },
          ],
        },
      ],
    })
    this.enonce = `On avait $${texNombre(data.nb1, 2)}$ € et on dispose maintenant de $${texNombre(data.nb1 + data.nb2)}$€ après avoir touché un remboursement.
<br>Quel est le montant du remboursement ?`
    this.correction = `Le remboursement est de $${texNombre(data.nb1 + data.nb2, 2)}-${texNombre(data.nb1, 2)}=${miseEnEvidence(texNombre(data.nb2, 2))}$ €.`
    this.reponse = texNombre(data.nb2, 2)
  }
}
