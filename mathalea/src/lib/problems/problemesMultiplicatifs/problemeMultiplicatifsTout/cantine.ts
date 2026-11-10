import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifs from './problemesMultiplicatifsTout'
/**
 * @author Jean-claude Lhote
 */
export function cantine(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(2, 5)
  const facteur = decimal ? randint(11, 25, 20) / 10 : randint(12, 25, [10, 20])
  const unite = decimal ? 'dL' : 'cL'
  const uniteComplete = decimal ? 'décilitres' : 'centilitres'
  const data = { nbFois, facteur }
  const enonce = `À la cantine, ${personnage.prenom} a bu $${nbFois}$ verres d'eau, chaque verre contenant $${texNombre(facteur, 1)}$ ${uniteComplete}. Quel volume d'eau a-t-${personnage.pronom} bu ?`
  const correction = `${personnage.prenom} a bu $${nbFois}$ verres de $${texNombre(facteur, 1)}$ ${uniteComplete}.
Le volume d'eau total est : $${texNombre(nbFois, 0)}\\times ${texNombre(facteur, 1)}=${miseEnEvidence(`${texNombre(nbFois * facteur, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeMultiplicatifs('cantine', data)
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

  probleme.styleChampTexteMathlive = KeyboardType.volume
  probleme.reponse = `${texNombre(nbFois * facteur, 1)}${unite}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
