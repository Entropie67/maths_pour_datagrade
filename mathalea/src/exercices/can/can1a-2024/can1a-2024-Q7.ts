import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Déterminer un coefficient multiplicateur ou un taux d'évolution"
export const interactifReady = true

export const uuid = 'abe93'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class TauxCoeff extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let taux: number
    let coeff: number
    if (this.canOfficielle) {
      this.question =
        'Multiplier une quantité par $0,87$ revient à la diminuer de : '
      this.correction = `Comme $0,87-1=-0,13$, multiplier par $0,87$ revient à diminuer de $${miseEnEvidence('13')}\\,\\%$. `
      this.reponse = 13 // Modification importante faite par Jean-claude Lhote le 28/03/2026 : la réponse est 13 et pas 12 !
      this.optionsChampTexte = { texteApres: '$\\%$' }
      if (!this.interactif) {
        this.question += '$\\ldots\\,\\%$'
      }
      this.canEnonce =
        'Multiplier une quantité par $0,87$ revient à la diminuer de  '
      this.canReponseACompleter = '$\\ldots\\,\\%$'
    } else {
      taux = randint(1, 29, [10, 20]) / 100
      coeff = 1 - taux
      if (choice([true, false])) {
        this.question = `Multiplier une quantité par $${texNombre(coeff, 2)}$ revient à la diminuer de : `
        this.correction = `Comme $${texNombre(coeff, 2)}-1=-${texNombre(taux, 2)}$, multiplier par $${texNombre(coeff, 2)}$ revient à diminuer de $${miseEnEvidence(texNombre(Math.round(taux * 100), 0))}\\,\\%$. `
        this.reponse = Math.round(taux * 100)
        this.optionsChampTexte = { texteApres: '$\\%$' }
        if (!this.interactif) {
          this.question += '$\\ldots\\,\\%$'
        }
        this.canEnonce = `Multiplier une quantité par $${texNombre(coeff, 2)}$ revient à la diminuer de : `
        this.canReponseACompleter = '$\\ldots\\,\\%$'
      } else {
        this.question = `Diminuer une quantité de $${texNombre(Math.round(taux * 100), 0)}\\,\\%$ revient à la multiplier par : `
        this.correction = `Diminuer une quantité de $${texNombre(Math.round(taux * 100), 0)}\\,\\%$ revient à la multiplier par $1 - \\dfrac{${texNombre(Math.round(taux * 100), 0)}}{100} = 1 - ${texNombre(taux, 2)} = ${miseEnEvidence(texNombre(coeff, 2))}$.`

        if (!this.interactif) {
          this.question += '$\\ldots$'
        }
        this.reponse = texNombre(coeff, 2)
        this.canEnonce = `Diminuer une quantité de $${texNombre(Math.round(taux * 100), 0)}\\,\\%$ revient à la multiplier par : `
      }
    }
  }
}
