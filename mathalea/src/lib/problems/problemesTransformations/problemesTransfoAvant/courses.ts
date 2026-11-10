import { troisObjetsAVendre } from '../../../../exercices/6e/6N4A-2'
import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeTransfoAvant from './problemesTransfoAvant'
import { deDevant } from '../../../outils/outilString'
/**
 * @author Jean-claude Lhote
 */
export function courses5(decimal = true): Probleme {
  const personnage = prenomPronom()
  let objet: { nom: string; prixMini: number; prixMaxi: number }
  do {
    objet = choice(choice(troisObjetsAVendre))
  } while (objet.prixMini < 20) // Assure que les deux objets sont différents
  let prix1 = randint(objet.prixMini, objet.prixMaxi)
  let solde: number
  if (decimal) {
    prix1 = Math.round(prix1 * 100 + randint(1, 19) * 5) / 100
    solde = Math.ceil(prix1) * randint(20, 100) * 0.8
  } else {
    solde = randint(12, 40) * prix1 + randint(1, 45)
  }
  const data = { nb1: prix1, nb2: solde }
  const enonce = `Dans la boutique ${deDevant(personnage.prenom)}, un client vient d'acheter ${objet.nom} à $${texNombre(prix1, 2)}$ €. Il y a maintenant dans la caisse $${texNombre(solde, 2)}$ €.
<br>Combien y avait-il dans la caisse avant cet achat ?`
  const correction = `Avant cet achat, la somme qu'il y avait dans la caisse était de : $${texNombre(solde, 2)}\\text{ €} - ${texNombre(prix1, 2)}\\text{ €} = ${miseEnEvidence(texNombre(solde - prix1, 2))}$ €.`
  const probleme = new ProblemeTransfoAvant('courses5', data)
  probleme.enonce = enonce
  probleme.correction = correction
  if (
    probleme.schema.topBraces == null ||
    probleme.schema.topBraces.length === 0
  ) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = `$${texNombre(solde, 2)}\\text{ €}$`
  probleme.schema.lignes[0].barres[0].content = `$${miseEnEvidence(texNombre(solde - prix1, 2))}\\text{ €}$`
  probleme.schema.lignes[0].barres[1].content = `$${texNombre(prix1, 2)}\\text{ €}$`
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.optionsChampTexteMathlive = { texteApres: ' €' }
  probleme.reponse = `${texNombre(solde - prix1, 2)}`
  return probleme
}
