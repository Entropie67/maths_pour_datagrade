import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'
/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompMulNbParts extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nbFois: number }) {
    data = data == null ? { nb1: randint(4, 8), nbFois: randint(2, 5) } : data
    const nb2 = data.nb1 * data.nbFois
    super(name, data)
    this.schema = new SchemaEnBoite({
      bottomBraces: [
        {
          start: 1,
          end: 13,
          text: `$${miseEnEvidence(texNombre(data.nbFois, 0))}$ fois`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(nb2, 2)}\\text{\\,€}$`,
              length: 12,
              color: 'lightgray',
            },
          ],
        },
        {
          barres: [
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
          ],
        },
      ],
    })

    this.enonce = `Un chocolatier vend ses chocolats selon deux types de conditionnement : en sachets à $${texNombre(data.nb1, 2, true)}$ € et en boites  à $${texNombre(nb2, 2, true)}$ €.
<br>Combien de sachets peut-on avoir pour le prix d'une boite ?`
    this.correction = `Pour le prix d'une boite, le nombre de sachets qu'on peut acheter est : $\{${texNombre(nb2, 2)}}\\text{\\,€} \\div {${texNombre(data.nb1, 2)}}\\text{\\,€}=${miseEnEvidence(texNombre(nb2 / data.nb1, 0))}$.`
    this.reponse = texNombre(data.nbFois, 0)
    this.optionsChampTexteMathlive = { texteApres: ' sachets' }
  }
}
