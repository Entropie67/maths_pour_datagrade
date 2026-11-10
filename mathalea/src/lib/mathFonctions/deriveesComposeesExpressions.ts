import FractionEtendue from '../../modules/FractionEtendue'

/** Expressions réelles du catalogue de dérivation, sans simplification de domaine. */
export type Expression =
  | { kind: 'number'; n: number; d: number }
  | { kind: 'variable' }
  | { kind: 'sum'; terms: Expression[] }
  | { kind: 'product'; terms: Expression[] }
  | { kind: 'quotient'; numerator: Expression; denominator: Expression }
  | { kind: 'power'; base: Expression; p: number; q: number }
  | { kind: 'sin' | 'cos' | 'tan' | 'exp' | 'ln'; argument: Expression }

export const variable: Expression = { kind: 'variable' }
export function number(n: number, d = 1): Expression {
  const f = new FractionEtendue(n, d).simplifie()
  return { kind: 'number', n: f.num, d: f.den }
}
const isNumber = (e: Expression, n: number) =>
  e.kind === 'number' && e.n === n * e.d

/** Réduire les petits polynômes résiduels, sans développer les puissances composées. */
function reducePolynomial(e: Expression): Expression {
  type Polynomial = FractionEtendue[]
  const zero = () => new FractionEtendue(0, 1)
  const read = (term: Expression): Polynomial | undefined => {
    if (term.kind === 'number') return [new FractionEtendue(term.n, term.d)]
    if (term.kind === 'variable') return [zero(), new FractionEtendue(1, 1)]
    if (
      term.kind === 'power' &&
      term.base.kind === 'variable' &&
      term.q === 1 &&
      term.p >= 0 &&
      term.p <= 12
    )
      return Array.from(
        { length: term.p + 1 },
        (_, i) => new FractionEtendue(i === term.p ? 1 : 0, 1),
      )
    if (term.kind !== 'sum' && term.kind !== 'product') return
    let result: Polynomial = [
      new FractionEtendue(term.kind === 'product' ? 1 : 0, 1),
    ]
    for (const child of term.terms) {
      const values = read(child)
      if (!values) return
      if (term.kind === 'sum') {
        result = Array.from(
          { length: Math.max(result.length, values.length) },
          (_, i) => (result[i] ?? zero()).sommeFraction(values[i] ?? zero()),
        )
      } else {
        if (result.length + values.length - 2 > 12) return
        const next = Array.from(
          { length: result.length + values.length - 1 },
          zero,
        )
        result.forEach((a, i) =>
          values.forEach((b, j) => {
            next[i + j] = next[i + j].sommeFraction(a.produitFraction(b))
          }),
        )
        result = next
      }
    }
    return result
  }
  const coefficients = read(e)
  if (!coefficients) return e
  return sum(
    ...coefficients
      .map((c, i) => product(number(c.num, c.den), power(variable, i)))
      .reverse(),
  )
}

