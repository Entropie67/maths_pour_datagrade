import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer avec une puissance'
export const interactifReady = true

export const uuid = 'fb465'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class puissances1 extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.optionsChampTexte = { texteAvant: '$?=$' }
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = 'La moitié de $2^{30}=2^?$<br>'
      this.reponse = '29'
      this.correction = `La moitié de $2^{30}$ est $\\dfrac{2^{30}}{2}=2^{${miseEnEvidence(this.reponse)}}$`
      this.canEnonce = 'La moitié de $2^{30}'
      this.canReponseACompleter = ' $2^{\\ldots}$'
    } else {
      let a
      switch (
        choice(['a', 'b']) //, 'b', 'c', 'd', 'e', 'f'
      ) {
        case 'a':
          a = randint(25, 35)

          this.reponse = (a - 1).toFixed(0)
          this.question = `La moitié de $2^{${a}}=2^?$<br>`
          this.correction = `La moitié de $2^{30}$ est $\\dfrac{2^{${a}}}{2}=2^{${miseEnEvidence(this.reponse)}}$.`
          this.canEnonce = `La moitié  de $2^{${a}}$`
          this.canReponseACompleter = ' $2^{\\ldots}$'
          break

        case 'b':
          a = randint(25, 35)

          this.reponse = (a + 1).toFixed(0)
          this.question = `Le double  de $2^{${a}}=2^?$<br>`
          this.correction = `Le double de $2^{30}$ est $2\\times 2^{${a}}=2^{${miseEnEvidence(this.reponse)}}$.`
          this.canEnonce = `Le double  de $2^{${a}}$`
          this.canReponseACompleter = ' $2^{\\ldots}$'
          break
      }
      if (!this.interactif) {
        this.question += '$?=\\ldots$'
      }
    }
  }
}
