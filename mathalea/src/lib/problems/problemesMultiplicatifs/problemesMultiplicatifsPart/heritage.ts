import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifParts from './problemesMultiplicatifsPart'
/**
 * @author Jean-claude Lhote
 */
export function heritage(decimal = false): Probleme {
  const nbFois = randint(3, 9)
  const quotité = decimal
    ? randint(200000, 1500000) / 100
    : randint(200, 1500) * 10
  const total = nbFois * quotité
  const data = { nbFois, quotité }
  const probleme = new ProblemeMultiplicatifParts('heritage', data)
  probleme.enonce = `Lors d'un héritage, une somme de $${texNombre(total, 2)}\\text{\\,€}$ est partagée équitablement entre $${texNombre(nbFois, 0)}$ héritiers. <br>Combien chacun recevra-t-il ?`
  probleme.correction = `On partage $${texNombre(total, 2)}\\text{\\,€}$ entre $${texNombre(nbFois, 0)}$ héritiers. Chacun recevra : $${texNombre(total, 2)}\\text{\\,€} \\div ${texNombre(nbFois, 0)} = ${miseEnEvidence(texNombre(total / nbFois, 2))}\\text{\\,€}$.`
  probleme.schema.topBraces = [
    {
      start: 1,
      end: 15,
      text: `$${texNombre(total, 2)}$ €`,
    },
  ]
  probleme.schema.lignes = [
    {
      barres: [
        {
          content: `$${miseEnEvidence(texNombre(quotité, 2))}\\text{\\,€}$`,
          length: 3,
          color: 'lightgray',
        },
        {
          content: '\\ldots',
          length: 8,
          color: 'white',
          options: {
            justify: 'center',
          },
        },
        {
          content: `$${miseEnEvidence(texNombre(quotité, 2))}\\text{\\,€}$`,
          length: 3,
          color: 'lightgray',
        },
      ],
    },
  ]
  probleme.schema.bottomBraces = [
    {
      start: 1,
      end: 15,
      text: `$${nbFois}$ héritiers`,
      type: 'accolade',
    },
  ]
  probleme.optionsChampTexteMathlive = { texteApres: ' €' }
  return probleme
}
