export type Operator = '+' | '-' | '\\times' | '\\div' | '^'

export type ArithmeticOperation = 'plus' | 'moins' | 'multi' | 'divise'

export type ArithmeticAst =
  | {
      type: 'number'
      value: number
    }
  | {
      type: 'operation'
      op: ArithmeticOperation
      left: ArithmeticAst
      right: ArithmeticAst
    }

export interface GenerateArithmeticAstOptions {
  negativeAllowed?: boolean
  strictInteger?: boolean
  maxAttempts?: number
  operationCount?: 1 | 2 | 3
  requireParentheses?: boolean
}

type JsonRecord = Record<string, unknown>

export interface ExpressionNode {
  operator: Operator
  left: ExpressionNode | number | string
  right: ExpressionNode | number | string
}

export type Expression = ExpressionNode | number | string

function getArithmeticPrecedence(op: ArithmeticOperation): number {
  if (op === 'plus' || op === 'moins') return 1
  return 2
}

function arithmeticLatexOperator(op: ArithmeticOperation): string {
  if (op === 'plus') return '+'
  if (op === 'moins') return '-'
  if (op === 'multi') return '\\times'
  return '\\div'
}

export function arithmeticAstToLatex(
  node: ArithmeticAst,
  preferDivToFrac: boolean,
  parentPrecedence = 0,
  isRightChild = false,
): string {
  if (node.type === 'number') return String(node.value)

  if (node.op === 'divise' && !preferDivToFrac) {
    return `\\dfrac{${arithmeticAstToLatex(node.left, preferDivToFrac)}}{${arithmeticAstToLatex(node.right, preferDivToFrac)}}`
  }

  const precedence = getArithmeticPrecedence(node.op)
  const left = arithmeticAstToLatex(
    node.left,
    preferDivToFrac,
    precedence,
    false,
  )
  const right = arithmeticAstToLatex(
    node.right,
    preferDivToFrac,
    precedence,
    true,
  )
  const expr = `${left} ${arithmeticLatexOperator(node.op)} ${right}`

  const samePriorityNeedsWrap =
    isRightChild && precedence === parentPrecedence && node.op !== 'plus'
  const lowerPriorityNeedsWrap = precedence < parentPrecedence

  return samePriorityNeedsWrap || lowerPriorityNeedsWrap ? `(${expr})` : expr
}

export function arithmeticAstToBlocklyValue(
  node: ArithmeticAst,
): Record<string, unknown> {
  if (node.type === 'number') {
    return {
      type: 'textinput',
      fields: {
        NUM: String(node.value),
      },
    }
  }

  return {
    type: 'operation',
    fields: {
      op: node.op,
    },
    inputs: {
      op1: {
        block: arithmeticAstToBlocklyValue(node.left),
      },
      op2: {
        block: arithmeticAstToBlocklyValue(node.right),
      },
    },
  }
}

function asRecord(value: unknown): JsonRecord | null {
  return value != null && typeof value === 'object'
    ? (value as JsonRecord)
    : null
}

function readInputBlock(
  block: JsonRecord,
  inputName: string,
): JsonRecord | null {
  const inputs = asRecord(block.inputs)
  if (!inputs) return null
  const input = asRecord(inputs[inputName])
  if (!input) return null
  return asRecord(input.block)
}

function parseNumberBlock(block: JsonRecord): ArithmeticAst | null {
  const fields = asRecord(block.fields)
  const rawNum = fields?.NUM
  if (typeof rawNum !== 'string' && typeof rawNum !== 'number') return null
  const value = Number(rawNum)
  if (!Number.isFinite(value)) return null
  return { type: 'number', value }
}

function normalizeBlocklyOp(op: string): ArithmeticOperation | null {
  if (op === 'plus' || op === 'moins' || op === 'multi' || op === 'divise') {
    return op
  }
  if (op === 'fraction') return 'divise'
  return null
}

export function blocklyValueToArithmeticAst(
  block: unknown,
): ArithmeticAst | null {
  const record = asRecord(block)
  if (!record) return null

  const type = record.type
  if (type === 'textinput') return parseNumberBlock(record)
  if (type !== 'operation') return null

  const fields = asRecord(record.fields)
  const rawOp = fields?.op
  if (typeof rawOp !== 'string') return null
  const op = normalizeBlocklyOp(rawOp)
  if (!op) return null

  const leftBlock = readInputBlock(record, 'op1')
  const rightBlock = readInputBlock(record, 'op2')
  if (!leftBlock || !rightBlock) return null

  const left = blocklyValueToArithmeticAst(leftBlock)
  const right = blocklyValueToArithmeticAst(rightBlock)
  if (!left || !right) return null

  return {
    type: 'operation',
    op,
    left,
    right,
  }
}

