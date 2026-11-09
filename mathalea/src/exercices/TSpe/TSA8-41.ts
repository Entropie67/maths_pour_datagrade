import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une intégrale avec une intégration par parties'
export const interactifReady = true

export const dateDePublication = '05/04/2025'

/**
 * Calculer une intégrale avec une intégration par parties.
 * @author Stéphane Guyon
 */
export const uuid = '7773c'

export const refs = {
  'fr-fr': ['TSA8-41'],
  'fr-ch': [],
}

type TypeQuestion = 'exp' | 'trigo' | 'ln'

type QuestionData = {
  texte: string
  correction: string
  reponse: string
  signature: string
}

const texFraction = (num: number, den = 1) =>
  new FractionEtendue(num, den).simplifie()

function texCoeffVariable(
  coefficient: FractionEtendue,
  variable: string,
): string {
  if (coefficient.num === 0) return ''
  return `${rienSi1(coefficient)}${variable}`
}

function texTermeVariableSigne(
  coefficient: FractionEtendue,
  variable: string,
): string {
  if (coefficient.num === 0) return ''
  const terme = texCoeffVariable(coefficient, variable)
  return coefficient.num > 0 ? `+${terme}` : terme
}

function texProduit(coefficient: FractionEtendue, expression: string): string {
  if (coefficient.num === 0) return '0'
  return `${rienSi1(coefficient)}${expression}`
}

function texProduitSigne(
  coefficient: FractionEtendue,
  expression: string,
): string {
  if (coefficient.num === 0) return ''
  const terme = texProduit(coefficient, expression)
  return coefficient.num > 0 ? `+${terme}` : terme
}

function texSomme(termes: string[]): string {
  const resultat = termes
    .filter((terme) => terme !== '' && terme !== '0')
    .join('')
    .replace(/^\+/, '')
  return resultat === '' ? '0' : resultat
}

function texTermeConstant(constante: FractionEtendue): string {
  if (constante.num === 0) return ''
  return constante.texFractionSignee
}

function retireParenthesesExterieures(expression: string): string {
  const matchAvecLeftRight = expression.match(/^\\left\((.*)\\right\)$/)
  if (matchAvecLeftRight) return matchAvecLeftRight[1]
  const matchParenthesesSimples = expression.match(/^\((.*)\)$/)
  return matchParenthesesSimples?.[1] ?? expression
}

function texConclusion(
  expressionAvantSimplification: string,
  reponse: string,
): string {
  if (retireParenthesesExterieures(expressionAvantSimplification) === reponse) {
    return `&=${miseEnEvidence(reponse)}`
  }
  return `&=${expressionAvantSimplification}\\\\
&=${miseEnEvidence(reponse)}`
}

function texPolynomeDeuxTermes(
  coefficient1: FractionEtendue,
  variable1: string,
  coefficient2: FractionEtendue,
  variable2: string,
): string {
  return texSomme([
    texTermeVariableSigne(coefficient1, variable1),
    texTermeVariableSigne(coefficient2, variable2),
  ])
}

function texExponentielle(k: number): string {
  if (k === 0) return '1'
  if (k === 1) return '\\mathrm{e}^x'
  if (k === -1) return '\\mathrm{e}^{-x}'
  return `\\mathrm{e}^{${k}x}`
}

function texExpValue(k: number): string {
  if (k === 0) return '1'
  if (k === 1) return '\\mathrm{e}'
  if (k === -1) return '\\mathrm{e}^{-1}'
  return `\\mathrm{e}^{${k}}`
}

function texArgumentTrigo(k: number): string {
  return `${rienSi1(k)}x`
}

function texBornePi(num: number, den = 1): string {
  if (den === 1) return num === 1 ? '\\pi' : `${num}\\pi`
  return num === 1 ? `\\frac{\\pi}{${den}}` : `\\frac{${num}\\pi}{${den}}`
}

function texDeriveeComposee(coefficient: number, fonction: string): string {
  return `${rienSi1(coefficient)}${fonction}`
}

