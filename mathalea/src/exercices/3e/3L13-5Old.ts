import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import {
  type GeneratedProgram,
  generateProgram,
} from '../../lib/outils/programmeCalculModels'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer si deux programmes de calcul sont équivalents'
export const interactifReady = true

export const dateDeModifImportante = '21/11/2025'

export const uuid = '97ceb'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

/**
 * @author Mickael Guironnet
 */
export default class ProgrammesDeCalculsEquivalent extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = '1-2'
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : ax + b = a(x + b/a)',
        '2 : a(x+b) + bx = (a+ b)x  + ab',
        '3 : (x+a)^2 = x^2 + 2ax + a^2',
        '4 : (x+a)(x-a) = x^2 - a^2)',
        '5 : (x+a)^2-x^2 = 2ax + a^2',
        '6 : (x+a)^2-a^2 = x(x + 2a)',
        '7 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })
    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      const a = randint(-5, 5, [-1, 0, 1])
      const b = randint(-5, 5, [-1, 0, 1, a])
      const ka = randint(2, 5) * a
      const x1 = randint(-8, -2)
      const x2 = randint(2, 8)
      let prog1: GeneratedProgram | undefined
      let prog2: GeneratedProgram | undefined
      switch (listeTypeDeQuestions[i]) {
        case 1: {
          // 1 : ax + b = a(x + b/a)
          prog1 = generateProgram('ax+b', { a, b: ka })
          prog2 = generateProgram('a(x+b)', { a, b: ka / a })
          break
        }
        case 2: {
          // 2 : a(x+b) + bx = (a+ b)x  + ab
          if (Math.abs(a + b) < 2) continue
          prog1 = generateProgram('ax+b', { a: a + b, b: a * b })
          prog2 = generateProgram('a(x+b)+bx', { a, b })
          break
        }
        case 3: {
          // 3 : (x+a)^2 = x^2 + 2ax + a^2
          prog1 = generateProgram('(x+a)^2', { a, b })
          prog2 = generateProgram('x^2+ax+b', { a: 2 * a, b: a * a })
          break
        }
        case 4: {
          // 4 : (x+a)(x-a) = x^2 - a^2
          prog1 = generateProgram('(x+a)(x-a)', { a, b })
          prog2 = generateProgram('x^2-abs(a)', { a: a * a, b })
          break
        }
        case 5: {
          // 5 : (x+a)^2-x^2 = 2ax + a^2
          prog1 = generateProgram('(x+a)^2-x^2', { a, b })
          prog2 = generateProgram('ax+b', { a: 2 * a, b: a * a })
          break
        }
        case 6: {
          // 6 : (x+a)^2-a^2 = x(x + 2a)
          prog1 = generateProgram('(x+a)^2+b', { a, b: -a * a })
          prog2 = generateProgram('x(x+a)', { a: 2 * a, b })
          break
        }
        default: {
          continue
        }
      }

      // Skip this iteration if prog1 or prog2 is not assigned
      if (!prog1 || !prog2) continue

      texte = `On considère les programmes de calcul suivants :<br><br>
        ${texteGras('Programme A :')}<br>
        ${prog1.program.join('<br>')}<br><br>
        ${texteGras('Programme B :')}<br>
        ${prog2.program.join('<br>')}<br><br>
        ${texteEnCouleurEtGras('a)')} Tester ces programmes avec les nombres $${x1}$ et $${x2}$.<br>
        ${ajouteChampTexteMathLive(
          this,
          6 * i,
          KeyboardType.clavierDeBaseAvecX,
          {
            texteAvant: `Pour le ${texteGras('Programme A')} si $x=${x1}$ on a:`,
            texteApres: '<br>',
          },
        )}
        ${ajouteChampTexteMathLive(
          this,
          6 * i + 1,
          KeyboardType.clavierDeBase,
          {
            texteAvant: `Pour le ${texteGras('Programme A')} si $x=${x2}$ on a:`,
            texteApres: '<br>',
          },
        )}
        ${ajouteChampTexteMathLive(
          this,
          6 * i + 2,
          KeyboardType.clavierDeBase,
          {
            texteAvant: `Pour le ${texteGras('Programme B')} si $x=${x1}$ on a:`,
            texteApres: '<br>',
          },
        )}
        ${ajouteChampTexteMathLive(
          this,
          6 * i + 3,
          KeyboardType.clavierDeBase,
          {
            texteAvant: `Pour le ${texteGras('Programme B')} si $x=${x2}$ on a:`,
            texteApres: '<br>',
          },
        )}
        ${texteEnCouleurEtGras('b)')} Prouver que les deux programmes donnent les mêmes résultats quel que soit le nombre choisi.<br><br>
        ${ajouteChampTexteMathLive(
          this,
          6 * i + 4,
          KeyboardType.clavierDeBaseAvecVariable,
          {
            texteAvant: `Pour le ${texteGras('Programme A')}, <br> donner l'expression littérale sans la développer :`,
            texteApres: '<br>',
          },
        )}
        ${ajouteChampTexteMathLive(
          this,
          6 * i + 5,
          KeyboardType.clavierDeBaseAvecVariable,
          {
            texteAvant: `Pour le ${texteGras('Programme B')}, <br> donner l'expression littérale sans la développer :`,
            texteApres: '<br>',
          },
        )}`

      handleAnswers(this, 6 * i, {
        reponse: { value: prog1.testV(x1).toString() },
      })
      handleAnswers(this, 6 * i + 1, {
        reponse: { value: prog1.testV(x2).toString() },
      })
      handleAnswers(this, 6 * i + 2, {
        reponse: { value: prog2.testV(x1).toString() },
      })
      handleAnswers(this, 6 * i + 3, {
        reponse: { value: prog2.testV(x2).toString() },
      })
      handleAnswers(this, 6 * i + 4, {
        reponse: {
          value: prog1.expression,
          options: { expressionsForcementReduites: false },
        },
      })
      handleAnswers(this, 6 * i + 5, {
        reponse: {
          value: prog2.expression,
          options: { expressionsForcementReduites: false },
        },
      })

      texteCorr = `${texteEnCouleurEtGras('a)')} On choisit le nombre $${x1}$ comme nombre de départ :<br><br>
        ${texteGras('Programme A :')}<br>
        ${prog1.solutionV(x1).join('<br>')}<br><br>
        ${texteGras('Programme B :')}<br>
        ${prog2.solutionV(x1).join('<br>')}<br><br>
        On choisit le nombre $${x2}$ comme nombre de départ :<br><br>
        ${texteGras('Programme A :')}<br>
        ${prog1.solutionV(x2).join('<br>')}<br><br>
        ${texteGras('Programme B :')}<br>
        ${prog2.solutionV(x2).join('<br>')}<br><br>

        ${texteEnCouleurEtGras('b)')} On choisit le nombre $x$ comme nombre de départ :<br><br>
        ${texteGras('Programme A :')}<br>
        ${prog1.solutionX.join('<br>')}<br><br>
        ${texteGras('Programme B :')}<br>
        ${prog2.solutionX.join('<br>')}<br><br>`

      if (prog1.simplify) {
        texteCorr += `On développe et réduit le ${texteGras('Programme A')} :<br>
        ${prog1.simplify?.join('<br>')}<br>`
      }
      if (prog2.simplify) {
        texteCorr += `On développe et réduit le ${texteGras('Programme B')} :<br>
        ${prog2.simplify?.join('<br>')}<br>`
      }

      texteCorr += `Après réduction, on constate que les deux expressions littérales sont similaires. 
        Donc les deux programmes sont équivalents.`

      if (this.questionJamaisPosee(i, a, b)) {
        this.listeQuestions[i] = texte || ''
        this.listeCorrections[i] = texteCorr || ''
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
