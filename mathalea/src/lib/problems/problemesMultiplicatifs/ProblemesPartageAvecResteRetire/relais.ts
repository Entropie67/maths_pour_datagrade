import { randint } from '../../../../modules/outils'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function relais(decimal = false): Probleme {
  const nbFois = randint(3, 6)
  const quotité = decimal
    ? randint(2, 5) + randint(1, 9) * 0.1 + choice([0, 5]) * 0.01
    : randint(35, 75) * 50
  const total =
    nbFois * quotité +
    (decimal ? choice([1, 2]) + randint(1, 8) * 0.1 : randint(4, 28) * 100)
  const reste = total - nbFois * quotité
  const data = { nbFois, quotité, reste }
  // const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = ` Lors d'une course en relais, chaque équipe devait parcourir $${texNombre(total, 2)}$ ${uniteComplete}.
La distance a été réduite de $${texNombre(reste, 2)}$ ${uniteComplete} à cause de la météo.
La distance restante a été répartie entre les ${nbFois} coureurs de l'équipe.
Quelle distance chaque coureur a-t-il parcourue ?`
  const correction = `$${texNombre(total, 2)}$ ${uniteComplete} devaient être parcourus, mais $${texNombre(reste, 2)}$ ${uniteComplete} ne l'ont pas été.
Il reste donc $${texNombre(total, 2)}-${texNombre(reste, 2)} = ${texNombre(total - reste, 2)}$ ${uniteComplete} à répartir entre ${nbFois} coureurs.
Le calcul est : $\\dfrac{${texNombre(total - reste, 2)}}{${texNombre(nbFois, 0)}} = ${miseEnEvidence(texNombre((total - reste) / nbFois, 2))}$ ${uniteComplete} par coureur.`

  const probleme = new ProblemePartageAvecResteRetire('relais', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
