import {
  derivative,
  latex,
  product,
  simplifyResult,
  sum,
  type Expression,
} from './deriveesComposeesExpressions'

/** Une règle et une application, sans décomposition récursive en fonctions auxiliaires. */
export function naturalDerivativeSteps(expression: Expression): string {
  const slope = (e: Expression) => latex(simplifyResult(derivative(e)))
  if (expression.kind === 'sum') {
    const terms = expression.terms.map((term) =>
      simplifyResult(derivative(term)),
    )
    const intermediate = latex(sum(...terms))
    return (
      'On dérive chaque terme de la somme.<br>' +
      (intermediate === slope(expression) ? '' : `$h'(x)=${intermediate}$.<br>`)
    )
  }
  if (expression.kind === 'product') {
    const factors: Expression[] = expression.terms.filter(
      (term) => term.kind !== 'number',
    )
    if (factors.length === 1) return naturalDerivativeSteps(factors[0])
    const coefficient = expression.terms.filter(
      (term) => term.kind === 'number',
    )
    factors[0] = product(...coefficient, factors[0])
    const names = ['u', 'v', 'w']
    const definitions = factors
      .map((term, i) => `$${names[i]}(x)=${latex(term)}$`)
      .join(', ')
    const derivatives = factors
      .map((term, i) => `$${names[i]}'(x)=${slope(term)}$`)
      .join(', ')
    const rule =
      factors.length === 3 ? "(uvw)'=u'vw+uv'w+uvw'" : "(uv)'=u'v+uv'"
    return `On utilise $${rule}$, avec ${definitions}.<br>On a ${derivatives}.<br>`
  }
  if (expression.kind === 'quotient') {
    return (
      `On utilise $\\left(\\dfrac uv\\right)'=\\dfrac{u'v-uv'}{v^2}$, avec $u(x)=${latex(expression.numerator)}$ et $v(x)=${latex(expression.denominator)}$.<br>` +
      `On a $u'(x)=${slope(expression.numerator)}$ et $v'(x)=${slope(expression.denominator)}$.<br>`
    )
  }
  if (expression.kind === 'number' || expression.kind === 'variable') return ''
  const argument =
    expression.kind === 'power' ? expression.base : expression.argument
  if (argument.kind === 'variable') return 'On utilise la dérivée usuelle.<br>'
  const rules = {
    sin: "(\\sin u)'=u'\\cos u",
    cos: "(\\cos u)'=-u'\\sin u",
    tan: "(\\tan u)'=\\dfrac{u'}{\\cos^2 u}",
    exp: "(\\mathrm{e}^u)'=u'\\mathrm{e}^u",
    ln: "(\\ln u)'=\\dfrac{u'}u",
  }
  const rule =
    expression.kind === 'power'
      ? expression.p === 1 && expression.q === 2
        ? "(\\sqrt u)'=\\dfrac{u'}{2\\sqrt u}"
        : "(u^n)'=nu^{n-1}u'"
      : rules[expression.kind]
  return `On utilise $${rule}$, avec $u(x)=${latex(argument)}$ et $u'(x)=${slope(argument)}$.<br>`
}
