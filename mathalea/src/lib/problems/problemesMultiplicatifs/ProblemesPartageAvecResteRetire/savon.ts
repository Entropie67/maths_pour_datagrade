import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function savon(decimal = false): Probleme {
  const nbFois = randint(3, 7)
  const quotité = decimal ? randint(5, 19, 10) * 0.1 : randint(5, 19, 10) * 10
  const total = nbFois * quotité + randint(11, 29, 20) * (decimal ? 0.01 : 1)
  const reste = total - nbFois * quotité
  const data = { nbFois, quotité, reste }
  const uniteComplete = decimal ? 'litres' : 'centilitres'
  const enonce = `La directrice a reçu $${texNombre(total, 2)}$ ${uniteComplete} de savon liquide pour équiper les sanitaires de l'école.
$${texNombre(reste, 2)}$ ${uniteComplete} ont été renversés par accident.
Les ${nbFois} distributeurs ont été remplis totalement avec le reste.
Quel volume de savon y a-t-il dans chaque distributeur ?`
  const correction = `$${texNombre(total, 2)}$ ${uniteComplete} ont été reçus, mais $${texNombre(reste, 2)}$ ${uniteComplete} ont été renversés.
Il reste donc $${texNombre(total - reste, 2)}$ ${uniteComplete} à répartir dans ${nbFois} distributeurs.
Le calcul est : $\\dfrac{${texNombre(total - reste, 2)}}{${texNombre(nbFois, 0)}} = ${miseEnEvidence(texNombre((total - reste) / nbFois, 2))}$ ${uniteComplete} par distributeur.`
  const probleme = new ProblemePartageAvecResteRetire('savon', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
