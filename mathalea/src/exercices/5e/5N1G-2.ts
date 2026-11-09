import { compile } from '@cortex-js/compute-engine'
import type { MathfieldElement } from 'mathlive'
import { assignVariablesCe } from '../../lib/assignVariablesCe'
import { calculerCe } from '../../lib/calculerCe'
import ce from '../../lib/interactif/comparisonFunctions'
import { toutPourUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { AnswerType, IExercice } from '../../lib/types'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const dateDePublication = '21/07/2024'
export const uuid = 'e2a95'
export const titre =
  "Mettre des parenthèses ou pas pour qu'une égalité soit juste"
export const refs = {
  'fr-fr': ['5N1G-2'],
  'fr-2016': ['5C12-4'],
  'fr-ch': ['9R1NO8B-3', '9R2NO8B-3', '9R3NO8B-3', 'PRQNO13A-3'],
}
/**
 * @author Jean-claude Lhote
 * Placer des parenthèses mais pas inutilement dans une expression pour qu'elle vérifie une égalité
 */

type Materiel = {
  expSP: string
  expAP: string
  test: (a: number, b: number, c: number, d: number) => boolean
}

type ListeVariableExo = 'a' | 'b' | 'c' | 'd'
type VariablesExo = Partial<
  Record<ListeVariableExo, string | number | boolean | object>
>

const normalizeExpression = (expression: string) =>
  expression.replaceAll('_', '')

const evaluateExpression = (
  expression: string,
  assignations: Record<string, number>,
) => compile(normalizeExpression(expression)).run!(assignations) ?? 0

const getCandidateExpressions = (
  materiel: Materiel,
  choix: Materiel[],
  parentheses: boolean,
) => {
  const baseExpression = parentheses ? materiel.expAP : materiel.expSP
  const expressions = [materiel.expSP]

  for (const option of choix) {
    if (
      option.expSP === materiel.expSP &&
      !expressions.includes(option.expAP)
    ) {
      expressions.push(option.expAP)
    }
  }

  return expressions.filter((expression) => expression !== baseExpression)
}

// Les tirets bas sont placés là où il n'y a pas de parenthèses mais qu'il pourrait y en avoir une. Cela sert à placer les placeholders et à savoir à quelle position on a quelle parenthèse
// Pour l'analyse et l'utilisation de l'expression, ces tirets bas sont remplacés par du vide.
// test est la valeur qui vient compléter a,b,c et d afin d'obtenir des données aux petits oignons
const dicoDesExpressions: {
  troisSignesToutPositif: Materiel[]
  troisSignesRelatifs: Materiel[]
  quatreSignesToutPositif: Materiel[]
  quatreSignesRelatifs: Materiel[]
} = {
  troisSignesToutPositif: [
    {
      expSP: '_a*_b_+c_',
      expAP: '_a*(b_+c)',
      test: (a) => a !== 1,
    },
    {
      expSP: '_a+_b_*c_',
      expAP: '(a+_b)*c_',
      test: (a, b, c) => c !== 1,
    },
    {
      expSP: '_a*_b_-c_',
      expAP: '_a*(b_-c)',
      test: (a, b, c) => a !== 1 && b > c,
    },
    {
      expSP: '_a-_b_*c_',
      expAP: '(a-_b)*c_',
      test: (a, b, c) => c !== 1 && a > b * c,
    },
  ],
  troisSignesRelatifs: [
    {
      expSP: '_a*_b_+c_',
      expAP: '_a*(b_+c)',
      test: (a, b, c) => a !== 1,
    },
    {
      expSP: '_a+_b_*c_',
      expAP: '(a+_b)*c_',
      test: (a, b, c) => c !== 1,
    },
    {
      expSP: '_a*_b_-c_',
      expAP: '_a*(b_-c)',
      test: (a, b, c) => a !== 1,
    },
    {
      expSP: '_a-_b_*c_',
      expAP: '(a-_b)*c_',
      test: (a, b, c) => c !== 1,
    },
  ],
  quatreSignesToutPositif: [
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '(a+_b)*(c_+d)',
      test: (a, b, c, d) =>
        (a + b) * (c + d) !== a + b * c + d &&
        (a + b) * (c + d) !== (a + b) * c + d &&
        (a + b) * (c + d) !== a + b * (c + d),
    },
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '_a+_b_*(c_+d)',
      test: (a, b, c, d) =>
        a + b * (c + d) !== a + b * c + d &&
        a + b * (c + d) !== (a + b) * (c + d) &&
        a + b * (c + d) !== (a + b) * c + d,
    },
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '(a+_b)*_c_+d_',
      test: (a, b, c, d) =>
        (a + b) * c + d !== a + b * c + d &&
        (a + b) * c + d !== (a + b) * (c + d) &&
        (a + b) * c + d !== a + b * (c + d),
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '(a-_b)*(c_+d)',
      test: (a, b, c, d) =>
        (a - b) * (c + d) !== a - b * c + d &&
        (a - b) * (c + d) !== (a - b) * c + d &&
        (a - b) * (c + d) !== a - b * (c + d) &&
        (a - b) * (c + d) !== a - (b * c + d) &&
        a > b * c,
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '_a-_b_*(c_+d)',
      test: (a, b, c, d) =>
        a - b * (c + d) !== a - b * c + d &&
        a - b * (c + d) !== (a - b) * (c + d) &&
        a - b * (c + d) !== (a - b) * c + d &&
        a - b * (c + d) !== a - (b * c + d) &&
        a > b * (c + d),
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '(a-_b)*_c_+d_',
      test: (a, b, c, d) =>
        (a - b) * c + d !== a - b * c + d &&
        (a - b) * c + d !== (a - b) * (c + d) &&
        (a - b) * c + d !== a - b * (c + d) &&
        (a - b) * c + d !== a - (b * c + d) &&
        a > b * c,
    },
  ],
  quatreSignesRelatifs: [
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '(a+_b)*(c_+d)',
      test: (a, b, c, d) =>
        (a + b) * (c + d) !== a + b * c + d &&
        (a + b) * (c + d) !== (a + b) * c + d &&
        (a + b) * (c + d) !== a + b * (c + d),
    },
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '_a+_b_*(c_+d)',
      test: (a, b, c, d) =>
        a + b * (c + d) !== a + b * c + d &&
        a + b * (c + d) !== (a + b) * (c + d) &&
        a + b * (c + d) !== (a + b) * c + d,
    },
    {
      expSP: '_a+_b_*_c_+d_',
      expAP: '(a+_b)*_c_+d_',
      test: (a, b, c, d) =>
        (a + b) * c + d !== a + b * c + d &&
        (a + b) * c + d !== (a + b) * (c + d) &&
        (a + b) * c + d !== a + b * (c + d),
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '(a-_b)*(c_+d)',
      test: (a, b, c, d) =>
        (a - b) * (c + d) !== a - b * c + d &&
        (a - b) * (c + d) !== (a - b) * c + d &&
        (a - b) * (c + d) !== a - b * (c + d) &&
        (a - b) * (c + d) !== a - (b * c + d),
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '_a-_b_*(c_+d)',
      test: (a, b, c, d) =>
        a - b * (c + d) !== a - b * c + d &&
        a - b * (c + d) !== (a - b) * (c + d) &&
        a - b * (c + d) !== (a - b) * c + d &&
        a - b * (c + d) !== a - (b * c + d),
    },
    {
      expSP: '_a-_b_*_c_+d_',
      expAP: '(a-_b)*_c_+d_',
      test: (a, b, c, d) =>
        (a - b) * c !== a - b * c + d &&
        (a - b) * c + d !== (a - b) * (c + d) &&
        (a - b) * c + d !== a - b * (c + d) &&
        (a - b) * c + d !== a - (b * c + d),
    },
  ],
}

