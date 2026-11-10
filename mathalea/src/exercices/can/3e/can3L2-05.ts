import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
export const titre = 'Utiliser la distributivité simple et réduire'
export const interactifReady = true

export const dateDePublication = '20/05/2024'
export const uuid = 'd6cd2'
export const refs = {
  'fr-fr': ['can3L2-05', '2L11-flash2'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class ReduireAvecParentheses2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const variable = choice(['x', 'y', 'a', 'b', 'n'])
    const a = this.quotaRandint('a', -10, 10, [0])
    const c = this.quotaRandint('c', -10, 10, [0])
    const d = this.quotaRandint('d', -10, 10, [0])
    const k = this.quotaRandint('k', -10, 10, [-1, 1, 0])
    const choix = this.quotaChoice('choix', [true, false])
    const reponse = choix
      ? reduireAxPlusB(a + k * c, k * d, variable)
      : reduireAxPlusB(k * c, k * d + a, variable) // texNombre(b).mul(-1).plus(a), 2) + `${variable}`
    this.reponse = {
      reponse: {
        value: reponse,
        // Seule une expression réduite est acceptée
        options: { expressionsForcementReduites: true },
      },
    }
    this.question = `Écrire le plus simplement possible  $${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebrique(k)}(${reduireAxPlusB(c, d, variable)})$.`
    if (this.interactif) {
      this.question += `<br>$${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebrique(k)}(${reduireAxPlusB(c, d, variable)})=$`
    }
    this.correction =
      'On commence par développer le produit, puis on réduit. <br>'

    this.correction += `$\\begin{aligned}
          ${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebrique(k)}(${reduireAxPlusB(c, d, variable)})&=${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebrique(k * c)}${variable}${ecritureAlgebrique(k * d)}\\\\
          &=${miseEnEvidence(`${choix ? reduireAxPlusB(a + k * c, k * d, variable) : reduireAxPlusB(k * c, k * d + a, variable)}`)}
          \\end{aligned}$`
  }
}
