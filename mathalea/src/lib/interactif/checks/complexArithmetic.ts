import { normalizeLatexArithmetic } from './latexArithmetic'

export type NombreComplexe = { re: number; im: number }

export type PointComplexe = Record<string, NombreComplexe>

const TOLERANCE = 1e-8

const ZERO: NombreComplexe = { re: 0, im: 0 }
const UN: NombreComplexe = { re: 1, im: 0 }
const I: NombreComplexe = { re: 0, im: 1 }

/**
 * Écritures produites par MathLive ou par les touches du clavier virtuel
 * (`\mathrm{i}`, `\imaginaryI`, `\lparen`, `\rparen`, `\,`...) ramenées à
 * leur forme simple.
 */
function normalizeImaginaryUnit(value: string): string {
  return value
    .replaceAll('\\mathrm{i}', 'i')
    .replaceAll('\\text{i}', 'i')
    .replaceAll('\\imaginaryI', 'i')
    .replaceAll('{,}', '.')
    .replaceAll('\\div', '/')
    .replaceAll('\\lparen', '(')
    .replaceAll('\\rparen', ')')
    .replaceAll('\\,', '')
}

const add = (a: NombreComplexe, b: NombreComplexe): NombreComplexe => ({
  re: a.re + b.re,
  im: a.im + b.im,
})
const sub = (a: NombreComplexe, b: NombreComplexe): NombreComplexe => ({
  re: a.re - b.re,
  im: a.im - b.im,
})
const mul = (a: NombreComplexe, b: NombreComplexe): NombreComplexe => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
})
const conj = (a: NombreComplexe): NombreComplexe => ({ re: a.re, im: -a.im })
function div(a: NombreComplexe, b: NombreComplexe): NombreComplexe {
  const denominateur = b.re * b.re + b.im * b.im
  if (denominateur === 0) throw new Error('Division par zéro')
  const numerateur = mul(a, conj(b))
  return {
    re: numerateur.re / denominateur,
    im: numerateur.im / denominateur,
  }
}
function puissance(a: NombreComplexe, n: number): NombreComplexe {
  if (!Number.isInteger(n) || Math.abs(n) > 20)
    throw new Error('Exposant non géré')
  let resultat = UN
  for (let k = 0; k < Math.abs(n); k++) resultat = mul(resultat, a)
  return n < 0 ? div(UN, resultat) : resultat
}

type Jeton = {
  type: 'nombre' | 'lettre' | 'operateur' | 'commande'
  texte: string
}

function tokenize(expression: string): Jeton[] {
  const jetons: Jeton[] = []
  let position = 0
  while (position < expression.length) {
    const reste = expression.slice(position)
    const nombre = /^\d+(?:\.\d+)?/.exec(reste)
    if (nombre != null) {
      jetons.push({ type: 'nombre', texte: nombre[0] })
      position += nombre[0].length
      continue
    }
    const commande = /^\\[a-zA-Z]+/.exec(reste)
    if (commande != null) {
      jetons.push({ type: 'commande', texte: commande[0] })
      position += commande[0].length
      continue
    }
    const caractere = reste[0]
    if (/[A-Za-z]/.test(caractere)) {
      jetons.push({ type: 'lettre', texte: caractere })
    } else if ('+-*/^(){}'.includes(caractere)) {
      jetons.push({ type: 'operateur', texte: caractere })
    } else throw new Error(`Caractère non géré : ${caractere}`)
    position += 1
  }
  return jetons
}

/**
 * Évaluateur d'expressions LaTeX de nombres complexes : opérations usuelles,
 * fractions, puissances entières, produit implicite, conjugué (`\overline`) et
 * unité imaginaire `i`. Les autres lettres sont des variables dont la valeur
 * est donnée par `point`.
 */
class EvaluateurComplexe {
  private position = 0

  constructor(
    private readonly jetons: Jeton[],
    private readonly point: PointComplexe,
  ) {}

  evaluate(): NombreComplexe {
    const valeur = this.somme()
    if (this.position < this.jetons.length) throw new Error('Reste inattendu')
    return valeur
  }

  private courant(): Jeton | undefined {
    return this.jetons[this.position]
  }

  private estOperateur(texte: string): boolean {
    const jeton = this.courant()
    return jeton?.type === 'operateur' && jeton.texte === texte
  }

  private somme(): NombreComplexe {
    let valeur = this.produit()
    while (this.estOperateur('+') || this.estOperateur('-')) {
      const operateur = this.jetons[this.position++].texte
      const terme = this.produit()
      valeur = operateur === '+' ? add(valeur, terme) : sub(valeur, terme)
    }
    return valeur
  }

  private debuteUnFacteur(): boolean {
    const jeton = this.courant()
    if (jeton == null) return false
    if (jeton.type === 'nombre' || jeton.type === 'lettre') return true
    if (jeton.type === 'commande') return jeton.texte === '\\overline'
    return jeton.texte === '(' || jeton.texte === '{'
  }

