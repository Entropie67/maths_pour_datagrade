import { troisObjetsAVendre } from '../../../../exercices/6e/6N4A-2'
import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeAdditif from './problemesAdditifsTout'
/**
 * @author Jean-claude Lhote
 */
export function courses1(decimal = true): Probleme {
  const personnage = prenomPronom()
  const objets = choice(troisObjetsAVendre)
  const objet1 = objets[0]
  const objet2 = objets[1]
  let prix1 = randint(objet1.prixMini, objet1.prixMaxi)
  let prix2 = randint(objet2.prixMini, objet2.prixMaxi)
  if (decimal) {
    prix1 = Math.round(prix1 * 100 + randint(1, 19) * 5) / 100
    prix2 = Math.round(prix2 * 100 + randint(1, 19) * 5) / 100
  }
  const data = { nb1: prix1, nb2: prix2 }
  const enonce = `${personnage.prenom} a acheté ${objet1.nom} à $${texNombre(prix1, 2)}$ € et ${objet2.nom} à $${texNombre(prix2, 2)}$ €.
<br>Combien a-t-${personnage.pronom} dépensé au total ?`
  const correction = `${personnage.prenom} a acheté ${objet1.nom} à $${texNombre(prix1, 2)}$ € et ${objet2.nom} à $${texNombre(prix2, 2)}$ €.
<br>Donc, au total, ${personnage.pronom} a dépensé $${texNombre(prix1, 2)}\\text{ €}+${texNombre(prix2, 2)}\\text{ €}=${miseEnEvidence(texNombre(prix1 + prix2, 2))}$ €.`
  const probleme = new ProblemeAdditif('coureur1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(prix1, 2)}\\text{ €}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(prix2, 2)}\\text{ €}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(prix1 + prix2, 2))}\\text{ €}$`
  probleme.schema.topBraces = [{ text: 'dépense totale', start: 1, end: 11 }]
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.optionsChampTexteMathlive = { texteApres: ' €' }
  probleme.reponse = `${texNombre(prix1 + prix2, 2)}`
  return probleme
}
