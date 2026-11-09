import type {
  MathJsonExpression,
  MathJsonNumberObject,
} from '@cortex-js/compute-engine'
import { assignVariablesCe } from './assignVariablesCe'
import ce from './interactif/comparisonFunctions'

export type MathJsonNode =
  number | string | MathJsonNumberObject | [string, ...MathJsonNode[]]

/** Convertit le sous-ensemble arithmétique de MathJSON sans modifier l'arbre source. */
export function toMathJsonNode(expression: MathJsonExpression): MathJsonNode {
  function convert(value: unknown, path: string): MathJsonNode {
    function unsupported(reason: string): never {
      throw new Error(`MathJSON unsupported à ${path} : ${reason}.`)
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) return unsupported('nombre non fini')
      return value
    }
    if (typeof value === 'string') return value
    if (Array.isArray(value)) {
      const items: readonly unknown[] = value
      const [operator, ...operands] = items
      if (typeof operator !== 'string') {
        return unsupported('opérateur absent ou non textuel')
      }
      return [
        operator,
        ...operands.map((operand, index) =>
          convert(operand, `${path}[${index + 1}]`),
        ),
      ]
    }
    if (typeof value !== 'object' || value === null) {
      return unsupported('forme JSON non arithmétique')
    }
    const forms = ['num', 'sym', 'fn', 'str', 'dict'].filter(
      (key) => key in value,
    )
    if (forms.length !== 1) return unsupported('forme JSON absente ou ambiguë')
    if ('sym' in value) {
      if (typeof value.sym !== 'string') return unsupported('sym non textuel')
      return value.sym
    }
    if ('fn' in value) {
      if (!Array.isArray(value.fn)) return unsupported('fn non tabulaire')
      return convert(value.fn, `${path}.fn`)
    }
    if ('num' in value) {
      if (typeof value.num !== 'string') return unsupported('num non textuel')
      // Conserver la chaîne exacte : Number() peut arrondir les grands nombres
      // et ne représente pas les décimaux périodiques de MathJSON.
      if (!/^-?\d+(?:\.\d*(?:\(\d+\))?)?(?:[eE][+-]?\d+)?$/.test(value.num)) {
        return unsupported('num non fini ou de format non reconnu')
      }
      return { num: value.num }
    }
    return unsupported('chaîne littérale str ou dictionnaire dict')
  }

  return convert(expression, '$')
}

interface MathJsonExpressionSource {
  readonly json: MathJsonExpression
}

interface CalculerCeResult {
  result: string
  printResult: string
  netapes: number
  texteDebug: string
  texte: string
  texteCorr: string
  stepsLatex: string[]
  steps: string[]
  commentaires: string[]
  printExpression: string
  name?: string
}

function isMathJsonFunction(
  node: MathJsonNode,
): node is [string, ...MathJsonNode[]] {
  return Array.isArray(node) && typeof node[0] === 'string'
}

function isNumericLiteral(node: MathJsonNode): node is number {
  return typeof node === 'number' && Number.isFinite(node)
}

function unwrapDelimiter(node: MathJsonNode): MathJsonNode {
  if (isMathJsonFunction(node) && node[0] === 'Delimiter' && node.length >= 2) {
    return unwrapDelimiter(node[1])
  }
  return node
}

function isNumericNode(node: MathJsonNode): boolean {
  const normalized = unwrapDelimiter(node)
  return Boolean(ce.box(normalized, { form: 'raw' }).isNumber)
}

