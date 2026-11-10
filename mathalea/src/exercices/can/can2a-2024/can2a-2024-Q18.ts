/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer l'écriture scientifique"
export const interactifReady = true

export const uuid = '70846'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '5,4\\times 10^{4}'
      this.question = `Écriture  scientifique de $${texNombre(54000)}$<br>`
      this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(54000)}=${miseEnEvidence(`${texNombre(5.4)}\\times 10^4`)}$ avec $1\\leqslant 5,4 <10$.`
    } else {
      const choix = choice(['a', 'b', 'c']) //
      if (choix === 'a') {
        const a = randint(11, 39, [10, 20, 30]) / 1000
        const truc = a * 100
        this.reponse = `${stringNombre(truc)}\\times 10^{-2}`
        this.question = `Écriture  scientifique de $${texNombre(a, 3)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
            Ici : $${texNombre(a, 3)}=${miseEnEvidence(`${texNombre(truc, 3)}\\times 10^{-2}`)}$ avec $1\\leqslant ${texNombre(truc, 3)} <10$. `
      }
      if (choix === 'b') {
        const a = randint(111, 399, [200, 300]) / 100000
        const truc = a * 1000
        this.reponse = `${stringNombre(truc)}\\times 10^{-3}`
        this.question = `Écriture  scientifique de $${texNombre(a, 5)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
              Ici : $${texNombre(a, 5)}=${miseEnEvidence(`${texNombre(truc, 5)}\\times 10^{-3}`)}$ avec $1\\leqslant ${texNombre(truc, 5)} <10$. `
      }
      if (choix === 'c') {
        const a = randint(111, 399, [200, 300]) / 1000000
        const truc = a * 10000
        this.reponse = `${stringNombre(truc)}\\times 10^{-4}`
        this.question = `Écriture  scientifique de $${texNombre(a, 6)}$`
        this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
                Ici : $${texNombre(a, 6)}=${miseEnEvidence(`${texNombre(truc, 6)}\\times 10^{-4}`)}$ avec $1\\leqslant ${texNombre(truc, 6)} <10$. `
      }
    }
  }
}
