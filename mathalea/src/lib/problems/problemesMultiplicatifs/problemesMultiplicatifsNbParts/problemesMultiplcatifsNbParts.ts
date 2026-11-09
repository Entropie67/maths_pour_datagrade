import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeMultiplicatifNbParts extends Probleme {
  constructor(name: string = '', data?: { nbFois: number; quotité: number }) {
    const nbFois = data?.nbFois ?? randint(5, 12)
    const quotité = data?.quotité ?? randint(10, 40)
    const total = nbFois * quotité
    data = data == null ? { nbFois, quotité: randint(5, 10) } : data
    super(name, data)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 15,
          text: `$${texNombre(total, 2)}$ feutres`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(quotité, 2)}\\text{\\,feutres}$`,
              length: 3,
              color: 'lightgray',
            },
            {
              content: '\\ldots',
              length: 8,
              color: 'white',
              options: {
                justify: 'start',
              },
            },
            {
              content: `$${texNombre(quotité, 2)}\\text{\\,feutres}$`,
              length: 3,
              color: 'lightgray',
            },
          ],
        },
      ],
      bottomBraces: [
        {
          start: 1,
          end: 15,
          text: `$${miseEnEvidence(nbFois.toString())}$ boites`,
          type: 'accolade',
        },
      ],
    })
    this.enonce = `Un centre de loisirs a acheté $${texNombre(total, 2)}$ feutres. Ils veulent les répartir dans $${nbFois}$ boites. <br>Combien de feutres y a-t-il par boite ?`
    this.correction = `On cherche à répartir $${texNombre(total, 2)}$ feutres dans $${nbFois}$ boites. Donc, le nombre de feutres par boite est de : $${texNombre(total, 2)} \\div ${texNombre(nbFois, 2)}=${miseEnEvidence(texNombre(total / nbFois, 2))}$.`
    this.reponse = texNombre(total / nbFois, 2)
    this.optionsChampTexteMathlive = { texteApres: ' boites' }
  }
}
