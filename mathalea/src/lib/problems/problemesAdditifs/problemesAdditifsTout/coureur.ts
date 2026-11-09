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
export function coureur2(decimal = true): Probleme {
  const personnage = prenomPronom()
  const nb1 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const nb2 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const data = { nb1, nb2 }
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = `${personnage.prenom} a réalisé un trail au cours duquel ${personnage.pronom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} et a marché sur $${texNombre(nb2, 3)}$ ${uniteComplete}.<br>
  Quelle distance totale a-t-${personnage.pronom} parcourue au cours de ce trail ?`
  const correction = `${personnage.prenom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} et a marché sur $${texNombre(nb2, 3)}$ ${uniteComplete}.<br>Donc, au total, ${personnage.pronom} a parcouru $${texNombre(nb1, 3)}\\text{ ${unite}}+${texNombre(nb2, 3)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(nb1 + nb2, 3)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeAdditif('coureur2', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 3)}\\text{  ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 3)}\\text{  ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 3))}\\text{  ${unite}}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'distance totale'
  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1 + nb2, 3)}${unite}`
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.optionsComparaison = { unite: true }
  return probleme
}
