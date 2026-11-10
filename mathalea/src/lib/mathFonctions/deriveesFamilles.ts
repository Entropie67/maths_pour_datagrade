import { naturalDerivativeSteps } from './deriveesCorrection'
import type { FormulaireComplexe } from '../formulaireComplexe'
import { choice } from '../outils/arrayOutils'
import { miseEnEvidence } from '../outils/embellissements'
import { randint } from '../../modules/outils'
import {
  buildCase,
  generateComposition,
  type CompositionCase,
  type InnerFamily,
  type OuterFamily,
  type Progression,
} from './deriveesComposees'
import {
  call,
  derivative,
  domainLatex,
  normalizeSigns,
  latex,
  number,
  power,
  product,
  quotient,
  simplifyResult,
  sum,
  variable as x,
  type Expression,
} from './deriveesComposeesExpressions'

/** Types de fonctions pouvant intervenir dans les facteurs, numérateurs et dénominateurs. */
export const functionTypes = {
  polynomial: 'Polynôme',
  root: 'Racine carrée',
  trig: 'Sinus et cosinus',
  exp: 'Exponentielle',
  ln: 'Logarithme népérien',
} as const
export type FunctionType = keyof typeof functionTypes

/** Familles de structures, et non questions numérotées d'une fiche. */
export const derivativeFamilies = {
  product: 'Produit de deux fonctions',
  tripleProduct: 'Produit de trois fonctions',
  powerProduct: 'Produit d’une puissance et d’une fonction',
  sumProduct: 'Somme d’un produit et d’une fonction',
  quotient: 'Quotient de deux fonctions',
  sumQuotient: 'Quotient avec une somme au numérateur',
  inverse: 'Inverse d’une fonction',
  powerQuotient: 'Quotient de puissances',
  power: 'Puissance d’une fonction',
  sumPowers: 'Somme d’une puissance et d’une fonction',
  sumFunctions: 'Somme de fonctions',
} as const
export type DerivativeFamily = keyof typeof derivativeFamilies | 'composition'

/** Familles proposées par exercice : chacune correspond à une règle de dérivation. */
export const exerciseFamilies = {
  product: ['product', 'tripleProduct', 'powerProduct', 'sumProduct'],
  quotient: ['quotient', 'sumQuotient', 'inverse', 'powerQuotient'],
  power: ['power', 'sumPowers', 'sumFunctions'],
} as const satisfies Record<
  string,
  readonly (keyof typeof derivativeFamilies)[]
>

/** Formulaire d'un exercice : familles pondérées, puis types de fonctions pondérés. */
export function derivativeFormFor(
  families: readonly (keyof typeof derivativeFamilies)[],
): FormulaireComplexe {
  return {
    champs: [
      {
        type: 'listePonderee',
        nom: 'family',
        label: 'Familles',
        items: families.map((nom) => ({
          nom,
          label: derivativeFamilies[nom],
          poids: 1,
        })),
      },
      {
        type: 'listePonderee',
        nom: 'functions',
        label: 'Types de fonctions',
        items: Object.entries(functionTypes).map(([nom, label]) => ({
          nom,
          label,
          poids: 1,
        })),
      },
    ],
  }
}
export type DerivativeCase = CompositionCase & { family: DerivativeFamily }

/**
 * Vrai si l'expression se simplifie d'elle-même : facteurs de même base ou
 * exponentielles à regrouper (`√x·√x`, `eˣe³ˣ`, `ln²x/ln³x`), puissance paire
 * d'une racine (`(√u)²`). De telles fonctions se dérivent mieux après réduction.
 */