function findMessageValueBlockInStatement(
  block: JsonRecord,
): JsonRecord | null {
  const type = block.type

  if (type === 'dire_2s') {
    return readInputBlock(block, 'MESSAGE')
  }

  const next = asRecord(block.next)
  const nextBlock = asRecord(next?.block)
  if (!nextBlock) return null
  return findMessageValueBlockInStatement(nextBlock)
}

export function blocklyWorkspaceToArithmeticAst(
  workspaceJson: unknown,
): ArithmeticAst | null {
  const workspace = asRecord(workspaceJson)
  if (!workspace) return null

  const blocksRoot = asRecord(workspace.blocks)
  const topBlocks = blocksRoot?.blocks
  if (!Array.isArray(topBlocks)) return null

  for (const topBlock of topBlocks) {
    const record = asRecord(topBlock)
    if (!record) continue
    const valueBlock = findMessageValueBlockInStatement(record)
    if (!valueBlock) continue
    const ast = blocklyValueToArithmeticAst(valueBlock)
    if (ast) return ast
  }

  return null
}

export function areArithmeticAstsEquivalent(
  left: ArithmeticAst,
  right: ArithmeticAst,
): boolean {
  const collectAdditiveTerms = (
    node: ArithmeticAst,
    sign: 1 | -1,
    acc: string[],
    signature: (inner: ArithmeticAst) => string,
  ): void => {
    if (node.type === 'operation' && node.op === 'plus') {
      collectAdditiveTerms(node.left, sign, acc, signature)
      collectAdditiveTerms(node.right, sign, acc, signature)
      return
    }

    if (node.type === 'operation' && node.op === 'moins') {
      collectAdditiveTerms(node.left, sign, acc, signature)
      collectAdditiveTerms(node.right, sign === 1 ? -1 : 1, acc, signature)
      return
    }

    const signedPrefix = sign === 1 ? '+' : '-'
    acc.push(`${signedPrefix}${signature(node)}`)
  }

  const collectMultiplicativeTerms = (
    node: ArithmeticAst,
    acc: string[],
    signature: (inner: ArithmeticAst) => string,
  ): void => {
    if (node.type === 'operation' && node.op === 'multi') {
      collectMultiplicativeTerms(node.left, acc, signature)
      collectMultiplicativeTerms(node.right, acc, signature)
      return
    }
    acc.push(signature(node))
  }

  const signature = (node: ArithmeticAst): string => {
    if (node.type === 'number') return `n:${String(node.value)}`

    if (node.op === 'plus' || node.op === 'moins') {
      const additiveTerms: string[] = []
      collectAdditiveTerms(node, 1, additiveTerms, signature)
      additiveTerms.sort()
      return `add(${additiveTerms.join(',')})`
    }

    if (node.op === 'multi') {
      const multiplicativeTerms: string[] = []
      collectMultiplicativeTerms(node, multiplicativeTerms, signature)
      multiplicativeTerms.sort()
      return `mul(${multiplicativeTerms.join(',')})`
    }

    return `op:${node.op}(${signature(node.left)}|${signature(node.right)})`
  }

  return signature(left) === signature(right)
}

export function buildBlocklySaySolutionBlocks(
  ast: ArithmeticAst,
): Record<string, unknown> {
  return {
    blocks: {
      blocks: [
        {
          type: 'demarrer',
          next: {
            block: {
              type: 'dire_2s',
              inputs: {
                MESSAGE: {
                  block: arithmeticAstToBlocklyValue(ast),
                },
              },
            },
          },
        },
      ],
    },
  }
}

export function evaluateArithmeticAst(node: ArithmeticAst): number {
  if (node.type === 'number') return node.value

  const left = evaluateArithmeticAst(node.left)
  const right = evaluateArithmeticAst(node.right)

  if (node.op === 'plus') return left + right
  if (node.op === 'moins') return left - right
  if (node.op === 'multi') return left * right
  return left / right
}

const arithmeticOperationNames: Record<ArithmeticOperation, string> = {
  plus: "l'addition",
  moins: 'la soustraction',
  multi: 'la multiplication',
  divise: 'la division',
}