/** Extraire les facteurs communs avant de simplifier une fraction. */
function factorSum(terms: Expression[]): Expression {
  const expression = sum(...terms.filter((term) => !isNumber(term, 0)))
  if (expression.kind !== 'sum') return expression
  const factors = expression.terms.map((term) =>
    term.kind === 'product' ? [...term.terms] : [term],
  )
  const base = (term: Expression) =>
    term.kind === 'power' && term.p > 0 ? term.base : term
  const exponent = (term: Expression) =>
    term.kind === 'power' && term.p > 0
      ? new FractionEtendue(term.p, term.q)
      : new FractionEtendue(1, 1)
  const commonFactors: Expression[] = []
  for (const candidate of [...factors[0]]) {
    if (candidate.kind === 'number') continue
    const id = JSON.stringify(base(candidate))
    const indices = factors.map((list) =>
      list.findIndex((term) => JSON.stringify(base(term)) === id),
    )
    if (indices.some((i) => i < 0)) continue
    const commonPower = factors
      .map((list, i) => exponent(list[indices[i]]))
      .reduce((a, b) => (a.valeurDecimale <= b.valeurDecimale ? a : b))
    commonFactors.push(power(base(candidate), commonPower.num, commonPower.den))
    factors.forEach((list, i) => {
      const index = indices[i]
      const remaining = exponent(list[index]).differenceFraction(commonPower)
      list[index] = power(base(list[index]), remaining.num, remaining.den)
    })
  }
  if (commonFactors.length) {
    const remainder = reducePolynomial(
      sum(...factors.map((list) => product(...list))),
    )
    return product(
      ...commonFactors,
      remainder.kind === 'sum' ? factorSum(remainder.terms) : remainder,
    )
  }
  // Regrouper les termes en sinus, cosinus, logarithme, etc. avant de réduire
  // leurs coefficients polynomiaux : 2x sin(x) - x sin(x) + cos(x).
  for (const candidate of factors.flat()) {
    const commonBase = base(candidate)
    if (!['sin', 'cos', 'tan', 'exp', 'ln'].includes(commonBase.kind)) continue
    const id = JSON.stringify(commonBase)
    const selected = factors.map((list) =>
      list.some((term) => JSON.stringify(base(term)) === id),
    )
    if (selected.filter(Boolean).length < 2) continue
    const grouped = factorSum(expression.terms.filter((_, i) => selected[i]))
    return factorSum([
      grouped,
      ...expression.terms.filter((_, i) => !selected[i]),
    ])
  }
  const reduced = reducePolynomial(expression)
  if (reduced.kind !== 'sum') return reduced
  const coefficients = reduced.terms.map((term) => {
    const coefficient = term.kind === 'product' ? term.terms[0] : term
    return coefficient.kind === 'number' && coefficient.d === 1
      ? Math.abs(coefficient.n)
      : 1
  })
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const common = coefficients.reduce(gcd)
  if (common <= 1) return reduced
  return product(
    number(common),
    sum(...reduced.terms.map((term) => product(number(1, common), term))),
  )
}
export function sum(...expressions: Expression[]): Expression {
  const terms = expressions.flatMap((e) => (e.kind === 'sum' ? e.terms : [e]))
  let constant = new FractionEtendue(0, 1)
  const others: Expression[] = []
  for (const term of terms) {
    if (term.kind === 'number')
      constant = constant.sommeFraction(new FractionEtendue(term.n, term.d))
    else others.push(term)
  }
  if (constant.num !== 0) others.push(number(constant.num, constant.den))
  return others.length === 0
    ? number(0)
    : others.length === 1
      ? others[0]
      : { kind: 'sum', terms: others }
}
export function product(...expressions: Expression[]): Expression {
  const terms = expressions.flatMap((e) =>
    e.kind === 'product' ? e.terms : [e],
  )
  let constant = new FractionEtendue(1, 1)
  const numerator: Expression[] = []
  const denominator: Expression[] = []
  for (const term of terms) {
    if (term.kind === 'number')
      constant = constant.produitFraction(new FractionEtendue(term.n, term.d))
    else if (term.kind === 'quotient') {
      numerator.push(term.numerator)
      denominator.push(term.denominator)
    } else numerator.push(term)
  }
  if (constant.num === 0) return number(0)
  if (constant.valeurDecimale !== 1)
    numerator.unshift(number(constant.num, constant.den))
  if (denominator.length)
    return quotient(product(...numerator), product(...denominator))
  return numerator.length === 0
    ? number(1)
    : numerator.length === 1
      ? numerator[0]
      : { kind: 'product', terms: numerator }
}
export function quotient(
  numerator: Expression,
  denominator: Expression,
): Expression {
  if (isNumber(numerator, 0)) return number(0)
  if (isNumber(denominator, 1)) return numerator
  if (denominator.kind === 'number')
    return product(number(denominator.d, denominator.n), numerator)
  const factors = numerator.kind === 'product' ? numerator.terms : [numerator]
  const coefficient = factors[0]
  if (coefficient?.kind === 'number' && coefficient.d !== 1) {
    return quotient(
      product(number(coefficient.n), ...factors.slice(1)),
      product(number(coefficient.d), denominator),
    )
  }
  return { kind: 'quotient', numerator, denominator }
}
export function power(base: Expression, p: number, q = 1): Expression {
  const exponent = new FractionEtendue(p, q).simplifie()
  p = exponent.num
  q = exponent.den
  if (p === 0) return number(1)
  if (p === q) return base
  return { kind: 'power', base, p, q }
}
export const call = (
  kind: 'sin' | 'cos' | 'tan' | 'exp' | 'ln',
  argument: Expression,
): Expression => ({ kind, argument })

