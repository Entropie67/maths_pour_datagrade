import { choice } from '../../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une racine carrée'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '3a350'

export const refs = {
  'fr-fr': ['can2N5-04', '2N51-flash3'],
  'fr-ch': [],
}
export default class CalculAvecRacineCarree3 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeRacines1 = [
      [2, 8],
      [2, 32],
      [2, 50],
      [3, 27],
      [5, 20],
      [2, 18],
      [2, 72],
      [3, 48],
      [5, 45],
    ] // couples pour simplifier des produits de racines carrées
    let racine, a, b, reduction
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        racine = choice(listeRacines1)
        a = racine[0]
        b = racine[1]
        reduction = extraireRacineCarree(b)
        if (choice([true, false])) {
          this.question = `Le carré de $\\sqrt{${a}}+\\sqrt{${b}}$ est égal à : `
          this.correction = `On simpifie $\\sqrt{${b}}$ en $${reduction[0]}\\sqrt{${reduction[1]}}$, car
    $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times ${reduction[1]}} =
    \\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
    Ainsi :<br>
    $\\begin{aligned}
    (\\sqrt{${a}}+\\sqrt{${b}})^2&=(\\sqrt{${a}}+${reduction[0]}\\sqrt{${reduction[1]}})^2\\\\
    &= (${reduction[0] + 1}\\sqrt{${reduction[1]}})^2 \\\\
    &=(${reduction[0] + 1}\\sqrt{${reduction[1]}})\\times (${reduction[0] + 1}\\sqrt{${reduction[1]}})\\\\
    &=\\underbrace{${reduction[0] + 1}\\times ${reduction[0] + 1}}_{${(reduction[0] + 1) ** 2}}\\times \\underbrace{\\sqrt{${reduction[1]}}\\times \\sqrt{${reduction[1]}}}_{${reduction[1]}}\\\\
    &=  ${miseEnEvidence(`${(reduction[0] + 1) ** 2 * reduction[1]}`)}
    \\end{aligned}$`
          this.canEnonce = `Calculer le carré de $\\sqrt{${a}}+\\sqrt{${b}}$.`
        } else {
          this.question = `Le carré de $\\sqrt{${b}}+\\sqrt{${a}}$ est égal à : `
          this.correction = `On simpifie $\\sqrt{${b}}$ en $${reduction[0]}\\sqrt{${reduction[1]}}$, car
  $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times ${reduction[1]}} =
  \\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
  =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
  Ainsi :<br>
  $\\begin{aligned}
  (\\sqrt{${b}}+\\sqrt{${a}})^2&=(${reduction[0]}\\sqrt{${reduction[1]}}+\\sqrt{${a}})^2\\\\
  &= (${reduction[0] + 1}\\sqrt{${reduction[1]}})^2 \\\\
  &=(${reduction[0] + 1}\\sqrt{${reduction[1]}})\\times (${reduction[0] + 1}\\sqrt{${reduction[1]}})\\\\
  &=\\underbrace{${reduction[0] + 1}\\times ${reduction[0] + 1}}_{${(reduction[0] + 1) ** 2}}\\times \\underbrace{\\sqrt{${reduction[1]}}\\times \\sqrt{${reduction[1]}}}_{${reduction[1]}}\\\\
   &=  ${miseEnEvidence(`${(reduction[0] + 1) ** 2 * reduction[1]}`)}
  \\end{aligned}$`
          this.canEnonce = `Calculer le carré de $\\sqrt{${b}}+\\sqrt{${a}}$.`
        }
        this.reponse = a + b + 2 * Math.sqrt(a * b)

        break

      case 2:
        racine = choice(listeRacines1)
        a = racine[0]
        b = racine[1]
        reduction = extraireRacineCarree(b)
        if (choice([true, false])) {
          this.question = `Le carré de $\\sqrt{${a}}-\\sqrt{${b}}$ est égal à : `
          this.correction = `On simpifie $\\sqrt{${b}}$ en $${reduction[0]}\\sqrt{${reduction[1]}}$, car
    $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times ${reduction[1]}} =
    \\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
    Ainsi :<br>
    $\\begin{aligned}
    (\\sqrt{${a}}-\\sqrt{${b}})^2&=(\\sqrt{${a}}-${reduction[0]}\\sqrt{${reduction[1]}})^2\\\\
    &= (${1 - reduction[0]}\\sqrt{${reduction[1]}})^2 \\\\
    &=(${1 - reduction[0]}\\sqrt{${reduction[1]}})\\times (${1 - reduction[0]}\\sqrt{${reduction[1]}})\\\\
  &=\\underbrace{${ecritureParentheseSiNegatif(1 - reduction[0])}\\times ${ecritureParentheseSiNegatif(1 - reduction[0])}}_{${(1 - reduction[0]) ** 2}}\\times \\underbrace{\\sqrt{${reduction[1]}}\\times \\sqrt{${reduction[1]}}}_{${reduction[1]}}\\\\
      &=  ${miseEnEvidence(`${(1 - reduction[0]) ** 2 * reduction[1]}`)}
    \\end{aligned}$`
          this.canEnonce = `Calculer le carré de $\\sqrt{${a}}-\\sqrt{${b}}$.`
        } else {
          this.question = `Le carré de $\\sqrt{${b}}-\\sqrt{${a}}$ est égal à : `
          this.correction = `On simpifie $\\sqrt{${b}}$ en $${reduction[0]}\\sqrt{${reduction[1]}}$, car
  $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times ${reduction[1]}} =
  \\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
  =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
  Ainsi :<br>
  $\\begin{aligned}
  (\\sqrt{${b}}-\\sqrt{${a}})^2&=(${reduction[0]}\\sqrt{${reduction[1]}}-\\sqrt{${a}})^2\\\\
  &= (${reduction[0] - 1}\\sqrt{${reduction[1]}})^2 \\\\
  &=(${reduction[0] - 1}\\sqrt{${reduction[1]}})\\times (${reduction[0] - 1}\\sqrt{${reduction[1]}})\\\\
  &=\\underbrace{${ecritureParentheseSiNegatif(reduction[0] - 1)}\\times ${ecritureParentheseSiNegatif(reduction[0] - 1)}}_{${(reduction[0] - 1) ** 2}}\\times \\underbrace{\\sqrt{${reduction[1]}}\\times \\sqrt{${reduction[1]}}}_{${reduction[1]}}\\\\
       &=  ${miseEnEvidence(`${(reduction[0] - 1) ** 2 * reduction[1]}`)}
  \\end{aligned}$`
          this.canEnonce = `Calculer le carré de $\\sqrt{${b}}-\\sqrt{${a}}$.`
        }
        this.reponse = a + b - 2 * Math.sqrt(a * b)
        break
    }
  }
}
