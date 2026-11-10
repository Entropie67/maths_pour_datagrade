import { troisObjetsAVendre } from '../../../../exercices/6e/6N4A-2'
import { randint } from '../../../../modules/outils'
import { choice, shuffle } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function courses2(decimal = false): Probleme {
  const personnage = prenomPronom()
  let objet
  do {
    const objets = shuffle(choice(shuffle(troisObjetsAVendre)))
    objet = objets.find((o) => o.prixMaxi < 20)
  } while (objet == null)
  const quotité = randint(objet.prixMini, objet.prixMaxi)
  const reste = randint(10, 20)

  const nbFois = randint(5, 10)
  const total = nbFois * quotité + reste
  const data = { nbFois, quotité, reste }
  const enonce = `${personnage.prenom} dispose de $${total}$ € pour acheter des ${objet.nomPluriel}. Grâce à un bon d'achat de $${reste}$ €, ${personnage.pronom} peut en acheter $${nbFois}$.
  Quel est le prix d' ${objet.nom} ?`
  const correction = `${personnage.prenom} a $${total}$ € pour acheter des ${objet.nomPluriel}.
  Grâce à un bon d'achat de ${reste} €, ${personnage.pronom} doit payer : $${total}-${reste}=${total - reste}$ €.<br>
  Donc, le prix d' ${objet.nom} est : $${texNombre(total - reste, 0)}\\div${nbFois}=${miseEnEvidence(quotité)}$ €.`
  const probleme = new ProblemePartageAvecResteRetire('courses2', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
