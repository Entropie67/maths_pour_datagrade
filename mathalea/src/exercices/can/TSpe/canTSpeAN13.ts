import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer une somme élémentaire avec le logarithme népérien'
export const interactifReady = true

export const dateDePublication = '20/02/2025'

export const uuid = '7c230'
export const refs = {
  'fr-fr': ['canTSpeAN13'],
  'fr-ch': [],
}

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon

*/
export default class logarithme extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a1 = randint(-5, 5, 0)
    const a2 = randint(-5, 5, 0)
    const a3 = randint(-5, 5, 0)
    const n1 = randint(-3, 3, [0, 1])
    const n3 = randint(-3, 3, [0, 1, n1])
    const a4 = randint(-5, 5, 0)
    const n4 = randint(-3, 3, [0, 1, n1, n3])
    this.question = `Calculer $A=${rienSi1(a1)} \\ln\\left(\\mathrm{e}^{${n1}}\\right)${ecritureAlgebriqueSauf1(a2)} \\ln(1)${ecritureAlgebriqueSauf1(a3)} \\ln\\left(\\dfrac{1}{\\mathrm{e}^{${n3}}}\\right)${ecritureAlgebriqueSauf1(a4)}\\ln\\left(\\mathrm{e}^{${n4}}\\right)$.`
    this.correction = `$\\begin{aligned} A&=${rienSi1(a1)} \\ln\\left(\\mathrm{e}^{${n1}}\\right)${ecritureAlgebriqueSauf1(a2)} \\ln(1)${ecritureAlgebriqueSauf1(a3)} \\ln\\left(\\dfrac{1}{\\mathrm{e}^{${n3}}}\\right)${ecritureAlgebrique(a4)}\\ln\\left(\\mathrm{e}^{${n4}}\\right)\\\\
    &=${a1} \\times ${ecritureParentheseSiNegatif(n1)}\\ln(\\mathrm{e})${ecritureAlgebrique(a2)} \\times 0${ecritureAlgebriqueSauf1(a3)} \\ln\\left(\\mathrm{e}^{${-n3}}\\right)${ecritureAlgebrique(a4)}\\times ${ecritureParentheseSiNegatif(n4)}\\\\
    &=${a1 * n1} \\times 1 ${ecritureAlgebrique(a3)} \\times ${ecritureParentheseSiNegatif(-n3)}\\times \\ln\\left({\\mathrm{e}}\\right)${ecritureAlgebrique(a4 * n4)}\\\\
    &=${a1 * n1}${ecritureAlgebrique(-a3 * n3)}${ecritureAlgebrique(a4 * n4)}\\\\
    &=${miseEnEvidence(a1 * n1 - a3 * n3 + a4 * n4)}\\end{aligned}$`
    this.optionsChampTexte = { texteAvant: '<br>$A=~$' }
    this.reponse = a1 * n1 - a3 * n3 + a4 * n4
  }
}
