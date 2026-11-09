import { bleuMathalea } from '../../../lib/colors'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'
export const titre = 'Calculer une image avec le second degré'
export const interactifReady = true

/**
 * @author Gilles Mora
 */
export const uuid = 'b2c31'

export const refs = {
  'fr-fr': ['can2F11-02', '2F13-flash2', '2F22-2'],
  'fr-ch': ['NR'],
}
export default class CalculImageSecondDegre extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.versionQcmDisponible = true
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let x, a, b, c, d, expression
    let nombreSouhaites: number
    let compteur = 0
    do {
      switch (
        choice(['a', 'b', 'c', 'd']) //
      ) {
        case 'a':
          x = this.versionQcm ? randint(-5, -1) : randint(1, 4)
          a = randint(1, 2)
          b = randint(1, 2)
          c = randint(2, 5)

          expression = `${rienSi1(a)}x^2+${rienSi1(b)}x+${c}`
          this.question = `On considère ${context.isDiaporama ? '<br>' : ''} la fonction $f$ définie par ${context.isDiaporama ? '<br>' : ''} $f(x)= ${expression}$. <br>`

          if (a === 1 && b !== 1) {
            this.correction = `On a : <br>
          $\\begin{aligned}
          f(${x})&= ${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}+${c}\\\\
          &=${x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &= ${a * x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &=${miseEnEvidence(a * x * x + b * x + c)}
          \\end{aligned}$<br>`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
          On commence par calculer le carré de $${x}$, soit $${ecritureParentheseSiNegatif(x)}^2=${texNombre(x ** 2)}$. <br>
   On calcule $${b}\\times ${ecritureParentheseSiNegatif(x)}$ que l'on ajoute à $${texNombre(a * x ** 2)}$, soit $${a * x ** 2}+${ecritureParentheseSiNegatif(b * x)}=${a * x ** 2 + b * x}$.<br>
  Pour finir, on ajoute $${c}$, ce qui donne $${texNombre(a * x ** 2 + b * x)}+${c}$, soit $${texNombre(a * x ** 2 + b * x + c)}$.<br>`,
              bleuMathalea,
            )
          }
          if (a !== 1 && b !== 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=${a}\\times${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}+${c}\\\\
          &=${a}\\times ${x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &=${a * x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &=${miseEnEvidence(a * x * x + b * x + c)}
          \\end{aligned}$.<br>`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
              On commence par calculer le carré de $${x}$, soit $${ecritureParentheseSiNegatif(x)}^2=${texNombre(x ** 2)}$. <br>
     On multiplie ensuite cette valeur par le coefficient devant $x^2$, soit $${a}\\times ${texNombre(x ** 2)}=${texNombre(a * x ** 2)}$.<br>
      On calcule $${b}\\times ${ecritureParentheseSiNegatif(x)}$ que l'on ajoute à $${texNombre(a * x ** 2)}$, soit $${a * x ** 2}+${ecritureParentheseSiNegatif(b * x)}=${a * x ** 2 + b * x}$.<br>
      Pour finir, on ajoute $${c}$, ce qui donne $${texNombre(a * x ** 2 + b * x)}+${c}$, soit $${texNombre(a * x ** 2 + b * x + c)}$.<br>`,
              bleuMathalea,
            )
          }
          if (a === 1 && b === 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=${ecritureParentheseSiNegatif(x)}^2+ ${ecritureParentheseSiNegatif(x)}+${c}\\\\
          &=${x * x}+${ecritureParentheseSiNegatif(x)}+${c}\\\\
          &=${miseEnEvidence(x * x + b * x + c)}
          \\end{aligned}$<br>`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
          On commence par calculer le carré de $${x}$, soit $${ecritureParentheseSiNegatif(x)}^2=${texNombre(x ** 2)}$. <br>
   On ajoute $${x}$ soit $${a * x ** 2}+${ecritureParentheseSiNegatif(x)}=${x ** 2 + b * x}$.<br>
  Pour finir, on ajoute $${c}$, ce qui donne $${texNombre(a * x ** 2 + b * x)}+${c}$, soit $${texNombre(a * x ** 2 + b * x + c)}$.<br>`,
              bleuMathalea,
            )
          }
          if (a !== 1 && b === 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=${a}\\times${ecritureParentheseSiNegatif(x)}^2+${b}\\times ${ecritureParentheseSiNegatif(x)}+${c}\\\\
          &=${a}\\times ${x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &=${a * x * x}${ecritureAlgebrique(b * x)}+${c}\\\\
          &=${miseEnEvidence(a * x * x + b * x + c)}
          \\end{aligned}$<br>`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
          On commence par calculer le carré de $${x}$, soit $${ecritureParentheseSiNegatif(x)}^2=${texNombre(x ** 2)}$. <br>
 On multiplie ensuite cette valeur par le coefficient devant $x^2$, soit $${a}\\times ${texNombre(x ** 2)}=${texNombre(a * x ** 2)}$.<br>
 On ajoute $${x}$ soit $${a * x ** 2}+${ecritureParentheseSiNegatif(x)}=${a * x ** 2 + b * x}$.<br>
  Pour finir, on ajoute $${c}$, ce qui donne $${texNombre(a * x ** 2 + b * x)}+${c}$, soit $${texNombre(a * x ** 2 + b * x + c)}$.<br>`,
              bleuMathalea,
            )
          }
          this.reponse = this.versionQcm
            ? `$${texNombre(a * x * x + b * x + c)}$`
            : a * x * x + b * x + c

          this.distracteurs = [
            a * x * x + b * x + c === -a * x * x + b * x + c
              ? `$${texNombre(a * x - b * x - c)}$`
              : `$${texNombre(-a * x * x + b * x + c)}$`,
            a * x * x + b * x + c === 2 * x + b * x + c
              ? `$${texNombre(-2 * a * x + b * x + c)}$`
              : `$${texNombre(-2 * x + b * x + c)}$`,
            a * x * x + b * x + c === x + b * x + c
              ? `$${texNombre(-x + b * x + c)}$`
              : `$${texNombre(x + b * x + c)}$`,
          ]
          break
        case 'b':
          a = randint(1, 3)
          b = randint(-2, 2, [0])
          c = randint(1, 3)
          d = randint(-3, 3, [0, b])
          x = this.versionQcm ? randint(-5, -1) : randint(-3, 3, [0])

          expression = `(${rienSi1(a)}x${ecritureAlgebrique(b)})(${rienSi1(c)}x${ecritureAlgebrique(d)})`
          this.question = `On considère ${context.isDiaporama ? '<br>' : ''} la fonction $f$ définie par ${context.isDiaporama ? '<br>' : ''} $f(x)= ${expression}$. <br>`

          if (a === 1 && c === 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=\\left(${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)\\left(${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}\\right)\\\\
          &=(${a * x}${ecritureAlgebrique(b)})(${c * x}${ecritureAlgebrique(d)})\\\\
          &=${a * x + b}\\times${ecritureParentheseSiNegatif(c * x + d)}\\\\
          &=${miseEnEvidence((a * x + b) * (c * x + d))}
          \\end{aligned}$<br>`
            this.reponse = this.versionQcm
              ? `$${(a * x + b) * (c * x + d)}$`
              : `${(a * x + b) * (c * x + d)}`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
          On commence par «${sp()}calculer${sp()}» la première parenthèse : $${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${a * x + b}$.<br>
           Puis la deuxième : $${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}=${c * x + d}$.<br>
        On fait le produit des nombres obtenus : $${a * x + b}\\times ${c * x + d}=${(a * x + b) * (c * x + d)}$.`,
              bleuMathalea,
            )
          }
          if (a !== 1 && c !== 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=\\left(${rienSi1(a)}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}\\right)\\\\
          &=(${a * x}${ecritureAlgebrique(b)})(${c * x}${ecritureAlgebrique(d)})\\\\
          &= ${a * x + b}\\times${ecritureParentheseSiNegatif(c * x + d)}=${miseEnEvidence((a * x + b) * (c * x + d))}
          \\end{aligned}$<br>`

            this.correction += texteEnCouleur(
              ` Mentalement : <br>
        On commence par «${sp()}calculer${sp()}» la première parenthèse : $${rienSi1(a)}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${a * x + b}$.<br>
        Puis la deuxième : $${c}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}=${c * x + d}$.<br>
        On fait le produit des nombres obtenus : $${a * x + b}\\times ${ecritureParentheseSiNegatif(c * x + d)}=${(a * x + b) * (c * x + d)}$.`,
              bleuMathalea,
            )
          }
          if (a === 1 && c !== 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=\\left(${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)\\left(${c}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}\\right)\\\\
          &=(${a * x}${ecritureAlgebrique(b)})(${c * x}${ecritureAlgebrique(d)})\\\\
          &=${a * x + b}\\times${ecritureParentheseSiNegatif(c * x + d)}=${miseEnEvidence((a * x + b) * (c * x + d))}
          \\end{aligned}$<br>`

            this.correction += texteEnCouleur(
              ` Mentalement : <br>
        On commence par «${sp()}calculer${sp()}» la première parenthèse : $${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${a * x + b}$.<br>
        Puis la deuxième : $${c}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}=${c * x + d}$.<br>
        On fait le produit des nombres obtenus : $${a * x + b}\\times ${c * x + d}=${(a * x + b) * (c * x + d)}$.`,
              bleuMathalea,
            )
          }
          if (a !== 1 && c === 1) {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=\\left(${a}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)\\left(${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}\\right)\\\\
          &=(${a * x}${ecritureAlgebrique(b)})(${c * x}${ecritureAlgebrique(d)})\\\\
          &=${a * x + b}\\times${ecritureParentheseSiNegatif(c * x + d)}=${miseEnEvidence((a * x + b) * (c * x + d))}
          \\end{aligned}$<br>`

            this.correction += texteEnCouleur(
              ` Mentalement : <br>
        On commence par «${sp()}calculer${sp()}» la première parenthèse : $${a}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}=${a * x + b}$.<br>
        Puis la deuxième : $${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(d)}=${c * x + d}$.<br>
        On fait le produit des nombres obtenus : $${a * x + b}\\times ${ecritureParentheseSiNegatif(c * x + d)}=${(a * x + b) * (c * x + d)}$.`,
              bleuMathalea,
            )
          }
          this.reponse = this.versionQcm
            ? `$${texNombre((a * x + b) * (c * x + d))}$`
            : (a * x + b) * (c * x + d)
          this.distracteurs = [
            `$${texNombre((a * x - b) * (c * x + d))}$`,
            `$${texNombre((a * x + b) * (c * x - d))}$`,
            `$${texNombre(a * x + b + (c * x + d))}$`,
            `$${texNombre(-a * x + b + (c * x + d))}$`,
            `$${texNombre(-a * x + b + (-c * x + d))}$`,
          ]
          break
        case 'c':
          a = randint(-3, 3, 0)
          b = randint(1, 3)
          x = this.versionQcm ? randint(-5, -1) : randint(-3, 3, [0])

          expression = `${a}-${rienSi1(b)}x^2`
          this.question = `On considère ${context.isDiaporama ? '<br>' : ''} la fonction $f$ définie par ${context.isDiaporama ? '<br>' : ''} $f(x)= ${expression}$. <br>`

          this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=${a}- ${ecritureParentheseSiNegatif(x)}^2\\\\
          &=${miseEnEvidence(a - b * x * x)}
          \\end{aligned}$<br>`
          this.reponse = this.versionQcm
            ? `$${texNombre(a - b * x * x)}$`
            : a - b * x * x
          if (b === 1) {
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
          On commence par «${sp()}calculer${sp()}» le carré de $${x}$ : $${ecritureParentheseSiNegatif(x)}^2=${x * x}$.<br>
          On calcule alors $${a}-${x * x}=${a - x * x}$.<br>`,
              bleuMathalea,
            )
          } else {
            this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=${a}- ${b}\\times ${ecritureParentheseSiNegatif(x)}^2\\\\
          &=${miseEnEvidence(a - b * x * x)}
          \\end{aligned}$<br>`
            this.correction += texteEnCouleur(
              ` Mentalement : <br>
    On commence par «${sp()}calculer${sp()}» le carré de $${x}$ : $${ecritureParentheseSiNegatif(x)}^2=${x * x}$.<br>
    Puis on multiplie le résultat par $${b}$ : $${b}\\times ${x ** 2}=${b * x * x}$.<br>
    On calcule alors : $${a}-${b * x * x}=${a - b * x * x}$.`,
              bleuMathalea,
            )
          }
          this.distracteurs = [
            `$${texNombre(a + b * x * x)}$`,
            `$${texNombre((a - b * x) ** 2)}$`,
            `$${texNombre(-a + b * x * x)}$`,
            `$${texNombre(a - 2 * b * x)}$`,
            `$${texNombre(a + 2 * b * x)}$`,
          ]
          break
        case 'd':
          a = randint(-4, 4, [0, -1, 1])
          b = randint(-4, 4, [0])
          c = randint(-4, 4, [0, -1, 1])
          d = randint(-4, 4, [0])
          x = this.versionQcm ? randint(-4, -1, [0]) : randint(-2, 2, [0])

          expression = `(${a}x${ecritureAlgebrique(b)})^2`
          this.question = `On considère ${context.isDiaporama ? '<br>' : ''} la fonction $f$ définie par ${context.isDiaporama ? '<br>' : ''} $f(x)= ${expression}$. <br>`

          this.correction = `On a :<br>
          $\\begin{aligned}
          f(${x})&=\\left(${a}\\times${ecritureParentheseSiNegatif(x)}${ecritureAlgebrique(b)}\\right)^2\\\\
          &= (${a * x}${ecritureAlgebrique(b)})^2\\\\
          &=${ecritureParentheseSiNegatif(a * x + b)}^2\\\\
        &=${miseEnEvidence((a * x + b) * (a * x + b))}
        \\end{aligned}$<br>`
          this.reponse = this.versionQcm
            ? `$${texNombre((a * x + b) * (a * x + b))}$`
            : (a * x + b) * (a * x + b)

          this.correction += texteEnCouleur(
            ` Mentalement : <br>
          On commence par «${sp()}calculer${sp()}» l'intérieur de la parenthèse, puis on élève le résultat au carré.`,
            bleuMathalea,
          )
          this.distracteurs = [
            `$${texNombre(-1 * (a * x + b) * (a * x + b))}$`,
            `$${texNombre((a * x - b) * (a * x + b))}$`,
            `$${texNombre(a * x + b)}$`,
            `$${texNombre((a + x + b) * (a + x + b))}$`,
          ]
          break
      }
      this.question += this.versionQcm
        ? `L'image de $${x}$ par la fonction $f$ est égale à :`
        : `Calculer $f(${x})$.`

      nombreSouhaites = this.distracteurs.length + 1
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, nombreSouhaites, true)
    )
  }
}
