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
export function nageur(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nb1 = decimal ? randint(25, 35) / 10 : randint(20, 40) * 100
  const nb2 = decimal
    ? randint(25, 45) / 10
    : randint(20, 50, Math.round(nb1 / 100)) * 100
  const data = { nb1, nb2 }
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = `${personnage.prenom} a nagé $${texNombre(nb1, 1)}$ ${uniteComplete} le matin et $${texNombre(nb2, 1)}$ ${uniteComplete} l'après-midi.
<br>Quelle distance totale a-t-${personnage.pronom} parcourue à la nage ?`
  const correction = `${personnage.prenom} a nagé $${texNombre(nb1, 1)}$ ${uniteComplete} le matin et $${texNombre(nb2, 1)}$ ${uniteComplete} l'après-midi.
<br>Donc, au total, ${personnage.pronom} a nagé : $${texNombre(nb1, 1)}\\text{ ${unite}}+${texNombre(nb2, 1)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(nb1 + nb2, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeAdditif('nageur', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 1))}\\text{ ${unite}}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'distance totale'
  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1 + nb2, 1)}${unite}`
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.optionsComparaison = { unite: true }
  return probleme
}