function reducible(e: Expression): boolean {
  switch (e.kind) {
    case 'sum':
      return e.terms.some(reducible)
    case 'power':
      return (
        (e.base.kind === 'power' &&
          (e.p * e.base.p) % (e.q * e.base.q) === 0) ||
        reducible(e.base)
      )
    case 'product':
    case 'quotient': {
      const factors: Expression[] = []
      const collect = (f: Expression) => {
        if (f.kind === 'product') f.terms.forEach(collect)
        else if (f.kind === 'quotient') {
          collect(f.numerator)
          collect(f.denominator)
        } else if (f.kind !== 'number') factors.push(f)
      }
      collect(e)
      const keys = factors.map((f) =>
        f.kind === 'exp'
          ? 'exp'
          : JSON.stringify(f.kind === 'power' ? f.base : f),
      )
      return new Set(keys).size < keys.length || factors.some(reducible)
    }
    default:
      return false
  }
}

/** Tire `count` types indépendamment : un même type peut apparaître plusieurs fois. */
function drawTypes(available: FunctionType[], count: number): FunctionType[] {
  return Array.from({ length: count }, () => choice(available))
}

/** Fonction élémentaire d'un type donné, éventuellement composée avec une fonction affine. */
function atom(type: FunctionType): Expression {
  const a = randint(1, 3) * choice([-1, 1])
  const b = randint(1, 3)
  const affine = sum(product(number(a), x), number(b))
  switch (type) {
    case 'polynomial':
      return choice([
        power(x, randint(2, 3)),
        sum(x, number(-Math.sign(a) * b)),
        sum(power(x, 2), number(b)),
        affine,
      ])
    case 'root':
      return choice([
        power(x, 1, 2),
        power(sum(power(x, 2), number(b)), 1, 2),
        power(sum(x, number(b)), 1, 2),
      ])
    case 'trig':
      return call(choice(['sin', 'cos']), choice([x, affine]))
    case 'exp':
      return call('exp', choice([x, product(number(a), x)]))
    case 'ln':
      return choice([
        call('ln', x),
        call('ln', sum(power(x, 2), number(b))),
        call('ln', sum(x, number(b))),
      ])
  }
}

/**
 * Base d'une puissance ou dénominateur : elle ne s'annule pas, ou seulement en un
 * point simple à énoncer, et sa puissance ne se réduit pas (pas de `(√x)²`).
 */
function baseAtom(type: FunctionType): Expression {
  const a = randint(1, 3) * choice([-1, 1])
  const b = randint(1, 3)
  switch (type) {
    case 'polynomial':
      return choice([
        x,
        sum(x, number(b * Math.sign(a))),
        sum(power(x, 2), number(b)),
      ])
    case 'root':
      return choice([
        sum(power(x, 1, 2), number(b)),
        power(sum(power(x, 2), number(b)), 1, 2),
      ])
    case 'trig':
      return sum(
        number(randint(2, 4)),
        call(choice(['sin', 'cos']), sum(product(number(a), x), number(b))),
      )
    case 'exp':
      return sum(call('exp', choice([x, product(number(a), x)])), number(b))
    case 'ln':
      return call('ln', x)
  }
}

function coefficient(): Expression {
  return number(randint(1, 3) * choice([-1, 1]))
}