/**
 * Indique si le calcul `node` est écrit entre parenthèses dans `arithmeticAstToLatex()`.
 */
function isArithmeticNodeWrapped(
  node: ArithmeticAst,
  parent: ArithmeticAst | null,
  isRightChild: boolean,
  preferDivToFrac: boolean,
): boolean {
  if (node.type === 'number' || parent == null || parent.type === 'number') {
    return false
  }
  if (node.op === 'divise' && !preferDivToFrac) return false
  if (parent.op === 'divise' && !preferDivToFrac) return false
  const precedence = getArithmeticPrecedence(node.op)
  const parentPrecedence = getArithmeticPrecedence(parent.op)
  return (
    precedence < parentPrecedence ||
    (isRightChild && precedence === parentPrecedence && node.op !== 'plus')
  )
}

/**
 * Décrit l'ordre des calculs puis l'imbrication des blocs correspondant à `ast`.
 * Chaque élément du tableau est une ligne de la correction (le LaTeX est entre `$`).
 */
export function describeArithmeticAstCorrection(
  ast: ArithmeticAst,
  preferDivToFrac: boolean,
): string[] {
  if (ast.type === 'number') return []
  const latex = (node: ArithmeticAst) =>
    `$${arithmeticAstToLatex(node, preferDivToFrac)}$`

  // Opérations dans l'ordre où on les effectue (les calculs internes d'abord)
  const steps: {
    node: ArithmeticAst
    reason: string
  }[] = []
  const walk = (
    node: ArithmeticAst,
    parent: ArithmeticAst | null,
    isRightChild: boolean,
  ): void => {
    if (node.type === 'number') return
    walk(node.left, node, false)
    walk(node.right, node, true)
    let reason = ''
    if (parent != null && parent.type === 'operation') {
      if (parent.op === 'divise' && !preferDivToFrac) {
        reason = isRightChild
          ? ' (calcul du dénominateur)'
          : ' (calcul du numérateur)'
      } else if (
        isArithmeticNodeWrapped(node, parent, isRightChild, preferDivToFrac)
      ) {
        reason = ' (calcul entre parenthèses)'
      } else if (
        (node.op === 'multi' || node.op === 'divise') &&
        (parent.op === 'plus' || parent.op === 'moins')
      ) {
        reason = ` (prioritaire sur ${arithmeticOperationNames[parent.op]})`
      }
    }
    steps.push({ node, reason })
  }
  walk(ast, null, false)

  const lines: string[] = []
  if (steps.length === 1) {
    lines.push(`Il n'y a qu'une seule opération : ${arithmeticOperationNames[ast.op]}.`)
  } else {
    steps.forEach(({ node, reason }, index) => {
      if (node.type === 'number') return
      const rank =
        index === 0
          ? 'En premier'
          : index === steps.length - 1
            ? 'En dernier'
            : 'Ensuite'
      lines.push(
        `${rank}, on effectue ${arithmeticOperationNames[node.op]} ${latex(node)}${reason}.`,
      )
    })
  }

  // Imbrication des blocs, de la dernière opération vers les premières
  const describeChild = (child: ArithmeticAst): string =>
    child.type === 'number'
      ? `le nombre $${child.value}$`
      : `le bloc de ${arithmeticOperationNames[child.op]} ${latex(child)}`
  lines.push(
    `Dans le bloc « dire », on place le bloc de la dernière opération : ${arithmeticOperationNames[ast.op]}.`,
  )
  const nest = (node: ArithmeticAst): void => {
    if (node.type === 'number') return
    lines.push(
      `Le bloc de ${arithmeticOperationNames[node.op]} ${latex(node)} contient à gauche ${describeChild(node.left)} et à droite ${describeChild(node.right)}.`,
    )
    nest(node.left)
    nest(node.right)
  }
  nest(ast)
  return lines
}

function collectArithmeticNumbers(node: ArithmeticAst, acc: number[]): number[] {
  if (node.type === 'number') acc.push(node.value)
  else {
    collectArithmeticNumbers(node.left, acc)
    collectArithmeticNumbers(node.right, acc)
  }
  return acc
}

/**
 * Message d'aide à l'élève dont le programme ne correspond pas au calcul attendu.
 * Il rappelle le calcul réellement codé (indiscernable à l'œil sur les blocs imbriqués)
 * puis oriente vers l'erreur la plus probable.
 */
