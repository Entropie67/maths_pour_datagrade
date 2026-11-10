import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer un taux global d’évolution'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/12/2021'
export const dateDeModifImportante = '30/10/2026'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export const uuid = '9d51d'

export const refs = {
  'fr-fr': ['can2I2-04', 'BP1CF11', '2I21-flash1'],
  'fr-ch': ['NR'],
}
export default class TauxGlobal extends ExerciceSimple {
  constructor() {
    super()
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = {
      texteAvant: "<br>Taux d'évolution global : ",
      texteApres: ' $\\%$',
    }
  }

  nouvelleVersion() {
    let a, b, coeffG
    let listeCalculs = []
    this.reponse = 0
    switch (
      this.quotaChoice('type', ['a', 'b', 'c', 'd']) //
    ) {
      case 'a': // augmente puis diminue
        a = randint(1, 9) * 10
        b = randint(1, 14) * 5
        coeffG = (1 + a / 100) * (1 - b / 100)
        listeCalculs = [
          `$\\bullet$ $${texNombre(1 - a / 100, 4)}\\times ${texNombre(1 - b / 100, 4)}=${texNombre((1 - a / 100) * (1 - b / 100), 4)}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100, 4)}\\times ${texNombre(1 - b / 100, 4)}=${texNombre((1 + a / 100) * (1 - b / 100), 4)}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100, 4)}\\times ${texNombre(1 + b / 100, 4)}=${texNombre((1 + a / 100) * (1 + b / 100), 4)}$${sp(4)}`,
          `$\\bullet$ $${texNombre(a / 100)}\\times ${texNombre(b / 100)}=${texNombre((a / 100) * (b / 100))}$${sp(4)}`,
        ]
        listeCalculs = shuffle(listeCalculs)
        this.question = ` ${listeCalculs[0]} ${listeCalculs[1]} <br>
 ${listeCalculs[2]}${listeCalculs[3]}<br>
En utilisant l'un des résultats précédents, ${context.isDiaporama ? '<br>' : ''}déterminer le taux global d'évolution d'un article qui augmente de
$${a}${sp(1)}\\%$ dans un premier temps, ${context.isDiaporama ? '<br>' : ''} puis qui diminue de $${b}${sp(1)}\\%$ dans un second temps.`
        this.correction = `Augmenter de $${a}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 + a / 100)}$ et diminuer de $${b}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 - b / 100)}$.<br>
Globalement cela revient donc à multiplier par $${texNombre(1 + a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre(coeffG)}$.<br>
Multiplier par $${texNombre(coeffG)}$ revient à multiplier par `
        if (coeffG > 1) {
          this.correction += ` $1+${texNombre(coeffG - 1)}$, ce qui revient à augmenter de $${texNombre((coeffG - 1) * 100)}${sp(1)}\\%$. <br>
          Le taux d'évolution global est donc : `
        } else {
          this.correction += ` $1-${texNombre(1 - coeffG)}$. <br>
        Le taux d'évolution global est donc : `
        }

        this.distracteurs = [
          `$${texNombre(-coeffG * 100, 2)}\\,\\%$`,
          `$${texNombre(coeffG * 100, 2)}\\,\\%$`,
          `$${texNombre(a - b, 4)}\\,\\%$`,
        ]
        break

      case 'b': // augmente puis augmente
        a = randint(1, 9) * 10
        b = randint(1, 14) * 5
        coeffG = (1 + a / 100) * (1 + b / 100)
        listeCalculs = [
          `$\\bullet$ $${texNombre(1 - a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre((1 - a / 100) * (1 + b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre((1 + a / 100) * (1 + b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre((1 + a / 100) * (1 - b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(a / 100)}\\times ${texNombre(b / 100)}=${texNombre((a / 100) * (b / 100))}$${sp(4)}`,
        ]
        listeCalculs = shuffle(listeCalculs)
        this.question = ` ${listeCalculs[0]} ${listeCalculs[1]} <br>
   ${listeCalculs[2]}${listeCalculs[3]}<br>
  En utilisant l'un des résultats précédents, ${context.isDiaporama ? '<br>' : ''} déterminer le taux global d'évolution ${context.isDiaporama ? '<br>' : ''} d'un article qui augmente de
  $${a}${sp(1)}\\%$ dans un premier temps, ${context.isDiaporama ? '<br>' : ''} puis qui augmente de $${b}${sp(1)}\\%$ dans un second temps. `
        this.correction = `Augmenter de $${a}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 + a / 100)}$ et augmenter de $${b}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 + b / 100)}$.<br>
  Globalement cela revient donc à multiplier par $${texNombre(1 + a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre(coeffG)}$.<br>
  Multiplier par $${texNombre(coeffG)}$ revient à multiplier par
           $1+${texNombre(coeffG - 1)}$. <br>
          Le taux d'évolution global est donc : `

        this.distracteurs = [
          `$${texNombre(100 * ((1 + a / 100) * (1 - b / 100)))}\\,\\%$`,
          `$${texNombre(coeffG * 100, 2)}\\,\\%$`,
          `$${texNombre(a + b, 4)}\\,\\%$`,
        ]

        break
      case 'c': // diminue puis diminue
        a = randint(1, 9) * 10
        b = randint(1, 14) * 5
        coeffG = (1 - a / 100) * (1 - b / 100)
        listeCalculs = [
          `$\\bullet$ $${texNombre(1 - a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre((1 - a / 100) * (1 - b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre((1 + a / 100) * (1 + b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre((1 + a / 100) * (1 - b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(a / 100)}\\times ${texNombre(b / 100)}=${texNombre((a / 100) * (b / 100))}$${sp(4)}`,
        ]
        listeCalculs = shuffle(listeCalculs)
        this.question = ` ${listeCalculs[0]} ${listeCalculs[1]} <br>
   ${listeCalculs[2]}${listeCalculs[3]}<br>

  En utilisant l'un des résultats précédents, ${context.isDiaporama ? '<br>' : ''}déterminer le taux global d'évolution ${context.isDiaporama ? '<br>' : ''} d'un article qui diminue de
  $${a}${sp(1)}\\%$ dans un premier temps, ${context.isDiaporama ? '<br>' : ''} puis qui diminue de $${b}${sp(1)}\\%$ dans un second temps. `
        this.correction = `Diminuer de $${a}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 - a / 100)}$ et diminuer de $${b}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 - b / 100)}$.<br>
  Globalement cela revient donc à multiplier par $${texNombre(1 - a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre(coeffG)}$.<br>
  Multiplier par $${texNombre(coeffG)}$ revient à multiplier par
           $1-${texNombre(1 - coeffG)}$. <br>
          Le taux d'évolution global est donc : `

        this.distracteurs = [
          `$${texNombre(-100 * ((1 + a / 100) * (1 - b / 100)))}\\,\\%$`,
          `$${texNombre(coeffG * 100, 2)}\\,\\%$`,
          `$${texNombre(-a - b, 4)}\\,\\%$`,
        ]

        break
      case 'd': // diminue puis augmente
      default:
        a = randint(1, 9) * 10
        b = randint(1, 4) * 5
        coeffG = (1 - a / 100) * (1 + b / 100)
        listeCalculs = [
          `$\\bullet$ $${texNombre(1 - a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre((1 - a / 100) * (1 + b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 - b / 100)}=${texNombre((1 + a / 100) * (1 - b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(1 + a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre((1 + a / 100) * (1 + b / 100))}$${sp(4)}`,
          `$\\bullet$ $${texNombre(a / 100)}\\times ${texNombre(b / 100)}=${texNombre((a / 100) * (b / 100))}$${sp(4)}`,
        ]
        listeCalculs = shuffle(listeCalculs)
        this.question = ` ${listeCalculs[0]} ${listeCalculs[1]} <br>
   ${listeCalculs[2]}${listeCalculs[3]}<br>
   
  En utilisant l'un des résultats précédents, ${context.isDiaporama ? '<br>' : ''}déterminer le taux global d'évolution ${context.isDiaporama ? '<br>' : ''} d'un article qui diminue de
  $${a}${sp(1)}\\%$ dans un premier temps, ${context.isDiaporama ? '<br>' : ''} puis qui augmente de $${b}${sp(1)}\\%$ dans un second temps. `
        this.correction = `Diminuer de $${a}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 - a / 100)}$ et augmenter de $${b}${sp(1)}\\%$ revient à multiplier par $${texNombre(1 + b / 100)}$.<br>
  Globalement cela revient donc à multiplier par $${texNombre(1 - a / 100)}\\times ${texNombre(1 + b / 100)}=${texNombre(coeffG)}$.<br>
  Multiplier par $${texNombre(coeffG)}$ revient à multiplier par `
        if (coeffG > 1) {
          this.correction += ` $1+${texNombre(coeffG - 1)}$, ce qui revient à augmenter de $${texNombre((coeffG - 1) * 100)}\\,\\%$. <br>
            Le taux d'évolution global est donc : `
        } else {
          this.correction += ` $1-${texNombre(1 - coeffG)}$. <br>
          Le taux d'évolution global est donc : `
        }

        this.distracteurs = [
          `$${texNombre(-100 * ((1 + a / 100) * (1 - b / 100)))}\\,\\%$`,
          `$${texNombre(coeffG * 100, 2)}\\,\\%$`,
          `$${texNombre(-a + b, 4)}\\,\\%$`,
        ]

        break
    }
    this.correction += this.versionQcm
      ? `$${miseEnEvidence(ecritureAlgebrique((coeffG - 1) * 100) + '\\,\\%')}$.`
      : `$${miseEnEvidence(ecritureAlgebrique((coeffG - 1) * 100))}\\,\\%$.`

    this.reponse = this.versionQcm
      ? `$${texNombre((coeffG - 1) * 100, 2)}\\,\\%$`
      : `${texNombre((coeffG - 1) * 100, 2)}`

    this.canReponseACompleter = '$\\ldots \\%$'
    if (this.versionQcm) {
      // Secours : Ne retenir qu’une des évolutions ou le coefficient global.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        this.distracteurs,
        [a, -a, b, -b, coeffG].map((n) => `$${texNombre(n, 4)}\\,\\%$`),
        Math.max(3, this.distracteurs.length),
      )
    }
  }
}
