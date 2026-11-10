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
export function lecture(): Probleme {
  const personnage = prenomPronom()
  const nb1 = randint(5, 20)
  const nb2 = randint(5, 20, nb1)
  const data = { nb1, nb2 }
  const enonce = `${personnage.prenom} a lu $${texNombre(nb1, 0)}$ pages d'un livre le matin et $${texNombre(nb2, 0)}$ pages le soir.
<br>Combien de pages a-t-${personnage.pronom} lues en tout ?`
  const correction = `${personnage.prenom} a lu $${texNombre(nb1, 0)}$ pages le matin et $${texNombre(nb2, 0)}$ pages le soir.
Donc, en tout, ${personnage.pronom} a lu $${texNombre(nb1, 0)}+${texNombre(nb2, 0)}=${miseEnEvidence(texNombre(nb1 + nb2, 0))}$ pages.`
  const probleme = new ProblemeAdditif('lecture', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 1)}\\text{ pages}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 1)}\\text{ pages}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 1))}\\text{ pages}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'pages lues en tout'
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.reponse = `${texNombre(nb1 + nb2, 1)}`
  probleme.optionsChampTexteMathlive = { texteApres: ' pages' }
  return probleme
}
