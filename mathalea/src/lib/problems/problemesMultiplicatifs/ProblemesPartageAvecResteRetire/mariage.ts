import { nombreEnLettres } from '../../../../modules/nombreEnLettres'
import { randint } from '../../../../modules/outils'
import { miseEnEvidence } from '../../../outils/embellissements'
import {
  deDevant,
  premiereLettreEnMajuscule,
} from '../../../outils/outilString'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemePartageAvecResteRetire from './promblemePartageAvecResteRetire'
/**
 * @author Jean-claude Lhote
 */
export function mariage1(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(3, 5) * 5
  const quotité = randint(5, 10)
  const reste = randint(2, 8) * 2
  const total = nbFois * quotité + reste
  const data = { nbFois, quotité, reste }
  const enonce = `Pour son mariage, ${personnage.prenom} a invité $${total}$ personnes.
  ${premiereLettreEnMajuscule(nombreEnLettres(reste))} personnes ne sont pas venues.
  ${premiereLettreEnMajuscule(personnage.pronom)} a donc formé $${nbFois}$ tables sur lesquelles ${personnage.pronom} a reparti les invités équitablement.
  Combien y a-t-il d'invités par table ?`
  const correction = `${nombreEnLettres(total)} personnes ont été invitées au mariage ${deDevant(personnage.prenom)}, mais ${nombreEnLettres(reste)} ne sont pas venues.
  Il reste donc ${nombreEnLettres(total - reste)} personnes à placer sur les ${nombreEnLettres(nbFois)} tables.
  Donc, il y a $${texNombre(total - reste, 0)} \\div ${texNombre(nbFois, 0)}=${miseEnEvidence(texNombre((total - reste) / nbFois, 1))}$ personnes par table.`
  const probleme = new ProblemePartageAvecResteRetire('mariage1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.reponse = `${texNombre(quotité, 0)}`
  return probleme
}