export function renderMathJsonLatex(
  node: MathJsonNode,
  options?: { implicitMultiply?: boolean },
): string {
  const implicitMultiply = options?.implicitMultiply ?? false
  if (isNumericLiteral(node)) return `${node}`
  if (typeof node === 'string') return node
  if (!isMathJsonFunction(node)) {
    return ce.box(node, { form: 'raw' }).toLatex({
      form: 'raw',
      implicitMultiplication: false,
      multiplicationSign: '\\times',
    })
  }

  const [operator, ...ops] = node

  if (operator === 'Add') {
    return ops
      .map((op, index) => {
        const rendered = renderMathJsonLatex(op, { implicitMultiply })
        if (index === 0) return rendered
        return rendered.startsWith('-') ? rendered : `+${rendered}`
      })
      .join('')
  }

  if (operator === 'Multiply') {
    return ops
      .map((op, index) => {
        const normalizedOp = unwrapDelimiter(op)
        const rendered = renderMathJsonLatex(normalizedOp, { implicitMultiply })
        if (
          isMathJsonFunction(normalizedOp) &&
          ['Add', 'Subtract'].includes(normalizedOp[0])
        ) {
          return `\\left(${rendered}\\right)`
        }
        if (index > 0 && rendered.startsWith('-')) {
          return `\\left(${rendered}\\right)`
        }
        return rendered
      })
      .join(implicitMultiply ? '' : '\\times')
  }

  if (operator === 'InvisibleOperator') {
    return ops
      .map((op, index) => {
        const normalizedOp = unwrapDelimiter(op)
        const rendered = renderMathJsonLatex(normalizedOp, { implicitMultiply })
        if (
          isMathJsonFunction(normalizedOp) &&
          ['Add', 'Subtract'].includes(normalizedOp[0])
        ) {
          return `\\left(${rendered}\\right)`
        }
        if (index > 0 && rendered.startsWith('-')) {
          return `\\left(${rendered}\\right)`
        }
        return rendered
      })
      .join(implicitMultiply ? '' : '\\times')
  }

  if (operator === 'Delimiter' && ops.length === 1) {
    return `\\left(${renderMathJsonLatex(ops[0], { implicitMultiply })}\\right)`
  }

  if (operator === 'Power' && ops.length === 2) {
    const [base, exponent] = ops
    const baseLatex = renderMathJsonLatex(base, { implicitMultiply })
    const needsParens =
      baseLatex.startsWith('-') ||
      (isMathJsonFunction(base) && !['Number', 'Symbol'].includes(base[0]))
    const renderedBase = needsParens ? `\\left(${baseLatex}\\right)` : baseLatex
    return `${renderedBase}^{${renderMathJsonLatex(exponent, { implicitMultiply })}}`
  }

  if (operator === 'Negate' && ops.length === 1) {
    return `-${renderMathJsonLatex(ops[0], { implicitMultiply })}`
  }

  if (operator === 'Subtract' && ops.length === 2) {
    const gauche = renderMathJsonLatex(ops[0], { implicitMultiply })
    const droite = renderMathJsonLatex(ops[1], { implicitMultiply })
    // pas de « -- » : un nombre négatif retranché est mis entre parenthèses
    return `${gauche}-${droite.startsWith('-') ? `\\left(${droite}\\right)` : droite}`
  }

  return ce.box(node, { form: 'raw' }).toLatex({
    form: 'raw',
    implicitMultiplication: false,
    multiplicationSign: '\\times',
  })
}

function isComputableNumericNode(node: MathJsonNode): boolean {
  if (!isMathJsonFunction(node)) return false
  const [operator, ...ops] = node
  if (
    ![
      'Add',
      'Multiply',
      'InvisibleOperator',
      'Power',
      'Negate',
      'Subtract',
      'Divide',
    ].includes(operator)
  ) {
    return false
  }
  return ops.every((op) => isNumericNode(op))
}

function evaluateNumericNode(node: MathJsonNode): MathJsonNode {
  const evaluated = ce.box(node, { form: 'raw' }).simplify()
  return toMathJsonNode(evaluated.json)
}

function evaluateDeepestOnce(node: MathJsonNode): [MathJsonNode, boolean] {
  if (!isMathJsonFunction(node)) return [node, false]

  const [operator, ...ops] = node
  for (let i = 0; i < ops.length; i++) {
    const [nextChild, changed] = evaluateDeepestOnce(ops[i])
    if (changed) {
      const nextOps = [...ops]
      nextOps[i] = nextChild
      return [[operator, ...nextOps], true]
    }
  }

  if (isComputableNumericNode(node)) {
    return [evaluateNumericNode(node), true]
  }

  return [node, false]
}

function evaluateAllComputableOperatorsOfTypeOnce(
  node: MathJsonNode,
): [MathJsonNode, boolean] {
  // Trouver le premier opérateur computable et son type
  function findFirstComputableOpType(n: MathJsonNode): string | null {
    if (isMathJsonFunction(n) && isComputableNumericNode(n)) {
      const [op] = n
      return op
    }
    if (!isMathJsonFunction(n)) return null
    const [, ...operands] = n
    for (const op of operands) {
      const t = findFirstComputableOpType(op)
      if (t) return t
    }
    return null
  }

  const opType = findFirstComputableOpType(node)
  if (!opType) return [node, false]

  // Évaluer tous les opérateurs de ce type dans tout l'arbre
  let changed = false
  function evaluateAllOfType(n: MathJsonNode): MathJsonNode {
    if (isMathJsonFunction(n) && isComputableNumericNode(n)) {
      const [op] = n
      if (op === opType) {
        changed = true
        return evaluateNumericNode(n)
      }
      return n
    }
    if (!isMathJsonFunction(n)) return n
    const [operator, ...operands] = n
    return [operator, ...operands.map((o) => evaluateAllOfType(o))]
  }

  const result = evaluateAllOfType(node)
  return [result, changed]
}

function countOperators(node: MathJsonNode): Record<string, number> {
  const counts: Record<string, number> = {}
  if (!isMathJsonFunction(node)) return counts

  const [operator, ...ops] = node
  counts[operator] = (counts[operator] ?? 0) + 1

  for (const op of ops) {
    const childCounts = countOperators(op)
    for (const [op, count] of Object.entries(childCounts)) {
      counts[op] = (counts[op] ?? 0) + count
    }
  }

  return counts
}

