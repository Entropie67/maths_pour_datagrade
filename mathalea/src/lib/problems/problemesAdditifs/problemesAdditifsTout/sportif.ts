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
export function sportif(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nb1 = decimal ? randint(25, 35) / 10 : randint(2, 4) * 100
  const nb2 = decimal
    ? randint(25, 45, Math.round(nb1 * 10)) / 10
    : randint(2, 5, Math.round(nb1 / 100)) * 100
  const data = { nb1, nb2 }
  const unite = decimal ? 'kJ' : 'J'
  const uniteComplete = decimal ? 'kilojoules' : 'joules'
  const enonce = `Lors de ses séances de sport, ${personnage.prenom} a brûlé $${texNombre(nb1, 1)}$ ${uniteComplete} samedi et $${texNombre(nb2, 1)}$ ${uniteComplete} dimanche.
<br>Combien de ${uniteComplete} a-t-${personnage.pronom} brûlés en tout ?`
  const correction = `${personnage.prenom} a brûlé $${texNombre(nb1, 1)}$ ${uniteComplete} samedi et $${texNombre(nb2, 1)}$ ${uniteComplete} dimanche.
Donc, en tout, ${personnage.pronom} a brûlé $${texNombre(nb1, 0)}\\text{ ${unite}}+${texNombre(nb2, 0)}\\text{ ${unite}}=${miseEnEvidence(texNombre(nb1 + nb2, 1))}\\text{ ${uniteComplete}}$.`
  const probleme = new ProblemeAdditif('sportif', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nb1, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(nb2, 1)}\\text{ ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(nb1 + nb2, 1))}\\text{ ${unite}}$`
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = 'énergie totale'
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.optionsChampTexteMathlive = { texteApres: ` ${unite}` }
  probleme.reponse = `${texNombre(nb1 + nb2, 1)}`
  return probleme
}