export function arithmeticMismatchFeedback(
  studentAst: ArithmeticAst,
  expectedAst: ArithmeticAst,
  preferDivToFrac: boolean,
): string {
  const parts = [
    `Ton programme calcule $${arithmeticAstToLatex(studentAst, preferDivToFrac)}$ alors que le calcul à traduire est $${arithmeticAstToLatex(expectedAst, preferDivToFrac)}$.`,
  ]
  const sortedNumbers = (node: ArithmeticAst) =>
    collectArithmeticNumbers(node, []).sort((a, b) => a - b).join(',')
  if (sortedNumbers(studentAst) !== sortedNumbers(expectedAst)) {
    parts.push('Vérifie les nombres utilisés.')
  } else if (
    studentAst.type === 'operation' &&
    expectedAst.type === 'operation' &&
    studentAst.op !== expectedAst.op
  ) {
    parts.push(
      `Le bloc placé directement dans « dire » doit être celui de la dernière opération effectuée : ${arithmeticOperationNames[expectedAst.op]}.`,
    )
  } else {
    parts.push(
      "Vérifie quel bloc est placé dans quel autre : le bloc d'une opération prioritaire ou entre parenthèses doit être placé à l'intérieur du bloc de l'opération suivante.",
    )
  }
  return parts.join('<br>')
}

export function hasAtLeastTwoOperationOccurrences(
  node: ArithmeticAst,
  operation: ArithmeticOperation,
): boolean {
  let count = 0

  const walk = (current: ArithmeticAst): void => {
    if (count >= 2) return
    if (current.type === 'number') return

    if (current.op === operation) count++
    walk(current.left)
    walk(current.right)
  }

  walk(node)
  return count >= 2
}

export function hasAtLeastTwoPlusOrMulti(node: ArithmeticAst): boolean {
  return (
    hasAtLeastTwoOperationOccurrences(node, 'plus') ||
    hasAtLeastTwoOperationOccurrences(node, 'multi')
  )
}

function validateArithmeticAst(
  node: ArithmeticAst,
  options: Required<
    Pick<GenerateArithmeticAstOptions, 'negativeAllowed' | 'strictInteger'>
  >,
): { ok: boolean; value: number } {
  if (node.type === 'number') {
    return {
      ok: options.negativeAllowed || node.value >= 0,
      value: node.value,
    }
  }

  const left = validateArithmeticAst(node.left, options)
  if (!left.ok) return { ok: false, value: 0 }

  const right = validateArithmeticAst(node.right, options)
  if (!right.ok) return { ok: false, value: 0 }

  if (
    (node.op === 'divise' && right.value === 0) ||
    !Number.isFinite(right.value)
  ) {
    return { ok: false, value: 0 }
  }

  let value = 0
  if (node.op === 'plus') value = left.value + right.value
  else if (node.op === 'moins') value = left.value - right.value
  else if (node.op === 'multi') value = left.value * right.value
  else value = left.value / right.value

  if (!Number.isFinite(value)) return { ok: false, value: 0 }
  if (!options.negativeAllowed && value < 0) return { ok: false, value }
  if (options.strictInteger && !Number.isInteger(value)) {
    return { ok: false, value }
  }

  return { ok: true, value }
}

function randomOperation(
  allowed: ArithmeticOperation[],
  randInt: (min: number, max: number) => number,
): ArithmeticOperation {
  return allowed[Math.floor((randInt(0, 99) * allowed.length) / 100)]
}

function randomNumberForOp(
  op: ArithmeticOperation,
  randInt: (min: number, max: number) => number,
): number {
  return op === 'divise' ? randInt(2, 10) : randInt(2, 30)
}

function arithmeticAstRequiresParenthesesForLatex(
  node: ArithmeticAst,
  parentPrecedence = 0,
  isRightChild = false,
): boolean {
  if (node.type === 'number') return false

  const precedence = getArithmeticPrecedence(node.op)
  const samePriorityNeedsWrap =
    isRightChild && precedence === parentPrecedence && node.op !== 'plus'
  const lowerPriorityNeedsWrap = precedence < parentPrecedence

  return (
    samePriorityNeedsWrap ||
    lowerPriorityNeedsWrap ||
    arithmeticAstRequiresParenthesesForLatex(node.left, precedence, false) ||
    arithmeticAstRequiresParenthesesForLatex(node.right, precedence, true)
  )
}

