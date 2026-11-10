import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer un coefficient directeur'
export const interactifReady = true

export const uuid = '5fe2c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class coeffDirecteur extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaChoice('a', [-1, 1])
    const c = this.quotaChoice('c', [-1, 1])
    const b = this.quotaRandint('b', 1, 4) * c
    this.question = `Quel est le coefficient directeur de la tangente au point d'abscisse $${texNombre(2025, 0)}$ de la courbe d'équation $y=${reduirePolynomeDegre3(0, a, b, 2025)}$ ?`
    this.correction = `Si $f$ est la fonction définie par $f(x)=${reduirePolynomeDegre3(0, a, b, 2025)}$, le coefficient directeur de la tangente au point d'abscisse  $${texNombre(2025, 0)}$ est donné par le nombre dérivé  $f'(${texNombre(2025, 0)})$.<br>
              Comme $f'(x)=${reduireAxPlusB(2 * a, b)}$, $f'(${texNombre(2025)})=${texNombre(2 * a)}\\times ${texNombre(2025)}${ecritureAlgebrique(b)}= ${miseEnEvidence(`${texNombre(2 * a * 2025 + b, 0)}`)}$.
               `
    this.reponse = `${4050 * a + b}`
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
