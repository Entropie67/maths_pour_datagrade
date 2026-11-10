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
export function gateaux1(_decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbPaquets = randint(2, 9)
  const nbGateauxParPaquet = choice([10, 12, 15, 16, 18, 20, 24, 30])
  const data = { nbFois: nbPaquets, facteur: nbGateauxParPaquet }
  const enonce = `Pour son goûter d'anniversaire, ${personnage.prenom} a acheté $${nbPaquets}$ paquets de gâteaux. Chaque paquet contient $${nbGateauxParPaquet}$ gâteaux. Combien de gâteaux a-t-${personnage.pronom} au total ?`
  const correction = `${personnage.prenom} a acheté $${nbPaquets}$ paquets de gâteaux, chacun contenant $${nbGateauxParPaquet}$ gâteaux. <br>Donc, au total, ${personnage.pronom} a $${miseEnEvidence(texNombre(nbPaquets * nbGateauxParPaquet, 0))}$ gâteaux.`
  const probleme = new ProblemeMultiplicatifs('gateaux1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  // probleme.schema.lignes[0].entete = { content: 'gâteaux', longueur: 3 }
  if (probleme.schema.topBraces == null) {
    probleme.schema.topBraces = []
  }
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbPaquets * nbGateauxParPaquet, 0)}\\text{ gâteaux}$`

  probleme.schema.topBraces[0].start = 1
  probleme.schema.topBraces[0].end = nbPaquets < 8 ? 2 * nbPaquets + 1 : 15
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.optionsChampTexteMathlive = { texteApres: ' gâteaux' }
  return probleme
}