function familyExpression(
  family: Exclude<DerivativeFamily, 'composition'>,
  available: FunctionType[],
): Expression {
  const n = randint(2, 3)
  const m = randint(2, 3)
  switch (family) {
    case 'product': {
      const [f, g] = drawTypes(available, 2).map(atom)
      return product(coefficient(), f, g)
    }
    case 'tripleProduct': {
      const [f, g, h] = drawTypes(available, 3).map(atom)
      return product(f, g, h)
    }
    case 'powerProduct': {
      const [f, g] = drawTypes(available, 2)
      return product(power(baseAtom(f), n), atom(g))
    }
    case 'sumProduct': {
      const [f, g, h] = drawTypes(available, 3).map(atom)
      return sum(product(coefficient(), f, g), product(coefficient(), h))
    }
    case 'quotient': {
      const [f, g] = drawTypes(available, 2)
      return quotient(product(coefficient(), atom(f)), baseAtom(g))
    }
    case 'sumQuotient': {
      const [f, g, h] = drawTypes(available, 3)
      return quotient(sum(atom(f), atom(g)), baseAtom(h))
    }
    case 'inverse':
      return sum(
        quotient(coefficient(), baseAtom(choice(available))),
        number(randint(1, 3)),
      )
    case 'powerQuotient': {
      const [f, g] = drawTypes(available, 2)
      return quotient(power(baseAtom(f), n), power(baseAtom(g), m))
    }
    case 'power':
      return product(
        number(randint(1, 3)),
        power(baseAtom(choice(available)), choice([n, -n])),
      )
    case 'sumPowers': {
      const [f] = drawTypes(available, 1)
      const u = baseAtom(f)
      return sum(product(coefficient(), power(u, n)), product(coefficient(), u))
    }
    case 'sumFunctions': {
      const [f, g, h] = drawTypes(available, 3).map(atom)
      return sum(
        product(coefficient(), f),
        product(coefficient(), g),
        product(coefficient(), h),
      )
    }
  }
}

export function generateDerivative(
  family: DerivativeFamily,
  progression: Progression,
  outer: OuterFamily,
  inner: InnerFamily,
  available: FunctionType[] = Object.keys(functionTypes) as FunctionType[],
): DerivativeCase {
  if (family === 'composition')
    return { ...generateComposition(progression, outer, inner), family }
  // Les domaines et les points de validation sont calculés sur l'expression originale.
  for (let attempt = 0; attempt < 60; attempt++) {
    const expression = familyExpression(family, available)
    // Après 40 essais, accepter un tirage réductible si la sélection l'impose.
    if (attempt < 40 && reducible(expression)) continue
    const result = buildCase(x, expression)
    // Somme et produit se dérivent terme à terme, sans mise au même dénominateur.
    if (expression.kind === 'sum' || expression.kind === 'product')
      result.derived = termwiseDerivative(expression)
    // Écarter les fonctions constantes, par exemple ln(x)/ln(x).
    if (latex(result.derived) === '0') continue
    if (result.samples.length >= 12) return { ...result, family }
  }
  throw new Error(`Famille de dérivation sans candidat : ${family}`)
}

/**
 * Termes de la dérivée : un terme par terme de la somme, un terme par facteur
 * dérivé pour un produit ; chacun est simplifié séparément.
 */
function derivativeTerms(e: Expression): Expression[] {
  if (e.kind === 'sum') return e.terms.flatMap(derivativeTerms)
  if (e.kind === 'product') {
    const d = derivative(e)
    return (d.kind === 'sum' ? d.terms : [d]).map((t) => simplifyResult(t))
  }
  return [simplifyResult(derivative(e))]
}

/**
 * Somme des termes de la dérivée. Regroupée et factorisée seulement si aucune
 * fraction n'intervient ; jamais mise au même dénominateur.
 */
function termwiseDerivative(e: Expression): Expression {
  const terms = derivativeTerms(e)
  return normalizeSigns(
    terms.some((term) => term.kind === 'quotient')
      ? sum(...terms)
      : simplifyResult(sum(...terms)),
  )
}

/** Dérivée terme à terme, puis regroupement si le résultat final diffère. */
function sumSteps(c: DerivativeCase): string {
  const intermediate = latex(
    normalizeSigns(sum(...derivativeTerms(c.expression))),
  )
  return (
    'On dérive chaque terme de la somme.<br>' +
    (intermediate === latex(c.derived) ? '' : `$h'(x)=${intermediate}$.<br>`)
  )
}

export function derivativeCorrection(c: DerivativeCase): string {
  return (
    `La fonction $h$ est dérivable sur $${domainLatex(c.differentiability)}$.<br>` +
    (c.expression.kind === 'sum'
      ? sumSteps(c)
      : naturalDerivativeSteps(c.expression)) +
    `Ainsi, $h'(x)=${miseEnEvidence(latex(c.derived))}$.`
  )
}
