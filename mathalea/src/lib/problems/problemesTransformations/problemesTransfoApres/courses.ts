import { troisObjetsAVendre } from '../../../../exercices/6e/6N4A-2'
import { randint } from '../../../../modules/outils'
import { KeyboardType } from '../../../interactif/claviers/keyboard'
import { choice } from '../../../outils/arrayOutils'
import { miseEnEvidence } from '../../../outils/embellissements'
import { prenomPronom } from '../../../outils/Personne'
import { texNombre } from '../../../outils/texNombre'
import type Probleme from '../../Probleme'
import ProblemeTransfoApres from './problemesTransfoApres'
/**
 * @author Jean-claude Lhote
 */
export function courses3(decimal = true): Probleme {
  const personnage = prenomPronom()
  let objet: { nom: string; prixMini: number; prixMaxi: number }
  do {
    objet = choice(choice(troisObjetsAVendre))
  } while (objet.prixMini < 20) // Assure que les deux objets sont différents
  let prix1 = randint(objet.prixMini, objet.prixMaxi)
  let augmentation: number
  if (decimal) {
    augmentation = prix1 * randint(1, 5) * 0.04
    prix1 = Math.round(prix1 * 100 + randint(1, 19) * 5) / 100
  } else {
    augmentation = randint(1, Math.ceil(prix1 * 0.05))
  }
  const data = { nb1: prix1, nb2: augmentation }
  const enonce = `${personnage.prenom} a repéré hier ${objet.nom} à $${texNombre(prix1, 2, true)}$ € dans une boutique. Mais aujourd'hui, le prix a augmenté de $${texNombre(augmentation, 2, true)}$ €.
<br>Combien ${personnage.prenom} doit-${personnage.pronom} dépenser aujourd'hui ?`
  const correction = `Aujourd'hui, le prix d'${objet.nom} est de : $${texNombre(prix1, 2, true)}\\text{\\,€}+${texNombre(augmentation, 2, true)}\\text{\\,€} = ${miseEnEvidence(texNombre(prix1 + augmentation, 2, true))}$ €.`
  const probleme = new ProblemeTransfoApres('courses3', data)
  probleme.enonce = enonce
  probleme.correction = correction
  if (
    probleme.schema.topBraces == null ||
    probleme.schema.topBraces.length === 0
  ) {
    probleme.schema.topBraces = []
  }
  probleme.schema.topBraces[0].text = `$${miseEnEvidence(texNombre(prix1 + augmentation, 2, true))}\\text{ €}$`
  probleme.schema.lignes[0].barres[0].content = `$${texNombre(prix1, 2, true)}\\text{ €}$`
  probleme.schema.lignes[0].barres[1].content = `$${texNombre(augmentation, 2, true)}\\text{ €}$`
  probleme.styleChampTexteMathlive = KeyboardType.clavierDeBase
  probleme.optionsChampTexteMathlive = { texteApres: ' €' }
  probleme.reponse = `${texNombre(prix1 + augmentation, 2)}`
  return probleme
}
