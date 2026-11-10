import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeAdditif from './problemesAdditifsPart'
/**
 * @author Jean-claude Lhote
 */
export function coureur3(decimal = true): Probleme {
  const personnage = prenomPronom()
  const nb1 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const nb2 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const data = { nb1, nb2 }
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = `${personnage.prenom} a réalisé un trail de $${texNombre(nb1 + nb2, 3)}$ ${uniteComplete} au cours duquel ${personnage.pronom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} et a marché sur la distance restante.<br>
 Sur quelle distance a-t-${personnage.pronom} marché au cours de ce trail ?`
  const correction = `${personnage.prenom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} sur $${texNombre(nb2 + nb1, 3)}$ ${uniteComplete}.<br>
  Donc la distance sur laquelle ${personnage.pronom} a marché est : $${texNombre(nb1 + nb2, 3)}\\text{ ${unite}}-${texNombre(nb1, 3)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(nb2, 3)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeAdditif('coureur3', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 3)}\\text{  ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${miseEnEvidence(texNombre(nb2, 3))}\\text{  ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(nb1 + nb2, 3)}\\text{  ${unite}}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'distance totale'
  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb2, 3)}${unite}`
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.optionsComparaison = { unite: true }
  return probleme
}
