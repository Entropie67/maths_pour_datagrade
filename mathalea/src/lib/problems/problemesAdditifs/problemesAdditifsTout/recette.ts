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
export function recette1(decimal = false): Probleme {
  const recettes = [
    {
      ingredient1: { nom: 'farine', masseMini: 100, masseMaxi: 500 },
      ingredient2: { nom: 'sucre', masseMini: 25, masseMaxi: 50 },
      nomRecette: 'crêpes',
    },
    {
      ingredient1: { nom: 'pâtes', masseMini: 200, masseMaxi: 800 },
      ingredient2: { nom: 'sauce tomate', masseMini: 100, masseMaxi: 300 },
      nomRecette: 'pâtes à la sauce tomate',
    },
    {
      ingredient1: { nom: 'riz', masseMini: 150, masseMaxi: 600 },
      ingredient2: { nom: 'légumes', masseMini: 100, masseMaxi: 400 },
      nomRecette: 'riz aux légumes',
    },
  ]
  const recette = choice(recettes)
  let masse1 = randint(
    recette.ingredient1.masseMini,
    recette.ingredient1.masseMaxi,
  )
  let masse2 = randint(
    recette.ingredient2.masseMini,
    recette.ingredient2.masseMaxi,
  )
  if (decimal) {
    masse1 = Math.round(masse1 / 10) / 10
    masse2 = Math.round(masse2 / 10) / 10
  }
  const unite = decimal ? 'kg' : 'g'
  const uniteComplete = decimal ? 'kilogrammes' : 'grammes'
  const nomRecette = recette.nomRecette
  const personnage = prenomPronom()
  const enonce = `${personnage.prenom} prépare des ${nomRecette} avec $${texNombre(masse1, 1)}$ ${uniteComplete} de ${recette.ingredient1.nom} et $${texNombre(masse2, 1)}$ ${uniteComplete} de ${recette.ingredient2.nom}. 
  <br>Quelle est la masse totale des ingrédients utilisés ?`
  const data = { nb1: masse1, nb2: masse2 }
  const correction = `${personnage.prenom} prépare des ${nomRecette} avec $${texNombre(masse1, 1)}$ ${uniteComplete} de ${recette.ingredient1.nom} et $${texNombre(masse2, 1)}$ ${uniteComplete} de ${recette.ingredient2.nom}.
Donc, la masse totale des ingrédients utilisés est de : $${texNombre(masse1, 1)}\\text{ ${unite}}+${texNombre(masse2, 1)}\\text{ ${unite}}=${miseEnEvidence(`${texNombre(masse1 + masse2, 1)}\\text{ ${unite}}`)}$.`
  const probleme = new ProblemeAdditif('recette1', data)
  probleme.enonce = enonce
  probleme.correction = correction
  probleme.schema.lignes[1].barres[0].content = `$${texNombre(masse1, 2)}\\text{ ${unite}}$`
  probleme.schema.lignes[1].barres[1].content = `$${texNombre(masse2, 2)}\\text{ ${unite}}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(masse1 + masse2, 2))}\\text{ ${unite}}$`
  probleme.schema.topBraces = [
    { text: 'masse totale des ingrédients', start: 1, end: 11 },
  ]
  probleme.styleChampTexteMathlive = KeyboardType.masse
  probleme.reponse = `${texNombre(masse1 + masse2, 2)}${unite}`
  probleme.optionsComparaison = { unite: true }
  return probleme
}
