import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeCompAddPteQantite from './problemesCompAddPteQuantite'
/**
 * @author Jean-claude Lhote
 */
export function coureur6(decimal = true): Probleme {
  const personnage = prenomPronom()
  const nb1 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const nb2 = (randint(150, 300) * 10) / (decimal ? 1000 : 1)
  const data = { nb1, nb2 }
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = `${personnage.prenom} a réalisé un trail au cours duquel ${personnage.pronom} a marché sur $${texNombre(nb2 + nb1, 3)}$ ${uniteComplete}, soit $${texNombre(data.nb2, 3)}$ ${uniteComplete} de plus que la distance courue.<br>
  Sur quelle distance a-t-${personnage.pronom} couru ?`
  const correction = `${personnage.prenom} a marché sur $${texNombre(nb2, 3)}$ ${uniteComplete} de moins que $${texNombre(nb1 + nb2, 3)}$ ${uniteComplete}.<br>
  La distance sur laquelle ${personnage.prenom} a donc couru est : $${texNombre(nb1 + nb2, 3)}\\text{  ${unite}}-${texNombre(nb2, 3)}\\text{  ${unite}} = ${miseEnEvidence(`${texNombre(nb1, 3)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeCompAddPteQantite('coureur6', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${miseEnEvidence(texNombre(nb1, 3))}\\text{  ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 3)}\\text{  ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(nb1 + nb2, 3)}\\text{  ${unite}}$`

  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1, 3)}${unite}`
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.optionsComparaison = { unite: true }
  return probleme
}