export function substitute(e: Expression, argument: Expression): Expression {
  switch (e.kind) {
    case 'number':
      return e
    case 'variable':
      return argument
    case 'sum':
      return sum(...e.terms.map((t) => substitute(t, argument)))
    case 'product':
      return product(...e.terms.map((t) => substitute(t, argument)))
    case 'quotient':
      return quotient(
        substitute(e.numerator, argument),
        substitute(e.denominator, argument),
      )
    case 'power':
      return power(substitute(e.base, argument), e.p, e.q)
    default:
      return call(e.kind, substitute(e.argument, argument))
  }
}

export function derivative(e: Expression): Expression {
  switch (e.kind) {
    case 'number':
      return number(0)
    case 'variable':
      return number(1)
    case 'sum':
      return sum(...e.terms.map(derivative))
    case 'product':
      return sum(
        ...e.terms.map((_, i) =>
          product(...e.terms.map((t, j) => (i === j ? derivative(t) : t))),
        ),
      )
    case 'quotient':
      return quotient(
        sum(
          product(derivative(e.numerator), e.denominator),
          product(number(-1), e.numerator, derivative(e.denominator)),
        ),
        power(e.denominator, 2),
      )
    case 'power':
      if (e.p === 1 && e.q === 2)
        return quotient(
          derivative(e.base),
          product(number(2), power(e.base, 1, 2)),
        )
      return product(
        number(e.p, e.q),
        power(e.base, e.p - e.q, e.q),
        derivative(e.base),
      )
    case 'sin':
      return product(derivative(e.argument), call('cos', e.argument))
    case 'cos':
      return product(
        number(-1),
        derivative(e.argument),
        call('sin', e.argument),
      )
    case 'tan':
      return quotient(derivative(e.argument), power(call('cos', e.argument), 2))
    case 'exp':
      return product(derivative(e.argument), e)
    case 'ln':
      return quotient(derivative(e.argument), e.argument)
  }
}

/**
 * Simplifier le résultat APRES avoir enregistré le domaine de la dérivée brute.
 * Les annulations sont alors licites sur l'ensemble annoncé, sans prolongement.
 */
