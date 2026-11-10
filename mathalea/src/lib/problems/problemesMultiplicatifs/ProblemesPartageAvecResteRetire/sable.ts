import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function sable(decimal = false): Probleme {
  const nbFois = randint(3, 7)
  const quotité = decimal ? 1 + randint(1, 4) * 0.1 : randint(2, 5) * 100
  const total =
    nbFois * quotité + (decimal ? randint(1, 8) * 0.01 : randint(1, 8) * 10)
  const reste = total - nbFois * quotité
  const data = { nbFois, quotité, reste }
  const uniteComplete = decimal ? 'tonnes' : 'kilogrammes'
  const enonce = `Un camion a livré $${texNombre(total, 2)}$ ${uniteComplete} de sable sur un chantier.
$${texNombre(reste, 2)}$ ${uniteComplete} ont été perdues en cours de déchargement.
Le sable restant a été réparti en ${nbFois} tas égaux.
Quelle masse de sable y a-t-il dans chaque tas ?`
  const correction = `$${texNombre(total, 2)}$ ${uniteComplete} ont été livrées, mais $${texNombre(reste, 2)}$ ${uniteComplete} ont été perdues.
Il reste donc $${texNombre(total - reste, 2)}$ ${uniteComplete} à répartir en ${nbFois} tas.<br>
La masse de chaque tas est : $\\dfrac{${texNombre(total - reste, 2)}}{${texNombre(nbFois, 0)}} = ${miseEnEvidence(texNombre((total - reste) / nbFois, 2))}$ ${uniteComplete} par tas.`
  const probleme = new ProblemePartageAvecResteRetire('sable', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
