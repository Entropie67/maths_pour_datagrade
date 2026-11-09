import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifs from './problemesMultiplicatifsTout'
/**
 * @author Jean-claude Lhote
 */
export function papier(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(2, 5)
  const facteur = decimal ? randint(8, 14, 10) / 10 : randint(8, 19, 10)
  const unite = decimal ? 'kg' : 'hg'
  const uniteComplete = decimal ? 'kilogrammes' : 'hectogrammes'
  const data = { nbFois, facteur }
  const enonce = `Pour préparer ${choice(['une exposition', 'la rentrée', 'une sortie scolaire'])}, ${personnage.prenom} a utilisé $${nbFois}$ ramettes de papier, chaque ramette pesant $${texNombre(facteur, 1)}$ ${uniteComplete}. Quelle masse totale de papier a-t-${personnage.pronom} utilisé ?`
  const correction = `${personnage.prenom} a utilisé $${nbFois}$ ramettes de $${texNombre(facteur, 1)}$ ${uniteComplete}.
La masse totale de papier est : $${texNombre(nbFois, 0)}\\times ${texNombre(facteur, 1)}=${miseEnEvidence(`${texNombre(nbFois * facteur, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeMultiplicatifs('papier', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(facteur, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbFois * facteur, 1)}\\text{ ${unite}}$`
  if (nbFois < 8) {
    probleme.schema.lignes[0].barres.forEach((barre, index) => {
      if (index > 0) {
        barre.content = `$${texNombre(facteur, 1)}\\text{\\,${unite}}$`
      }
    })
  }
  probleme.styleChampTexteMathlive = KeyboardType.masse
  probleme.reponse = `${texNombre(nbFois * facteur, 1)}${unite}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
