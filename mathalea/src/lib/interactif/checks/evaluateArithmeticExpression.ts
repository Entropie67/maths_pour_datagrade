type Token =
  | { type: 'number'; value: number }
  | { type: 'constant'; value: number }
  | { type: 'operator'; value: '+' | '-' | '*' | '/' }
  | { type: 'leftParen' }
  | { type: 'rightParen' }

function tokenize(expression: string): Token[] | undefined {
  const tokens: Token[] = []
  let index = 0

  while (index < expression.length) {
    const character = expression[index]

    if (/\s/.test(character)) {
      index++
      continue
    }

    if (expression.startsWith('PI', index)) {
      tokens.push({ type: 'constant', value: Math.PI })
      index += 2
      continue
    }

    if (/\d|\./.test(character)) {
      const match = expression.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)/)
      if (match == null) return undefined
      tokens.push({ type: 'number', value: Number(match[0]) })
      index += match[0].length
      continue
    }

    if (
      character === '+' ||
      character === '-' ||
      character === '*' ||
      character === '/'
    ) {
      tokens.push({ type: 'operator', value: character })
      index++
      continue
    }

    if (character === '(') {
      tokens.push({ type: 'leftParen' })
      index++
      continue
    }

    if (character === ')') {
      tokens.push({ type: 'rightParen' })
      index++
      continue
    }

    return undefined
  }

  return tokens
}

class ArithmeticParser {
  #position = 0

  constructor(private readonly tokens: Token[]) {}

  parse(): number | undefined {
    const value = this.parseSum()
    return value !== undefined && this.#position === this.tokens.length
      ? value
      : undefined
  }

  private parseSum(): number | undefined {
    let value = this.parseProduct()
    if (value === undefined) return undefined

    while (this.peekOperator('+') || this.peekOperator('-')) {
      const operator = this.tokens[this.#position++] as Token & {
        type: 'operator'
      }
      const right = this.parseProduct()
      if (right === undefined) return undefined
      value = operator.value === '+' ? value + right : value - right
    }

    return value
  }

  private parseProduct(): number | undefined {
    let value = this.parseUnary()
    if (value === undefined) return undefined

    while (this.peekOperator('*') || this.peekOperator('/')) {
      const operator = this.tokens[this.#position++] as Token & {
        type: 'operator'
      }
      const right = this.parseUnary()
      if (right === undefined) return undefined
      value = operator.value === '*' ? value * right : value / right
    }

    return value
  }

  private parseUnary(): number | undefined {
    if (this.peekOperator('+')) {
      this.#position++
      return this.parseUnary()
    }

    if (this.peekOperator('-')) {
      this.#position++
      const value = this.parseUnary()
      return value === undefined ? undefined : -value
    }

    return this.parsePrimary()
  }

  private parsePrimary(): number | undefined {
    const token = this.tokens[this.#position]
    if (token == null) return undefined

    if (token.type === 'number' || token.type === 'constant') {
      this.#position++
      return token.value
    }

    if (token.type === 'leftParen') {
      this.#position++
      const value = this.parseSum()
      if (
        value === undefined ||
        this.tokens[this.#position]?.type !== 'rightParen'
      )
        return undefined
      this.#position++
      return value
    }

    return undefined
  }

  private peekOperator(operator: '+' | '-' | '*' | '/'): boolean {
    const token = this.tokens[this.#position]
    return token?.type === 'operator' && token.value === operator
  }
}

export function evaluateArithmeticExpression(
  expression: string,
): number | undefined {
  const tokens = tokenize(expression)
  if (tokens == null) return undefined

  const value = new ArithmeticParser(tokens).parse()
  return value !== undefined && Number.isFinite(value) ? value : undefined
}
