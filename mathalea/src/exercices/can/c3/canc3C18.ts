import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { prenomM } from '../../../lib/outils/Personne'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Résoudre un problème avec une soustraction'
export const interactifReady = true

export const dateDePublication = '31/10/2024'
/**
 * @author Gilles Mora
 */
export const uuid = '31e91'

export const refs = {
  'fr-fr': ['canc3C18'],
  'fr-ch': ['PR-19'],
}
export default class problemeSoustraction extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5

    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (
      this.quotaRandint('typeProbleme', 1, 7) // 1,2, 3
    ) {
      case 1:
        {
          const a = randint(4, 6) * 10 + randint(1, 5)
          const b = randint(1, 3) * 10 + randint(6, 9)
          this.reponse = texNombre(a - b, 0)
          this.question = `Dans un carton qui contient $${a}$ balles, $${b}$ sont rouges.<br>
Combien de balles ne sont pas rouges ?`
          this.correction = `Le carton contient $${a}$ balles en tout et $${b}$ sont rouges.<br>
           $${a} -${b}=${this.reponse}$<br>
          Dans le carton, $${miseEnEvidence(this.reponse)}$ balles ne sont pas rouges.`

          this.canReponseACompleter = '$\\ldots$ balles'
          this.optionsChampTexte = { texteApres: 'balles' }
        }
        break

      case 2:
        {
          const a = 100 + randint(3, 4) * 10 + randint(1, 5)
          const b = randint(2, 3) * 10 + randint(6, 9)
          this.reponse = texNombre(a - b, 0)
          this.question = `Un cycliste doit parcourir $${a}\\text{ km}$. <br>
          Il a déjà parcouru $${b}\\text{ km}$.<br>
Combien lui reste-t-il de $\\text{ km}$ à parcourir ?`
          this.correction = `Le cycliste doit parcourir $${a}\\text{ km}$ et il a déjà parcouru $${b}\\text{ km}$.<br>
           $${a} -${b}=${this.reponse}$ <br>
          Le cycliste doit encore parcourir $${miseEnEvidence(this.reponse)}\\text{ km}$.`

          this.canReponseACompleter = '$\\ldots\\text{ km}$'
          this.optionsChampTexte = { texteApres: '$\\text{ km}$' }
        }
        break
      case 3:
        {
          const prenom = prenomM()
          const a = randint(4, 8) * 10 + randint(1, 5)
          const b = randint(1, 2) * 10 + randint(6, 9)
          this.reponse = texNombre(a - b, 0)
          this.question = ` ${prenom} a $${b}$ euros.<br>
           Il voudrait acheter un jeu qui coûte $${a}$ euros.<br>
Combien lui manque-t-il ?`
          this.correction = `${prenom} veut acheter un jeu qui coûte $${a}$ euros mais a seulement $${b}$ euros.<br>
          $${a} -${b}=${this.reponse}$<br>
          Il manque $${miseEnEvidence(this.reponse)}$ € à ${prenom} pour acheter son jeu.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 4:
        {
          const prenom = prenomM()
          const a = randint(4, 8) * 10 + randint(1, 5)
          const b = randint(1, 2) * 10 + randint(6, 9)
          this.reponse = texNombre(a - b, 0)
          this.question = `${prenom} a acheté un pantalon et une chemise pour $${a}$ euros. <br>
            Le pantalon coûte $${b}$ euros.<br>
 Quel est le prix de la chemise ?`
          this.correction = `${prenom} a acheté un pantalon à $${b}$ € et une chemise pour un total de $${a}$ €.<br>
          $${a} -${b}=${this.reponse}$<br>
          La chemise coûte $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break

      case 5:
        {
          const a = randint(2, 4) * 1000 + randint(1, 4) * 100
          const b = randint(15, 19) * 100
          this.reponse = texNombre(a - b, 0)
          this.question = `Dans une salle de spectacle, il y a $${texNombre(a, 0)}$ places.<br>
           $${texNombre(b, 0)}$ places sont occupées.<br>
Combien de places sont inoccupées ? `
          this.correction = `Au total, il y a $${texNombre(a, 0)}$ places et seulement $${texNombre(b, 0)}$ places sont occupées.<br>
          $${texNombre(a, 0)} -${texNombre(b, 0)}=${this.reponse}$<br>
          Ainsi, $${miseEnEvidence(this.reponse)}$ places sont inoccupées.`

          this.canReponseACompleter = '$\\ldots$ places'
          this.optionsChampTexte = { texteApres: 'places' }
        }
        break

      case 6:
        {
          const a =
            randint(1, 3) * 1000 + randint(1, 9) * 100 + randint(6, 9) * 10
          const b = randint(1, 2) * 100 + randint(1, 5) * 10
          const c = a - b
          this.reponse = texNombre(c, 0)
          this.question = `Après une augmentation de $${b}$ euros, mon salaire mensuel est de $${texNombre(a, 0)}$ euros.<br>
             Quel était mon salaire mensuel avant l'augmentation ?`
          this.correction = `Mon salaire mensuel est de $${texNombre(a, 0)}$ € après une augmentation de $${b}$ €.<br>
          $${texNombre(a, 0)} -${b}=${this.reponse}$<br>          
          Mon salaire était de $${miseEnEvidence(this.reponse)}$ €.`

          this.canReponseACompleter = '$\\ldots$ €'
          this.optionsChampTexte = { texteApres: '€' }
        }
        break
      case 7:
        {
          const a = randint(13, 29) * 1000 + randint(1, 9) * 100
          const b = randint(0, 2) * 1000 + randint(1, 9) * 100
          const c = a - b
          this.reponse = texNombre(c, 0)
          this.question = `Le prix d'une voiture est $${texNombre(a, 0)}$ euros avec l'option confort.<br>
              L'option confort coûte $${texNombre(b, 0)}$ euros.<br>
                              Quel est le prix de cette voiture sans l'option confort ?`
          this.correction = `Le prix d'une voiture est $${texNombre(a, 0)}$ € avec l'option.<br>
          $${texNombre(a, 0)} -${texNombre(b)}=${this.reponse}$<br>
          Sans l'option confort, le prix de la voiture est $${miseEnEvidence(this.reponse)}$ €.`

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