function genereQuestionExponentielle(): QuestionData {
  const a = randint(-4, 4, 0)
  const b = randint(-5, 5, 0)
  const k = choice([-2, -1, 1, 2])
  const borneInf = 0
  const borneSup = 1
  const coefficientXPrimitive = texFraction(a, k)
  const constantePrimitive = texFraction(b * k - a, k * k)
  const coefficientExp = coefficientXPrimitive.sommeFraction(constantePrimitive)
  const constante = constantePrimitive.oppose()
  const reponse = texSomme([
    texTermeVariableSigne(coefficientExp, texExpValue(k)),
    texTermeConstant(constante),
  ])
  const integrande = `(${reduireAxPlusB(a, b)})${texExponentielle(k)}`
  const primitiveUvPrime = `${texCoeffVariable(texFraction(a, k * k), texExponentielle(k))}`
  const primitive = `${texExponentielle(k)}\\left(${texSomme([texTermeVariableSigne(coefficientXPrimitive, 'x'), texTermeConstant(constantePrimitive)])}\\right)`
  const expressionAvantSimplification = texSomme([
    texTermeVariableSigne(coefficientExp, texExpValue(k)),
    texTermeConstant(constante),
  ])

  return {
    texte: `Calculer $I=\\displaystyle\\int_{${borneInf}}^{${borneSup}} ${integrande}\\,\\mathrm{d}x$.`,
    correction: `On utilise la relation d'intégration par parties :<br>
$\\displaystyle\\int_\\alpha^\\beta u'(x)v(x)\\,\\mathrm{d}x=\\left[u(x)v(x)\\right]_\\alpha^\\beta-\\displaystyle\\int_\\alpha^\\beta u(x)v'(x)\\,\\mathrm{d}x$.<br>
Ici, on pose $u'(x)=${texExponentielle(k)}$ et $v(x)=${reduireAxPlusB(a, b)}$.<br>
Comme $\\left(${texExponentielle(k)}\\right)'=${rienSi1(k)}${texExponentielle(k)}$, une primitive de $${texExponentielle(k)}$ est $${texCoeffVariable(texFraction(1, k), texExponentielle(k))}$.<br>
On a donc $u(x)=${texCoeffVariable(texFraction(1, k), texExponentielle(k))}$ et $v'(x)=${a}$.<br>
$\\begin{aligned}
I&=\\displaystyle\\int_{${borneInf}}^{${borneSup}} (${reduireAxPlusB(a, b)})${texExponentielle(k)}\\,\\mathrm{d}x\\\\
&=\\left[(${reduireAxPlusB(a, b)})${texCoeffVariable(texFraction(1, k), texExponentielle(k))}\\right]_{${borneInf}}^{${borneSup}}-\\displaystyle\\int_{${borneInf}}^{${borneSup}} ${texCoeffVariable(texFraction(a, k), texExponentielle(k))}\\,\\mathrm{d}x\\\\
&=\\left[(${reduireAxPlusB(a, b)})${texCoeffVariable(texFraction(1, k), texExponentielle(k))}\\right]_{${borneInf}}^{${borneSup}}-\\left[${primitiveUvPrime}\\right]_{${borneInf}}^{${borneSup}}\\\\
&=\\left[${primitive}\\right]_{${borneInf}}^{${borneSup}}\\\\
${texConclusion(expressionAvantSimplification, reponse)}
\\end{aligned}$`,
    reponse,
    signature: `exp-${a}-${b}-${k}`,
  }
}

