export function normalizeLatexArithmetic(value: string): string {
  let normalized = value
    .trim()
    .replaceAll(',', '.')
    .replaceAll(',', '.')
    .replaceAll('−', '-')
    .replaceAll('\\times', '*')
    .replaceAll('\\cdot', '*')
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')

  while (/\\[dtc]?frac\{([^{}]+)\}\{([^{}]+)\}/.test(normalized)) {
    normalized = normalized.replace(
      /\\[dtc]?frac\{([^{}]+)\}\{([^{}]+)\}/g,
      '(($1)/($2))',
    )
  }

  return normalized
    .replace(/\\[dtc]?frac([+-]?\d)([+-]?\d)(?!\d)/g, '(($1)/($2))')
    .replace(/\s+/g, '')
}

export function insertImplicitProducts(expression: string): string {
  return expression
    .replace(/(\d|\))(?=[A-Za-z(])/g, '$1*')
    .replace(/([A-Za-z])(?=\d|\()/g, '$1*')
    .replace(/\)(?=\d|[A-Za-z])/g, ')*')
}

export function splitTopLevelTerms(expression: string): string[] {
  const terms: string[] = []
  let start = 0
  let depth = 0

  for (let index = 0; index < expression.length; index++) {
    const character = expression[index]
    if (character === '(') depth++
    if (character === ')') depth--
    if (depth === 0 && index > 0 && (character === '+' || character === '-')) {
      terms.push(expression.slice(start, index))
      start = index
    }
  }

  terms.push(expression.slice(start))
  return terms
    .filter((term) => term !== '')
    .map((term) =>
      term.startsWith('+') || term.startsWith('-') ? term : `+${term}`,
    )
}
