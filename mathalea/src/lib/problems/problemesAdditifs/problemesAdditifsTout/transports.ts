import Hms from '../../../../modules/Hms'
import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeAdditif from './problemesAdditifsTout'
/**
 * @author Jean-claude Lhote
 */
export function transports(): Probleme {
  const personnage = prenomPronom()
  const nb1 = randint(25, 35)
  const nb2 = randint(25, 35, nb1)
  const data = { nb1, nb2 }
  const enonce = `${personnage.prenom} a mis $${texNombre(nb1, 0)}$ minutes pour aller au travail le matin et $${texNombre(nb2, 0)}$ minutes pour rentrer le soir.
<br>Quel temps total a-t-${personnage.pronom} passé dans les transports ?`
  const correction = `${personnage.prenom} a mis $${texNombre(nb1, 0)}$ minutes le matin et $${texNombre(nb2, 0)}$ minutes le soir.
Donc, en tout, ${personnage.pronom} a passé $${texNombre(nb1, 0)}+${texNombre(nb2, 0)}=${miseEnEvidence(texNombre(nb1 + nb2, 0))}$ minutes dans les transports.`

  const probleme = new ProblemeAdditif('transports', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 0)}\\text{ min}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 0)}\\text{ min}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 0))}\\text{ min}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'durée totale'
  probleme.styleChampTexteMathlive = KeyboardType.clavierHms
  probleme.reponse = new Hms({ minute: nb1 + nb2 }).toString()
  probleme.optionsComparaison = { HMS: true }
  return probleme
}