function genereQuestionTrigo(): QuestionData {
  const a = randint(-5, 5, 0)
  const b = randint(-5, 5, 0)
  const k = choice([-2, -1, 1, 2, 3])
  const absK = Math.abs(k)
  const fonction = choice(['cos', 'sin'])
  const argument = texArgumentTrigo(k)
  const integrande =
    fonction === 'cos'
      ? `(${reduireAxPlusB(a, b)})\\cos(${argument})`
      : `(${reduireAxPlusB(a, b)})\\sin(${argument})`

  if (fonction === 'cos') {
    const borneSup = texBornePi(1, 2 * absK)
    const invK = texFraction(1, k)
    const aSurK = texFraction(a, k)
    const aSurKCarre = texFraction(a, k * k)
    const primitiveUvPrime = texProduit(
      texFraction(-a, k * k),
      `\\cos(${argument})`,
    )
    const coefficientPi = texFraction(a, 2 * k * k)
    const constante = texFraction(b * absK - a, k * k)
    const reponse = texSomme([
      texTermeVariableSigne(coefficientPi, '\\pi'),
      texTermeConstant(constante),
    ])
    const expressionAvantSimplification = `\\left(${texSomme([texTermeVariableSigne(coefficientPi, '\\pi'), texTermeConstant(texFraction(b, absK))])}\\right)${texTermeConstant(texFraction(-a, k * k))}`
    return {
      texte: `Calculer $I=\\displaystyle\\int_0^{${borneSup}} ${integrande}\\,\\mathrm{d}x$.`,
      correction: `On utilise la relation d'intégration par parties :<br>
$\\displaystyle\\int_\\alpha^\\beta u'(x)v(x)\\,\\mathrm{d}x=\\left[u(x)v(x)\\right]_\\alpha^\\beta-\\displaystyle\\int_\\alpha^\\beta u(x)v'(x)\\,\\mathrm{d}x$.<br>
Ici, on pose $u'(x)=\\cos(${argument})$ et $v(x)=${reduireAxPlusB(a, b)}$.<br>
Comme $\\left(\\sin(${argument})\\right)'=${texDeriveeComposee(k, `\\cos(${argument})`)}$, une primitive de $\\cos(${argument})$ est $${texProduit(invK, `\\sin(${argument})`)}$.<br>
On a donc $u(x)=${texProduit(invK, `\\sin(${argument})`)}$ et $v'(x)=${a}$.<br>
$\\begin{aligned}
I&=\\displaystyle\\int_0^{${borneSup}} (${reduireAxPlusB(a, b)})\\cos(${argument})\\,\\mathrm{d}x\\\\
&=\\left[${texProduit(invK, `(${reduireAxPlusB(a, b)})\\sin(${argument})`)}\\right]_0^{${borneSup}}-\\displaystyle\\int_0^{${borneSup}} ${texProduit(aSurK, `\\sin(${argument})`)}\\,\\mathrm{d}x\\\\
&=\\left[${texProduit(invK, `(${reduireAxPlusB(a, b)})\\sin(${argument})`)}\\right]_0^{${borneSup}}-\\left[${primitiveUvPrime}\\right]_0^{${borneSup}}\\\\
&=\\left[${texProduit(invK, `(${reduireAxPlusB(a, b)})\\sin(${argument})`)}${texProduitSigne(aSurKCarre, `\\cos(${argument})`)}\\right]_0^{${borneSup}}\\\\
${texConclusion(expressionAvantSimplification, reponse)}
\\end{aligned}$`,
      reponse,
      signature: `cos-${a}-${b}-${k}`,
    }
  }

  const borneSup = texBornePi(1, absK)
  const moinsInvK = texFraction(-1, k)
  const moinsASurK = texFraction(-a, k)
  const aSurKCarre = texFraction(a, k * k)
  const signeK = k / absK
  const primitiveUvPrime = texProduit(
    texFraction(-a, k * k),
    `\\sin(${argument})`,
  )
  const coefficientPi = texFraction(a * signeK, k * k)
  const constante = texFraction(2 * b, k)
  const reponse = texSomme([
    texTermeVariableSigne(coefficientPi, '\\pi'),
    texTermeConstant(constante),
  ])
  const expressionAvantSimplification = `(${texSomme([texTermeVariableSigne(coefficientPi, '\\pi'), texTermeConstant(texFraction(b, k))])})${texTermeConstant(texFraction(b, k))}`
  return {
    texte: `Calculer $I=\\displaystyle\\int_0^{${borneSup}} ${integrande}\\,\\mathrm{d}x$.`,
    correction: `On utilise la relation d'intégration par parties :<br>
$\\displaystyle\\int_\\alpha^\\beta u'(x)v(x)\\,\\mathrm{d}x=\\left[u(x)v(x)\\right]_\\alpha^\\beta-\\displaystyle\\int_\\alpha^\\beta u(x)v'(x)\\,\\mathrm{d}x$.<br>
Ici, on pose $u'(x)=\\sin(${argument})$ et $v(x)=${reduireAxPlusB(a, b)}$.<br>
Comme $\\left(\\cos(${argument})\\right)'=${texDeriveeComposee(-k, `\\sin(${argument})`)}$, une primitive de $\\sin(${argument})$ est $${texProduit(moinsInvK, `\\cos(${argument})`)}$.<br>
On a donc $u(x)=${texProduit(moinsInvK, `\\cos(${argument})`)}$ et $v'(x)=${a}$.<br>
$\\begin{aligned}
I&=\\displaystyle\\int_0^{${borneSup}} (${reduireAxPlusB(a, b)})\\sin(${argument})\\,\\mathrm{d}x\\\\
&=\\left[${texProduit(moinsInvK, `(${reduireAxPlusB(a, b)})\\cos(${argument})`)}\\right]_0^{${borneSup}}-\\displaystyle\\int_0^{${borneSup}} ${texProduit(moinsASurK, `\\cos(${argument})`)}\\,\\mathrm{d}x\\\\
&=\\left[${texProduit(moinsInvK, `(${reduireAxPlusB(a, b)})\\cos(${argument})`)}\\right]_0^{${borneSup}}-\\left[${primitiveUvPrime}\\right]_0^{${borneSup}}\\\\
&=\\left[${texProduit(moinsInvK, `(${reduireAxPlusB(a, b)})\\cos(${argument})`)}${texProduitSigne(aSurKCarre, `\\sin(${argument})`)}\\right]_0^{${borneSup}}\\\\
${texConclusion(expressionAvantSimplification, reponse)}
\\end{aligned}$`,
    reponse,
    signature: `sin-${a}-${b}-${k}`,
  }
}

