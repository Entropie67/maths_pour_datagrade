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
export function coureur2(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(2, 12, 10)
  const facteur = decimal
    ? choice([11, 12, 14, 16, 18]) * choice([0.1, 0.2, 0.3])
    : choice([11, 12, 15, 16, 18]) * 20
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const coin = decimal
    ? choice(['parc', 'village', 'bois'])
    : choice(['terrain de sport', 'parc', 'quartier', 'stade'])
  const data = { nbFois, facteur }
  const enonce = `${personnage.prenom} a couru $${nbFois}$ tours du ${coin}, chacun mesurant $${texNombre(facteur, 1)}$ ${uniteComplete}. Quelle distance totale a-t-${personnage.pronom} parcourue ?`
  const correction = `${personnage.prenom} a couru $${nbFois}$ tours de $${texNombre(facteur, 1)}$ ${uniteComplete}.
La distance totale parcourue est : $${texNombre(nbFois, 0)}\\times ${texNombre(facteur, 1)}=${miseEnEvidence(`${texNombre(nbFois * facteur, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeMultiplicatifs('coureur2', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(facteur, 1)}$ ${unite}`
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbFois * facteur, 1)}\\text{ ${unite}}$`
  if (nbFois < 8) {
    probleme.schema.lignes[0].barres.forEach((barre, index) => {
      if (index > 0) {
        barre.content = `$${texNombre(facteur, 1)}\\text{\\,${unite}}$`
      }
    })
  }
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.reponse = `${texNombre(nbFois * facteur, 1)}${unite}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
