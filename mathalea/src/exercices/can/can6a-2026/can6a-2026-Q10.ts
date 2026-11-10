import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Compléter une égalité avec une fraction'
export const interactifReady = true

export const uuid = '1h3ps'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can20266Q10 extends ExerciceCan {
  enonce(num?: number, cas?: number) {
    if (num == null || cas == null) {
      num = randint(1, 9) * 10
      cas = choice([1, 2, 3, 4])
    }
    const result = num / 10

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'
    this.consigne = 'Complète.'

    if (cas === 1) {
      // Cas 1 : num/100 = .../10
      this.reponse = {
        champ1: { value: result },
      }

      this.question = `\\dfrac{${num}}{100}=\\dfrac{%{champ1}}{10}`

      this.correction = `$\\dfrac{${num}}{100}=\\dfrac{${miseEnEvidence(result)}}{10}$ (en divisant par $10$ le numérateur et le dénominateur de la première fraction).`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$\\dfrac{${num}}{100}=\\dfrac{\\ldots}{10}$`
    } else if (cas === 2) {
      // Cas 2 : num/100 = result/...
      this.reponse = {
        champ1: { value: 10 },
      }

      this.question = `\\dfrac{${num}}{100}=\\dfrac{${result}}{%{champ1}}`

      this.correction = `$\\dfrac{${num}}{100}=\\dfrac{${result}}{${miseEnEvidence(10)}}$ (en divisant par $10$ le numérateur et le dénominateur de la première fraction).`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$\\dfrac{${num}}{100}=\\dfrac{${result}}{\\ldots}$`
    } else if (cas === 3) {
      // Cas 3 : result/10 = .../100
      this.reponse = {
        champ1: { value: num },
      }

      this.question = `\\dfrac{${result}}{10}=\\dfrac{%{champ1}}{100}`

      this.correction = `$\\dfrac{${result}}{10}=\\dfrac{${miseEnEvidence(num)}}{100}$ (en multipliant par $10$ le numérateur et le dénominateur).`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$\\dfrac{${result}}{10}=\\dfrac{\\ldots}{100}$`
    } else {
      // Cas 4 : result/10 = num/...
      this.reponse = {
        champ1: { value: 100 },
      }

      this.question = `\\dfrac{${result}}{10}=\\dfrac{${num}}{%{champ1}}`

      this.correction = `$\\dfrac{${result}}{10}=\\dfrac{${num}}{${miseEnEvidence(100)}}$ (en multipliant par $10$ le numérateur et le dénominateur).`

      this.canEnonce = 'Complète.'
      this.canReponseACompleter = `$\\dfrac{${result}}{10}=\\dfrac{${num}}{\\ldots}$`
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(10, 1)
    else this.enonce()
  }
}