function genereQuestionLogarithme(): QuestionData {
  const a = randint(-4, 4, 0)
  const b = randint(-5, 5, 0)
  const coefficientExpCarre = texFraction(a, 4)
  const constante = texFraction(a + 4 * b, 4)
  const reponse = texSomme([
    texTermeVariableSigne(coefficientExpCarre, '\\mathrm{e}^2'),
    texTermeConstant(constante),
  ])
  const primitiveUvPrime = `${texPolynomeDeuxTermes(texFraction(a, 4), 'x^2', texFraction(b), 'x')}`
  const primitive = `\\left(${texPolynomeDeuxTermes(texFraction(a, 2), 'x^2', texFraction(b), 'x')}\\right)\\ln(x)${texTermeVariableSigne(texFraction(-a, 4), 'x^2')}${texTermeVariableSigne(texFraction(-b), 'x')}`
  const expressionAvantSimplification = texSomme([
    texTermeVariableSigne(coefficientExpCarre, '\\mathrm{e}^2'),
    texTermeConstant(constante),
  ])

  return {
    texte: `Calculer $I=\\displaystyle\\int_1^{\\mathrm{e}} (${reduireAxPlusB(a, b)})\\ln(x)\\,\\mathrm{d}x$.`,
    correction: `On utilise la relation d'intégration par parties :<br>
$\\displaystyle\\int_\\alpha^\\beta u'(x)v(x)\\,\\mathrm{d}x=\\left[u(x)v(x)\\right]_\\alpha^\\beta-\\displaystyle\\int_\\alpha^\\beta u(x)v'(x)\\,\\mathrm{d}x$.<br>
Ici, on pose $u'(x)=${reduireAxPlusB(a, b)}$ et $v(x)=\\ln(x)$.<br>
On a donc $u(x)=${texPolynomeDeuxTermes(texFraction(a, 2), 'x^2', texFraction(b), 'x')}$ et $v'(x)=\\dfrac{1}{x}$.<br>
$\\begin{aligned}
I&=\\displaystyle\\int_1^{\\mathrm{e}} (${reduireAxPlusB(a, b)})\\ln(x)\\,\\mathrm{d}x\\\\
&=\\left[\\left(${texPolynomeDeuxTermes(texFraction(a, 2), 'x^2', texFraction(b), 'x')}\\right)\\ln(x)\\right]_1^{\\mathrm{e}}-\\displaystyle\\int_1^{\\mathrm{e}} \\left(${texCoeffVariable(texFraction(a, 2), 'x')}${texTermeConstant(texFraction(b))}\\right)\\,\\mathrm{d}x\\\\
&=\\left[\\left(${texPolynomeDeuxTermes(texFraction(a, 2), 'x^2', texFraction(b), 'x')}\\right)\\ln(x)\\right]_1^{\\mathrm{e}}-\\left[${primitiveUvPrime}\\right]_1^{\\mathrm{e}}\\\\
&=\\left[${primitive}\\right]_1^{\\mathrm{e}}\\\\
${texConclusion(expressionAvantSimplification, reponse)}
\\end{aligned}$`,
    reponse,
    signature: `ln-${a}-${b}`,
  }
}

function genereQuestion(type: TypeQuestion): QuestionData {
  switch (type) {
    case 'exp':
      return genereQuestionExponentielle()
    case 'trigo':
      return genereQuestionTrigo()
    case 'ln':
      return genereQuestionLogarithme()
  }
}

export default class IntegraleParParties extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Famille de fonctions',
      'Nombres séparés par des tirets :\n1 : $(ax+b)e^{kx}$\n2 : $(ax+b)\\cos(kx)$ ou $(ax+b)\\sin(kx)$\n3 : $(ax+b)\\ln(x)$\n4 : Mélange',
    ]
    this.sup = '4'
    this.nbQuestions = 3
    this.spacing = 2
    this.spacingCorr = 3
  }

  nouvelleVersion() {
    const listeTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['exp', 'trigo', 'ln'],
    }) as TypeQuestion[]

    this.consigne =
      'Calculer chaque intégrale en utilisant une intégration par parties.'

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const question = genereQuestion(listeTypes[i])
      let texte = question.texte

      if (this.questionJamaisPosee(i, question.signature)) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierFonctionsTerminales,
            {
              texteAvant: '<br>$I=$ ',
              placeholder: '...',
            },
          )
          handleAnswers(this, i, { reponse: { value: question.reponse } })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = question.correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