export function generateArithmeticAst(
  level: number,
  randInt: (min: number, max: number) => number,
  options: GenerateArithmeticAstOptions = {},
): ArithmeticAst {
  const normalizedOptions: Required<
    Pick<
      GenerateArithmeticAstOptions,
      'negativeAllowed' | 'strictInteger' | 'maxAttempts'
    >
  > = {
    negativeAllowed: options.negativeAllowed ?? true,
    strictInteger: options.strictInteger ?? false,
    maxAttempts: options.maxAttempts ?? 300,
  }

  const allOps: ArithmeticOperation[] = ['plus', 'moins', 'multi', 'divise']
  const lowOps: ArithmeticOperation[] = ['plus', 'moins']
  const highOps: ArithmeticOperation[] = ['multi', 'divise']

  const operationCount: 1 | 2 | 3 =
    options.operationCount ?? (level <= 1 ? 1 : level === 2 ? 2 : 3)
  const requireParentheses: boolean = options.requireParentheses ?? level === 3

  const buildCandidate = (): ArithmeticAst => {
    const randomBoolean = (): boolean => randInt(0, 99) < 50

    const buildAdditiveAstWithValue = (
      value: number,
      preferredOp?: ArithmeticOperation,
    ): ArithmeticAst => {
      const op = preferredOp ?? randomOperation(lowOps, randInt)
      if (op === 'plus' && value > 4) {
        const leftValue = randInt(2, value - 2)
        return {
          type: 'operation',
          op,
          left: { type: 'number', value: leftValue },
          right: { type: 'number', value: value - leftValue },
        }
      }

      const rightValue = randInt(2, 15)
      return {
        type: 'operation',
        op: 'moins',
        left: { type: 'number', value: value + rightValue },
        right: { type: 'number', value: rightValue },
      }
    }

    const buildAdditiveAst = (
      max = 15,
      preferredOp?: ArithmeticOperation,
    ): ArithmeticAst => {
      const op = preferredOp ?? randomOperation(lowOps, randInt)
      return {
        type: 'operation',
        op,
        left: { type: 'number', value: randInt(2, max) },
        right: {
          type: 'number',
          value: randomNumberForOp(op, randInt),
        },
      }
    }

    const buildHighAstWithAdditiveChild = (
      preferredOp?: ArithmeticOperation,
      preferredAdditiveOp?: ArithmeticOperation,
    ): ArithmeticAst => {
      const op = preferredOp ?? randomOperation(highOps, randInt)
      const additiveOnLeft = op === 'divise' || randomBoolean()
      const rightValue = randomNumberForOp(op, randInt)
      const additiveValue =
        op === 'divise' ? rightValue * randInt(2, 12) : randInt(2, 15)
      return {
        type: 'operation',
        op,
        left: additiveOnLeft
          ? buildAdditiveAstWithValue(additiveValue, preferredAdditiveOp)
          : { type: 'number', value: randInt(2, 15) },
        right: additiveOnLeft
          ? { type: 'number', value: rightValue }
          : buildAdditiveAst(15, preferredAdditiveOp),
      }
    }

    const buildHighAstWithTwoAdditiveChildren = (): ArithmeticAst => {
      const op = randomOperation(highOps, randInt)
      const right = buildAdditiveAstWithValue(randInt(2, 12), 'moins')
      const left =
        op === 'divise'
          ? buildAdditiveAstWithValue(
              evaluateArithmeticAst(right) * randInt(2, 8),
              'plus',
            )
          : buildAdditiveAstWithValue(randInt(2, 20), 'plus')

      return {
        type: 'operation',
        op,
        left,
        right,
      }
    }

    if (operationCount === 1) {
      const op = randomOperation(allOps, randInt)
      return {
        type: 'operation',
        op,
        left: { type: 'number', value: randInt(2, 30) },
        right: { type: 'number', value: randomNumberForOp(op, randInt) },
      }
    }

    if (operationCount === 2) {
      const parentOp = randomOperation(lowOps, randInt)
      const childOp = randomOperation(highOps, randInt)
      const childOnLeft = randInt(0, 1) === 0
      const childAst: ArithmeticAst = {
        type: 'operation',
        op: childOp,
        left: { type: 'number', value: randInt(2, 12) },
        right: { type: 'number', value: randomNumberForOp(childOp, randInt) },
      }

      return {
        type: 'operation',
        op: parentOp,
        left: childOnLeft
          ? childAst
          : { type: 'number', value: randInt(2, 20) },
        right: childOnLeft
          ? { type: 'number', value: randInt(2, 20) }
          : childAst,
      }
    }

    if (requireParentheses) {
      const shape = randInt(0, 3)

      if (shape === 0) {
        return buildHighAstWithTwoAdditiveChildren()
      }

      if (shape === 1) {
        return {
          type: 'operation',
          op: 'plus',
          left: buildHighAstWithAdditiveChild('multi', 'moins'),
          right: { type: 'number', value: randInt(2, 20) },
        }
      }

      if (shape === 2) {
        return {
          type: 'operation',
          op: 'moins',
          left: buildHighAstWithAdditiveChild(
            randomOperation(highOps, randInt),
          ),
          right: { type: 'number', value: randInt(2, 20) },
        }
      }

      return {
        type: 'operation',
        op: 'moins',
        left: { type: 'number', value: randInt(20, 60) },
        right: buildHighAstWithAdditiveChild('divise'),
      }
    }

    // Sans parenthèses explicites: chaîne gauche de 3 opérations.
    // Exemple: a - b + c × d
    const op1 = randomOperation(allOps, randInt)
    const op2 = randomOperation(allOps, randInt)
    const op3 = randomOperation(allOps, randInt)
    return {
      type: 'operation',
      op: op3,
      left: {
        type: 'operation',
        op: op2,
        left: {
          type: 'operation',
          op: op1,
          left: { type: 'number', value: randInt(2, 20) },
          right: { type: 'number', value: randomNumberForOp(op1, randInt) },
        },
        right: { type: 'number', value: randomNumberForOp(op2, randInt) },
      },
      right: { type: 'number', value: randomNumberForOp(op3, randInt) },
    }
  }

  for (let attempt = 0; attempt < normalizedOptions.maxAttempts; attempt++) {
    const candidate = buildCandidate()
    if (
      validateArithmeticAst(candidate, normalizedOptions).ok &&
      !hasAtLeastTwoPlusOrMulti(candidate) &&
      (requireParentheses ||
        !arithmeticAstRequiresParenthesesForLatex(candidate))
    ) {
      return candidate
    }
  }

  // Fallback garanti pour éviter un échec en cas de contraintes trop strictes.
  const safeValue = randInt(2, 20)
  return {
    type: 'operation',
    op: 'plus',
    left: { type: 'number', value: safeValue },
    right: { type: 'number', value: randInt(2, 20) },
  }
}

