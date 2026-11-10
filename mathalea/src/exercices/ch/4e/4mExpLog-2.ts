import {
  lireFormulaireComplexe,
  repartitionPonderee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import { samePrimitiveUpToConstant, seq } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { Polynome } from '../../../lib/mathFonctions/Polynome'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Déterminer une primitive avec ln ou exp'
export const dateDePublication = '26/10/2026'
export const uuid = 'd1a94'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-2'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'formes',
      label: 'Formes à reconnaître',
      items: [
        { nom: 'quotientPolynome', label: "u'/u avec u polynomiale" },
        { nom: 'quotientTrigo', label: "u'/u avec u trigonométrique" },
        {
          nom: 'quotientExpLn',
          label: "u'/u avec u = exp ou ln",
        },
        { nom: 'exponentielle', label: "u' exp(u)" },
        { nom: 'puissanceLn', label: "u' u^n avec u = ln" },
        { nom: 'puissanceExp', label: "u' u^n avec u = exp" },
        { nom: 'base', label: 'Exponentielle de base a' },
      ],
    },
  ],
}

const frac = (num: number, den = 1) => new FractionEtendue(num, den).simplifie()

const E = '\\mathrm{e}'

/** λ devant une expression dans une réécriture : « \dfrac{3}{2}\times\dfrac{2x}{…} », « -… ». */
function fois(lambda: FractionEtendue, expr: string): string {
  const facteur = expr.startsWith('-') ? `\\left(${expr}\\right)` : expr
  if (lambda.valeurDecimale === 1) return expr
  if (lambda.valeurDecimale === -1) return `-${facteur}`
  return `${lambda.texFractionSimplifiee}\\times ${facteur}`
}

/** λ collé devant \ln, \mathrm{e} ou une parenthèse : « \dfrac{3}{2}\ln(…) », « -\ln(…) ». */
function devant(lambda: FractionEtendue, expr: string): string {
  if (lambda.valeurDecimale === 1) return expr
  if (lambda.valeurDecimale === -1) return `-${expr}`
  // Deux fractions accolées se liraient mal : « \dfrac{3}{2}\times\dfrac{u'}{u} ».
  if (expr.startsWith('\\dfrac'))
    return `${lambda.texFractionSimplifiee}\\times ${expr}`
  return `${lambda.texFractionSimplifiee}${expr}`
}

/** Fraction m·num/den avec le signe sorti : « -\dfrac{3x}{x^{2}+5} ». */
function fraction(m: number, num: string, den: string): string {
  const signe = m < 0 ? '-' : ''
  // Sans facteur x ni exponentielle, le numérateur 1 doit rester écrit.
  const coefficient = num === '' ? String(Math.abs(m)) : rienSi1(Math.abs(m))
  return `${signe}\\dfrac{${coefficient}${num}}{${den}}`
}

type Forme = 'quotient' | 'exponentielle' | 'puissance' | 'base'

type Famille =
  | 'quotientPolynome'
  | 'quotientTrigo'
  | 'quotientExpLn'
  | 'exponentielle'
  | 'puissanceLn'
  | 'puissanceExp'
  | 'base'

type Tirage = {
  forme: Forme
  fTex: string
  /** null lorsque f est définie sur ℝ. */
  intervalleTex: string | null
  /** Intervalle fini inclus dans I, pour comparer la saisie numériquement. */
  echantillon: [number, number]
  uTex: string
  upTex: string
  lambda: FractionEtendue
  /** f réécrite sans λ, avec u et u' explicites. */
  reecritureTex: string
  /** Pourquoi on se place sur I : là où f n'est pas définie. */
  pourquoiI?: string
  /** Pour u'/u : signe de u sur I, et -u(x) développé quand u < 0. */
  justification?: string
  moinsU?: string
  /** Pour u'u^n : l'exposant n. */
  n?: number
  /** Pour a^(kx) : le coefficient λ, irrationnel. */
  lambdaTex?: string
  FTex: string
  trigo?: boolean
}

// ---------- u'/u ----------

