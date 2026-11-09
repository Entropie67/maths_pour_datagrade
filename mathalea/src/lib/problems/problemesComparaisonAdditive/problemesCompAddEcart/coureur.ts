import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeCompAddEcart from './problemesCompAddEcart'
/**
 * @author Jean-claude Lhote
 */
export function coureur4(decimal = true): Probleme {
  const personnage = prenomPronom()
  const nb1 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const nb2 = (randint(350, 700) * 10) / (decimal ? 1000 : 1)
  const data = { nb1, nb2 }
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const enonce = `${personnage.prenom} a réalisé un trail de $${texNombre(nb1 + nb2, 3)}$ ${uniteComplete} au cours duquel ${personnage.pronom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} et a marché $${texNombre(nb2, 3)}$ ${uniteComplete}.
  <br>Quelle est la différence entre la distance courue et celle marchée ?`
  const correction = `${personnage.prenom} a couru sur $${texNombre(nb1, 3)}$ ${uniteComplete} et a marché sur $${texNombre(nb2, 3)}$ ${uniteComplete}.
<br>${personnage.prenom} a donc marché : ${
    nb2 > nb1
      ? `$${texNombre(nb2, 3)}\\text{  ${unite}}-${texNombre(nb1, 3)}\\text{  ${unite}} = ${texNombre(nb2 - nb1, 3)}\\text{  ${unite}}$ de plus`
      : `$${texNombre(nb1, 3)}\\text{  ${unite}}-${texNombre(nb2, 3)}\\text{  ${unite}} = ${miseEnEvidence(`${texNombre(nb1 - nb2, 3)}\\text{ ${unite}}`)}$ de moins`
  } qu'${personnage.pronom} a couru.`
  const probleme = new ProblemeCompAddEcart('coureur4', data)
  probleme.enonce = enonce
  probleme.correction = correction
  if (nb1 > nb2) {
    probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb2, 3)}\\text{  ${unite}}$`
    probleme.schema.lignes[1].barres[1].content = `$${miseEnEvidence(texNombre(nb1 - nb2, 3))}\\text{  ${unite}}$`
    probleme.schema.lignes[0].barres[0].content = `$${texNombre(nb1, 3)}\\text{  ${unite}}$`
  } else {
    probleme.schema.lignes[0].barres[0].content = `$${texNombre(nb1, 3)}\\text{  ${unite}}$`
    probleme.schema.lignes[0].barres[1].content = `$${miseEnEvidence(texNombre(nb2 - nb1, 3))}\\text{  ${unite}}$`
    probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb2, 3)}\\text{  ${unite}}$`
  }

  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(Math.abs(nb2 - nb1), 3)}${unite}`
  probleme.styleChampTexteMathlive = `${KeyboardType.longueur} ${KeyboardType.clavierDeBaseAvecFraction}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