export function simplifyResult(e: Expression): Expression {
  switch (e.kind) {
    case 'number':
    case 'variable':
      return e
    case 'sum': {
      // Réduire aussi les fractions présentes dans une somme, par exemple
      // (3/x² + 2)/x² = (2x² + 3)/x⁴.
      const terms = e.terms.map((term) =>
        simplifyResult({ kind: 'product', terms: [term] }),
      )
      const denominators = terms.map((term) =>
        term.kind === 'quotient' ? term.denominator : number(1),
      )
      if (denominators.every((term) => isNumber(term, 1)))
        return factorSum(terms)
      const numerator = sum(
        ...terms.map((term, i) =>
          simplifyResult(
            product(
              term.kind === 'quotient' ? term.numerator : term,
              ...denominators.filter((_denominator, j) => j !== i),
            ),
          ),
        ),
      )
      return simplifyResult(quotient(numerator, product(...denominators)))
    }
    case 'sin':
    case 'cos':
    case 'tan':
    case 'exp':
    case 'ln':
      return call(e.kind, simplifyResult(e.argument))
    case 'power': {
      const base = simplifyResult(e.base)
      if (base.kind === 'exp')
        return call(
          'exp',
          simplifyResult(product(number(e.p, e.q), base.argument)),
        )
      if (e.p === 1 && e.q === 2) {
        const factors = base.kind === 'product' ? base.terms : [base]
        const coefficient = factors[0]
        if (coefficient?.kind === 'number' && coefficient.n > 0) {
          const n = Math.round(Math.sqrt(coefficient.n))
          const d = Math.round(Math.sqrt(coefficient.d))
          if (n * n === coefficient.n && d * d === coefficient.d) {
            return product(
              number(n, d),
              factors.length === 1
                ? number(1)
                : power(product(...factors.slice(1)), 1, 2),
            )
          }
        }
      }
      if (e.q === 1) {
        if (base.kind === 'number')
          return number(
            e.p > 0 ? base.n ** e.p : base.d ** -e.p,
            e.p > 0 ? base.d ** e.p : base.n ** -e.p,
          )
        if (base.kind === 'power')
          return simplifyResult(power(base.base, base.p * e.p, base.q))
        if (base.kind === 'product')
          return simplifyResult(
            product(...base.terms.map((t) => power(t, e.p))),
          )
        if (base.kind === 'quotient')
          return simplifyResult(
            quotient(power(base.numerator, e.p), power(base.denominator, e.p)),
          )
      }
      return power(base, e.p, e.q)
    }
    default: {
      const factors = new Map<
        string,
        { base: Expression; exponent: FractionEtendue }
      >()
      let coefficient = new FractionEtendue(1, 1)
      const exponentialArguments: Expression[] = []
      const collect = (term: Expression, sign: 1 | -1): void => {
        if (term.kind === 'product') {
          term.terms.forEach((t) => collect(t, sign))
          return
        }
        if (term.kind === 'quotient') {
          collect(term.numerator, sign)
          collect(term.denominator, sign === 1 ? -1 : 1)
          return
        }
        const simplified = simplifyResult(term)
        if (simplified.kind === 'product' || simplified.kind === 'quotient') {
          collect(simplified, sign)
          return
        }
        if (simplified.kind === 'number') {
          coefficient = coefficient.produitFraction(
            new FractionEtendue(
              sign === 1 ? simplified.n : simplified.d,
              sign === 1 ? simplified.d : simplified.n,
            ),
          )
          return
        }
        if (simplified.kind === 'exp') {
          exponentialArguments.push(product(number(sign), simplified.argument))
          return
        }
        const base = simplified.kind === 'power' ? simplified.base : simplified
        const exponent =
          simplified.kind === 'power'
            ? new FractionEtendue(sign * simplified.p, simplified.q)
            : new FractionEtendue(sign, 1)
        const id = JSON.stringify(base)
        factors.set(id, {
          base,
          exponent: factors.has(id)
            ? factors.get(id)!.exponent.sommeFraction(exponent)
            : exponent,
        })
      }
      if (e.kind === 'product') e.terms.forEach((t) => collect(t, 1))
      else {
        collect(e.numerator, 1)
        collect(e.denominator, -1)
      }
      coefficient = coefficient.simplifie()
      if (coefficient.num === 0) return number(0)
      const numerator: Expression[] = [number(coefficient.num)]
      const denominator: Expression[] = [number(coefficient.den)]
      if (exponentialArguments.length) {
        const argument = simplifyResult(sum(...exponentialArguments))
        if (!isNumber(argument, 0)) numerator.push(call('exp', argument))
      }
      for (const { base, exponent } of factors.values()) {
        const f = exponent.simplifie()
        if (f.num === 0) continue
        ;(f.num > 0 ? numerator : denominator).push(
          power(base, Math.abs(f.num), f.den),
        )
      }
      const complexity = (term: Expression): number => {
        switch (term.kind) {
          case 'number':
            return 0
          case 'variable':
            return 1
          case 'power':
            return complexity(term.base) + 1
          case 'sum':
          case 'product':
            return 2 + term.terms.reduce((s, t) => s + complexity(t), 0)
          case 'quotient':
            return 2 + complexity(term.numerator) + complexity(term.denominator)
          default:
            return 3 + complexity(term.argument)
        }
      }
      numerator.sort((a, b) => complexity(a) - complexity(b))
      denominator.sort((a, b) => complexity(a) - complexity(b))
      return quotient(product(...numerator), product(...denominator))
    }
  }
}

const negativeLead = (term: Expression): boolean => {
  const lead = term.kind === 'product' ? term.terms[0] : term
  return lead.kind === 'number' && lead.n < 0
}

