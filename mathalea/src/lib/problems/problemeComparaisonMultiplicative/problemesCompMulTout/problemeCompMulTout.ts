import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import SchemaEnBoite from '../../../outils/SchemaEnBoite'
import { texNombre } from '../../../outils/texNombre'
import Probleme from '../../Probleme'

/**
 * @author Jean-claude Lhote
 */
export default class ProblemeCompMulTout extends Probleme {
  constructor(name: string = '', data?: { nb1: number; nbFois: number }) {
    const personnage = prenomPronom()
    data = data == null ? { nb1: randint(4, 8), nbFois: randint(3, 6) } : data
    const nb2 = data.nb1 * data.nbFois
    super(name, data)
    this.schema = new SchemaEnBoite({
      topBraces: [
        {
          start: 1,
          end: 16,
          text: `$${miseEnEvidence(texNombre((data.nbFois + 1) * data.nb1, 2))}\\text{\\,€}$`,
        },
      ],
      lignes: [
        {
          barres: [
            {
              content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
              length: 3,
              color: 'lightgray',
            },
            {
              content: `$${texNombre(data.nb1, 2)}\\text{\\,€}$`,
              length: 3,
              color: 'lightgray',
            },
            {
              content: '\\ldots',
              length: 6,
              color: 'white',
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
      bottomBraces: [
        {
          start: 1,
          end: 4,
          text: 'sachet',
        },
        {
          start: 4,
          end: 16,
          text: 'boite',
        },
      ],
    })

    this.enonce = `Un chocolatier vend ses chocolats selon deux types de conditionnement : en sachets à $${texNombre(data.nb1, 2, true)}$ € ou en boites qui coûtent $${texNombre(data.nbFois, 0)}$ fois plus cher qu'un sachet.<br>
${personnage.prenom} décide d'acheter un sachet et une boite. <br>Combien va-t-${personnage.pronom} payer en tout ?`
    this.correction = `Le prix d'une boite est : $${texNombre(data.nbFois, 0)}\\times ${texNombre(data.nb1, 2, true)}$ € $=${texNombre(nb2, 2)}$ € et le prix d'un sachet est $${texNombre(data.nb1, 2)}$ €.
   <br> ${personnage.prenom} va payer en tout : $${texNombre(nb2, 2)}$ € $+${texNombre(data.nb1, 2)}$ € $=${miseEnEvidence(texNombre(nb2 + data.nb1, 2))}$ €.`
    this.reponse = texNombre(nb2 + data.nb1, 2)
    this.optionsChampTexteMathlive = { texteApres: ' €' }
  }
}
