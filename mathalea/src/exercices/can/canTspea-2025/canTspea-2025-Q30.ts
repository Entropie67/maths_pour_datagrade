import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une limite'
export const interactifReady = true

export const uuid = 'a09e5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ30 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? -5 : randint(-9, 9, 0)
    const b = this.canOfficielle ? 2 : randint(-9, 9, 0)
    const c = this.canOfficielle ? 2 : randint(-9, 9, 0)
    const d = this.canOfficielle ? -5 : randint(-9, 9, 0)
    const choix1 = this.canOfficielle ? true : choice([true, false])
    const choix2 = this.canOfficielle ? true : choice([true, false])
    this.reponse = new FractionEtendue(a, c)
    this.question = `$\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{${choix1 ? `${reduireAxPlusB(a, b)}` : `${b}${ecritureAlgebriqueSauf1(a)}x`}}{${choix2 ? `${reduireAxPlusB(c, d)}` : `${d}${ecritureAlgebriqueSauf1(c)}x`}}$`
    this.correction = `$\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{${choix1 ? `${reduireAxPlusB(a, b)}` : `${b}${ecritureAlgebriqueSauf1(a)}x`}}{${choix2 ? `${reduireAxPlusB(c, d)}` : `${d}${ecritureAlgebriqueSauf1(c)}x`}}
    =\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{${rienSi1(a)}x}{${rienSi1(c)}x}=${miseEnEvidence(new FractionEtendue(a, c).texFractionSimplifiee)}$.`
  }
}