/**
 * Évite `-18(-x-1)` : lorsque tous les termes d'une somme facteur sont négatifs,
 * le signe passe dans le coefficient, ce qui donne `18(x+1)`.
 */
export function normalizeSigns(e: Expression): Expression {
  switch (e.kind) {
    case 'sum':
      return sum(...e.terms.map(normalizeSigns))
    case 'quotient':
      return quotient(
        normalizeSigns(e.numerator),
        normalizeSigns(e.denominator),
      )
    case 'product': {
      const terms = e.terms.map(normalizeSigns)
      const index = terms.findIndex(
        (t) => t.kind === 'sum' && t.terms.every(negativeLead),
      )
      const factor = terms[index]
      if (index < 0 || factor.kind !== 'sum' || terms[0].kind !== 'number')
        return product(...terms)
      return product(
        number(-1),
        ...terms.map((t, i) =>
          i === index
            ? sum(...factor.terms.map((f) => product(number(-1), f)))
            : t,
        ),
      )
    }
    default:
      return e
  }
}

/** Convention réelle : racine d'ordre impair d'un nombre négatif. */
export function realPower(value: number, p: number, q = 1): number {
  if (value === 0 && p < 0) return Number.NaN
  if (value < 0) {
    if (q % 2 === 0) return Number.NaN
    return (Math.abs(p) % 2 === 0 ? 1 : -1) * Math.pow(-value, p / q)
  }
  return Math.pow(value, p / q)
}
export function evaluate(e: Expression, x: number): number {
  switch (e.kind) {
    case 'number':
      return e.n / e.d
    case 'variable':
      return x
    case 'sum':
      return e.terms.reduce((v, t) => v + evaluate(t, x), 0)
    case 'product':
      return e.terms.reduce((v, t) => v * evaluate(t, x), 1)
    case 'quotient':
      return evaluate(e.numerator, x) / evaluate(e.denominator, x)
    case 'power':
      return realPower(evaluate(e.base, x), e.p, e.q)
    case 'sin':
      return Math.sin(evaluate(e.argument, x))
    case 'cos':
      return Math.cos(evaluate(e.argument, x))
    case 'tan':
      return Math.tan(evaluate(e.argument, x))
    case 'exp':
      return Math.exp(evaluate(e.argument, x))
    case 'ln':
      return Math.log(evaluate(e.argument, x))
  }
}

const parentheses = (s: string) => `\\left(${s}\\right)`
export function latex(e: Expression): string {
  switch (e.kind) {
    case 'number':
      return new FractionEtendue(e.n, e.d).texFractionSimplifiee
    case 'variable':
      return 'x'
    case 'sum':
      return e.terms
        .map((t, i) => {
          const s = latex(t)
          return i === 0 || s.startsWith('-') ? s : `+${s}`
        })
        .join('')
    case 'product':
      return e.terms
        .map((t, i) => {
          if (i === 0 && isNumber(t, -1)) return '-'
          return t.kind === 'sum' ? parentheses(latex(t)) : latex(t)
        })
        .join('\\,')
        .replace(/^-\\,/, '-')
    case 'quotient': {
      if (
        e.numerator.kind === 'product' &&
        e.numerator.terms.length === 2 &&
        isNumber(e.numerator.terms[0], -1)
      )
        return `-\\dfrac{${latex(e.numerator.terms[1])}}{${latex(e.denominator)}}`
      const n = latex(e.numerator)
      const negative = n.startsWith('-') && e.numerator.kind !== 'sum'
      return `${negative ? '-' : ''}\\dfrac{${negative ? n.slice(1) : n}}{${latex(e.denominator)}}`
    }
    case 'power': {
      const base =
        e.base.kind === 'variable' ||
        (e.base.kind === 'number' && e.base.n >= 0 && e.base.d === 1)
          ? latex(e.base)
          : parentheses(latex(e.base))
      if (e.q === 1) {
        if (
          e.base.kind === 'sin' ||
          e.base.kind === 'cos' ||
          e.base.kind === 'tan'
        )
          return `\\${e.base.kind}^{${e.p}}${parentheses(latex(e.base.argument))}`
        return `${base}^{${e.p}}`
      }
      if (e.p < 0)
        return `${base}^{${latex(number(e.p, e.q)).replaceAll('\\dfrac', '\\frac')}}`
      if (e.p > e.q)
        return latex(
          product(
            power(e.base, Math.floor(e.p / e.q)),
            power(e.base, e.p % e.q, e.q),
          ),
        )
      return `\\sqrt${e.q === 2 ? '' : `[${e.q}]`}{${e.p === 1 ? latex(e.base) : `${base}^{${e.p}}`}}`
    }
    case 'exp':
      return `\\mathrm{e}^{${latex(e.argument).replaceAll('\\dfrac', '\\frac')}}`
    default:
      return `\\${e.kind}${parentheses(latex(e.argument))}`
  }
}

