import { randint } from '../../../../modules/outils'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeMultiplicatifs from './problemesMultiplicatifsTout'
/**
 * @author Jean-claude Lhote
 */
export function cinema(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFois = randint(4, 12, 10)
  const facteur = decimal
    ? randint(6, 9) * choice([1.1, 1.2, 1.3])
    : randint(6, 11, 10)
  const data = { nbFois, facteur }
  const enonce = `${personnage.prenom} a acheté $${nbFois}$ tickets de cinéma à $${texNombre(facteur, 2, true, false)}$ euros chacun. Combien a-t-${personnage.pronom} payé au total ?`
  const correction = `${personnage.prenom} a acheté $${nbFois}$ tickets à $${texNombre(facteur, 2, true, false)}$ euros.
Le coût total des tickets est : $${texNombre(nbFois, 0)}\\times ${texNombre(facteur, 2, true, false)}=${miseEnEvidence(texNombre(nbFois * facteur, 2, true, false))}$ euros.`
  const probleme = new ProblemeMultiplicatifs('cinema', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(facteur, 2, true, false)}\\text{€}$`
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbFois * facteur, 1)}\\text{ €}$`
  if (nbFois < 8) {
    probleme.schema.lignes[0].barres.forEach((barre, index) => {
      if (index > 0) {
        barre.content = `$${texNombre(facteur, 1)}\\text{\\,€}$`
      }
    })
  }
  probleme.reponse = `${texNombre(nbFois * facteur, 1)}`
  probleme.optionsChampTexteMathlive = { texteApres: ' €' }
  return probleme
}
