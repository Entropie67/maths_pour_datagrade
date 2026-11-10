/**
 * Expressions des graphiques des fiches de cours (« x^2/4+1/2 », « a*sin(x) »,
 * « 2e^(-x) ») : même grammaire que l'analyseur de l'application, sans eval.
 * Nombres, variables, + - * / ^, parenthèses, multiplication sous-entendue
 * (2x, 3(x+1), x sin(x)), fonctions usuelles, constantes pi et e.
 */

export type Evaluator = (variables: Record<string, number>) => number

const FUNCTIONS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  exp: Math.exp,
  ln: Math.log,
  log: Math.log10,
  sqrt: Math.sqrt,
  abs: Math.abs,
}
const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E }

type Token =
  { t: 'number'; v: number } | { t: 'name'; v: string } | { t: 'op'; v: string }

function tokenize(text: string): Token[] | null {
  const tokens: Token[] = []
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (/\s/.test(c)) i++
    else if (/[0-9.]/.test(c)) {
      const m = /^[0-9]*\.?[0-9]+|^[0-9]+\.?/.exec(text.slice(i))
      if (!m) return null
      tokens.push({ t: 'number', v: Number(m[0]) })
      i += m[0].length
    } else if (/[a-zA-Z]/.test(c)) {
      const word = /^[a-zA-Z]+/.exec(text.slice(i))![0]
      // « xsin » ou « ex » : une fonction connue d'abord, sinon lettre par lettre
      let rest = word
      while (rest) {
        const f =
          Object.keys(FUNCTIONS).find((n) => rest.startsWith(n)) ??
          (rest.startsWith('pi') ? 'pi' : rest[0])
        tokens.push({ t: 'name', v: f })
        rest = rest.slice(f.length)
      }
      i += word.length
    } else if ('+-*/^()'.includes(c)) {
      tokens.push({ t: 'op', v: c })
      i++
    } else return null
  }
  return tokens
}

/** Fonction des variables, ou null si l'expression est mal écrite ou cite une variable inconnue */
export function compile(
  text: string,
  variables: string[] = ['x'],
): Evaluator | null {
  const read = tokenize(text)
  if (!read || !read.length) return null
  const tokens: Token[] = read
  let i = 0
  const peek = () => tokens[i]
  const isOp = (v: string) => {
    const t = peek()
    return t?.t === 'op' && t.v === v
  }

  // sum := product (('+'|'-') product)*
  function sum(): Evaluator | null {
    let left = product()
    while (left && (isOp('+') || isOp('-'))) {
      const op = (tokens[i++] as { v: string }).v
      const right = product()
      if (!right) return null
      const l = left
      left = op === '+' ? (v) => l(v) + right(v) : (v) => l(v) - right(v)
    }
    return left
  }
  // product := sign (('*'|'/'|implicite) sign)*
  function product(): Evaluator | null {
    let left = sign()
    while (left) {
      let op = '*'
      if (isOp('*') || isOp('/')) op = (tokens[i++] as { v: string }).v
      else if (!(peek()?.t === 'number' || peek()?.t === 'name' || isOp('(')))
        break
      const right = sign()
      if (!right) return null
      const l = left
      left = op === '*' ? (v) => l(v) * right(v) : (v) => l(v) / right(v)
    }
    return left
  }
  // sign := ('-'|'+') sign | power
  function sign(): Evaluator | null {
    if (isOp('-') || isOp('+')) {
      const op = (tokens[i++] as { v: string }).v
      const right = sign()
      return right && (op === '-' ? (v) => -right(v) : right)
    }
    return power()
  }
  // power := atom ('^' sign)?  (associative à droite : 2^3^2 = 2^9)
  function power(): Evaluator | null {
    const base = atom()
    if (!base || !isOp('^')) return base
    i++
    const exponent = sign()
    return exponent && ((v) => Math.pow(base(v), exponent(v)))
  }
  function atom(): Evaluator | null {
    const token = tokens[i++]
    if (!token) return null
    if (token.t === 'number') return () => token.v
    if (token.t === 'op') {
      if (token.v !== '(') return null
      const inner = sum()
      if (!inner || !isOp(')')) return null
      i++
      return inner
    }
    const f = FUNCTIONS[token.v]
    if (f) {
      // sin(x) ou sin x
      const arg = isOp('(') ? atom() : power()
      return arg && ((v) => f(arg(v)))
    }
    if (variables.includes(token.v)) return (v) => v[token.v]
    if (token.v in CONSTANTS) return () => CONSTANTS[token.v]
    return null
  }

  const f = sum()
  return f && i === tokens.length ? f : null
}

export const isExpression = (text: string, variables: string[] = ['x']) =>
  compile(text, variables) !== null

/** Intégrale de a à b par la méthode de Simpson (n pair) */
export function integral(
  f: (x: number) => number,
  a: number,
  b: number,
  n = 400,
): number {
  const h = (b - a) / n
  let s = f(a) + f(b)
  for (let k = 1; k < n; k++) s += (k % 2 ? 4 : 2) * f(a + k * h)
  return (s * h) / 3
}