function quotientAffine(): Tirage {
  const a = choice([-4, -3, -2, -1, 1, 2, 3, 4])
  // Avec une pente négative, la constante est positive et écrite en tête : « 3-2x ».
  const b =
    a < 0 ? randint(1, 6) : choice([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  const c = choice([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  if (c === a) return quotientAffine()
  const u = a < 0 ? `${b}-${rienSi1(-a)}x` : reduireAxPlusB(a, b)
  const moinsU =
    a > 0 && b < 0 ? `${-b}-${rienSi1(a)}x` : reduireAxPlusB(-a, -b)
  const racine = frac(-b, a)
  const r = racine.valeurDecimale
  const rTex = racine.texFractionSimplifiee
  // À droite de sa racine, u a le signe de a.
  const droite = choice([true, false])
  const negatif = droite !== a > 0
  return {
    forme: 'quotient',
    fTex: fraction(c, '', u),
    intervalleTex: droite
      ? `\\left]${rTex};+\\infty\\right[`
      : `\\left]-\\infty;${rTex}\\right[`,
    echantillon: droite ? [r + 0.2, r + 5] : [r - 5, r - 0.2],
    uTex: u,
    upTex: String(a),
    lambda: frac(c, a),
    reecritureTex: `\\dfrac{${a}}{${u}}`,
    pourquoiI: `$f$ n'est pas définie en $x=${rTex}$, où $u$ s'annule`,
    justification: `Pour $x\\in I$, on a $x${droite ? '>' : '<'}${rTex}$, donc $u(x)${negatif ? '<' : '>'}0$`,
    moinsU: negatif ? moinsU : undefined,
    FTex: devant(frac(c, a), `\\ln\\left(${negatif ? moinsU : u}\\right)`),
  }
}

/** Facteur x - r : « x », « (x-2) », « (x+3) ». */
const facteur = (r: number) => (r === 0 ? 'x' : `(x${ecritureAlgebrique(-r)})`)

/** u = (x-p)(x-q) développé, sur l'un des trois intervalles délimités par ses racines. */
function quotientRacines(): Tirage {
  const p = randint(-4, 3)
  const q = randint(p + 1, 4)
  const somme = p + q
  const g = somme % 2 === 0 ? 2 : 1
  const s = choice([-3, -2, -1, 1, 2, 3])
  if (s === g) return quotientRacines()
  const u = new Polynome({ coeffs: [p * q, -somme, 1] }).toLatex()
  const moinsU = new Polynome({ coeffs: [-p * q, somme, -1] }).toLatex()
  const up = new Polynome({ coeffs: [-somme, 2] }).toLatex()
  const numerateur = new Polynome({
    coeffs: [(-s * somme) / g, (2 * s) / g],
  }).toLatex()
  const zone = choice(['gauche', 'milieu', 'droite'])
  const negatif = zone === 'milieu'
  return {
    forme: 'quotient',
    fTex: `\\dfrac{${numerateur}}{${u}}`,
    intervalleTex:
      zone === 'gauche'
        ? `\\left]-\\infty;${p}\\right[`
        : zone === 'milieu'
          ? `\\left]${p};${q}\\right[`
          : `\\left]${q};+\\infty\\right[`,
    echantillon:
      zone === 'gauche'
        ? [p - 4, p - 0.2]
        : zone === 'milieu'
          ? [p + 0.1, q - 0.1]
          : [q + 0.2, q + 4],
    uTex: u,
    upTex: up,
    lambda: frac(s, g),
    reecritureTex: `\\dfrac{${up}}{${u}}`,
    pourquoiI: `$f$ n'est pas définie en $x=${p}$ et en $x=${q}$, où $u$ s'annule`,
    justification: `On a $u(x)=${facteur(p)}${facteur(q)}$, de coefficient dominant positif : $u$ est ${negatif ? 'négatif entre' : 'positif en dehors de'} ses racines $${p}$ et $${q}$, donc $u(x)${negatif ? '<' : '>'}0$ pour $x\\in I$`,
    moinsU: negatif ? moinsU : undefined,
    FTex: devant(frac(s, g), `\\ln\\left(${negatif ? moinsU : u}\\right)`),
  }
}

function quotientCarre(): Tirage {
  const c = randint(1, 9)
  const k = choice([-6, -5, -4, -3, -1, 1, 3, 4, 5, 6])
  const u = `x^{2}+${c}`
  return {
    forme: 'quotient',
    fTex: fraction(k, 'x', u),
    intervalleTex: null,
    echantillon: [-3, 3],
    uTex: u,
    upTex: '2x',
    lambda: frac(k, 2),
    reecritureTex: `\\dfrac{2x}{${u}}`,
    justification: `Pour tout réel $x$, $u(x)\\geqslant ${c}>0$`,
    FTex: devant(frac(k, 2), `\\ln\\left(${u}\\right)`),
  }
}

/** αx² + βx + γ de discriminant négatif ; le numérateur est un multiple entier de u'/pgcd. */
function quotientTrinome(): Tirage {
  const alpha = randint(1, 3)
  const beta = choice([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  const gamma = Math.floor((beta * beta) / (4 * alpha)) + randint(1, 4)
  const delta = beta * beta - 4 * alpha * gamma
  const pgcd = (x: number, y: number): number => (y === 0 ? x : pgcd(y, x % y))
  const g = pgcd(2 * alpha, Math.abs(beta))
  const s = choice([-3, -2, -1, 1, 2, 3])
  if (s === g) return quotientTrinome()
  const u = new Polynome({ coeffs: [gamma, beta, alpha] }).toLatex()
  const up = new Polynome({ coeffs: [beta, 2 * alpha] }).toLatex()
  const numerateur = new Polynome({
    coeffs: [(s * beta) / g, (s * 2 * alpha) / g],
  }).toLatex()
  return {
    forme: 'quotient',
    fTex: `\\dfrac{${numerateur}}{${u}}`,
    intervalleTex: null,
    echantillon: [-3, 3],
    uTex: u,
    upTex: up,
    lambda: frac(s, g),
    reecritureTex: `\\dfrac{${up}}{${u}}`,
    justification: `Le discriminant de $u$ vaut $\\Delta=${delta}<0$ et son coefficient dominant est positif, donc $u(x)>0$ pour tout réel $x$`,
    FTex: devant(frac(s, g), `\\ln\\left(${u}\\right)`),
  }
}

function quotientExponentielle(): Tirage {
  const k = randint(1, 2)
  const p = randint(1, 3)
  const c = randint(1, 9)
  const m = randint(1, 6)
  const ekx = `${E}^{${k === 1 ? '' : k}x}`
  const u = choice([true, false])
    ? `${rienSi1(p)}${ekx}+${c}`
    : `${c}+${rienSi1(p)}${ekx}`
  return {
    forme: 'quotient',
    fTex: fraction(m, ekx, u),
    intervalleTex: null,
    echantillon: [-2, 2],
    uTex: u,
    upTex: `${rienSi1(p * k)}${ekx}`,
    lambda: frac(m, p * k),
    reecritureTex: `\\dfrac{${rienSi1(p * k)}${ekx}}{${u}}`,
    justification: `Pour tout réel $x$, $${ekx}>0$, donc $u(x)>0$`,
    FTex: devant(frac(m, p * k), `\\ln\\left(${u}\\right)`),
  }
}

function quotientTrigo(): Tirage {
  const k = randint(1, 3)
  const cas = choice(['tan', 'unMoinsCos', 'cPlusSin'])
  if (cas === 'tan')
    return {
      forme: 'quotient',
      fTex: `\\dfrac{${rienSi1(k)}\\sin(x)}{\\cos(x)}`,
      intervalleTex: '\\left]-\\dfrac{\\pi}{2};\\dfrac{\\pi}{2}\\right[',
      echantillon: [-1.4, 1.4],
      uTex: '\\cos(x)',
      upTex: '-\\sin(x)',
      lambda: frac(-k),
      reecritureTex: '\\dfrac{-\\sin(x)}{\\cos(x)}',
      pourquoiI:
        "$f$ n'est pas définie là où $\\cos(x)=0$, par exemple en $-\\dfrac{\\pi}{2}$ et en $\\dfrac{\\pi}{2}$",
      justification: 'Pour $x\\in I$, $u(x)=\\cos(x)>0$',
      FTex: devant(frac(-k), '\\ln\\left(\\cos(x)\\right)'),
      trigo: true,
    }
  if (cas === 'unMoinsCos')
    return {
      forme: 'quotient',
      fTex: `\\dfrac{${rienSi1(k)}\\sin(x)}{1-\\cos(x)}`,
      intervalleTex: '\\left]0;2\\pi\\right[',
      echantillon: [0.2, 6],
      uTex: '1-\\cos(x)',
      upTex: '\\sin(x)',
      lambda: frac(k),
      reecritureTex: '\\dfrac{\\sin(x)}{1-\\cos(x)}',
      pourquoiI:
        "$f$ n'est pas définie là où $\\cos(x)=1$, par exemple en $0$ et en $2\\pi$",
      justification: 'Pour $x\\in I$, $\\cos(x)<1$, donc $u(x)>0$',
      FTex: devant(frac(k), '\\ln\\left(1-\\cos(x)\\right)'),
      trigo: true,
    }
  const c = randint(2, 3)
  return {
    forme: 'quotient',
    fTex: `\\dfrac{${rienSi1(k)}\\cos(x)}{${c}+\\sin(x)}`,
    intervalleTex: null,
    echantillon: [-3, 3],
    uTex: `${c}+\\sin(x)`,
    upTex: '\\cos(x)',
    lambda: frac(k),
    reecritureTex: `\\dfrac{\\cos(x)}{${c}+\\sin(x)}`,
    justification: `Pour tout réel $x$, $\\sin(x)\\geqslant -1$, donc $u(x)\\geqslant ${c - 1}>0$`,
    FTex: devant(frac(k), `\\ln\\left(${c}+\\sin(x)\\right)`),
    trigo: true,
  }
}

function quotientLn(): Tirage {
  const c = randint(1, 3)
  const m = randint(1, 4)
  const u = `${c}+\\ln(x)`
  return {
    forme: 'quotient',
    fTex: `\\dfrac{${m}}{x\\left(${u}\\right)}`,
    intervalleTex: `\\left]${E}^{-${c}};+\\infty\\right[`,
    echantillon: [Math.exp(-c) + 0.1, 6],
    uTex: u,
    upTex: '\\dfrac{1}{x}',
    lambda: frac(m),
    reecritureTex: `\\dfrac{\\frac{1}{x}}{${u}}`,
    pourquoiI: `$f$ n'est définie que si $x>0$ et $${u}\\neq 0$, c'est-à-dire $x\\neq ${E}^{-${c}}$`,
    justification: `Pour $x\\in I$, $x>${E}^{-${c}}$, donc $\\ln(x)>-${c}$ et $u(x)>0$`,
    FTex: devant(frac(m), `\\ln\\left(${u}\\right)`),
  }
}

// ---------- u' e^u ----------

function exponentielleAffine(): Tirage {
  const a = choice([-4, -3, -2, 2, 3, 4])
  const b = randint(-5, 5)
  const m = choice([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  if (m === a) return exponentielleAffine()
  const u = reduireAxPlusB(a, b)
  return {
    forme: 'exponentielle',
    fTex: `${rienSi1(m)}${E}^{${u}}`,
    intervalleTex: null,
    echantillon: [-2, 2],
    uTex: u,
    upTex: String(a),
    lambda: frac(m, a),
    reecritureTex: `${a}${E}^{${u}}`,
    FTex: devant(frac(m, a), `${E}^{${u}}`),
  }
}

function exponentielleMonome(): Tirage {
  const n = randint(2, 3)
  const a = choice([-2, -1, 1, 2])
  const b = randint(-2, 2)
  const m = choice([-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6])
  if (m === n * a) return exponentielleMonome()
  const coeffs = [b, 0, 0, 0].slice(0, n + 1)
  coeffs[n] = a
  const u = new Polynome({ coeffs }).toLatex()
  const xPuissance = n === 2 ? 'x' : 'x^{2}'
  return {
    forme: 'exponentielle',
    fTex: `${rienSi1(m)}${xPuissance}${E}^{${u}}`,
    intervalleTex: null,
    echantillon: [-1.5, 1.5],
    uTex: u,
    upTex: `${rienSi1(n * a)}${xPuissance}`,
    lambda: frac(m, n * a),
    reecritureTex: `${rienSi1(n * a)}${xPuissance}${E}^{${u}}`,
    FTex: devant(frac(m, n * a), `${E}^{${u}}`),
  }
}

function exponentielleAutre(): Tirage {
  const m = randint(1, 4)
  const cas = choice(['sin', 'cos', 'racine', 'inverse'])
  if (cas === 'sin')
    return {
      forme: 'exponentielle',
      fTex: `${rienSi1(m)}\\cos(x)${E}^{\\sin(x)}`,
      intervalleTex: null,
      echantillon: [-3, 3],
      uTex: '\\sin(x)',
      upTex: '\\cos(x)',
      lambda: frac(m),
      reecritureTex: `\\cos(x)${E}^{\\sin(x)}`,
      FTex: devant(frac(m), `${E}^{\\sin(x)}`),
      trigo: true,
    }
  if (cas === 'cos')
    return {
      forme: 'exponentielle',
      fTex: `${rienSi1(m)}\\sin(x)${E}^{\\cos(x)}`,
      intervalleTex: null,
      echantillon: [-3, 3],
      uTex: '\\cos(x)',
      upTex: '-\\sin(x)',
      lambda: frac(-m),
      reecritureTex: `\\left(-\\sin(x)\\right)${E}^{\\cos(x)}`,
      FTex: devant(frac(-m), `${E}^{\\cos(x)}`),
      trigo: true,
    }
  if (cas === 'racine')
    return {
      forme: 'exponentielle',
      fTex: `\\dfrac{${rienSi1(m)}${E}^{\\sqrt{x}}}{\\sqrt{x}}`,
      intervalleTex: '\\left]0;+\\infty\\right[',
      echantillon: [0.3, 5],
      uTex: '\\sqrt{x}',
      upTex: '\\dfrac{1}{2\\sqrt{x}}',
      lambda: frac(2 * m),
      reecritureTex: `\\dfrac{1}{2\\sqrt{x}}${E}^{\\sqrt{x}}`,
      pourquoiI: "$f$ n'est définie que pour $x>0$",
      FTex: devant(frac(2 * m), `${E}^{\\sqrt{x}}`),
    }
  return {
    forme: 'exponentielle',
    fTex: `\\dfrac{${rienSi1(m)}${E}^{1/x}}{x^{2}}`,
    intervalleTex: '\\left]0;+\\infty\\right[',
    echantillon: [0.4, 5],
    uTex: '\\dfrac{1}{x}',
    upTex: '-\\dfrac{1}{x^{2}}',
    lambda: frac(-m),
    reecritureTex: `\\left(-\\dfrac{1}{x^{2}}\\right)${E}^{1/x}`,
    pourquoiI: "$f$ n'est pas définie en $0$",
    FTex: devant(frac(-m), `${E}^{1/x}`),
  }
}

// ---------- u' u^n ----------

/** u^n écrit à la manière du cours : ln^{3}(x), (e^x+2)^{3}. */
function puissanceTex(u: string, n: number, estLn: boolean): string {
  if (estLn) return n === 1 ? '\\ln(x)' : `\\ln^{${n}}(x)`
  return n === 1 ? `\\left(${u}\\right)` : `\\left(${u}\\right)^{${n}}`
}

function puissance(cas: 'ln' | 'lnInverse' | 'cPlusLn' | 'exp'): Tirage {
  if (cas === 'ln') {
    const n = randint(1, 4)
    const m = randint(1, 5)
    const lambda = frac(m, n + 1)
    return {
      forme: 'puissance',
      fTex: `\\dfrac{${rienSi1(m)}${puissanceTex('', n, true)}}{x}`,
      intervalleTex: '\\left]0;+\\infty\\right[',
      echantillon: [0.3, 5],
      uTex: '\\ln(x)',
      upTex: '\\dfrac{1}{x}',
      lambda: frac(m),
      n,
      reecritureTex: `\\dfrac{1}{x}${puissanceTex('', n, true)}`,
      pourquoiI: "$\\ln(x)$ n'est défini que pour $x>0$",
      FTex: devant(lambda, puissanceTex('', n + 1, true)),
    }
  }
  if (cas === 'lnInverse') {
    const m = randint(1, 5)
    return {
      forme: 'puissance',
      fTex: `\\dfrac{${m}}{x\\ln^{2}(x)}`,
      intervalleTex: '\\left]1;+\\infty\\right[',
      echantillon: [1.3, 6],
      uTex: '\\ln(x)',
      upTex: '\\dfrac{1}{x}',
      lambda: frac(m),
      n: -2,
      reecritureTex: '\\dfrac{1}{x}\\left(\\ln(x)\\right)^{-2}',
      pourquoiI:
        "$f$ n'est définie que si $x>0$ et $\\ln(x)\\neq 0$, c'est-à-dire $x\\neq 1$",
      FTex: `-\\dfrac{${m}}{\\ln(x)}`,
    }
  }
  if (cas === 'cPlusLn') {
    const c = randint(1, 5)
    const u = `${c}+\\ln(x)`
    return {
      forme: 'puissance',
      fTex: `\\dfrac{${u}}{x}`,
      intervalleTex: '\\left]0;+\\infty\\right[',
      echantillon: [0.3, 5],
      uTex: u,
      upTex: '\\dfrac{1}{x}',
      lambda: frac(1),
      n: 1,
      reecritureTex: `\\dfrac{1}{x}\\left(${u}\\right)`,
      pourquoiI: "$\\ln(x)$ n'est défini que pour $x>0$",
      FTex: `\\dfrac{1}{2}\\left(${u}\\right)^{2}`,
    }
  }
  const n = randint(2, 3)
  const c = randint(1, 5)
  const m = randint(1, 4)
  const u = `${E}^{x}+${c}`
  return {
    forme: 'puissance',
    fTex: `${rienSi1(m)}\\left(${u}\\right)^{${n}}${E}^{x}`,
    intervalleTex: null,
    echantillon: [-2, 1.5],
    uTex: u,
    upTex: `${E}^{x}`,
    lambda: frac(m),
    n,
    reecritureTex: `${E}^{x}\\left(${u}\\right)^{${n}}`,
    FTex: devant(frac(m, n + 1), `\\left(${u}\\right)^{${n + 1}}`),
  }
}

// ---------- a^(kx) ----------

function base(): Tirage {
  const a = choice([2, 3, 5, 10])
  const k = randint(1, 5)
  const m = randint(1, 4)
  const kx = `${rienSi1(k)}x`
  const kLn = `${rienSi1(k)}\\ln(${a})`
  return {
    forme: 'base',
    fTex: `${m === 1 ? '' : `${m}\\times `}${a}^{${kx}}`,
    intervalleTex: null,
    echantillon: [-1, 1],
    uTex: `${kLn}\\,x`,
    upTex: kLn,
    lambda: frac(m),
    reecritureTex: `${a}^{${kx}}=${E}^{${kLn}\\,x}`,
    lambdaTex: `\\dfrac{${m}}{${kLn}}`,
    FTex: `\\dfrac{${m === 1 ? '' : `${m}\\times `}${a}^{${kx}}}{${kLn}}`,
  }
}

const TIRAGES: Record<Famille, (() => Tirage)[]> = {
  quotientPolynome: [
    quotientAffine,
    quotientRacines,
    quotientCarre,
    quotientTrinome,
  ],
  quotientTrigo: [quotientTrigo],
  quotientExpLn: [quotientExponentielle, quotientLn],
  exponentielle: [exponentielleAffine, exponentielleMonome, exponentielleAutre],
  puissanceLn: [
    () => puissance('ln'),
    () => puissance('lnInverse'),
    () => puissance('cPlusLn'),
  ],
  puissanceExp: [() => puissance('exp')],
  base: [base],
}

function correction(t: Tirage): string {
  const surI = t.intervalleTex == null ? '' : ' sur $I$'
  // Les élèves s'inquiètent de I : rappeler en une phrase d'où il vient.
  const pourquoi =
    t.pourquoiI == null
      ? ''
      : `Pourquoi $I$ ? ${t.pourquoiI} : on cherche une primitive sur un intervalle où $f$ est définie.${t.forme === 'quotient' ? " Comme $u$ est continue et ne s'annule pas sur $I$, elle y garde un signe constant." : ''}<br>`
  const F = `$F(x)=${miseEnEvidence(t.FTex)}$`
  if (t.forme === 'base')
    return (
      `Pour tout réel $x$, $${t.reecritureTex}$. On pose $u(x)=${t.uTex}$, d'où $u'(x)=${t.upTex}$ et ` +
      `$f(x)=${t.lambdaTex}\\times ${t.upTex}\\,${E}^{u(x)}$, de la forme $${t.lambdaTex}\\,u'${E}^{u}$.<br>` +
      `Une primitive de $f$ est $F(x)=${t.lambdaTex}\\,${E}^{u(x)}$, soit ${F}.`
    )
  const pose = `On pose $u(x)=${t.uTex}$, d'où $u'(x)=${t.upTex}$ et $f(x)=${fois(t.lambda, t.reecritureTex)}$`
  if (t.forme === 'quotient')
    return (
      pourquoi +
      `${pose}, de la forme $${devant(t.lambda, "\\dfrac{u'}{u}")}$.<br>` +
      `Une primitive de $f$${surI} est $F(x)=${devant(t.lambda, '\\ln\\left|u(x)\\right|')}$. ` +
      `${t.justification}, d'où $\\left|u(x)\\right|=${t.moinsU == null ? 'u(x)' : `-u(x)=${t.moinsU}`}$ et ${F}.`
    )
  if (t.forme === 'exponentielle')
    return (
      pourquoi +
      `${pose}, de la forme $${devant(t.lambda, `u'${E}^{u}`)}$.<br>` +
      `Une primitive de $f$${surI} est $F(x)=${devant(t.lambda, `${E}^{u(x)}`)}$, soit ${F}.`
    )
  const n = t.n ?? 1
  const primitiveU =
    n === -2 ? '-\\dfrac{1}{u(x)}' : `\\dfrac{u(x)^{${n + 1}}}{${n + 1}}`
  return (
    pourquoi +
    `${pose}, de la forme $${devant(t.lambda, n === 1 ? "u'u" : `u'u^{${n}}`)}$.<br>` +
    `Une primitive de $f$${surI} est $F(x)=${fois(t.lambda, primitiveU)}$, soit ${F}.`
  )
}

/** @author Nathan Scheinmann */
export default class PrimitivesLnExp extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacingCorr = 2
    this.besoinFormulaireComplexe = formulaire
    this.sup = serialiseFormulaireComplexe(
      formulaire,
      valeursParDefaut(formulaire),
    )
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(formulaire, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('formes')),
      this.nbQuestions,
      shuffle(params.declares('formes')),
    ) as Famille[]
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const t = choice(TIRAGES[familles[i]])()
      if (!this.questionJamaisPosee(i, t.fTex, t.intervalleTex ?? '')) continue
      let texte =
        t.intervalleTex == null
          ? `Soit $f\\colon\\mathbb{R}\\to\\mathbb{R}$ la fonction définie par $f(x)=${t.fTex}$. Déterminer une primitive $F$ de $f$.`
          : `Soit $f\\colon I\\to\\mathbb{R}$ avec $I=${t.intervalleTex}$ la fonction définie par $f(x)=${t.fTex}$. Déterminer une primitive $F$ de $f$ sur $I$.`
      if (this.interactif)
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            i,
            t.trigo
              ? KeyboardType.clavierFonctionsTerminalesTrigo
              : KeyboardType.clavierFonctionsTerminales,
            {
              texteAvant: '$F(x)=$',
              // Le clavier n'a pas de valeur absolue : on l'ajoute pour écrire ln|u|.
              dataKeys:
                t.forme === 'quotient' ? ['\\left|#0\\right|'] : undefined,
            },
          )
      // Toute primitive est acceptée : la saisie doit différer de la réponse d'une constante.
      handleAnswers(this, i, {
        reponse: {
          value: t.FTex,
          compare: seq([
            samePrimitiveUpToConstant({
              domaine: t.echantillon,
              constant: 'C',
            }),
          ]),
        },
      })
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = correction(t)
      i++
    }
    listeQuestionsToContenu(this)
  }
}