class MettreDesParentheses extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.correctionDetailleeDisponible = true
    this.besoinFormulaireTexte = [
      'Complexité',
      'Nombres séparés par des tirets :\n1 : 2 opérations\n2 : 3 opérations\n3 Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Avec des nombres relatifs', false]
    this.sup = '3'
    this.sup2 = false
    this.comment =
      "L'exercice propose des expressions à 3 ou 4 opérandes avec possibilité d'avoir des calculs relatifs ou pas.<br>Les opérandes sont inférieures ou égales à 10 en valeur absolue pour permettre le calcul mental. Une réponse trop parenthésée est comptée fausse."
  }

  nouvelleVersion() {
    if (this.nbQuestions > 1) {
      this.consigne =
        'Mettre des parenthèses si besoin dans les égalités suivantes afin que celles-ci soient justes.<br>'
    } else {
      this.consigne =
        "Mettre des parenthèses si besoin dans l'égalité suivante afin que celle-ci soit juste.<br>"
    }
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 3,
      defaut: 3,
    })
    let findExp = false
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const choix: Materiel[] = []
      if (listeTypeDeQuestion[i] === 1) {
        if (this.sup2) {
          choix.push(...dicoDesExpressions.troisSignesRelatifs)
        } else {
          choix.push(...dicoDesExpressions.troisSignesToutPositif)
        }
      } else {
        if (this.sup2) {
          choix.push(...dicoDesExpressions.quatreSignesRelatifs)
        } else {
          choix.push(...dicoDesExpressions.quatreSignesToutPositif)
        }
      }
      // Les données de la question (expression sans parenthèse, expression avec parenthèses, test )
      const materiel = choice(choix)
      // l'objet qui sert à assigner les valeurs dans l'expression
      /* const assignations = aleaVariables({
        a: `${this.sup2 ? 'pickRandom([-1,1])' : '1'}*randomInt(1,10)`,
        b: 'randomInt(1,10)',
        c: `${this.sup2 ? 'pickRandom([-1,1])' : '1'}*randomInt(1,10)`,
        d: 'randomInt(1,10)',
        test: materiel.test
      }) */
      let assignations
      do {
        assignations = {
          a: (this.sup2 ? choice([-1, 1]) : 1) * randint(1, 10),
          b: randint(1, 10),
          c: (this.sup2 ? choice([-1, 1]) : 1) * randint(1, 10),
          d: randint(1, 10),
        }
      } while (
        !materiel.test(
          assignations.a,
          assignations.b,
          assignations.c,
          assignations.d,
        )
      )
      // On choisit de proposer une expression sans parenthèse avec une probabilité de 25%
      const parentheses = choice([true, true, true, false])
      const expressionCible = parentheses ? materiel.expAP : materiel.expSP
      const resultat = evaluateExpression(expressionCible, assignations) || 0
      findExp = false
      if (
        // On vérifie toutes les autres expressions possibles avec les mêmes opérandes
        // pour être sûr que la question n'est pas ambiguë.
        getCandidateExpressions(materiel, choix, parentheses).some(
          (expression) =>
            resultat === evaluateExpression(expression, assignations),
        )
      ) {
        continue
      }
      findExp = true // On a du matériel pour faire la question, on peut sortir de la boucle de recherche
      const a = Number(assignations.a)
      const b = Number(assignations.b)
      const c = Number(assignations.c)
      const d = Number(assignations.d)

      // mathjs calcule l'expression avec les valeur choisies et fournit le membre de droite de l'énoncé

      let texte = ''
      let index = 1
      let content = ''
      // on fabrique la string pour le Mathfield fillInTheBlank
      for (let c = 0; c < materiel.expSP.length; c++) {
        const char = materiel.expSP[c]
        if (char === '+' || char === '-') content += `~${char}`
        if (char === '*') content += '~\\times'
        if (['a', 'b', 'c', 'd'].includes(char)) {
          const value = Number(assignations[char as keyof VariablesExo])
          if (value < 0) content += `~(${value})`
          else content += `~${value}`
        }
        if (char === '_') content += `~%{champ${index++}}`
      }
      content += `~=~${resultat}`
      // En Typst, pas de pointillés : on n'a pas besoin de place pour ajouter des parenthèses
      texte += remplisLesBlancs(
        this,
        i,
        content,
        '',
        context.isTypst ? '' : '\\ldots',
      )
      // on élimine test des assignations, car on n'en a pas besoin pour la suite, le nouvel objet contenant les opérandes s'appelle valeurs
      const valeurs = {
        a: assignations.a,
        b: assignations.b,
        c: assignations.c,
        d: assignations.d,
        // test: assignations.test
      }
      const answer = parentheses
        ? calculerCe(normalizeExpression(materiel.expAP), {
            variables: valeurs,
            comment: this.correctionDetaillee,
            implicitMultiply: false,
          })
        : calculerCe(normalizeExpression(materiel.expSP), {
            variables: valeurs,
            comment: this.correctionDetaillee,
            implicitMultiply: false,
          })

      const texteCorr: string = `${answer.texteCorr}<br>
      Il fallait donc ${parentheses ? 'mettre des parenthèses' : 'ne pas mettre de parenthèse'} : $${miseEnEvidence(
        assignVariablesCe(
          (parentheses ? materiel.expAP : materiel.expSP).replaceAll('_', ''),
          valeurs,
          {
            invisibleMultiply: '\\times',
            multiplySymbol: '\\times',
          },
        ),
      )}$`
      // La callback de correction intéractive
      const callback = (
        exercice: IExercice,
        question: number,
        variables: [string, AnswerType][],
      ) => {
        let feedback = ''
        const mfe = document.querySelector(
          `#champTexteEx${exercice.numeroExercice}Q${question}`,
        ) as MathfieldElement
        const goodAnswer = ce.parse(String(resultat))

        const prompts = mfe.getPrompts()
        const saisies = prompts.map((pr) =>
          mfe
            .getPromptValue(pr)
            .replaceAll('\\left(', '(')
            .replaceAll('\\right)', ')')
            .replaceAll('\\lparen', '(')
            .replaceAll('\\rparen', ')'),
        )
        let laSaisie = ''
        for (let k = 0, index = 0; k < materiel.expSP.length; k++) {
          const char = materiel.expSP.charAt(k)
          if (char === '_') {
            laSaisie += saisies[index++]
          } else {
            laSaisie += char
          }
        }
        const onlyParentheses = saisies.every((saisie) =>
          /^[()]*$/.test(saisie),
        )
        let depth = 0
        const balancedParentheses =
          saisies
            .join('')
            .split('')
            .every((char) => {
              if (char === '(') depth++
              if (char === ')') depth--
              return depth >= 0
            }) && depth === 0
        let isOk1 = false
        let expSaisie = ''
        let evaluatedValue = NaN
        if (onlyParentheses && balancedParentheses) {
          expSaisie = assignVariablesCe(laSaisie, valeurs, {
            invisibleMultiply: '\\times',
            multiplySymbol: '\\times',
          })
          const saisieParsed = ce.parse(expSaisie)
          if (saisieParsed.isValid) {
            evaluatedValue = saisieParsed.evaluate().re
            isOk1 =
              Number.isFinite(evaluatedValue) &&
              (goodAnswer.isEqual(saisieParsed) ?? false)
          }
        }
        // cependant, il peut y avoir des parenthèses inutiles.
        let isOk2 = true
        for (let index2 = 0; index2 < variables.length; index2++) {
          if (variables[index2][1].value !== saisies[index2]) {
            isOk2 = false
          }
        }
        if (!onlyParentheses) {
          feedback =
            'Saisir uniquement des parenthèses ou laisser les cases vides.'
        } else if (!balancedParentheses) {
          feedback =
            'Les parenthèses sont mal équilibrées : chaque parenthèse ouvrante doit être refermée.'
        } else if (!Number.isFinite(evaluatedValue)) {
          feedback =
            "L'expression est mal écrite. Vérifier le placement des parenthèses."
        } else if (isOk1 && !isOk2) {
          feedback =
            "L'égalité est respectée, mais il y a des parenthèses inutiles."
        } else if (!isOk1) {
          feedback = `L'égalité n'est pas respectée : en effet, $${expSaisie.replace('*', '\\times ')}=${evaluatedValue}$.`
        } else {
          feedback = "L'égalité est respectée."
        }

        for (let index3 = 0; index3 < variables.length; index3++) {
          if (variables[index3][1].value === saisies[index3]) {
            mfe.setPromptState(`champ${index3 + 1}`, 'correct', true)
          } else {
            mfe.setPromptState(`champ${index3 + 1}`, 'incorrect', true)
          }
        }
        const spanReponseLigne = document.querySelector(
          `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
        )
        if (spanReponseLigne != null) {
          spanReponseLigne.innerHTML = isOk1 && isOk2 ? '😎' : '☹️'
        }

        const spanFeedback = document.querySelector(
          `#feedbackEx${exercice.numeroExercice}Q${question}`,
        )
        if (feedback != null && spanFeedback != null && feedback.length > 0) {
          spanFeedback.innerHTML = '💡 ' + feedback
          spanFeedback.classList.add(
            'py-2',
            'italic',
            'text-coopmaths-warn-darkest',
            'dark:text-coopmathsdark-warn-darkest',
          )
        }
        return {
          isOk: isOk1 && isOk2,
          feedback,
          score: {
            nbBonnesReponses: isOk1 && isOk2 ? 1 : 0,
            nbReponses: 1,
          },
        }
      }
      // fin de la callback

      // On fournit les réponses correctes selon le cas de figure (parenthèses ou pas, 3 ou 4 opérandes)
      if (listeTypeDeQuestion[i] === 1) {
        if (parentheses) {
          // On récupère la liste des parenthèses (ou absence de parenthèses) pour renseigner les goodAnswers
          const listePar = materiel.expAP.match(/[_()]/g)
          if (listePar != null && listePar.length === 4) {
            handleAnswers(this, i, {
              champ1: { value: listePar[0] === '(' ? '(' : '' },
              champ2: { value: listePar[1] === '(' ? '(' : '' },
              champ3: { value: listePar[2] === ')' ? ')' : '' },
              champ4: { value: listePar[3] === ')' ? ')' : '' },
              bareme: toutPourUnPoint,
              callback,
            })
          } else {
            throw Error(
              `Il y a un problème avec cette expressions, on n'a pas trouvé 4 symboles : ${materiel.expAP}`,
            )
          }
        } else {
          // Ici, il ne faut pas de parenthèses !
          handleAnswers(this, i, {
            champ1: { value: '' },
            champ2: { value: '' },
            champ3: { value: '' },
            champ4: { value: '' },
            bareme: toutPourUnPoint,
            callback,
          })
        }
      } else {
        if (parentheses) {
          // On récupère la liste des parenthèses (ou absence de parenthèses) pour renseigner les goodAnswers
          const listePar = materiel.expAP.match(/[_()]/g)
          if (listePar != null && listePar.length === 6) {
            handleAnswers(this, i, {
              champ1: { value: listePar[0] === '(' ? '(' : '' },
              champ2: { value: listePar[1] === '(' ? '(' : '' },
              champ3: {
                value:
                  listePar[2] === '(' ? '(' : listePar[2] === ')' ? ')' : '',
              },
              champ4: {
                value:
                  listePar[3] === '(' ? '(' : listePar[3] === ')' ? ')' : '',
              },
              champ5: {
                value:
                  listePar[4] === '(' ? '(' : listePar[4] === ')' ? ')' : '',
              },
              champ6: {
                value:
                  listePar[5] === '(' ? '(' : listePar[5] === ')' ? ')' : '',
              },
              bareme: toutPourUnPoint,
              callback,
            })
          } else {
            throw Error(
              `Il y a un problème avec cette expressions, on n'a pas trouvé 6 symboles : ${materiel.expAP}`,
            )
          }
        } else {
          // Ici, il ne faut pas de parenthèses !
          handleAnswers(this, i, {
            champ1: { value: '' },
            champ2: { value: '' },
            champ3: { value: '' },
            champ4: { value: '' },
            champ5: { value: '' },
            champ6: { value: '' },
            bareme: toutPourUnPoint,
            callback,
          })
        }
      }

      if (findExp && this.questionJamaisPosee(i, a, b, c, d, materiel.expAP)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
  }
}

export default MettreDesParentheses
