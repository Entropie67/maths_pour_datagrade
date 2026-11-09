import type { Check, CheckOverrides } from './types'

type GeometricKind = 'segment' | 'droite' | 'demiDroite' | 'angle' | 'triangle'

type GeometricName = { kind: GeometricKind; points: string[] }

/** Message quand la saisie n'a pas la notation de l'objet attendu */
const NOTATION_FEEDBACK: Record<GeometricKind, string> = {
  segment: 'Noter un segment entre crochets.',
  droite: 'Noter une droite entre parenthèses.',
  demiDroite:
    "Noter une demi-droite avec un crochet du côté de son origine et une parenthèse de l'autre.",
  angle: 'Noter un angle avec un chapeau.',
  triangle: 'Noter un triangle avec ses trois sommets.',
}

/** Retire de la saisie MathLive ce qui ne change pas le nom de l'objet */
function normalize(value: string): string {
  return value
    .replace(/\\left|\\right/g, '')
    .replace(/\\lbrack/g, '[')
    .replace(/\\rbrack/g, ']')
    .replace(/\\lparen/g, '(')
    .replace(/\\rparen/g, ')')
    .replace(/\\(?:mathrm|text)\{([^{}]*)\}/g, '$1')
    .replace(/\^\{?\\prime\}?/g, "'")
    .replace(/\\[,;:! ]|\s/g, '')
}

/** Noms de points : une majuscule, suivie éventuellement de primes ou d'un indice */
function splitPoints(value: string): string[] | null {
  const points = value.match(/[A-Z](?:'+|_\{?\d+\}?|\d+)?/g) ?? []
  return points.join('') === value && points.length > 0 ? points : null
}

function parse(value: string): GeometricName | null {
  const normalized = normalize(value)
  const angle = normalized.match(/^\\widehat\{(.+)\}$/)
  if (angle != null) {
    const points = splitPoints(angle[1])
    return points?.length === 3 ? { kind: 'angle', points } : null
  }
  const delimiters: [string, string, GeometricKind][] = [
    ['[', ']', 'segment'],
    ['(', ')', 'droite'],
    ['[', ')', 'demiDroite'],
  ]
  for (const [open, close, kind] of delimiters) {
    if (normalized.startsWith(open) && normalized.endsWith(close)) {
      const points = splitPoints(normalized.slice(1, -1))
      return points?.length === 2 ? { kind, points } : null
    }
  }
  const points = splitPoints(normalized)
  return points?.length === 3 ? { kind: 'triangle', points } : null
}

function distinct(points: string[]): boolean {
  return new Set(points).size === points.length
}

/** Mêmes points, l'ordre comptant ou non selon l'objet */
function sameObject(saisie: GeometricName, answer: GeometricName): boolean {
  const [a, b, c] = saisie.points
  const [x, y, z] = answer.points
  switch (answer.kind) {
    case 'segment':
    case 'droite':
      return (a === x && b === y) || (a === y && b === x)
    case 'demiDroite':
      return a === x && b === y
    case 'angle':
      return b === y && ((a === x && c === z) || (a === z && c === x))
    case 'triangle':
      return (
        [...saisie.points].sort().join() === [...answer.points].sort().join()
      )
  }
}

/**
 * Compare deux noms d'objets géométriques : segment `[AB]`, droite `(AB)`,
 * demi-droite `[AB)`, angle `\widehat{ABC}` ou triangle `ABC`. La notation de
 * la réponse attendue fixe l'objet ; les points doivent être distincts.
 * L'ordre des points est libre sauf pour la demi-droite (origine en premier)
 * et pour l'angle (sommet au milieu).
 */
export function sameGeometricName(options: CheckOverrides = {}): Check {
  return {
    name: options.name ?? 'sameGeometricName',
    weight: options.weight,
    feedbackEnabled: options.feedbackEnabled,
    feedbackOnSuccess: options.feedbackOnSuccess,
    run: (saisie, answer) => {
      const expected = parse(answer)
      const given = parse(saisie)
      const feedbackKo = (message: string) => ({
        passed: false,
        feedbackKo: options.feedbackKo ?? message,
      })
      if (expected == null) {
        return feedbackKo(
          "La réponse attendue n'est pas un nom d'objet géométrique.",
        )
      }
      if (given == null || given.kind !== expected.kind) {
        return feedbackKo(NOTATION_FEEDBACK[expected.kind])
      }
      if (!distinct(given.points)) {
        return feedbackKo('Nommer des points distincts.')
      }
      if (
        expected.kind === 'angle' &&
        !sameObject(given, expected) &&
        [...given.points].sort().join() === [...expected.points].sort().join()
      ) {
        return feedbackKo("Placer le sommet de l'angle au milieu.")
      }
      return sameObject(given, expected)
        ? { passed: true, feedbackKo: '', feedbackOk: options.feedbackOk }
        : feedbackKo('Les points ne correspondent pas à la réponse attendue.')
    },
  }
}
