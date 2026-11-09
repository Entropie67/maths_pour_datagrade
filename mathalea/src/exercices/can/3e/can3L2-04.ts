import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
export const titre =
  "Réduire une expression avec des parenthèses précédées d'un signe $+$ ou $-$"
export const interactifReady = true

export const dateDePublication = '19/05/2024'
export const uuid = '8e42a'
export const refs = {
  'fr-fr': ['can3L2-04', '2L11-flash1'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ReduireAvecParentheses extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1: // ax+(cx+d) ou a+(cx+d)
        {
          const variable = choice(['x', 'y', 'a', 'b', 'n'])
          const a = randint(-10, 10, 0)
          const c = randint(-10, 10, 0)
          const d = randint(-10, 10, 0)
          const choix = choice([true, false])
          this.reponse = choix
            ? reduireAxPlusB(a + c, d, variable)
            : reduireAxPlusB(c, d + a, variable) // texNombre(b).mul(-1).plus(a), 2) + `${variable}`
          this.reponse = {
            reponse: {
              value: this.reponse,
              // Seule une expression réduite est acceptée
              options: { expressionsForcementReduites: true },
            },
          }
          this.question = `Écrire le plus simplement possible $${choix ? `${rienSi1(a)}${variable}` : `${a}`}+(${reduireAxPlusB(c, d, variable)})$.`
          if (this.interactif) {
            this.question += `<br>$${choix ? `${rienSi1(a)}${variable}` : `${a}`}+(${reduireAxPlusB(c, d, variable)})=$`
          }
          this.correction =
            "Les parenthèses sont précédées d'un signe $+$ (on les supprime sans changer l'expression entre parenthèses). <br>"

          this.correction += `$\\begin{aligned}
          ${choix ? `${rienSi1(a)}${variable}` : `${a}`}+(${reduireAxPlusB(c, d, variable)})&=${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebriqueSauf1(c)}${variable}${ecritureAlgebrique(d)}\\\\
          &=${miseEnEvidence(`${choix ? reduireAxPlusB(a + c, d, variable) : reduireAxPlusB(c, d + a, variable)}`)}
          \\end{aligned}$`
        }
        break
      case 2: // ax-(cx+d) ou a-(cx+d)
        {
          const variable = choice(['x', 'y', 'a', 'b', 'n'])
          const a = randint(-10, 10, 0)
          const c = randint(-10, 10, 0)
          const d = randint(-10, 10, 0)
          const choix = choice([true, false])
          this.reponse = choix
            ? reduireAxPlusB(a - c, -d, variable)
            : reduireAxPlusB(-c, a - d, variable) // texNombre(b).mul(-1).plus(a), 2) + `${variable}`
          this.reponse = {
            reponse: {
              value: this.reponse,
              // Seule une expression réduite est acceptée
              options: { expressionsForcementReduites: true },
            },
          }
          this.question = `Écrire le plus simplement possible $${choix ? `${rienSi1(a)}${variable}` : `${a}`}-(${reduireAxPlusB(c, d, variable)})$.`
          if (this.interactif) {
            this.question += `<br>$${choix ? `${rienSi1(a)}${variable}` : `${a}`}-(${reduireAxPlusB(c, d, variable)})=$`
          }
          this.correction =
            "Les parenthèses sont précédées d'un signe $-$ (on les supprime en prenant l'opposé des termes de l'expression entre parenthèses). <br>"

          this.correction += `$\\begin{aligned}
          ${choix ? `${rienSi1(a)}${variable}` : `${a}`}-(${reduireAxPlusB(c, d, variable)})&=${choix ? `${rienSi1(a)}${variable}` : `${a}`}${ecritureAlgebriqueSauf1(-c)}${variable}${ecritureAlgebrique(-d)}\\\\
      &=${miseEnEvidence(`${choix ? reduireAxPlusB(a - c, -d, variable) : reduireAxPlusB(-c, a - d, variable)}`)}
      \\end{aligned}$`
        }
        break
    }
  }
}
