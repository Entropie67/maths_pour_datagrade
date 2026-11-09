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
export function decoupe1(decimal = false): Probleme {
  const objet = choice(['ficelle', 'corde', 'tissu', 'cartoline', 'bois'])
  const personnage = prenomPronom()
  const nbFois = randint(5, 12)
  const longueur = decimal
    ? (randint(6, 14, 10) * 2 + 1) * 0.5
    : randint(6, 15, 10)
  const data = { nbFois, facteur: longueur }
  const enonce = `${personnage.prenom} a découpé $${nbFois}$ morceaux de ${objet} de longueur $${texNombre(longueur, 1)}\\text{ cm}$. Quelle est la longueur totale de ${objet} utilisé ?`
  const correction = `${personnage.prenom} a découpé $${nbFois}$ morceaux de ${objet} de longueur $${texNombre(longueur, 1)}\\text{ cm}$. Donc, la longueur totale de ${objet} utilisé est de $${miseEnEvidence(`${texNombre(nbFois * longueur, 1)}\\text{ cm}`)}$.`
  const probleme = new ProblemeMultiplicatifs('decoupe1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(longueur, 1)}\\text{ cm}$`
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbFois * longueur, 1)}\\text{ cm}$`
  if (nbFois < 8) {
    probleme.schema.lignes[0].barres.forEach((barre, index) => {
      if (index > 0) {
        barre.content = `$${texNombre(longueur, 1)}\\text{ cm}$`
      }
    })
  }

  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.reponse = `${texNombre(nbFois * longueur, 1)}cm`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
