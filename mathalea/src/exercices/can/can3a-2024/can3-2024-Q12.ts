import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Simplifier des puissances de 10'
export const interactifReady = true

export const uuid = '29066'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = 0.01
      this.question = 'Écriture décimale de $\\dfrac{10^3}{10^5}$   '
      this.correction = `$\\dfrac{10^3}{10^5}=\\dfrac{1}{10^2}=10^{-2}=\\dfrac{1}{100}=${miseEnEvidence(texNombre(0.01))}$`
    } else {
      if (choice([true, false])) {
        const a = randint(2, 3)
        const k = randint(1, 4)
        const b = a + k
        this.reponse = 10 ** (b - a)
        this.question = `Écriture décimale de $\\dfrac{10^${b}}{10^{${a}}}$   `
        this.correction = `$\\dfrac{10^${b}}{10^${a}}=10^{${b - a}}=${miseEnEvidence(texNombre(10 ** k, 0))}$`
      } else {
        const a = randint(2, 3)
        const k = randint(1, 4)
        const b = a + k

        this.reponse = 10 ** (a - b)
        this.question = `Écriture décimale de $\\dfrac{10^${a}}{10^{${b}}}$   `
        this.correction = `$\\dfrac{10^${a}}{10^${b}}=\\dfrac{1}{10^{${rienSi1(b - a)}}}=${miseEnEvidence(texNombre(10 ** -k, 5))}$`
      }
    }
  }
}
