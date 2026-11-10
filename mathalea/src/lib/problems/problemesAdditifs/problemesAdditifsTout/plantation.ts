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
export function plantation(): Probleme {
  const personnage = prenomPronom()
  const nb1 = randint(5, 20)
  const nb2 = randint(5, 20, nb1)
  const data = { nb1, nb2 }
  const enonce = `${personnage.prenom} a planté $${texNombre(nb1, 0)}$ arbres le matin et $${texNombre(nb2, 0)}$ arbres l'après-midi.
<br>ombien d'arbres a-t-${personnage.pronom} plantés en tout ?`
  const correction = `${personnage.prenom} a planté $${texNombre(nb1, 0)}$ arbres le matin et $${texNombre(nb2, 0)}$ arbres l'après-midi.
<br>Donc, au total, le nombre d'arbres qu'${personnage.pronom} a planté est : $${texNombre(nb1, 0)}+${texNombre(nb2, 0)}=${miseEnEvidence(texNombre(nb1 + nb2, 0))}$.`
  const probleme = new ProblemeAdditif('plantation', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 0)}\\text{ arbres}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 0)}\\text{ arbres}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 0))}\\text{ arbres}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'arbres plantés en tout'
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1 + nb2, 0)}`
  probleme.optionsChampTexteMathlive = { texteApres: ' arbres' }
  return probleme
}