  private produit(): NombreComplexe {
    let valeur = this.signe()
    for (;;) {
      if (this.estOperateur('*')) {
        this.position++
        valeur = mul(valeur, this.signe())
      } else if (this.estOperateur('/')) {
        this.position++
        valeur = div(valeur, this.signe())
      } else if (this.debuteUnFacteur()) {
        valeur = mul(valeur, this.puissance())
      } else return valeur
    }
  }

  private signe(): NombreComplexe {
    if (this.estOperateur('-')) {
      this.position++
      return sub(ZERO, this.signe())
    }
    if (this.estOperateur('+')) {
      this.position++
      return this.signe()
    }
    return this.puissance()
  }

  private puissance(): NombreComplexe {
    const base = this.atome()
    if (!this.estOperateur('^')) return base
    this.position++
    const exposant = this.atome()
    if (Math.abs(exposant.im) > TOLERANCE) throw new Error('Exposant complexe')
    return puissance(base, exposant.re)
  }

  private atome(): NombreComplexe {
    const jeton = this.courant()
    if (jeton == null) throw new Error('Expression incomplète')
    this.position++
    if (jeton.type === 'nombre') return { re: Number(jeton.texte), im: 0 }
    if (jeton.type === 'lettre') {
      if (jeton.texte === 'i') return I
      const valeur = this.point[jeton.texte]
      if (valeur == null) throw new Error(`Variable inconnue : ${jeton.texte}`)
      return valeur
    }
    if (jeton.type === 'commande') {
      if (jeton.texte !== '\\overline')
        throw new Error(`Commande non gérée : ${jeton.texte}`)
      return conj(this.atome())
    }
    if (jeton.texte === '-') {
      return sub(ZERO, this.atome())
    }
    if (jeton.texte === '(' || jeton.texte === '{') {
      const fermant = jeton.texte === '(' ? ')' : '}'
      const valeur = this.somme()
      if (!this.estOperateur(fermant)) throw new Error('Parenthèse manquante')
      this.position++
      return valeur
    }
    throw new Error(`Symbole inattendu : ${jeton.texte}`)
  }
}

/**
 * Valeur complexe d'une expression LaTeX en un point donné, ou `undefined` si
 * l'expression ne peut pas être évaluée (syntaxe non gérée, division par 0…).
 */
export function evaluateComplexExpression(
  expression: string,
  point: PointComplexe = {},
): NombreComplexe | undefined {
  try {
    const normalisee = normalizeLatexArithmetic(
      normalizeImaginaryUnit(expression),
    )
    if (normalisee === '') return undefined
    const valeur = new EvaluateurComplexe(
      tokenize(normalisee),
      point,
    ).evaluate()
    return Number.isFinite(valeur.re) && Number.isFinite(valeur.im)
      ? valeur
      : undefined
  } catch {
    return undefined
  }
}

/** Lettres (hors `i`) d'une expression LaTeX, commandes exclues. */
export function complexVariables(expression: string): string[] {
  const sansCommandes = normalizeImaginaryUnit(expression).replace(
    /\\[a-zA-Z]+/g,
    '',
  )
  return [
    ...new Set(
      (sansCommandes.match(/[A-Za-z]/g) ?? []).filter((c) => c !== 'i'),
    ),
  ].sort()
}

/** Points d'évaluation variés (parties réelles et imaginaires non nulles). */
export function complexEvaluationPoints(variables: string[]): PointComplexe[] {
  const valeurs = [-2, -1, 0, 1, 2, 3]
  const points: PointComplexe[] = []
  for (let index = 0; index < Math.max(8, variables.length * 3); index++) {
    const point: PointComplexe = {}
    variables.forEach((variable, rang) => {
      point[variable] = {
        re: valeurs[(index + 2 * rang) % valeurs.length],
        im: valeurs[(2 * index + 3 * rang + 1) % valeurs.length],
      }
    })
    points.push(point)
  }
  return points
}

export const toleranceComplexe = (...valeurs: NombreComplexe[]): number =>
  TOLERANCE * Math.max(1, ...valeurs.map((v) => Math.hypot(v.re, v.im)))

export function complexDivide(
  a: NombreComplexe,
  b: NombreComplexe,
): NombreComplexe {
  return div(a, b)
}

export function complexSubtract(
  a: NombreComplexe,
  b: NombreComplexe,
): NombreComplexe {
  return sub(a, b)
}

export const complexModulus = (a: NombreComplexe): number =>
  Math.hypot(a.re, a.im)

/** Deux expressions ont-elles la même valeur complexe (variables comprises) ? */
export function haveSameComplexValue(left: string, right: string): boolean {
  const variables = complexVariables(`${left}${right}`)
  return complexEvaluationPoints(variables).every((point) => {
    const a = evaluateComplexExpression(left, point)
    const b = evaluateComplexExpression(right, point)
    return (
      a != null &&
      b != null &&
      complexModulus(sub(a, b)) <= toleranceComplexe(a, b)
    )
  })
}
