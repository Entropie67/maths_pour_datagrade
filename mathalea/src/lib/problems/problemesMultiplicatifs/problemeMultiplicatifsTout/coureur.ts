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
export function coureur1(decimal = false): Probleme {
  const personnage = prenomPronom()
  const nbFoisParSemaine = randint(2, 4)
  const nbKmParJour = decimal
    ? choice([11, 12, 15, 16, 18]) * choice([0.8, 0.9, 1.2, 1.1])
    : choice([11, 12, 15, 16, 18]) * 1000
  const unite = decimal ? 'km' : 'm'
  const uniteComplete = decimal ? 'kilomètres' : 'mètres'
  const data = { nbFois: nbFoisParSemaine, facteur: nbKmParJour }
  const enonce = `Pour entretenir sa bonne santé, ${personnage.prenom} court $${nbFoisParSemaine}$ jours par semaine. Chaque fois ${personnage.pronom} court $${texNombre(nbKmParJour, 1)}$ ${uniteComplete}. Combien de ${uniteComplete} parcourt-${personnage.pronom} au total chaque semaine ?`
  const correction = `${personnage.prenom} court $${nbFoisParSemaine}$ jours par semaine. Chaque jour, ${personnage.pronom} court $${texNombre(nbKmParJour, 1)}$ ${uniteComplete}. <br>Donc, au total, ${personnage.pronom} parcourt $${nbFoisParSemaine}\\times ${texNombre(nbKmParJour, 1)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(nbFoisParSemaine * nbKmParJour, 1)}\\text{ ${unite}}`)}$ chaque semaine.`
  const probleme = new ProblemeMultiplicatifs('coureur1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(nbKmParJour, 1)}$ ${unite}`
  if (!decimal) {
    for (const barre of probleme.schema.lignes[0].barres) {
      barre.length = 3
    }
    probleme.schema.lignes[1].barres[0].length = nbFoisParSemaine * 3
    if (probleme.schema.topBraces != null) {
      probleme.schema.topBraces[0].end = nbFoisParSemaine * 3 + 1
    }
  }
  probleme.schema.lignes[0].barres.forEach((barre, index) => {
    if (index > 0) {
      barre.content = `$${texNombre(nbKmParJour, 1)}\\text{\\,${unite}}$`
    }
  })
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(nbFoisParSemaine * nbKmParJour, 1)}\\text{ ${unite}}$`
  probleme.styleChampTexteMathlive = KeyboardType.longueur
  probleme.reponse = `${texNombre(nbFoisParSemaine * nbKmParJour, 1)}${unite}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
