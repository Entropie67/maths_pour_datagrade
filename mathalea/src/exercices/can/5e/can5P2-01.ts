import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Prendre t % d’une quantité'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '18/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '12/02/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '6946a'

export const refs = {
  'fr-fr': ['can5P2-01', '5P1B-flash1', '2I11-flash3'],
  'fr-ch': [],
}
export default class PoucentageP2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let a, u, b
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'a', 'b', 'c', 'c', 'd', 'd']) //
    ) {
      case 'a':
        a = randint(10, 99)
        this.reponse = a / 100
        this.question = `Prendre $${texNombre(a, 0)}\\,\\%$ d'une quantité revient à la multiplier par `
        if (!this.interactif) {
          this.question += '$\\ldots$ '
        }
        this.correction = `$${texNombre(a, 0)}\\,\\%=\\dfrac{${texNombre(a, 2)}}{100}=${texNombre(this.reponse, 2)}$ <br>
    Donc prendre $${texNombre(a, 2)}\\,\\%$ d'une quantité revient à la multiplier par $${miseEnEvidence(texNombre(this.reponse, 2))}$.`

        break
      case 'b':
        a = randint(1, 9)
        this.reponse = a / 100
        this.question = `Prendre $${a}\\,\\%$ d'une quantité revient à la multiplier par `
        if (!this.interactif) {
          this.question += '$\\ldots$ '
        }
        this.correction = `$${a}\\,\\%=\\dfrac{${texNombre(a, 2)}}{100}=${texNombre(this.reponse, 2)}$ <br>
       Donc prendre $${texNombre(a, 2)}\\,\\%$ d'une quantité revient à la multiplier par $${miseEnEvidence(texNombre(this.reponse, 2))}$.`
        this.reponse = a / 100
        break
      case 'c':
        u = randint(1, 99)
        a = randint(1, 9) / 10
        this.reponse = (a + u) / 100
        this.question = `Prendre $${texNombre(a + u, 1)}\\,\\%$ d'une quantité revient à la multiplier par `
        if (!this.interactif) {
          this.question += '$\\ldots$ '
        }
        this.correction = `$${texNombre(a + u, 1)}\\,\\%=\\dfrac{${texNombre(a + u, 1)}}{100}=${texNombre(this.reponse, 3)}$ <br>
       Donc prendre $${texNombre(a + u, 1)}\\,\\%$ d'une quantité revient à la multiplier par $${miseEnEvidence(texNombre(this.reponse, 3))}$.`

        break

      case 'd':
      default:
        b = randint(11, 99, [20, 30, 40, 50, 60, 70, 80])
        a = b / 10
        this.reponse = a / 100
        this.question = `Prendre $${texNombre(a, 1)}\\,\\%$ d'une quantité revient à la multiplier par `
        if (!this.interactif) {
          this.question += '$\\ldots$ '
        }
        this.correction = `$${texNombre(a, 1)}\\,\\%=\\dfrac{${texNombre(a, 2)}}{100}=${texNombre(this.reponse, 3)}$ <br>
      Donc prendre $${texNombre(a, 2)}\\,\\%$ d'une quantité revient à la multiplier par $${miseEnEvidence(texNombre(this.reponse, 3))}$.`
    }
    this.reponse = this.reponse.toFixed(3)
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = this.question
  }
}