export type Constraint = {
  expression: Expression
  relation: 'positive' | 'nonnegative' | 'nonzero'
}
const key = (e: Expression) => JSON.stringify(e)

/** Bornes grossières certifiées, utilisées seulement pour enlever les conditions tautologiques. */
function bounds(e: Expression): [number, number] {
  switch (e.kind) {
    case 'number':
      return [e.n / e.d, e.n / e.d]
    case 'sin':
    case 'cos':
      return [-1, 1]
    case 'exp':
      return [0, Infinity]
    case 'power':
      if (e.p % 2 === 0 || e.q % 2 === 0) return [0, Infinity]
      break
    case 'sum':
      return e.terms.reduce<[number, number]>(
        (a, t) => {
          const b = bounds(t)
          return [a[0] + b[0], a[1] + b[1]]
        },
        [0, 0],
      )
    case 'product': {
      if (e.terms.every((t) => bounds(t)[0] >= 0)) return [0, Infinity]
      break
    }
  }
  return [-Infinity, Infinity]
}

export function simplifyConstraints(input: Constraint[]): Constraint[] {
  const result = new Map<string, Constraint>()
  const pending = [...input]
  while (pending.length) {
    let { expression, relation } = pending.shift()!
    if (relation === 'nonzero' && expression.kind === 'product') {
      pending.push(
        ...expression.terms.map((term) => ({ expression: term, relation })),
      )
      continue
    }
    if (relation === 'nonzero' && expression.kind === 'quotient') {
      pending.push(
        { expression: expression.numerator, relation },
        { expression: expression.denominator, relation },
      )
      continue
    }
    if (
      expression.kind === 'power' &&
      (relation === 'nonzero' ||
        (relation === 'positive' && expression.p % 2 === 0))
    ) {
      pending.push({ expression: expression.base, relation: 'nonzero' })
      continue
    }
    if (
      expression.kind === 'product' &&
      expression.terms[0]?.kind === 'number' &&
      expression.terms[0].n > 0
    ) {
      expression = product(...expression.terms.slice(1))
    }
    if (expression.kind === 'ln') {
      // ln(u)>0 équivaut à u>1 ; ln(u)≠0 équivaut à u≠1 sur son domaine.
      pending.push({
        expression: sum(expression.argument, number(-1)),
        relation,
      })
      continue
    }
    if (expression.kind === 'power' && relation === 'positive') {
      pending.push({
        expression: expression.base,
        relation: expression.p % 2 === 0 ? 'nonzero' : 'positive',
      })
      continue
    }
    if (expression.kind === 'exp') continue
    const [min, max] = bounds(expression)
    if (relation === 'nonnegative' && min >= 0) continue
    if (
      (relation === 'positive' && min > 0) ||
      (relation === 'nonzero' && (min > 0 || max < 0))
    )
      continue
    const previous = result.get(key(expression))
    if (previous && previous.relation !== relation) relation = 'positive'
    result.set(key(expression), { expression, relation })
  }
  return [...result.values()]
}

