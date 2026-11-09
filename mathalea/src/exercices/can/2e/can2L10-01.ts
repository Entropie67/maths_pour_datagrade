import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une expression avec des valeurs'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '06/07/2025'
/**
 * @author Gilles Mora (IA pour les distracteurs)
 * Réference : can2C22
 */
export const uuid = 'af398'

export const refs = {
  'fr-fr': ['can2L10-01'],
  'fr-ch': ['NR'],
}
export default class CalculExpAvecValeurs extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 3
    this.optionsDeComparaison = { fractionEgale: true }
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let a, b, c, d, frac1
    let compteur = 0
    const nombreSouhaites = 4
    do {
      switch (randint(1, 2)) {
        case 1:
          {
            frac1 = choice([
              [1, 3],
              [2, 3],
              [3, 4],
              [1, 4],
              [2, 5],
              [1, 2],
              [1, 6],
              [1, 7],
            ])
            a = new FractionEtendue(frac1[0], frac1[1])
            b = randint(1, 9)
            c = randint(-9, 9, [-2, -1, 0, 1, 2])
            d = choice([new FractionEtendue(1, c), new FractionEtendue(1, -c)])
            const candidats: FractionEtendue[] = [
              new FractionEtendue(
                a.num * d.num * c + b * d.den,
                a.den * d.num * c,
              ),
              new FractionEtendue(
                a.num * d.den * c + b * d.num * a.den,
                a.den * d.den * c,
              ),
              a.sommeFraction(new FractionEtendue(b, (c * d.num) / d.den)),
              new FractionEtendue(
                a.num * d.num * c + b * d.den * a.den,
                a.den * d.num,
              ),
              a.sommeFraction(new FractionEtendue(b, 1)), // celui qui cause l'ambiguïté
              new FractionEtendue(
                a.num * d.num * c - b * d.den * a.den,
                a.den * d.num * c,
              ),
            ]
            const num = a.num * d.num * c + b * d.den * a.den
            const den = a.den * d.num * c

            const bonneReponse = new FractionEtendue(num, den)
              .texFractionSimplifiee
            this.reponse = this.versionQcm ? `$${bonneReponse}$` : bonneReponse

            this.question = `
On considère la relation $F=a+\\dfrac{b}{cd}$.<br>
Lorsque $a=${a.texFraction}$, $b=${b}$, $c=${c}$ et $d=${d.texFractionSimplifiee}$, ${context.isDiaporama ? '<br>' : ''} la valeur de $F$ est égale à : `

            this.correction = `On remplace $a$, $b$, $c$ et $d$ par les valeurs données : <br>
$\\begin{aligned}
F&=${a.texFraction}+\\dfrac{${b}}{${c}\\times ${d.den * d.num > 0 ? `${d.texFractionSimplifiee}` : `\\left(${d.texFractionSimplifiee}\\right)`}}\\\\
&=${a.texFraction}+\\dfrac{${b}}{${d.multiplieEntier(c).texFractionSimplifiee}}\\\\
&=${a.texFraction}${b * d.den * c * d.num > 0 ? '+' : ''}${new FractionEtendue(b * d.den, c * d.num).texFractionSimplifiee}\\\\
&=${miseEnEvidence(`${bonneReponse}`)}
\\end{aligned}$`

            this.canEnonce = `On considère la relation $F=a+\\dfrac{b}{cd}$.<br>
Calculer $F$ lorsque $a=${a.texFraction}$, $b=${b}$, $c=${c}$ et $d=${d.texFractionSimplifiee}$.`
            this.canReponseACompleter = '$F=\\ldots$'

            const distracteursValides: string[] = []
            for (const frac of candidats) {
              const simpl = frac.simplifie().texFractionSimplifiee
              if (
                simpl !== bonneReponse &&
                !distracteursValides.includes(`$${simpl}$`)
              ) {
                distracteursValides.push(`$${simpl}$`)
              }
              if (distracteursValides.length === 3) break
            }

            // Complète avec "N/A" si besoin
            while (distracteursValides.length < 3) {
              distracteursValides.push('$\\text{N/A}$')
            }

            this.distracteurs = distracteursValides
          }
          break
        case 2:
          {
            const fracB = choice([
              [1, 2],
              [1, 3],
              [1, 4],
              [1, 5],
              [1, 6],
              [1, 7],
            ])
            b = new FractionEtendue(fracB[0], fracB[1]) // numérateur 1
            a = randint(1, 5)
            c = randint(4, 4, 0)
            const fracD = choice([
              [1, 2],
              [2, 3],
              [3, 4],
              [1, 4],
              [3, 5],
            ])
            d = new FractionEtendue(fracD[0], fracD[1])
            const div = new FractionEtendue(a * b.den, b.num)
            const prod = new FractionEtendue(c * d.num, d.den) // c * d
            const reponse = div.sommeFraction(prod).texFractionSimplifiee
            this.reponse = this.versionQcm ? `$${reponse}$` : reponse

            this.question = `
On considère la relation $F=\\dfrac{a}{b}+cd$.<br>
Lorsque $a=${a}$, $b=${b.texFraction}$, $c=${c}$ et $d=${d.texFraction}$, ${context.isDiaporama ? '<br>' : ''} la valeur de $F$ est égale à : `

            this.correction = `On remplace $a$, $b$, $c$ et $d$ par les valeurs données :<br>
$\\begin{aligned}
F &= \\dfrac{${a}}{${b.texFraction}} ${ecritureAlgebrique(c)} \\times ${d.texFraction} \\\\
  &= ${div.texFraction} ${c > 0 ? `+${prod.texFractionSimplifiee}` : `${prod.texFractionSimplifiee}`}\\\\
  &= ${miseEnEvidence(reponse)}
\\end{aligned}$`
            this.canEnonce = `On considère la relation $F=\\dfrac{a}{b}+cd$.<br>
Calculer $F$ lorsque $a=${a}$, $b=${b.texFraction}$, $c=${c}$ et $d=${d.texFraction}$.`
            this.canReponseACompleter = '$F=\\ldots$'
            const erreur1 = new FractionEtendue(a, b.num * b.den)
            const dist1 = erreur1.sommeFraction(prod)

            // Erreur 2 : Oubli de la multiplication c*d (juste addition de c et d)
            const erreur2 = new FractionEtendue(c + d.num, d.den)
            const dist2 = div.sommeFraction(erreur2)

            // Erreur 3 : Erreur dans l'ordre des opérations (calculer d'abord a+c puis diviser par b et multiplier par d)
            const erreur3 = new FractionEtendue((a + c) * d.num, b.num * d.den)

            this.distracteurs = [
              `$${dist1.texFractionSimplifiee}$`,
              `$${dist2.texFractionSimplifiee}$`,
              `$${erreur3.texFractionSimplifiee}$`,
            ]
          }

          break
      }
      if (!this.interactif && !this.versionQcm) {
        this.question += ' $\\ldots$'
      }
      compteur++
    } while (
      compteur < 100 &&
      !aLeBonNombreDePropsDifferentes(this, nombreSouhaites, true)
    )
  }
}
