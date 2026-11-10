import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une dérivée'
export const interactifReady = true

export const uuid = '4a964'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class calcDerivee extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte =
      KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets
  }

  nouvelleVersion() {
    let a, b, c, pol
    if (this.quotaChoice('branche', [true, false])) {
      this.question = 'Soit $f$ la fonction définie sur $\\mathbb{R}$ par : '
      this.correction = "$f'(x)="

      a = randint(-3, 3, 0)
      this.reponse = `${a * 2025}\\times x^{2024}`
      this.question += `$f(x)=${rienSi1(a)}x^{${texNombre(2025, 0)}}$`
      this.correction = `$f'(x)=${
        a === 1 || a === -1
          ? `${miseEnEvidence(`${texNombre(a * 2025, 0)}x^{${texNombre(2024, 0)}}`)}`
          : `${a}\\times ${texNombre(2025, 0)} x^{${texNombre(2024, 0)}}= ${miseEnEvidence(`${texNombre(a * 2025, 0)}x^{${texNombre(2024, 0)}}`)}`
      }$`

      this.question += '.<br>Donner sa fonction dérivée.'
    } else {
      a = 2025 * choice([-1, 1])
      b = 2025 * choice([-1, 1])
      c = 2025 * choice([-1, 1])
      pol = reduirePolynomeDegre3(0, a, b, c)
      this.reponse = `${reduirePolynomeDegre3(0, 0, a * 2, b)}`
      this.question = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par : $f(x)=${pol}$.<br>
            Donner sa fonction dérivée. `

      this.correction = "<br>$f'(x)="

      this.correction += `2\\times ${ecritureParentheseSiNegatif(a)}x${ecritureAlgebrique(b)}=${miseEnEvidence(this.reponse)}$
             `
      this.reponse = `${reduirePolynomeDegre3(0, 0, a * 2, b)}`
    }

    if (this.interactif) {
      this.question += "<br> $f'(x)=$"
    }

    this.canReponseACompleter = "$f'(x)=\\ldots$"
  }
}