function getOperationComment(
  previous: MathJsonNode,
  current: MathJsonNode,
): string | null {
  const prevCounts = countOperators(previous)
  const currCounts = countOperators(current)

  // Vérifier quel opérateur a diminué
  const disappeared: [string, number][] = []
  const decreased: [string, number][] = []

  for (const [op, count] of Object.entries(prevCounts)) {
    const currCount = currCounts[op] ?? 0
    if (currCount === 0) disappeared.push([op, count])
    else if (currCount < count) decreased.push([op, count - currCount])
  }

  // Priorité d'affichage : Power > Multiply > Divide > Add/Subtract
  const priorityOrder = ['Power', 'Multiply', 'Divide', 'Add', 'Subtract']

  for (const op of priorityOrder) {
    const disapEntry = disappeared.find(([o]) => o === op)
    const decEntry = decreased.find(([o]) => o === op)
    const entry = disapEntry ?? decEntry

    if (entry) {
      const [operator, count] = entry
      const plural = count > 1

      if (operator === 'Power') {
        return plural
          ? 'On effectue les puissances'
          : 'On effectue la puissance'
      }
      if (operator === 'Multiply') {
        return plural
          ? 'On effectue les multiplications'
          : 'On effectue la multiplication'
      }
      if (operator === 'Divide') {
        return plural ? 'On effectue les divisions' : 'On effectue la division'
      }
      if (operator === 'Add') {
        return plural ? 'On effectue les sommes' : 'On effectue la somme'
      }
      if (operator === 'Subtract') {
        return plural
          ? 'On effectue les soustractions'
          : 'On effectue la soustraction'
      }
    }
  }

  return null
}

function buildCorrDetails(
  parsedExpression: MathJsonExpressionSource,
  options?: {
    comment?: boolean
    singleOp?: boolean
    implicitMultiply?: boolean
  },
): string[] {
  const steps: string[] = []
  let current = toMathJsonNode(parsedExpression.json)
  const useComments = options?.comment ?? false
  const singleOp = options?.singleOp ?? true
  const implicitMultiply = options?.implicitMultiply ?? false

  for (let i = 0; i < 20; i++) {
    const [next, changed] = singleOp
      ? evaluateDeepestOnce(current)
      : evaluateAllComputableOperatorsOfTypeOnce(current)
    if (!changed) break
    const latex = renderMathJsonLatex(next, { implicitMultiply })
    if (steps[steps.length - 1] !== latex) {
      if (useComments) {
        const comment = getOperationComment(current, next)
        if (comment) {
          steps.push(`${latex} \\quad \\text{\\small{(${comment})}}`)
        } else {
          steps.push(latex)
        }
      } else {
        steps.push(latex)
      }
    }
    current = next
    if (isNumericLiteral(current)) break
  }

  return steps
}

export { buildCorrDetails }

/**
 * Calcule et simplifie une expression LaTeX en utilisant cortex-js ComputeEngine (sans mathjs ni mathsteps)
 * @param expression Expression LaTeX (ex: 'a\\times x+b')
 * @param params Options (similaires à calculer)
 */
export function calculerCe(
  expression: string,
  params?: {
    variables?: Record<string, unknown>
    name?: string
    comment?: boolean
    singleOp?: boolean
    implicitMultiply?: boolean
    comments?: Record<string, string>
  },
): CalculerCeResult {
  params = Object.assign(
    {
      variables: undefined,
      name: undefined,
      comment: false,
      singleOp: true,
      implicitMultiply: false,
      comments: {},
    },
    params,
  )

  const exprLatex = expression
  const substituted = assignVariablesCe(
    expression,
    params.variables || {},
    params.implicitMultiply
      ? undefined
      : {
          invisibleMultiply: '\\times',
          multiplySymbol: '\\times',
        },
  )

  const expr = ce.parse(substituted, { form: 'raw' })
  const substitutedForDisplay = renderMathJsonLatex(toMathJsonNode(expr.json), {
    implicitMultiply: params.implicitMultiply,
  })
  const corrDetails = buildCorrDetails(expr, {
    comment: params.comment,
    singleOp: params.singleOp,
    implicitMultiply: params.implicitMultiply,
  })

  // Résultat final
  const stepsLatex = [substitutedForDisplay, ...corrDetails]
  const texte = `Calculer $${exprLatex}$.`
  const texteCorr = `$\\begin{aligned}\n${stepsLatex
    .map((s, i) =>
      i === 0 ? s : `&=${s}${i === stepsLatex.length - 1 ? '' : '\\\\'}`,
    )
    .join('')}\n\\end{aligned}$`

  return {
    result: substitutedForDisplay,
    printResult: substitutedForDisplay,
    netapes: stepsLatex.length,
    texteDebug: texte + texteCorr,
    texte,
    texteCorr,
    stepsLatex,
    steps: stepsLatex,
    commentaires: [],
    printExpression: exprLatex,
    name: params.name,
  }
}
