import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifParts from './problemesMultiplicatifsPart'
/**
 * @author Jean-claude Lhote
 */
export function chocolats(decimal = false): Probleme {
  const nbFois = randint(5, 12)
  const quotite = decimal ? randint(3, 9) / 20 : randint(3, 9) * 50
  const total = nbFois * quotite
  const data = { nbFois, quotité: quotite }
  const unite = decimal ? 'kg' : 'g'
  // const unitéComplète = decimal ? 'kilogrammes' : 'grammes'
  const probleme = new ProblemeMultiplicatifParts('chocolats', data)
  probleme.enonce = `Une boîte contient $${texNombre(total, 2)}$ ${unite} de chocolats. On veut la partager équitablement dans $${texNombre(nbFois, 0)}$ boites. <br>Quelle masse doit-on mettre dans chaque boite ?`
  probleme.correction = `On cherche à répartir $${texNombre(total, 2)}$ ${unite} dans $${nbFois}$ boites.<br> Donc la masse qu'on doit mettre dans chaque boite est : $${texNombre(total, 2)}\\text{\\,${unite}} \\div ${texNombre(nbFois, 2)}=${miseEnEvidence(texNombre(total / nbFois, 2))}\\text{\\,${unite}}$.`
  probleme.schema.topBraces = [
    {
      start: 1,
      end: 15,
      text: `$${texNombre(total, 2)}$ ${unite} de chocolats`,
    },
  ]
  probleme.schema.lignes = [
    {
      barres: [
        {
          content: `$${miseEnEvidence(texNombre(quotite, 2))}\\text{\\,${unite}}$`,
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
          content: `$${miseEnEvidence(texNombre(quotite, 2))}\\text{\\,${unite}}$`,
          length: 3,
          color: 'lightgray',
        },
      ],
    },
  ]
  probleme.optionsChampTexteMathlive = { texteApres: ` ${unite}` }
  return probleme
}
