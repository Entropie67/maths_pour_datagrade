import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
export const titre = 'Résoudre un problème avec une division'
export const interactifReady = true

export const dateDePublication = '30/10/2024'
/**
 * @author Gilles Mora
 */
export const uuid = '416be'

export const refs = {
  'fr-fr': ['canc3C20'],
  'fr-ch': [],
}
export default class problemeDivision extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (
      this.quotaRandint('typeDeQuestions', 1, 6) // 1,2, 3
    ) {
      case 1:
        {
          const a = randint(4, 10)
          const k = randint(3, 10)
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Un fleuriste a $${b}$ roses.<br>
Combien de bouquets de $${a}$ roses peut-il faire au maximum ?`
          this.correction = `Le fleuriste a au total $${b}$ roses et veut faire un maximum de bouquets avec $${a}$ roses chacun.<br>
          $${b} \\div ${a}=${this.reponse}$<br>
          Le fleuriste peut faire $${miseEnEvidence(this.reponse)}$ bouquets de $${a}$ roses chacun.`

          this.canReponseACompleter = '$\\ldots$ bouquets'
          this.optionsChampTexte = { texteApres: 'bouquets' }
        }
        break

      case 2:
        {
          const a = choice([3, 4, 6])
          const k = randint(3, 9)
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Les bouteilles sont vendues par pack de $${a}$ bouteilles.<br>
          Je dois acheter $${b}$ bouteilles.<br>
Combien de packs dois-je acheter ?`
          this.correction = `Je dois acheter au total $${b}$ bouteilles et les bouteilles sont vendues en pack de $${a}$ bouteilles.
          $${b} \\div ${a}=${this.reponse}$<br>          
          Je dois donc acheter $${miseEnEvidence(this.reponse)}$ packs.`

          this.canReponseACompleter = '$\\ldots$ packs'
          this.optionsChampTexte = { texteApres: 'packs' }
        }
        break
      case 3:
        {
          const a = randint(3, 10)
          const k = randint(3, 9)
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Un immeuble de $${a}$ étages comporte $${b}$ appartements. <br>
            Il y a le même nombre d’appartements à chaque étage.<br>
Combien d’appartements y a-t-il à chaque étage ?`
          this.correction = `L'immeuble de $${a}$ étages comporte $${b}$ appartements au total.<br>
          $${b} \\div ${a}=${this.reponse}$<br>
          Il y a $${miseEnEvidence(this.reponse)}$ appartements à chaque étage.`

          this.canReponseACompleter = '$\\ldots$ appartements'
          this.optionsChampTexte = { texteApres: 'appartements' }
        }
        break

      case 4:
        {
          const a = randint(5, 10)
          const k = randint(3, 9) * 10
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Pour l'achat de tee-shirts, une association a dépensé $${texNombre(b, 0)}$ €.<br>
            Chaque tee-shirt coûte $${a}$ €.<br>
            Combien de tee-shirts a-t-elle acheté ?`
          this.correction = `Au total, la dépense pour l'achat des tee-shirts est $${texNombre(b, 0)}$ € et chaque tee-shirt coûte $${a}$ €.<br>
          $${b} \\div ${a}=${this.reponse}$<br>          
          L'association a acheté $${miseEnEvidence(this.reponse)}$ tee-shirts.`

          this.canReponseACompleter = '$\\ldots$ tee-shirts'
          this.optionsChampTexte = { texteApres: 'tee-shirts' }
        }
        break

      case 5:
        {
          const prenom = prenomM()
          const a = randint(5, 10)
          const k = randint(3, 9) * 10
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Pour son goûter d’anniversaire ${prenom} a besoin de $${b}$ biscuits.<br>
             Les biscuits sont vendus par paquet de $${a}$.<br>
Combien de paquets ${prenom} doit-il acheter ?`
          this.correction = `Au total, ${prenom} a besoin de $${b}$ biscuits et ils sont vendus par paquet de $${a}$.<br>
            $${b} \\div ${a}=${this.reponse}$<br>       
          ${prenom} doit acheter $${miseEnEvidence(this.reponse)}$ paquets.`

          this.canReponseACompleter = '$\\ldots$ paquets'
          this.optionsChampTexte = { texteApres: 'paquets' }
        }
        break

      case 6:
        {
          const a = randint(2, 5) * 1000
          const k = randint(3, 9) * 10
          const b = k * a
          this.reponse = texNombre(k, 0)
          this.question = `Pour un concert, il y a $${texNombre(a, 0)}$ spectateurs. La recette totale est de $${texNombre(b, 0)}$ €.<br>
             Toutes les places ont été vendues a un prix unique.<br>
Quel est le prix d'une place pour ce concert ?`
          this.correction = `La recette totale est $${texNombre(b, 0)}$ € pour $${texNombre(a, 0)}$ spectateurs. <br>
          $${texNombre(b, 0)} \\div ${texNombre(a, 0)}=${this.reponse}$<br>
          Le prix de la place de concert est $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
