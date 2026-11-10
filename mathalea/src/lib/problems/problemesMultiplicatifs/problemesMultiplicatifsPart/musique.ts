import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifParts from './problemesMultiplicatifsPart'
/**
 * @author Jean-claude Lhote
 */
export function musique(decimal = false): Probleme {
  const nbFois = randint(3, 7)
  const quotité = decimal ? randint(21, 55, [30, 40, 50]) / 10 : randint(2, 6)
  const total = nbFois * quotité
  const data = { nbFois, quotité }
  const probleme = new ProblemeMultiplicatifParts('musique', data)
  probleme.enonce = `Un morceau de musique dure $${texNombre(total, 2)}$ minutes. Il est divisé en $${texNombre(nbFois, 0)}$ parties égales. <br>Quelle est la durée d'une partie ?`
  probleme.correction = `On divise $${texNombre(total, 2)}$ minutes en $${texNombre(nbFois, 0)}$ parties. La durée d'une partie est : $${texNombre(total, 2)}\\text{\\,min} \\div ${texNombre(nbFois, 0)} = ${miseEnEvidence(texNombre(total / nbFois, 2))}\\text{\\,min}$`
  probleme.schema.topBraces = [
    {
      start: 1,
      end: 15,
      text: `$${texNombre(total, 2)}$ minutes`,
    },
  ]
  probleme.schema.lignes = [
    {
      barres: [
        {
          content: `$${miseEnEvidence(texNombre(quotité, 2))}\\text{\\,min}$`,
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
          content: `$${miseEnEvidence(texNombre(quotité, 2))}\\text{\\,min}$`,
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
      text: `$${nbFois}$ jours`,
      type: 'accolade',
    },
  ]
  probleme.optionsChampTexteMathlive = { texteApres: ' min' }
  return probleme
}
