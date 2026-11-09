import Exercice from '../Exercice'

import { tableauColonneLigne } from '../../lib/2d/tableau'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { scratchblock } from '../../modules/scratchblock'

import { deparenthise } from '../../lib/mathFonctions/EnleverParenthesesInutiles'
import { context } from '../../modules/context'

export const titre = 'Calculer avec des priorités (Scratch)'
export const interactifReady = true

export const dateDePublication = '25/11/2024'
export const dateDeModifImportante = '28/10/2025'

export const uuid = '93d9f'

export const refs = {
  'fr-fr': ['5I1E'],
  'fr-2016': ['5I12'],
  'fr-ch': ['9R1NO8B-5', '9R2NO8B-5', '9R3NO8B-5', 'PRQNO13A-5'],
}

/**
 * Calculs avec priorité et Scratch
 * @author Mickael Guironnet
 * Ajout par Éric Elter du paramètre pouvant avoir un résultat sans parenthèses inutiles.
 */
export default class CalculsAvecPriorité extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : tableau de valeurs d'un script Scratch : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ['Avec division', true]
    this.sup = true
    this.besoinFormulaire2Texte = [
      "Type d'opérations (séparés par un trait)",
      '1 : (a ★ b) ★ c\n2 : a ★ (b ★ c)\n3 : ((a ★ b) ★ c) ★ d\n4 : (a ★( b ★ c)) ★ d\n5 : a ★(( b ★ c) ★ d)\n6 : a ★( b ★(c ★ d))\n7 : Mélange',
    ]
    this.sup2 = '7'
    this.besoinFormulaire3CaseACocher = [
      'Avec parenthèses inutiles dans la correction',
      true,
    ]
    this.sup3 = true
  }

  nouvelleVersion() {
    const typesDeQuestionsInArray = gestionnaireFormulaireTexte({
      nbQuestions: 6,
      saisie: this.sup2,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      shuffle: false,
    })
    this.consigne =
      this.nbQuestions > 1
        ? 'Compléter les tableaux.<br>'
        : 'Compléter le tableau.<br>'
    for (let i = 0; i < this.nbQuestions; i++) {
      const texteScratch: string[] = []
      const texteMath: string[] = []
      const resultat: number[] = []
      for (let k = 0; k < 20; k++) {
        const operators = [
          ...shuffle(this.sup ? ['+', '-', '*', '/'] : ['+', '-', '*']),
          ...shuffle(this.sup ? ['+', '-', '*', '/'] : ['+', '-', '*']),
          ...shuffle(this.sup ? ['+', '-', '*', '/'] : ['+', '-', '*']),
        ]
        const a = randint(2, 10)
        const b = randint(2, 10, [a])
        const c = randint(2, 10, [a, b])
        const d = randint(2, 10, [a, b, c])
        const numbers = [a, b, c, d]
        const types = ['3_g', '3_d', '4_gg', '4_gd', '4_dg', '4_dd']
        for (
          let lig = texteScratch.length, cpte = 0;
          lig < typesDeQuestionsInArray.length && cpte < 50;
          cpte++
        ) {
          const index = typesDeQuestionsInArray[lig] as number
          const {
            texteScratch: texte1Scratch,
            texteMath: texte1Math,
            resultat: resultat1,
          } = this.buildScratchBlock(types[index - 1], numbers, operators)
          if (
            texte1Scratch &&
            this.questionJamaisPosee(this.listeArguments.length, texte1Math)
          ) {
            texteScratch.push(texte1Scratch)
            texteMath.push(texte1Math)
            resultat.push(resultat1)
            lig++
          }
        }
      }
      const texte = tableauColonneLigne(
        [
          '\\text{Scratch}',
          '\\text{Calculs avec priorité}',
          '\\text{Résultat}',
        ],
        [...texteScratch.slice(0, 6)],
        [texteMath[0], resultat[0], '', '', '', '', '', '', '', '', '', ''],
        3,
        false,
        this.numeroExercice,
        i,
        this.interactif,
        {
          LC0: 'white',
          L0C0: 'white',
          L0C1: 'white',
          L0C2: 'white',
          classes: 'clavierDeBaseAvecEgal',
        },
      )

      const result = Array.from(
        { length: texteMath.length + resultat.length },
        (_, index) =>
          index % 2 === 0
            ? this.sup3
              ? texteMath[Math.floor(index / 2)]
              : deparenthise(texteMath[Math.floor(index / 2)])
            : resultat[Math.floor(index / 2)],
      )

      const texteCorr = tableauColonneLigne(
        [
          '\\text{Scratch}',
          '\\text{Calculs avec priorité}',
          '\\text{Résultat}',
        ],
        [...texteScratch.slice(0, 6)],
        result,
        3,
        false,
        this.numeroExercice,
        i,
        this.interactif,
        {
          LC0: 'white',
          L0C0: 'white',
          L0C1: 'white',
          L0C2: 'white',
          classes: 'clavierDeBaseAvecEgal',
        },
      )

      const reponses = Object.fromEntries([
        ...texteMath.slice(1).map((el, index) => [
          `L${index + 2}C1`,
          {
            value: el,
            options: { expressionNumerique: true },
          },
        ]),
        ...resultat
          .slice(1)
          .map((el, index) => [`L${index + 2}C2`, { value: el }]),
        [
          'bareme',
          (listePoints: number[]) => {
            const n = listePoints.length / 2
            let result = 0
            for (let i = 0; i < n; i++) {
              if (listePoints[i] + (listePoints[n + i] || 0) === 2) {
                result++
              }
            }
            return [result, n]
          },
        ],
      ])
      handleAnswers(this, i, reponses)
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }
    listeQuestionsToContenu(this)
  }

  computeOpe(
    a: number,
    b: number,
    operator: string,
    result: boolean[],
  ): number {
    result[0] =
      operator === '/' ? Math.floor(a / b) === a / b && result[0] : result[0] // quotient entier
    result[1] = operator === '-' ? a - b > 0 && result[1] : result[1] // soustraction positive
    return operator === '+'
      ? a + b
      : operator === '-'
        ? a - b
        : operator === '*'
          ? a * b
          : a / b
  }

  transformOpe(operator: string): string {
    return operator === '+'
      ? '+'
      : operator === '-'
        ? '-'
        : operator === '*'
          ? '\\times'
          : '\\div'
  }

  scaleScratch(value: string): string {
    const scale = 1.2
    if (context.isHtml) {
      return value.replace(
        '<pre class="blocks" >',
        `<pre class="blocks2" scale="${scale}">`,
      )
    } else {
      return '\\setscratch{scale=1.5,line width=1pt}' + value
    }
  }

  buildScratchBlock(type: string, numbers: number[], operators: string[]) {
    switch (type) {
      case '3_g': {
        const exact = [true, true]
        let resultat1 = this.computeOpe(
          this.computeOpe(numbers[0], numbers[1], operators[0], exact),
          numbers[2],
          operators[1],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat1) !== resultat1 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3 && !exact[0]) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3 && !exact[0]) numbers[2]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (
            (operators[0] === '/' || operators[1] === '/') &&
            !exact[0] &&
            k > 10
          )
            numbers[0]++
          if (
            (operators[0] === '-' || operators[1] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat1 = this.computeOpe(
            this.computeOpe(numbers[0], numbers[1], operators[0], exact),
            numbers[2],
            operators[1],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovaloperator{\\ovalnum{${numbers[0]}} ${operators[0]} \\ovalnum{${numbers[1]}}} ${operators[1]} \\ovalnum{${numbers[2]}}}\n`
        const texte1Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte1Math = `(${numbers[0]} ${this.transformOpe(operators[0])} ${numbers[1]}) ${this.transformOpe(operators[1])} ${numbers[2]}`
        return {
          texteScratch: texte1Scratch,
          texteMath: texte1Math,
          resultat: resultat1,
        }
      }
      case '3_d': {
        const exact = [true, true]
        let resultat2 = this.computeOpe(
          numbers[0],
          this.computeOpe(numbers[1], numbers[2], operators[1], exact),
          operators[0],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat2) !== resultat2 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3) numbers[2]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (
            (operators[0] === '/' || operators[1] === '/') &&
            !exact[0] &&
            k > 10
          )
            numbers[0]++
          if (
            (operators[0] === '-' || operators[1] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat2 = this.computeOpe(
            numbers[0],
            this.computeOpe(numbers[1], numbers[2], operators[1], exact),
            operators[0],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovalnum{${numbers[0]}} ${operators[0]} \\ovaloperator{\\ovalnum{${numbers[1]}} ${operators[1]} \\ovalnum{${numbers[2]}}}}\n`
        const texte2Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte2Math = `${numbers[0]} ${this.transformOpe(operators[0])} (${numbers[1]} ${this.transformOpe(operators[1])} ${numbers[2]})`
        return {
          texteScratch: texte2Scratch,
          texteMath: texte2Math,
          resultat: resultat2,
        }
      }
      case '4_gg': {
        const exact = [true, true]
        let resultat3 = this.computeOpe(
          this.computeOpe(
            this.computeOpe(numbers[0], numbers[1], operators[0], exact),
            numbers[2],
            operators[1],
            exact,
          ),
          numbers[3],
          operators[2],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat3) !== resultat3 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3 && !exact[0]) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3 && !exact[0]) numbers[2]--
          if (operators[2] === '/' && numbers[3] > 3 && !exact[0]) numbers[3]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (operators[2] === '-' && numbers[3] > 3 && !exact[1]) numbers[3]--
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 0
          )
            numbers[0]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 1
          )
            numbers[1]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 2
          )
            numbers[2]++
          if (
            (operators[0] === '-' ||
              operators[1] === '-' ||
              operators[2] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat3 = this.computeOpe(
            this.computeOpe(
              this.computeOpe(numbers[0], numbers[1], operators[0], exact),
              numbers[2],
              operators[1],
              exact,
            ),
            numbers[3],
            operators[2],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovaloperator{ \\ovaloperator{ \\ovalnum{${numbers[0]}} ${operators[0]} \\ovalnum{${numbers[1]}}} ${operators[1]} \\ovalnum{${numbers[2]}}} ${operators[2]} \\ovalnum{${numbers[3]}}}\n`
        const texte3Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte3Math = `((${numbers[0]} ${this.transformOpe(operators[0])} ${numbers[1]}) ${this.transformOpe(operators[1])} ${numbers[2]}) ${this.transformOpe(operators[2])} ${numbers[3]}`
        return {
          texteScratch: texte3Scratch,
          texteMath: texte3Math,
          resultat: resultat3,
        }
      }
      case '4_gd': {
        const exact = [true, true]
        let resultat3 = this.computeOpe(
          this.computeOpe(
            numbers[0],
            this.computeOpe(numbers[1], numbers[2], operators[1], exact),
            operators[0],
            exact,
          ),
          numbers[3],
          operators[2],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat3) !== resultat3 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3 && !exact[0]) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3 && !exact[0]) numbers[2]--
          if (operators[2] === '/' && numbers[3] > 3 && !exact[0]) numbers[3]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (operators[2] === '-' && numbers[3] > 3 && !exact[1]) numbers[3]--
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 0
          )
            numbers[0]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 1
          )
            numbers[1]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 2
          )
            numbers[2]++
          if (
            (operators[0] === '-' ||
              operators[1] === '-' ||
              operators[2] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat3 = this.computeOpe(
            this.computeOpe(
              numbers[0],
              this.computeOpe(numbers[1], numbers[2], operators[1], exact),
              operators[0],
              exact,
            ),
            numbers[3],
            operators[2],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovaloperator{ \\ovalnum{${numbers[0]}} ${operators[0]} \\ovaloperator{\\ovalnum{${numbers[1]}} ${operators[1]} \\ovalnum{${numbers[2]}}}} ${operators[2]} \\ovalnum{${numbers[3]}}}\n`
        const texte3Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte3Math = `(${numbers[0]} ${this.transformOpe(operators[0])} (${numbers[1]} ${this.transformOpe(operators[1])} ${numbers[2]})) ${this.transformOpe(operators[2])} ${numbers[3]}`
        return {
          texteScratch: texte3Scratch,
          texteMath: texte3Math,
          resultat: resultat3,
        }
      }
      case '4_dg': {
        const exact = [true, true]
        let resultat3 = this.computeOpe(
          numbers[0],
          this.computeOpe(
            this.computeOpe(numbers[1], numbers[2], operators[1], exact),
            numbers[3],
            operators[2],
            exact,
          ),
          operators[0],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat3) !== resultat3 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3 && !exact[0]) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3 && !exact[0]) numbers[2]--
          if (operators[2] === '/' && numbers[3] > 3 && !exact[0]) numbers[3]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (operators[2] === '-' && numbers[3] > 3 && !exact[1]) numbers[3]--
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 0
          )
            numbers[0]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 1
          )
            numbers[1]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 2
          )
            numbers[2]++
          if (
            (operators[0] === '-' ||
              operators[1] === '-' ||
              operators[2] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat3 = this.computeOpe(
            numbers[0],
            this.computeOpe(
              this.computeOpe(numbers[1], numbers[2], operators[1], exact),
              numbers[3],
              operators[2],
              exact,
            ),
            operators[0],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovalnum{${numbers[0]}} ${operators[0]} \\ovaloperator{ \\ovaloperator{ \\ovalnum{${numbers[1]}} ${operators[1]} \\ovalnum{${numbers[2]}}} ${operators[2]} \\ovalnum{${numbers[3]}} }}\n`
        const texte3Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte3Math = `${numbers[0]} ${this.transformOpe(operators[0])} (( ${numbers[1]} ${this.transformOpe(operators[1])} ${numbers[2]} ) ${this.transformOpe(operators[2])} ${numbers[3]})`
        return {
          texteScratch: texte3Scratch,
          texteMath: texte3Math,
          resultat: resultat3,
        }
      }
      case '4_dd': {
        const exact = [true, true]
        let resultat3 = this.computeOpe(
          numbers[0],
          this.computeOpe(
            numbers[1],
            this.computeOpe(numbers[2], numbers[3], operators[2], exact),
            operators[1],
            exact,
          ),
          operators[0],
          exact,
        )
        let k = 0
        while (
          (Math.floor(resultat3) !== resultat3 || !exact[0] || !exact[1]) &&
          k < 20
        ) {
          if (operators[0] === '/' && numbers[1] > 3 && !exact[0]) numbers[1]--
          if (operators[1] === '/' && numbers[2] > 3 && !exact[0]) numbers[2]--
          if (operators[2] === '/' && numbers[3] > 3 && !exact[0]) numbers[3]--
          if (operators[0] === '-' && numbers[1] > 3 && !exact[1]) numbers[1]--
          if (operators[1] === '-' && numbers[2] > 3 && !exact[1]) numbers[2]--
          if (operators[2] === '-' && numbers[3] > 3 && !exact[1]) numbers[3]--
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 0
          )
            numbers[0]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 1
          )
            numbers[1]++
          if (
            (operators[0] === '/' ||
              operators[1] === '/' ||
              operators[2] === '/') &&
            !exact[0] &&
            k > 10 &&
            k % 3 === 2
          )
            numbers[2]++
          if (
            (operators[0] === '-' ||
              operators[1] === '-' ||
              operators[2] === '-') &&
            !exact[1] &&
            k > 10
          )
            numbers[0]++
          exact[0] = true
          exact[1] = true
          resultat3 = this.computeOpe(
            numbers[0],
            this.computeOpe(
              numbers[1],
              this.computeOpe(numbers[2], numbers[3], operators[2], exact),
              operators[1],
              exact,
            ),
            operators[0],
            exact,
          )
          k++
        }
        if (!exact[0] || !exact[1]) {
          return { texteScratch: '', texteMath: '', resultat: NaN }
        }
        const txtScratch = `\\ovaloperator{ \\ovalnum{${numbers[0]}} ${operators[0]} \\ovaloperator{ \\ovalnum{${numbers[1]}} ${operators[1]} \\ovaloperator{ \\ovalnum{${numbers[2]}} ${operators[2]} \\ovalnum{${numbers[3]}} }}}\n`
        const texte3Scratch = this.scaleScratch(scratchblock(txtScratch) || '')
        const texte3Math = `${numbers[0]} ${this.transformOpe(operators[0])} ( ${numbers[1]} ${this.transformOpe(operators[1])} (${numbers[2]} ${this.transformOpe(operators[2])} ${numbers[3]}))`
        return {
          texteScratch: texte3Scratch,
          texteMath: texte3Math,
          resultat: resultat3,
        }
      }
      default:
        return { texteScratch: '', texteMath: '', resultat: NaN }
    }
  }
}
