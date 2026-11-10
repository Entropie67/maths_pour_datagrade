import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifNbParts from './problemesMultiplcatifsNbParts'
/**
 * @author Jean-claude Lhote
 */
export function chocolats2(decimal = false): Probleme {
  const nbFois = randint(5, 12)
  const quotité = decimal ? randint(3, 9) / 20 : randint(3, 9) * 50
  const total = nbFois * quotité
  const data = { nbFois, quotité }
  const unité = decimal ? 'kg' : 'g'
  const unitéComplète = decimal ? 'kilogrammes' : 'grammes'
  const probleme = new ProblemeMultiplicatifNbParts('chocolats2', data)
  probleme.enonce = `Un chocolatier a produit $${texNombre(total, 2)}$ ${unitéComplète} de chocolats. Il veut les répartir équitablement dans des boites de $${texNombre(quotité, 3)}$ ${unité}. <br>Combien de boites pourra-t-il faire ?`
  probleme.correction = `On cherche à répartir $${texNombre(total, 2)}$ ${unitéComplète} dans des boites de $${texNombre(quotité, 3)}$ ${unité}.<br> Donc le nombre de boites qu'il pourra faire est de :  $${texNombre(total, 2)}$ ${unité} $\\div ${texNombre(quotité, 3)}$ ${unité}$=${miseEnEvidence(texNombre(total / quotité, 0))}$.`
  probleme.reponse = texNombre(total / quotité, 0)
  probleme.schema.topBraces = [
    {
      start: 1,
      end: 15,
      text: `$${texNombre(total, 2)}$ ${unité} de chocolats`,
    },
  ]
  probleme.schema.lignes = [
    {
      barres: [
        {
          content: `$${texNombre(quotité, 2)}\\text{\\,${unité}}$`,
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
          content: `$${texNombre(quotité, 2)}\\text{\\,${unité}}$`,
          length: 3,
          color: 'lightgray',
        },
      ],
    },
  ]
  return probleme
}
