import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { premiereLettreEnMajuscule } from '../../../outils/outilString'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function fete(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(3, 5) * 5
  const quotité = decimal ? (randint(10, 20) * 2 + 1) * 0.5 : randint(11, 19)
  const total = Math.ceil(
    nbFois * quotité +
      (decimal ? (randint(4, 16) * 10 + 1) * 0.5 : randint(2, 8) * 20),
  )
  const reste = total - nbFois * quotité
  const data = { nbFois, quotité, reste }
  const enonce = `Pour une fête de l'école, ${personnage.prenom} a apporté $${texNombre(total, 1)}$ centilitres de jus de fruit.
$${texNombre(reste, 1)}$ centilitres ont été renversés par accident.
${premiereLettreEnMajuscule(personnage.pronom)} a ensuite rempli $${nbFois}$ verres en répartissant équitablement le jus de fruit restant.
Quel volume de jus de fruit y a-t-il dans chaque verre ?`
  const correction = `${texNombre(total, 1)} centilitres ont été apportés, mais ${texNombre(reste, 1)} centilitres ont été renversés.
Il reste donc ${texNombre(total - reste, 1)} centilitres à répartir dans ${nbFois} verres.
Le calcul est : $${texNombre(total - reste, 1)} \\div ${texNombre(nbFois, 0)} = ${miseEnEvidence(texNombre((total - reste) / nbFois, 2))}$ centilitres par verre.`
  const probleme = new ProblemePartageAvecResteRetire('fete', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
