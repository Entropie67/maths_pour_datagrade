import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Passer de la fraction décimale à l’écriture décimale'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '15/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '04/08/2025'
/**
 * @author Gilles Mora
 */
export const uuid = 'b850a'

export const refs = {
  'fr-fr': ['can5C4-10', '6N3autoC-2', '6AutoN2-3'],
  'fr-ch': ['NR'],
}
export default class FractionDecimaleEcritureDecimale2 extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.optionsChampTexte = { texteAvant: ' <br>$A=$' }
  }

  nouvelleVersion() {
    let a, b, c, choix
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b']) //,
    ) {
      case 'a':
        a = randint(1, 19, [10])
        b = randint(11, 59, [20, 30, 40, 50])
        choix = choice([true, false])
        this.reponse = this.versionQcm
          ? `$A=${texNombre(a * 0.1 + b * 0.01, 2)}$`
          : arrondi(a * 0.1 + b * 0.01, 2)
        this.question = this.versionQcm
          ? `On considère ${choix ? `$A=\\dfrac{${a}}{10}+\\dfrac{${b}}{100}$.<br>` : `$A=\\dfrac{${b}}{100}+\\dfrac{${a}}{10}$.<br>`}
          On a :`
          : `Écrire sous forme décimale ${choix ? `$A=\\dfrac{${a}}{10}+\\dfrac{${b}}{100}$.` : `$A=\\dfrac{${b}}{100}+\\dfrac{${a}}{10}$.`}`
        this.correction = `On a : <br><br>$\\begin{aligned}
          A&=${choix ? `\\dfrac{${a}}{10}+\\dfrac{${b}}{100}` : `\\dfrac{${b}}{100}+=\\dfrac{${a}}{10}`}\\\\
          &=${choix ? `${texNombre(a / 10)}+${texNombre(b / 100)}` : `${texNombre(b / 100)}+${texNombre(a / 10)}`}\\\\
          &=${miseEnEvidence(texNombre(a / 10 + b / 100))}
          \\end{aligned}$`

        this.distracteurs = [
          `$A=${texNombre(a * 0.1 + b * 0.001, 5)}$`,
          `$A=${texNombre(a * 0.01 + b * 0.01, 4)}$`,
          `$A=${texNombre((a + b) * 0.001, 4)}$`,
        ]
        break
      case 'b':
        b = randint(1, 299, [20, 30, 40, 50, 60, 70, 80, 90, 100, 200])
        c = randint(1, 29, [10, 20])
        choix = choice([true, false])

        this.reponse = this.versionQcm
          ? `$A=${texNombre(b * 0.01 + c * 0.001, 3)}$`
          : arrondi(b * 0.01 + c * 0.001, 3)

        this.question = this.versionQcm
          ? `On considère ${choix ? `$A=\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}$.<br>` : `$A=\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}$.<br>`}
    On a :`
          : `Écrire sous forme décimale ${choix ? `$A=\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}$.` : `$A=\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}$.`}`

        this.correction = `On a : <br><br>$\\begin{aligned}
    A&=${choix ? `\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${b}}{100}` : `\\dfrac{${b}}{100}+\\dfrac{${c}}{${texNombre(1000)}}`}\\\\
    &=${choix ? `${texNombre(c / 1000)}+${texNombre(b / 100)}` : `${texNombre(b / 100)}+${texNombre(c / 1000)}`}\\\\
    &=${miseEnEvidence(texNombre(c / 1000 + b / 100))}
    \\end{aligned}$`

        this.distracteurs = [
          `$A=${texNombre(b * 0.01 + c * 0.0001, 6)}$`,
          `$A=${texNombre(b * 0.001 + c * 0.001, 4)}$`,
          `$A=${texNombre((b + c) * 0.0001, 4)}$`,
        ]
        break
    }
  }
}
