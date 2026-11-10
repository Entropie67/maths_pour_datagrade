import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une racine carrée'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = '2af85'

export const refs = {
  'fr-fr': ['can2N5-03', '2N51-flash2'],
  'fr-ch': ['NR'],
}
export default class CalculAvecRacineCarree2 extends ExerciceSimple {
  constructor() {
    super()

    this.optionsChampTexte = { texteAvant: '<br>' }
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { texteSansCasse: true }
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
      [2, 200],
      [3, 300],
      [5, 500],
      [6, 600],
      [7, 700],
    ] // couples pour simplifier des produits de racines carrées
    let racine, a, b, reduction
    switch (this.quotaChoice('cas', [1, 2])) {
      case 1:
        racine = choice(listeRacines1)
        a = racine[0]
        b = racine[1]
        reduction = extraireRacineCarree(b)
        if (choice([true, false])) {
          this.question = `Écrire $\\sqrt{${a}}+\\sqrt{${b}}$ sous la forme $a\\sqrt{b}$ avec $a$ et $b$ entiers et $b$ le plus petit possible. `
          this.correction = `On a  $${b}=${reduction[0]}^2\\times ${reduction[1]}$.<br>
          Ainsi, $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times${reduction[1]}}=\\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
    $\\begin{aligned}
    \\sqrt{${a}}+\\sqrt{${b}}&=\\sqrt{${a}}+${reduction[0]}\\sqrt{${reduction[1]}}\\\\
    &= ${miseEnEvidence(`${reduction[0] + 1}\\sqrt{${reduction[1]}}`)}
    \\end{aligned}$
  `
        } else {
          this.question = `Écrire $\\sqrt{${b}}+\\sqrt{${a}}$ sous la forme $a\\sqrt{b}$ avec $a$ et $b$ entiers et $b$ le plus petit possible. `
          this.correction = `On a  $${b}=${reduction[0]}^2\\times ${reduction[1]}$.<br>
          Ainsi, $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times${reduction[1]}}=\\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
  $\\begin{aligned}
  \\sqrt{${b}}+\\sqrt{${a}}&=${reduction[0]}\\sqrt{${reduction[1]}}+\\sqrt{${a}}\\\\
  &= ${miseEnEvidence(`${reduction[0] + 1}\\sqrt{${reduction[1]}}`)}
  \\end{aligned}$
`
        }
        this.reponse = [`${reduction[0] + 1}\\sqrt${reduction[1]}`]
        break

      case 2:
        racine = choice(listeRacines1)
        a = racine[0]
        b = racine[1]
        reduction = extraireRacineCarree(b)
        if (choice([true, false])) {
          this.question = `Écrire $\\sqrt{${a}}-\\sqrt{${b}}$ sous la forme $a\\sqrt{b}$ avec $a$ et $b$ entiers et $b$ le plus petit possible. `
          this.correction = `On a  $${b}=${reduction[0]}^2\\times ${reduction[1]}$.<br>
          Ainsi, $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times${reduction[1]}}=\\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
    $\\begin{aligned}
    \\sqrt{${a}}-\\sqrt{${b}}&=\\sqrt{${a}}-${reduction[0]}\\sqrt{${reduction[1]}}\\\\
    &= ${miseEnEvidence(`${1 - reduction[0]}\\sqrt{${reduction[1]}}`)}
    \\end{aligned}$
  `
          if (1 - reduction[0] === -1) {
            this.reponse = [`${1 - reduction[0]}\\sqrt${reduction[1]}`]
          } else {
            this.reponse = [
              `${1 - reduction[0]}\\sqrt${reduction[1]}`,
              `-\\sqrt${reduction[1]}`,
            ]
          }
        } else {
          this.question = `Écrire $\\sqrt{${b}}-\\sqrt{${a}}$ sous la forme $a\\sqrt{b}$ avec $a$ et $b$ entiers et $b$ le plus petit possible. `
          this.correction = `On a  $${b}=${reduction[0]}^2\\times ${reduction[1]}$.<br>
          Ainsi, $\\sqrt{${b}}=\\sqrt{${reduction[0]}^2\\times${reduction[1]}}=\\sqrt{${reduction[0]}^2}\\times \\sqrt{${reduction[1]}}
    =${reduction[0]}\\sqrt{${reduction[1]}}$.<br>
  $\\begin{aligned}
  \\sqrt{${b}}-\\sqrt{${a}}&=${reduction[0]}\\sqrt{${reduction[1]}}-\\sqrt{${a}}\\\\
  &= ${miseEnEvidence(`${reduction[0] - 1}\\sqrt{${reduction[1]}}`)}
  \\end{aligned}$
`
          if (1 - reduction[0] === 1) {
            this.reponse = [
              `${reduction[0] - 1}\\sqrt${reduction[1]}`,
              `\\sqrt${reduction[1]}`,
            ]
          } else {
            this.reponse = [`${reduction[0] - 1}\\sqrt${reduction[1]}`]
          }
        }

        break
    }
  }
}
