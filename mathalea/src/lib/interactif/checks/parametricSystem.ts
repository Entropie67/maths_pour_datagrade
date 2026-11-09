export type LineDimension = 2 | 3

export function cleanSystem(input: string): string {
  return input
    .replace(/\$/g, '')
    .replace(/\\left|\\right/g, '')
    .replace(/\\begin\{cases\}|\\end\{cases\}/g, '')
    .replace(/\\begin\{array\}\{[^}]*\}|\\end\{array\}/g, '')
    .replace(/\\begin\{aligned\}|\\end\{aligned\}/g, '')
    .replace(/\\quad/g, '')
    .replace(/\\,/g, '')
    .replace(/\\;/g, '')
    .replace(/~/g, '')
    .replace(/\s/g, '')
    .replace(/&/g, '')
    .replace(/[;,]?[a-zA-Z]\\in\\mathbb\{R\}/g, '')
    .replace(/[;,]?[a-zA-Z]\u2208\\mathbb\{R\}/g, '')
    .replace(/[;,]?[a-zA-Z]\u2208R/g, '')
    .replace(/\\\\/g, ';')
}

export function extractEquations(input: string): Record<string, string> {
  const equations: Record<string, string> = {}
  const matches = Array.from(
    cleanSystem(input).matchAll(/([xyz])=([^;]+)(?:;|$)/g),
  )

  for (const match of matches) {
    equations[match[1]] = match[2]
  }

  return equations
}

export function variablesInExpression(expression: string): string[] {
  const withoutLatexCommands = expression.replace(/\\[a-zA-Z]+/g, '')
  const variables = new Set<string>()

  for (const match of withoutLatexCommands.matchAll(/[a-zA-Z]/g)) {
    const variable = match[0]
    if (!['x', 'y', 'z', 'R'].includes(variable)) {
      variables.add(variable)
    }
  }

  return Array.from(variables)
}

export function expectedCoordinates(dimension: LineDimension): string[] {
  return dimension === 2 ? ['x', 'y'] : ['x', 'y', 'z']
}

export function missingCoordinates(
  equations: Record<string, string>,
  coordinates: string[],
): string[] {
  return coordinates.filter((coordinate) => equations[coordinate] == null)
}

export function variablesInSystem(
  input: string,
  dimension: LineDimension,
): string[] | { error: string } {
  const equations = extractEquations(input)
  const coordinates = expectedCoordinates(dimension)
  const missing = missingCoordinates(equations, coordinates)

  if (missing.length > 0) {
    return {
      error:
        dimension === 2
          ? 'On attend un système avec deux équations : $x=...$ et $y=...$.'
          : 'On attend un système avec trois équations : $x=...$, $y=...$ et $z=...$.',
    }
  }

  const variables = new Set<string>()
  for (const coordinate of coordinates) {
    const expression = equations[coordinate]
    for (const variable of variablesInExpression(expression)) {
      variables.add(variable)
    }
  }

  return Array.from(variables)
}

export function parametricSystemFromValues(
  values: Record<string, string>,
  dimension: LineDimension,
): string {
  const coordinates = expectedCoordinates(dimension)
  return `\\begin{cases}${coordinates.map((coordinate, index) => `${coordinate}=${values[`champ${index + 1}`] ?? ''}`).join('\\\\')}\\end{cases}`
}