/** Ensemble de définition exact de l'expression, avant toute transformation algébrique. */
export function constraints(e: Expression): Constraint[] {
  switch (e.kind) {
    case 'number':
    case 'variable':
      return []
    case 'sum':
    case 'product':
      return simplifyConstraints(e.terms.flatMap(constraints))
    case 'quotient':
      return simplifyConstraints([
        ...constraints(e.numerator),
        ...constraints(e.denominator),
        { expression: e.denominator, relation: 'nonzero' },
      ])
    case 'power':
      return simplifyConstraints([
        ...constraints(e.base),
        ...(e.q % 2 === 0
          ? [
              {
                expression: e.base,
                relation:
                  e.p < 0 ? ('positive' as const) : ('nonnegative' as const),
              },
            ]
          : e.p < 0
            ? [{ expression: e.base, relation: 'nonzero' as const }]
            : []),
      ])
    case 'ln':
      return simplifyConstraints([
        ...constraints(e.argument),
        { expression: e.argument, relation: 'positive' },
      ])
    case 'tan':
      return simplifyConstraints([
        ...constraints(e.argument),
        { expression: call('cos', e.argument), relation: 'nonzero' },
      ])
    default:
      return constraints(e.argument)
  }
}

export function satisfies(
  domain: Constraint[],
  x: number,
  margin = 0,
): boolean {
  return domain.every(({ expression, relation }) => {
    const y = evaluate(expression, x)
    return (
      Number.isFinite(y) &&
      (relation === 'positive'
        ? y > margin
        : relation === 'nonnegative'
          ? y >= margin
          : Math.abs(y) > margin)
    )
  })
}

function affine(e: Expression): [number, number] | undefined {
  if (e.kind === 'variable') return [1, 0]
  if (e.kind === 'number') return [0, e.n / e.d]
  if (e.kind === 'sum') {
    const parts = e.terms.map(affine)
    if (parts.every((p) => p !== undefined))
      return parts.reduce<[number, number]>(
        (a, b) => [a[0] + b[0], a[1] + b[1]],
        [0, 0],
      )
  }
  if (e.kind === 'product') {
    const parts = e.terms.map(affine)
    if (
      parts.every((p) => p !== undefined) &&
      parts.filter((p) => p[0] !== 0).length <= 1
    ) {
      const factor = parts
        .filter((p) => p[0] === 0)
        .reduce((a, b) => a * b[1], 1)
      const linear = parts.find((p) => p[0] !== 0) ?? [0, 1]
      return [factor * linear[0], factor * linear[1]]
    }
  }
}

export function domainLatex(domain: Constraint[]): string {
  if (!domain.length) return '\\mathbb{R}'
  if (domain.every((c) => affine(c.expression)?.[0])) {
    let lower = -Infinity
    let upper = Infinity
    let lowerClosed = false
    let upperClosed = false
    let lowerTex = '-\\infty'
    let upperTex = '+\\infty'
    const excluded: { value: number; tex: string }[] = []
    for (const c of domain) {
      const [a, b] = affine(c.expression)!
      const value = -b / a
      const tex = new FractionEtendue(-b, a).texFractionSimplifiee
      const closed = c.relation === 'nonnegative'
      if (c.relation === 'nonzero') excluded.push({ value, tex })
      else if (a > 0 && value >= lower) {
        lowerClosed = value === lower ? lowerClosed && closed : closed
        lower = value
        lowerTex = tex
      } else if (a < 0 && value <= upper) {
        upperClosed = value === upper ? upperClosed && closed : closed
        upper = value
        upperTex = tex
      }
    }
    const holes = [
      ...new Set(
        excluded
          .filter((p) => p.value > lower && p.value < upper)
          .map((p) => p.tex),
      ),
    ]
    if (excluded.some((p) => p.value === lower)) lowerClosed = false
    if (excluded.some((p) => p.value === upper)) upperClosed = false
    const interval =
      lower === -Infinity && upper === Infinity
        ? '\\mathbb{R}'
        : `${lowerClosed ? '[' : ']'}${lowerTex};${upperTex}${upperClosed ? ']' : '['}`
    return (
      interval +
      (holes.length ? `\\setminus\\left\\{${holes.join(';')}\\right\\}` : '')
    )
  }
  const relations = {
    positive: '>0',
    nonnegative: '\\geqslant0',
    nonzero: '\\ne0',
  }
  return `\\left\\{x\\in\\mathbb{R}\\mid ${domain.map((c) => `${latex(c.expression)}${relations[c.relation]}`).join('\\text{ et }')}\\right\\}`
}
