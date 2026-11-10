import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import {
    ecritureAlgebrique,
    ecritureAlgebriqueSauf1,
    ecritureParentheseSiNegatif,
    reduireAxPlusB,
    rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Résoudre des équations logarithmiques'
export const dateDePublication = '18/02/2026'
export const interactifReady = true

export const uuid = '2l11f'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mLogExp-11'],
}

/**
 * Affiche la borne du domaine -b/a sous forme simplifiée
 */
function afficherBorne(b: number, a: number): string {
  const frac = new FractionEtendue(-b, a).simplifie()
  return frac.texFractionSimplifiee
}

/**
 * Calcule la valeur numérique de -b/a
 */
function borneNumerique(b: number, a: number): number {
  return -b / a
}

/**
 * Équations logarithmiques
 * @author Nathan Scheinmann
 */
export default class EquationsLogarithmiques extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Équations logarithmiques simples',
        '2 : Propriété de puissance',
        '3 : Équations log(ax+b) + log(cx+d) = log(ex+f)',
        '4 : Équations log(ax+b) - log(cx+d) = log(ex+f)',
        '5 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['Logarithme népérien (ln)', false]
    this.sup = '5'
    this.sup2 = false
  }

  nouvelleVersion() {
    const isLn = Boolean(this.sup2)
    const logString = isLn ? '\\ln' : '\\log'
    const base = isLn ? '\\text{e}' : '10'
    const baseNum = isLn ? Math.E : 10
    const formatBasePow = (n: number): string => {
      if (isLn) {
        return `\\text{e}^{${n}}`
      } else {
        return texNombre(10 ** n, 0)
      }
    }

    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      listeOfCase: ['logarithmique', 'puissance', 'produitLog', 'quotientLog'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse: string | string[] = ''
      let cleUnique = ''

      const typeQuestion = listeTypeDeQuestions[i]

      if (typeQuestion === 'logarithmique') {
        // Type 1 : Équations logarithmiques simples (generalized to ax+b)
        const variante = choice([
          'somme1',
          'somme2',
          'difference',
          'quadratique1',
          'quadratique2',
          'quadratique3',
        ])

        if (variante === 'somme1') {
          // log(a1·x+b1) + log(a2·x+b2) = n with b2 > 0 to ensure positive domain overlap
          const a1 = randint(1, 3)
          const b1 = 0
          const a2 = randint(1, 3)
          const b2 = randint(2, 8)
          const n = randint(1, 3)
          const produitCible = baseNum ** n

          cleUnique = `log-somme1-${a1}-${b1}-${a2}-${b2}-${n}-${isLn}`

          // Domain: a1·x > 0 → x > 0, a2·x+b2 > 0 → x > -b2/a2 (always satisfied if x>0 since b2>0)
          const borne = 0
          const borneStr = '0'

          // Equation: (a1·x)(a2·x+b2) = base^n
          // a1·a2·x² + a1·b2·x - base^n = 0
          const A = a1 * a2
          const B = a1 * b2
          const C = -produitCible

          const delta = B * B - 4 * A * C
          const sqrtDelta = Math.sqrt(delta)
          const x1 = (-B + sqrtDelta) / (2 * A)
          const x2 = (-B - sqrtDelta) / (2 * A)

          const expr1 = reduireAxPlusB(a1, b1, 'x')
          const expr2 = reduireAxPlusB(a2, b2, 'x')

          texte = `Résoudre l'équation $${logString}(${expr1}) + ${logString}(${expr2}) = ${n}$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$ et $${expr2} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `Par la propriété du produit, $${logString}(a) + ${logString}(b) = ${logString}(a \\times b)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}((${expr1})(${expr2})) = ${n}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${base}^b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&(${expr1})(${expr2}) = ${formatBasePow(n)}\\\\\n`
          texteCorr += `\\iff &${rienSi1(A)}x^2${ecritureAlgebriqueSauf1(B)}x-${formatBasePow(n)} = 0\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `On résout cette équation du second degré.<br>`
          const deltaExpr = isLn
            ? `${ecritureParentheseSiNegatif(B)}^2${ecritureAlgebrique(4 * A)}\\text{e}^{${n}}`
            : `${texNombre(delta, 0)}`
          texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(B)}^2${ecritureAlgebrique(4 * A)}\\times ${formatBasePow(n)} ${isLn ? `= ${B * B}${ecritureAlgebrique(4 * A)}\\text{e}^{${n}}` : `= ${texNombre(delta, 0)}`}$<br>`
          texteCorr += `$x_1 = \\dfrac{-${B} + \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x1, 2, true)}$<br>`
          texteCorr += `$x_2 = \\dfrac{-${B} - \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x2, 2, true)}$<br>`
          texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`
          texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} > ${borneStr} \\quad \\implies \\quad x_1 \\in D$<br>`
          if (borneStr.includes('frac')) {
            texteCorr += `<br>`
          }
          texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} ${x2 > borne ? `> ${borneStr} \\quad \\implies \\quad x_2 \\in D` : `\\leqslant ${borneStr} \\quad \\implies \\quad x_2 \\notin D`}$<br>`

          const solutions = [x1, x2].filter((x) => x > borne)
          if (solutions.length === 1) {
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(solutions[0], 2, true)}\\right\\}`)}$`
            reponse = new Decimal(solutions[0]).toDecimalPlaces(2).toFixed(2)
          } else if (solutions.length === 2) {
            const sorted = solutions.sort((a, b) => a - b)
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(sorted[0], 2, true)};${texNombre(sorted[1], 2, true)}\\right\\}`)}$`
            reponse = sorted.map((s) =>
              new Decimal(s).toDecimalPlaces(2).toFixed(2),
            )
          } else {
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        } else if (variante === 'somme2') {
          // log(a1·x+b1) + log(a2·x+b2) = n with b1 < 0 and b2 > 0
          const a1 = randint(1, 2)
          const b1 = -randint(1, 4)
          const a2 = randint(1, 2)
          const b2 = randint(Math.abs(b1) + 1, Math.abs(b1) + 5)
          const n = randint(1, 3)
          const produitCible = baseNum ** n

          cleUnique = `log-somme2-${a1}-${b1}-${a2}-${b2}-${n}-${isLn}`

          const borne1 = borneNumerique(b1, a1)
          const borne2 = borneNumerique(b2, a2)
          const borne = Math.max(borne1, borne2)
          const borneStr = afficherBorne(b1, a1)

          const expr1 = reduireAxPlusB(a1, b1, 'x')
          const expr2 = reduireAxPlusB(a2, b2, 'x')

          // (a1·x+b1)(a2·x+b2) = base^n
          const A = a1 * a2
          const bCoef = a1 * b2 + a2 * b1
          const cCoef = b1 * b2 - produitCible

          const delta = bCoef * bCoef - 4 * A * cCoef
          const sqrtDelta = Math.sqrt(delta)
          const x1 = (-bCoef + sqrtDelta) / (2 * A)
          const x2 = (-bCoef - sqrtDelta) / (2 * A)

          texte = `Résoudre l'équation $${logString}(${expr1}) + ${logString}(${expr2}) = ${n}$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$ et $${expr2} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `Par la propriété du produit, $${logString}(a) + ${logString}(b) = ${logString}(a \\times b)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}((${expr1})(${expr2})) = ${n}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${base}^b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&(${expr1})(${expr2}) = ${formatBasePow(n)}\\\\\n`
          texteCorr += `\\iff &${rienSi1(A)}x^2${bCoef === 0 ? '' : `${ecritureAlgebriqueSauf1(bCoef)}x`}${ecritureAlgebrique(b1 * b2)}-${formatBasePow(n)} = 0\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `On résout cette équation du second degré.<br>`
          const deltaExpr = isLn
            ? `${ecritureParentheseSiNegatif(bCoef)}^2${ecritureAlgebrique(-4 * A)}(${b1 * b2} - \\text{e}^{${n}})`
            : `${texNombre(delta, 0)}`
          texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(bCoef)}^2${ecritureAlgebrique(-4 * A)}(${b1 * b2} - ${formatBasePow(n)}) ${isLn ? '' : `= ${texNombre(delta, 0)}`}$<br>`
          texteCorr += `$x_1 = \\dfrac{${-bCoef} + \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x1, 2, true)}$<br>`
          texteCorr += `$x_2 = \\dfrac{${-bCoef} - \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x2, 2, true)}$<br>`
          texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`

          const solutions: number[] = []
          if (x1 > borne) {
            texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} > ${borneStr} \\quad \\implies \\quad x_1 \\in D$<br>`
            solutions.push(x1)
          } else {
            texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x_1 \\notin D$<br>`
          }
          if (borneStr.includes('frac')) {
            texteCorr += `<br>`
          }
          if (x2 > borne) {
            texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} > ${borneStr} \\quad \\implies \\quad x_2 \\in D$<br>`
            solutions.push(x2)
          } else {
            texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x_2 \\notin D$<br>`
          }

          if (solutions.length >= 1) {
            const sol = solutions.sort((a, b) => a - b)
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${sol.map((s) => texNombre(s, 2, true)).join(';')}\\right\\}`)}$`
            reponse =
              sol.length === 1
                ? new Decimal(sol[0]).toDecimalPlaces(2).toFixed(2)
                : sol.map((s) => new Decimal(s).toDecimalPlaces(2).toFixed(2))
          } else {
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        } else if (variante === 'difference') {
          // log(a1·x+b1) - log(a2·x+b2) = n
          const a1 = randint(1, 3)
          const b1 = randint(2, 15)
          const a2 = randint(1, 2)
          const b2 = 0
          const n = randint(1, 2)
          const produitCible = baseNum ** n

          cleUnique = `log-diff-${a1}-${b1}-${a2}-${b2}-${n}-${isLn}`

          const borneStr = '0'

          const expr1 = reduireAxPlusB(a1, b1, 'x')
          const expr2 = reduireAxPlusB(a2, b2, 'x')

          // (a1·x+b1)/(a2·x) = base^n → a1·x+b1 = a2·base^n·x
          // b1 = (a2·base^n - a1)·x
          const solution = b1 / (a2 * produitCible - a1)

          texte = `Résoudre l'équation $${logString}(${expr1}) - ${logString}(${expr2}) = ${n}$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$ et $${expr2} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `Par la propriété du quotient, $${logString}(a) - ${logString}(b) = ${logString}\\left(\\dfrac{a}{b}\\right)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}\\left(\\dfrac{${expr1}}{${expr2}}\\right) = ${n}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${base}^b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&\\dfrac{${expr1}}{${expr2}} = ${formatBasePow(n)}\\\\\n`
          if (isLn) {
            texteCorr += `\\iff &${expr1} = ${formatBasePow(n)} \\times (${expr2})\\\\\n`
            texteCorr += `\\iff &${b1} = (${rienSi1(a2)}${formatBasePow(n)} - ${a1})x\\\\\n`
            texteCorr += `\\iff &x = \\dfrac{${b1}}{${rienSi1(a2)}${formatBasePow(n)} - ${a1}} \\approx ${texNombre(solution, 2, true)}\n`
          } else {
            const coefX = a2 * produitCible - a1
            texteCorr += `\\iff &${expr1} = ${texNombre(a2 * produitCible, 0)}x\\\\\n`
            texteCorr += `\\iff &${b1} = ${texNombre(coefX, 0)}x\\\\\n`
            texteCorr += `\\iff &x = \\dfrac{${b1}}{${texNombre(coefX, 0)}} \\approx ${texNombre(solution, 2, true)}\n`
          }
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `Vérifions que la solution appartient au domaine :<br>`

          if (solution > 0) {
            texteCorr += `$x \\approx ${texNombre(solution, 2, true)} > ${borneStr} \\quad \\implies \\quad x \\in D$<br>`
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(solution, 2, true)}\\right\\}`)}$`
            reponse = new Decimal(solution).toDecimalPlaces(2).toFixed(2)
          } else {
            texteCorr += `$x \\approx ${texNombre(solution, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x \\notin D$<br>`
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        } else if (variante === 'quadratique1') {
          // log(a1·x+b1) + log(a2·x+b2) = c with b1, b2 < 0
          const a1 = randint(1, 2)
          const a2 = randint(1, 2)
          const rawB1 = randint(1, 4)
          const rawB2 = randint(rawB1 + 2, rawB1 + 5)
          const b1 = -rawB1
          const b2 = -rawB2
          const c = randint(1, 2)
          const produitCible = baseNum ** c

          cleUnique = `log-quad1-${a1}-${b1}-${a2}-${b2}-${c}-${isLn}`

          const borne1 = borneNumerique(b1, a1)
          const borne2 = borneNumerique(b2, a2)
          const borne = Math.max(borne1, borne2)
          const borneStr =
            borne1 >= borne2 ? afficherBorne(b1, a1) : afficherBorne(b2, a2)

          const expr1 = reduireAxPlusB(a1, b1, 'x')
          const expr2 = reduireAxPlusB(a2, b2, 'x')

          // (a1·x+b1)(a2·x+b2) = base^c
          const A = a1 * a2
          const bCoef = a1 * b2 + a2 * b1
          const prodBD = b1 * b2
          const cCoef = prodBD - produitCible

          const delta = bCoef * bCoef - 4 * A * cCoef
          const sqrtDelta = Math.sqrt(delta)
          const x1 = (-bCoef + sqrtDelta) / (2 * A)
          const x2 = (-bCoef - sqrtDelta) / (2 * A)

          texte = `Résoudre l'équation $${logString}(${expr1}) + ${logString}(${expr2}) = ${c}$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$ et $${expr2} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `Par la propriété du produit, $${logString}(a) + ${logString}(b) = ${logString}(a \\times b)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}((${expr1})(${expr2})) = ${c}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${base}^b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&(${expr1})(${expr2}) = ${formatBasePow(c)}\\\\\n`
          texteCorr += `\\iff &${rienSi1(A)}x^2${ecritureAlgebriqueSauf1(bCoef)}x${ecritureAlgebrique(prodBD)}-${formatBasePow(c)} = 0\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `On résout cette équation du second degré.<br>`
          const deltaExpr = isLn
            ? `${ecritureParentheseSiNegatif(bCoef)}^2${ecritureAlgebrique(-4 * A)}(${prodBD} - \\text{e}^{${c}})`
            : `${texNombre(delta, 0)}`
          texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(bCoef)}^2${ecritureAlgebrique(-4 * A)}(${prodBD} - ${formatBasePow(c)}) ${isLn ? '' : `= ${texNombre(delta, 0)}`}$<br>`
          texteCorr += `$x_1 = \\dfrac{${-bCoef} + \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x1, 2, true)}$<br>`
          texteCorr += `$x_2 = \\dfrac{${-bCoef} - \\sqrt{${deltaExpr}}}{${2 * A}} \\approx ${texNombre(x2, 2, true)}$<br>`
          texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`

          const solutions: number[] = []
          if (x1 > borne) {
            texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} > ${borneStr} \\quad \\implies \\quad x_1 \\in D$<br>`
            solutions.push(x1)
          } else {
            texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x_1 \\notin D$<br>`
          }
          if (borneStr.includes('frac')) {
            texteCorr += `<br>`
          }
          if (x2 > borne) {
            texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} > ${borneStr} \\quad \\implies \\quad x_2 \\in D$<br>`
            solutions.push(x2)
          } else {
            texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x_2 \\notin D$<br>`
          }

          if (solutions.length >= 1) {
            const sol = solutions.sort((a, b) => a - b)
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${sol.map((s) => texNombre(s, 2, true)).join(';')}\\right\\}`)}$`
            reponse =
              sol.length === 1
                ? new Decimal(sol[0]).toDecimalPlaces(2).toFixed(2)
                : sol.map((s) => new Decimal(s).toDecimalPlaces(2).toFixed(2))
          } else {
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        } else if (variante === 'quadratique2') {
          // 2·log(a1·x) = log(a2·x+b2) → (a1·x)² = a2·x+b2
          const a1 = randint(1, 2)
          const a2 = randint(1, 3)
          const b2 = randint(2, 12)
          cleUnique = `log-quad2-${a1}-${a2}-${b2}-${isLn}`

          const expr2 = reduireAxPlusB(a2, b2, 'x')

          // a1²·x² = a2·x + b2 → a1²·x² - a2·x - b2 = 0
          const A = a1 * a1
          const bCoef = -a2
          const cCoef = -b2
          const delta = bCoef * bCoef - 4 * A * cCoef
          const sqrtDelta = Math.sqrt(delta)
          const x1 = (-bCoef + sqrtDelta) / (2 * A)
          const x2 = (-bCoef - sqrtDelta) / (2 * A)

          texte = `Résoudre l'équation $2${logString}(${rienSi1(a1)}x) = ${logString}(${expr2})$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${rienSi1(a1)}x > 0$ et $${expr2} > 0 \\implies x > 0$, soit $D = \\left]0\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `En utilisant $2${logString}(${rienSi1(a1)}x) = ${logString}((${rienSi1(a1)}x)^2)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}((${rienSi1(a1)}x)^2) = ${logString}(${expr2})$<br>`
          texteCorr += `Si $${logString}(a) = ${logString}(b)$, alors $a = b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&${rienSi1(A)}x^2 = ${expr2}\\\\\n`
          texteCorr += `\\iff &${rienSi1(A)}x^2${ecritureAlgebriqueSauf1(bCoef)}x${ecritureAlgebrique(cCoef)} = 0\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `On résout cette équation du second degré.<br>`
          texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(bCoef)}^2${ecritureAlgebrique(-4 * A)}(${cCoef}) = ${delta}$<br>`
          texteCorr += `$x_1 = \\dfrac{${a2} + \\sqrt{${delta}}}{${2 * A}} \\approx ${texNombre(x1, 2, true)}$<br>`
          texteCorr += `$x_2 = \\dfrac{${a2} - \\sqrt{${delta}}}{${2 * A}} \\approx ${texNombre(x2, 2, true)}$<br>`
          texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`
          texteCorr += `$x_1 \\approx ${texNombre(x1, 2, true)} > 0 \\quad \\implies \\quad x_1 \\in D$<br>`
          texteCorr += `$x_2 \\approx ${texNombre(x2, 2, true)} ${x2 > 0 ? '> 0 \\quad \\implies \\quad x_2 \\in D' : '\\leqslant 0 \\quad \\implies \\quad x_2 \\notin D'}$<br>`

          const solutions = [x1, x2].filter((x) => x > 0)
          if (solutions.length >= 1) {
            const sol = solutions.sort((a, b) => a - b)
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${sol.map((s) => texNombre(s, 2, true)).join(';')}\\right\\}`)}$`
            reponse =
              sol.length === 1
                ? new Decimal(sol[0]).toDecimalPlaces(2).toFixed(2)
                : sol.map((s) => new Decimal(s).toDecimalPlaces(2).toFixed(2))
          } else {
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        } else {
          // log(a1·x+b1) - log(a2·x+b2) = c → quotient with domain
          const a1 = randint(1, 3)
          const b1 = randint(1, 5)
          const a2 = randint(1, 2)
          const b2 = -randint(1, 4)
          const c = randint(1, 2)
          const produitCible = baseNum ** c

          cleUnique = `log-quad3-${a1}-${b1}-${a2}-${b2}-${c}-${isLn}`

          const borne1 = borneNumerique(b1, a1)
          const borne2 = borneNumerique(b2, a2)
          const borne = Math.max(borne1, borne2)
          const borneStr =
            borne1 >= borne2 ? afficherBorne(b1, a1) : afficherBorne(b2, a2)

          const expr1 = reduireAxPlusB(a1, b1, 'x')
          const expr2 = reduireAxPlusB(a2, b2, 'x')

          // (a1·x+b1)/(a2·x+b2) = base^c
          // a1·x+b1 = base^c·(a2·x+b2)
          // a1·x+b1 = a2·base^c·x + b2·base^c
          // (a1 - a2·base^c)·x = b2·base^c - b1
          const solution = (b2 * produitCible - b1) / (a1 - a2 * produitCible)

          texte = `Résoudre l'équation $${logString}(${expr1}) - ${logString}(${expr2}) = ${c}$.`
          texte += ` Arrondir la solution au centième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$ et $${expr2} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `Par la propriété du quotient, $${logString}(a) - ${logString}(b) = ${logString}\\left(\\dfrac{a}{b}\\right)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logString}\\left(\\dfrac{${expr1}}{${expr2}}\\right) = ${c}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${base}^b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&\\dfrac{${expr1}}{${expr2}} = ${formatBasePow(c)}\\\\\n`
          if (isLn) {
            texteCorr += `\\iff &${expr1} = ${formatBasePow(c)} \\times (${expr2})\\\\\n`
            texteCorr += `\\iff &x = \\dfrac{${b2} \\times ${formatBasePow(c)} - ${b1}}{${a1} - ${rienSi1(a2)}${formatBasePow(c)}} \\approx ${texNombre(solution, 2, true)}\n`
          } else {
            texteCorr += `\\iff &${expr1} = ${texNombre(produitCible, 0)}(${expr2})\\\\\n`
            const coefX = a1 - a2 * produitCible
            const constTerm = b2 * produitCible - b1
            texteCorr += `\\iff &${texNombre(coefX, 0)}x = ${texNombre(constTerm, 0)}\\\\\n`
            texteCorr += `\\iff &x = \\dfrac{${texNombre(constTerm, 0)}}{${texNombre(coefX, 0)}} \\approx ${texNombre(solution, 2, true)}\n`
          }
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `Vérifions que la solution appartient au domaine :<br>`

          if (solution > borne) {
            texteCorr += `$x \\approx ${texNombre(solution, 2, true)} > ${borneStr} \\quad \\implies \\quad x \\in D$<br>`
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(solution, 2, true)}\\right\\}`)}$`
            reponse = new Decimal(solution).toDecimalPlaces(2).toFixed(2)
          } else {
            texteCorr += `$x \\approx ${texNombre(solution, 2, true)} \\leqslant ${borneStr} \\quad \\implies \\quad x \\notin D$<br>`
            texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
            reponse = '\\emptyset'
          }
        }
      } else if (typeQuestion === 'puissance') {
        // Type 2 : Propriété de puissance
        const variante = choice(['standard', 'inverse', 'mixte'])
        const baseLog = choice([2, 3, 5, 10])
        const coefA = randint(2, 5)
        const coefC = randint(2, 5, [coefA])
        const d = choice([2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 16, 20, 25])

        if (variante === 'standard') {
          // a·log_b(x) = c·log_b(d) → x = d^(c/a)
          cleUnique = `puiss-std-${baseLog}-${coefA}-${coefC}-${d}`

          const exposant = new FractionEtendue(coefC, coefA).simplifie()
          const resultat = new Decimal(d).pow(exposant.valeurDecimale)
          const resultatArrondi = resultat.toDecimalPlaces(3)

          const logBase = baseLog === 10 ? logString : `\\log_{${baseLog}}`

          texte = `Résoudre l'équation $${rienSi1(coefA)}${logBase}(x) = ${rienSi1(coefC)}${logBase}(${d})$.`
          texte += ` Arrondir la solution au millième près.`

          reponse = resultatArrondi.toFixed(3)

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $x > 0$, soit $D = \\left]0\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `En utilisant la propriété $n \\times \\log_a(b) = \\log_a(b^n)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$${logBase}(x^{${coefA}}) = ${logBase}(${d}^{${coefC}})$<br>`
          texteCorr += `Si $${logBase}(a) = ${logBase}(b)$, alors $a = b$, donc :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&x^{${coefA}} = ${d}^{${coefC}}\\\\\n`
          texteCorr += `\\iff &x = ${d}^{${exposant.simplifie().toLatex('sfrac')}}\\\\\n`
          texteCorr += `\\iff &x \\approx ${texNombre(resultatArrondi, 3, true)}\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `Vérifions que la solution appartient au domaine :<br>`
          texteCorr += `$x \\approx ${texNombre(resultatArrondi, 3, true)} > 0 \\quad \\implies \\quad x \\in D$<br>`
          texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
        } else if (variante === 'inverse') {
          // log_b(x^a) = c → x = b^(c/a) (or x = ±b^(c/a) if a is even)
          const baseEffective = baseLog === 10 && isLn ? Math.E : baseLog
          const baseAffichee =
            baseLog === 10 && isLn ? '\\text{e}' : `${baseLog}`
          const isEvenPower = coefA % 2 === 0

          cleUnique = `puiss-inv-${baseLog}-${coefA}-${coefC}-${isLn}`

          const exposant = new FractionEtendue(coefC, coefA).simplifie()
          const resultat = new Decimal(baseEffective).pow(
            exposant.valeurDecimale,
          )
          const resultatArrondi = resultat.toDecimalPlaces(3)

          const logBase = baseLog === 10 ? logString : `\\log_{${baseLog}}`

          texte = `Résoudre l'équation $${logBase}(x^{${coefA}}) = ${coefC}$.`
          texte += ` Arrondir la solution au millième près.`

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          if (isEvenPower) {
            texteCorr += `${texteGras(`Domaine :`)} $x^{${coefA}} > 0 \\iff x \\neq 0$, soit $D = \\mathbb{R} \\setminus \\{0\\}$<br>`
          } else {
            texteCorr += `${texteGras(`Domaine :`)} $x > 0$, soit $D = \\left]0\\,;\\, +\\infty\\right[$<br>`
          }
          texteCorr += `Par définition, $${logBase}(a) = b \\iff a = ${baseAffichee}^b$, donc l'équation initiale est équivalente à :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&x^{${coefA}} = ${baseAffichee}^{${coefC}}\\\\\n`
          if (isEvenPower) {
            texteCorr += `\\iff &x = \\pm ${baseAffichee}^{${exposant.simplifie().toLatex('sfrac')}}\\\\\n`
            texteCorr += `\\iff &x \\approx \\pm ${texNombre(resultatArrondi, 3, true)}\n`
          } else {
            texteCorr += `\\iff &x = ${baseAffichee}^{${exposant.simplifie().toLatex('sfrac')}}\\\\\n`
            texteCorr += `\\iff &x \\approx ${texNombre(resultatArrondi, 3, true)}\n`
          }
          texteCorr += `\\end{aligned}$<br>`
          if (isEvenPower) {
            const negResultatArrondi = resultatArrondi.neg()
            texteCorr += `Les deux solutions sont non nulles, donc elles appartiennent au domaine.<br>`
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(negResultatArrondi, 3, true)};${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
            reponse = [
              negResultatArrondi.toFixed(3),
              resultatArrondi.toFixed(3),
            ]
          } else {
            texteCorr += `Vérifions que la solution appartient au domaine :<br>`
            texteCorr += `$x \\approx ${texNombre(resultatArrondi, 3, true)} > 0 \\quad \\implies \\quad x \\in D$<br>`
            texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(resultatArrondi, 3, true)}\\right\\}`)}$`
            reponse = resultatArrondi.toFixed(3)
          }
        } else {
          // a·log(x) + b·log(kx) = c
          const k = randint(2, 5)
          const coefB = randint(1, 3)
          const c = randint(2, 4)
          cleUnique = `puiss-mixte-${coefA}-${coefB}-${k}-${c}-${isLn}`

          const logK = isLn ? Math.log(k) : Math.log10(k)
          const logX = (c - coefB * logK) / (coefA + coefB)
          const solution = isLn ? Math.exp(logX) : 10 ** logX
          const solutionArrondie = new Decimal(solution).toDecimalPlaces(3)
          const baseExpo = isLn ? '\\text{e}' : '10'

          texte = `Résoudre l'équation $${rienSi1(coefA)}${logString}(x)${ecritureAlgebriqueSauf1(coefB)}${logString}(${k}x) = ${c}$.`
          texte += ` Arrondir la solution au millième près.`

          reponse = solutionArrondie.toFixed(3)

          texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
          texteCorr += `${texteGras(`Domaine :`)} $x > 0$, soit $D = \\left]0\\,;\\, +\\infty\\right[$<br>`
          texteCorr += `En développant $${logString}(${k}x) = ${logString}(${k}) + ${logString}(x)$, l'équation initiale est équivalente à :<br>`
          texteCorr += `$\\begin{aligned}\n`
          texteCorr += `&${rienSi1(coefA)}${logString}(x)${ecritureAlgebriqueSauf1(coefB)}(${logString}(${k}) + ${logString}(x)) = ${c}\\\\\n`
          texteCorr += `\\iff &${rienSi1(coefA)}${logString}(x)${ecritureAlgebriqueSauf1(coefB)}${logString}(${k})${ecritureAlgebriqueSauf1(coefB)}${logString}(x) = ${c}\\\\\n`
          texteCorr += `\\iff &${rienSi1(coefA + coefB)}${logString}(x) = ${c}${ecritureAlgebriqueSauf1(-coefB)}${logString}(${k})\\\\\n`
          texteCorr += `\\iff &${logString}(x) = \\dfrac{${c}${ecritureAlgebriqueSauf1(-coefB)}${logString}(${k})}{${coefA + coefB}}\\\\\n`
          texteCorr += `\\end{aligned}$<br>`
          texteCorr += `Par définition, $${logString}(a) = b \\iff a = ${baseExpo}^b$, donc :<br>`
          texteCorr += `$x = ${baseExpo}^{(${c}${ecritureAlgebriqueSauf1(-coefB)}${logString}(${k}))/${coefA + coefB}} \\approx ${texNombre(solutionArrondie, 3, true)}$<br>`
          texteCorr += `Vérifions que la solution appartient au domaine :<br>`
          texteCorr += `$x \\approx ${texNombre(solutionArrondie, 3, true)} > 0 \\quad \\implies \\quad x \\in D$<br>`
          texteCorr += `$S \\approx ${miseEnEvidence(`\\left\\{${texNombre(solutionArrondie, 3, true)}\\right\\}`)}$`
        }
      } else if (typeQuestion === 'produitLog') {
        // Type 3 : log(ax+b) + log(cx+d) = log(ex+f) — product property → quadratic
        // Backward generation with Vieta's formulas: pick roots r1, r2, derive e1, f1
        // Ensures exact rational solutions and pedagogical variety
        const scenario = choice([
          'deuxSolutions',
          'uneSolution',
          'aucuneSolution',
          'fractionSolution',
        ])
        let a1 = 0
        let b1 = 0
        let c1 = 0
        let d1 = 0
        let e1 = 0
        let f1 = 0
        let r1Num = 0
        let r2Num = 0

        // Vieta: A = a1*c1, e1 = a1*d1 + c1*b1 + A*(r1+r2), f1 = b1*d1 - A*r1*r2
        if (scenario === 'deuxSolutions') {
          // Both roots positive integers, b1≥0, d1≥0 → domain bound ≤ 0 → both in domain
          do {
            a1 = randint(1, 2)
            c1 = randint(1, 2)
            b1 = randint(0, 3)
            d1 = randint(0, 3)
            r1Num = randint(1, 6)
            r2Num = randint(1, 6, [r1Num])
            const A = a1 * c1
            e1 = a1 * d1 + c1 * b1 + A * (r1Num + r2Num)
            f1 = b1 * d1 - A * r1Num * r2Num
          } while (e1 <= 0 || f1 === 0)
        } else if (scenario === 'uneSolution') {
          // r1 positive, r2 negative → r2 outside domain (bound ≤ 0)
          do {
            a1 = randint(1, 2)
            c1 = randint(1, 2)
            b1 = randint(0, 3)
            d1 = randint(0, 3)
            r1Num = randint(2, 6)
            r2Num = -randint(1, 5)
            const A = a1 * c1
            e1 = a1 * d1 + c1 * b1 + A * (r1Num + r2Num)
            f1 = b1 * d1 - A * r1Num * r2Num
          } while (e1 <= 0 || f1 === 0)
        } else if (scenario === 'aucuneSolution') {
          // Both roots positive but below domain bound (b1 negative → high bound)
          let valid = false
          while (!valid) {
            a1 = randint(1, 2)
            c1 = randint(1, 2)
            b1 = -randint(3, 6)
            d1 = randint(5, 10)
            r1Num = randint(1, 3)
            r2Num = randint(1, 3, [r1Num])
            const A = a1 * c1
            e1 = a1 * d1 + c1 * b1 + A * (r1Num + r2Num)
            f1 = b1 * d1 - A * r1Num * r2Num
            if (e1 <= 0 || f1 === 0) continue
            const borne = Math.max(-b1 / a1, -d1 / c1, -f1 / e1)
            if (borne >= Math.max(r1Num, r2Num)) valid = true
          }
        } else {
          // fractionSolution: a1=2 ensures A even → fractional root r1 = odd/2
          do {
            a1 = 2
            c1 = randint(1, 2)
            b1 = randint(0, 3)
            d1 = randint(0, 3)
            r1Num = choice([1, 3, 5, 7])
            r2Num = randint(1, 5)
            const A = a1 * c1
            // r1 = r1Num/2, r2 = r2Num
            // r1+r2 = r1Num/2 + r2Num, r1*r2 = r1Num*r2Num/2
            e1 = a1 * d1 + c1 * b1 + (A * (r1Num + 2 * r2Num)) / 2
            f1 = b1 * d1 - (A * r1Num * r2Num) / 2
          } while (
            e1 <= 0 ||
            f1 === 0 ||
            !Number.isInteger(e1) ||
            !Number.isInteger(f1)
          )
        }

        cleUnique = `prodLog-${scenario}-${a1}-${b1}-${c1}-${d1}-${e1}-${f1}-${isLn}`

        const expr1 = reduireAxPlusB(a1, b1, 'x')
        const expr2 = reduireAxPlusB(c1, d1, 'x')
        const expr3 = reduireAxPlusB(e1, f1, 'x')

        // Domain: all three expressions > 0
        const bornes = [
          borneNumerique(b1, a1),
          borneNumerique(d1, c1),
          borneNumerique(f1, e1),
        ]
        const borne = Math.max(...bornes)
        const borneIdx = bornes.indexOf(borne)
        const borneStr = [
          afficherBorne(b1, a1),
          afficherBorne(d1, c1),
          afficherBorne(f1, e1),
        ][borneIdx]

        // Quadratic: a1·c1·x² + (a1·d1+c1·b1-e1)x + (b1·d1-f1) = 0
        const A = a1 * c1
        const bCoef = a1 * d1 + c1 * b1 - e1
        const cCoef = b1 * d1 - f1
        const delta = bCoef * bCoef - 4 * A * cCoef
        // By construction delta = A²(r1-r2)² > 0, sqrtDelta is always integer
        const sqrtDelta = Math.round(Math.sqrt(delta))

        // Exact roots via quadratic formula
        const num1 = -bCoef + sqrtDelta
        const num2 = -bCoef - sqrtDelta
        const den = 2 * A
        // x1 is the larger root (with +), x2 the smaller (with -)
        const x1 = num1 / den
        const x2 = num2 / den
        const x1Str = new FractionEtendue(num1, den).simplifie()
          .texFractionSimplifiee
        const x2Str = new FractionEtendue(num2, den).simplifie()
          .texFractionSimplifiee

        texte = `Résoudre l'équation $${logString}(${expr1}) + ${logString}(${expr2}) = ${logString}(${expr3})$.`

        texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
        texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$, $${expr2} > 0$ et $${expr3} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
        texteCorr += `Par la propriété du produit, $${logString}(a) + ${logString}(b) = ${logString}(a \\times b)$, l'équation initiale est équivalente à :<br>`
        texteCorr += `$${logString}((${expr1})(${expr2})) = ${logString}(${expr3})$<br>`
        texteCorr += `Si $${logString}(a) = ${logString}(b)$, alors $a = b$, donc :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `&(${expr1})(${expr2}) = ${expr3}\\\\\n`
        texteCorr += `\\iff &${rienSi1(A)}x^2 ${bCoef >= 0 ? '+' : ''} ${reduireAxPlusB(bCoef, cCoef, 'x')} = 0\n`
        texteCorr += `\\end{aligned}$<br>`

        texteCorr += `On résout cette équation du second degré.<br>`
        texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(bCoef)}^2 - 4 \\times ${A} \\times (${cCoef}) = ${texNombre(delta)}$, $\\sqrt{\\Delta} = ${sqrtDelta}$<br>`
        texteCorr += `$x_1 = \\dfrac{${-bCoef} + ${sqrtDelta}}{${den}} = ${x1Str}$<br>`
        texteCorr += `$x_2 = \\dfrac{${-bCoef} - ${sqrtDelta}}{${den}} = ${x2Str}$<br>`
        texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`

        const solsProd: string[] = []
        texteCorr += '$\\begin{aligned}'
        if (x1 > borne) {
          texteCorr += `x_1 &= ${x1Str} > ${borneStr} \\quad \\implies \\quad x_1 \\in D\\\\`
          solsProd.push(x1Str)
        } else {
          texteCorr += `x_1 &= ${x1Str} \\leqslant ${borneStr} \\quad \\implies \\quad x_1 \\notin D\\\\`
        }
        if (borneStr.includes('frac')) {
          texteCorr += `[1ex]`
        }
        if (x2 > borne) {
          texteCorr += `x_2 &= ${x2Str} > ${borneStr} \\quad \\implies \\quad x_2 \\in D\\\\`
          solsProd.push(x2Str)
        } else {
          texteCorr += `x_2 &= ${x2Str} \\leqslant ${borneStr} \\quad \\implies \\quad x_2 \\notin D\\\\`
        }
        texteCorr += '\\end{aligned}$<br>'

        if (solsProd.length >= 1) {
          // Sort solutions numerically for display
          const solsNum = [
            ...(x1 > borne ? [{ val: x1, str: x1Str, num: num1 }] : []),
            ...(x2 > borne ? [{ val: x2, str: x2Str, num: num2 }] : []),
          ].sort((a, b) => a.val - b.val)
          texteCorr += `$S = ${miseEnEvidence(`\\left\\{${solsNum.map((s) => s.str).join(';')}\\right\\}`)}$`
          // For interactive answer, accept any valid solution
          const reponsesExactes = solsNum.map((s) => {
            const frac = new FractionEtendue(s.num, den).simplifie()
            return frac.den === 1 ? `${frac.num}` : frac.texFractionSimplifiee
          })
          reponse =
            reponsesExactes.length === 1 ? reponsesExactes[0] : reponsesExactes
        } else {
          texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
          reponse = '\\emptyset'
        }
      } else {
        // Type 4 : log(ax+b) - log(cx+d) = log(ex+f) — quotient property → quadratic
        // Backward generation: pick e1, c1, d1, f1, roots r1, r2, derive a1, b1
        // Equation: (ax+b)/(cx+d) = ex+f → ecx²+(ed+fc-a)x+(fd-b)=0
        // Vieta: a1 = e1*d1 + f1*c1 + A*(r1+r2), b1 = f1*d1 - A*r1*r2
        const scenarioQ = choice([
          'deuxSolutions',
          'uneSolution',
          'aucuneSolution',
          'fractionSolution',
        ])
        let a1 = 0
        let b1 = 0
        let c1 = 0
        let d1 = 0
        let e1 = 0
        let f1 = 0
        let r1Num = 0
        let r2Num = 0

        if (scenarioQ === 'deuxSolutions') {
          // Both roots positive integers, d1≥0, f1>0 → domain bound ≤ 0 → both in domain
          do {
            e1 = randint(1, 2)
            c1 = randint(1, 2)
            d1 = randint(0, 3)
            f1 = randint(1, 4)
            r1Num = randint(1, 6)
            r2Num = randint(1, 6, [r1Num])
            const A = e1 * c1
            a1 = e1 * d1 + f1 * c1 + A * (r1Num + r2Num)
            b1 = f1 * d1 - A * r1Num * r2Num
          } while (a1 <= 0 || b1 === 0 || a1 === e1)
        } else if (scenarioQ === 'uneSolution') {
          // r1 positive, r2 negative → use d1<0 to create positive domain bound
          do {
            e1 = randint(1, 2)
            c1 = randint(1, 2)
            d1 = -randint(1, 3)
            f1 = randint(2, 5)
            r1Num = randint(3, 7)
            r2Num = -randint(1, 3)
            const A = e1 * c1
            a1 = e1 * d1 + f1 * c1 + A * (r1Num + r2Num)
            b1 = f1 * d1 - A * r1Num * r2Num
            if (a1 <= 0 || b1 === 0 || a1 === e1) continue
            // Verify: r1 in domain, r2 not in domain
            const borne = Math.max(-b1 / a1, -d1 / c1, -f1 / e1)
            if (r1Num > borne && r2Num <= borne) break
          } while (true)
        } else if (scenarioQ === 'aucuneSolution') {
          // Both roots below domain bound (d1 negative → high bound from -d1/c1)
          let valid = false
          while (!valid) {
            e1 = randint(1, 2)
            c1 = randint(1, 2)
            d1 = -randint(3, 5)
            f1 = randint(2, 6)
            r1Num = randint(1, 3)
            r2Num = randint(1, 3, [r1Num])
            const A = e1 * c1
            a1 = e1 * d1 + f1 * c1 + A * (r1Num + r2Num)
            b1 = f1 * d1 - A * r1Num * r2Num
            if (a1 <= 0 || b1 === 0 || a1 === e1) continue
            const borne = Math.max(-b1 / a1, -d1 / c1, -f1 / e1)
            if (borne >= Math.max(r1Num, r2Num)) valid = true
          }
        } else {
          // fractionSolution: e1=2, c1=1 → A=2 → fractional root r1 = odd/2
          do {
            e1 = 2
            c1 = 1
            d1 = randint(0, 3)
            f1 = randint(1, 4)
            r1Num = choice([1, 3, 5, 7])
            r2Num = randint(1, 5)
            const A = e1 * c1
            // r1 = r1Num/2, r2 = r2Num
            // r1+r2 = r1Num/2 + r2Num, r1*r2 = r1Num*r2Num/2
            a1 = e1 * d1 + f1 * c1 + (A * (r1Num + 2 * r2Num)) / 2
            b1 = f1 * d1 - (A * r1Num * r2Num) / 2
          } while (
            a1 <= 0 ||
            b1 === 0 ||
            !Number.isInteger(a1) ||
            !Number.isInteger(b1) ||
            a1 === e1
          )
        }

        cleUnique = `quotLog-${scenarioQ}-${a1}-${b1}-${c1}-${d1}-${e1}-${f1}-${isLn}`

        const expr1 = reduireAxPlusB(a1, b1, 'x')
        const expr2 = reduireAxPlusB(c1, d1, 'x')
        const expr3 = reduireAxPlusB(e1, f1, 'x')

        const bornes = [
          borneNumerique(b1, a1),
          borneNumerique(d1, c1),
          borneNumerique(f1, e1),
        ]
        const borne = Math.max(...bornes)
        const borneIdx = bornes.indexOf(borne)
        const borneStr = [
          afficherBorne(b1, a1),
          afficherBorne(d1, c1),
          afficherBorne(f1, e1),
        ][borneIdx]

        // Quadratic: e1·c1·x² + (e1·d1+f1·c1-a1)x + (f1·d1-b1) = 0
        const A = e1 * c1
        const bCoef = e1 * d1 + f1 * c1 - a1
        const cCoef = f1 * d1 - b1
        const delta = bCoef * bCoef - 4 * A * cCoef
        // By construction delta = A²(r1-r2)² > 0, sqrtDelta is always integer
        const sqrtDelta = Math.round(Math.sqrt(delta))

        // Exact roots via quadratic formula
        const num1 = -bCoef + sqrtDelta
        const num2 = -bCoef - sqrtDelta
        const den = 2 * A
        const x1 = num1 / den
        const x2 = num2 / den
        const x1Str = new FractionEtendue(num1, den).simplifie()
          .texFractionSimplifiee
        const x2Str = new FractionEtendue(num2, den).simplifie()
          .texFractionSimplifiee

        texte = `Résoudre l'équation $${logString}(${expr1}) - ${logString}(${expr2}) = ${logString}(${expr3})$.`

        texteCorr = `Déterminons d'abord le domaine de l'équation.<br>`
        texteCorr += `${texteGras(`Domaine :`)} $${expr1} > 0$, $${expr2} > 0$ et $${expr3} > 0 \\implies x > ${borneStr}$, soit $D = \\left]${borneStr}\\,;\\, +\\infty\\right[$<br>`
        texteCorr += `Par la propriété du quotient, $${logString}(a) - ${logString}(b) = ${logString}\\left(\\dfrac{a}{b}\\right)$, l'équation initiale est équivalente à :<br>`
        texteCorr += `$${logString}\\left(\\dfrac{${expr1}}{${expr2}}\\right) = ${logString}(${expr3})$<br>`
        texteCorr += `Si $${logString}(a) = ${logString}(b)$, alors $a = b$, donc :<br>`
        texteCorr += `$\\begin{aligned}\n`
        texteCorr += `&\\dfrac{${expr1}}{${expr2}} = ${expr3}\\\\\n`
        texteCorr += `\\iff &${expr1} = (${expr3})(${expr2})\\\\\n`
        texteCorr += `\\iff &${rienSi1(A)}x^2 ${bCoef >= 0 ? '+' : ''} ${reduireAxPlusB(bCoef, cCoef, 'x')} = 0\n`
        texteCorr += `\\end{aligned}$<br>`

        texteCorr += `On résout cette équation du second degré.<br>`
        texteCorr += `$\\Delta = ${ecritureParentheseSiNegatif(bCoef)}^2 - 4 \\times ${A} \\times (${cCoef}) = ${delta}$, $\\sqrt{\\Delta} = ${sqrtDelta}$<br>`
        texteCorr += `$x_1 = \\dfrac{${-bCoef} + ${sqrtDelta}}{${den}} = ${x1Str}$<br>`
        texteCorr += `$x_2 = \\dfrac{${-bCoef} - ${sqrtDelta}}{${den}} = ${x2Str}$<br>`
        texteCorr += `Vérifions que les solutions appartiennent au domaine :<br>`

        const solsQuot: string[] = []
        texteCorr += '$\\begin{aligned}'
        if (x1 > borne) {
          texteCorr += `x_1 &= ${x1Str} > ${borneStr} \\quad \\implies \\quad x_1 \\in D\\\\`
          solsQuot.push(x1Str)
        } else {
          texteCorr += `x_1 &= ${x1Str} \\leqslant ${borneStr} \\quad \\implies \\quad x_1 \\notin D\\\\`
        }
        if (borneStr.includes('frac')) {
          texteCorr += `[1ex]`
        }
        if (x2 > borne) {
          texteCorr += `x_2 &= ${x2Str} > ${borneStr} \\quad \\implies \\quad x_2 \\in D`
          solsQuot.push(x2Str)
        } else {
          texteCorr += `x_2 &= ${x2Str} \\leqslant ${borneStr} \\quad \\implies \\quad x_2 \\notin D`
        }
        texteCorr += '\\end{aligned}$<br>'

        if (solsQuot.length >= 1) {
          const solsNum = [
            ...(x1 > borne ? [{ val: x1, str: x1Str, num: num1 }] : []),
            ...(x2 > borne ? [{ val: x2, str: x2Str, num: num2 }] : []),
          ].sort((a, b) => a.val - b.val)
          texteCorr += `$S = ${miseEnEvidence(`\\left\\{${solsNum.map((s) => s.str).join(';')}\\right\\}`)}$`
          // For interactive answer, accept any valid solution
          const reponsesExactesQ = solsNum.map((s) => {
            const frac = new FractionEtendue(s.num, den).simplifie()
            return frac.den === 1 ? `${frac.num}` : frac.texFractionSimplifiee
          })
          reponse =
            reponsesExactesQ.length === 1
              ? reponsesExactesQ[0]
              : reponsesExactesQ
        } else {
          texteCorr += `$S = ${miseEnEvidence('\\emptyset')}$`
          reponse = '\\emptyset'
        }
      }

      // Champ interactif
      if (this.interactif) {
        const isExactType =
          typeQuestion === 'produitLog' || typeQuestion === 'quotientLog'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.clavierEnsemble,
          {
            texteAvant: isExactType ? '<br>$S =$ ' : '<br>$S \\approx$ ',
          },
        )
        let reponseSet: string
        if (reponse === '\\emptyset') {
          reponseSet = '\\emptyset'
        } else if (Array.isArray(reponse)) {
          reponseSet = `\\{${reponse.join(';')}\\}`
        } else {
          reponseSet = `\\{${reponse}\\}`
        }
        handleAnswers(this, i, {
          reponse: {
            value: reponseSet,
            options: { ensembleDeNombres: true },
          },
        })
      }

      if (this.questionJamaisPosee(i, cleUnique)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
