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
export function soif(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nb1 = decimal ? randint(25, 35) / 10 : randint(10, 40) * 10
  const nb2 = decimal
    ? randint(25, 45, Math.round(nb1 * 10)) / 10
    : randint(10, 50, Math.round(nb1 / 10)) * 10
  const unite = decimal ? 'L' : 'cL'
  const uniteComplete = decimal ? 'litres' : 'centilitres'
  const data = { nb1, nb2 }
  const enonce = `Lors d'une journée chaude, ${personnage.prenom} a bu $${texNombre(nb1, 1)}$ ${uniteComplete} d'eau le matin et $${texNombre(nb2, 1)}$ ${uniteComplete} l'après-midi.
<br>Quelle quantité totale d'eau a-t-${personnage.pronom} bue ?`
  const correction = `${personnage.prenom} a bu $${texNombre(nb1, 1)}$ ${uniteComplete} d'eau le matin et $${texNombre(nb2, 1)}$ ${uniteComplete} l'après-midi.
Donc, en tout, ${personnage.pronom} a bu $${texNombre(nb1, 1)}\\text{ ${unite}}+${texNombre(nb2, 1)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(nb1 + nb2, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeAdditif('soif', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 1))}\\text{ ${unite}}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'consommation totale'
  // probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1 + nb2, 1)} ${unite}`
  probleme.styleChampTexteMathlive = KeyboardType.volume
  probleme.optionsComparaison = { unite: true }
  return probleme
}