/**
 * Analyse un arbre de calculs avec priorité et fournit une string avec uniquement les parenthèses utiles
  const example: Expression = {
    operator: '+',
    left: {
        operator: '*',
        left: 'a',
        right: 'b'
    },
    right: {
        operator: '^',
        left: 'c',
        right: 'd'
    }
  }
  parseExpression(example, 0)
  resultat :
  a * b + c^d
 * @param expression
 * @param parentPrecedence
 * @param position branche du parent est à gauche ou à droite
 * @returns
 */
export function parseExpression(
  expression: Expression,
  parentPrecedence = 0,
  position: 'g' | 'd' | '' = '',
): string {
  if (typeof expression === 'number' || typeof expression === 'string') {
    // Si c'est un nombre ou une variable, retournez-le directement
    return expression.toString()
  }

  if ('operator' in expression) {
    const precedence = getOperatorPrecedence(expression.operator)
    const left = parseExpression(expression.left, precedence, 'g')
    const right = parseExpression(expression.right, precedence, 'd') // Associativité à gauche pour la plupart des opérateurs

    // Ajout de parenthèses si la priorité du parent est plus élevée que celle de l'opérateur actuel
    let shouldWrap = false
    if (position === 'd' && precedence === parentPrecedence) shouldWrap = true
    if (position === 'g' && precedence === parentPrecedence) shouldWrap = false
    if (precedence < parentPrecedence) shouldWrap = true
    const expressionString = `${left} ${expression.operator} ${right}`
    return shouldWrap ? `(${expressionString})` : expressionString
  }
  throw new Error('Expression invalide')
}

function getOperatorPrecedence(operator: Operator | ''): number {
  switch (operator) {
    case '^':
      return 3
    case '\\times':
    case '\\div':
      return 2
    case '+':
    case '-':
      return 1
    default:
      return 0 // Pas d'opérateur
  }
}
