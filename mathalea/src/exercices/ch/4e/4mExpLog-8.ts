import { cercle } from '../../../lib/2d/cercle'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { addTableauSignesVariations } from '../../../lib/customElements/TableauSignesVariationsElement'
import { createList } from '../../../lib/format/lists'
import {
  lireFormulaireComplexe,
  repartitionPonderee,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../../lib/formulaireComplexe'
import {
  all,
  isEqual,
  sameEquationSet,
  sameExpressionList,
  sameFunction,
  sameInterval,
  seq,
} from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { troisPointsProportionnels } from '../../../lib/interactif/fonctionsBaremes'
import {
  createSubQuestions,
  type SubQuestion,
} from '../../../lib/interactif/subQuestions'
import {
  celluleSigne,
  colonne,
  ligneSigne,
} from '../../../lib/interactif/tableauSignesVariations/helpers'
import type { TableauSVConfig } from '../../../lib/interactif/tableauSignesVariations/types'
import { tableauDeVariation } from '../../../lib/mathFonctions/etudeFonction'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Étudier complètement une fonction avec le logarithme'
export const dateDePublication = '02/11/2026'
export const dateDeModifImportante = '05/11/2026'
export const uuid = '60d2c'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['4mExpLog-8'] }

const formulaire: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'difference', label: 'Différence ln(x² + c) - ln(x - b)' },
        { nom: 'quotient', label: 'Quotient (a + b ln(x)) / xⁿ' },
        { nom: 'produit', label: 'Produit xⁿ (a + b ln(x))' },
        {
          nom: 'quotientAffine',
          label: 'Quotient (a + b ln(kx + d)) / (kx + d)ⁿ',
        },
      ],
    },
  ],
}

/** Familles dont l'équation f(x) = 0 ne se résout pas algébriquement (4mExpLog-9). */
export const formulaireZerosApproches: FormulaireComplexe = {
  champs: [
    {
      type: 'listePonderee',
      nom: 'familles',
      label: 'Familles de fonctions',
      items: [
        { nom: 'somme', label: 'Somme ax + b + k ln(x)' },
        { nom: 'trinome', label: 'Somme k ln(x² + c) - x, définie sur R' },
      ],
    },
  ],
}

/** Fin du commentaire « En savoir plus », commune à 4mExpLog-8 et 4mExpLog-9. */
export const COMMENTAIRE_INTERACTIF =
  "En mode interactif, les asymptotes se donnent comme une liste d'équations séparées par des points-virgules (∅ s'il n'y en a pas), et les extrema par la liste de leurs abscisses et celle de leurs valeurs. " +
  "Le tableau de signes de f part des seuls bords du domaine : l'élève ajoute une colonne par zéro, puis complète antécédents, signes et zéros de chaque ligne."

type Famille =
  'difference' | 'quotient' | 'produit' | 'somme' | 'trinome' | 'quotientAffine'
type F = FractionEtendue

type Extremum = {
  x: string
  y: string
  xNum: number
  yNum: number
  nature: 'maximum' | 'minimum'
}

/** Comportement de f en un bord du domaine. */
type Bord = {
  /** Ce vers quoi tend x : `1^{+}`, `+\infty`… */
  borne: string
  /** Valeur de la borne pour le tableau : `1`, `-\infty`, `+\infty`. */
  valeur: string
  /** Le bord est une valeur interdite (double barre dans le tableau). */
  interdit: boolean
  limite: string
  redaction: string
}

/** Facteur du tableau de signes de f, avec une fonction pour lire son signe. */
type Facteur = { label: string; fNum: (x: number) => number }

type Etude = {
  f: string
  fNum: (x: number) => number
  domaine: string
  domaineCorr: string
  gauche: Bord
  droite: Bord
  asymptotes: string[]
  asymptotesCorr: string
  derivee: string
  deriveeCalcul: string
  signeCorr: string
  /** Signes de f' sur chaque intervalle entre les bords et les extrema. */
  signes: ('+' | '-')[]
  extrema: Extremum[]
  /** Asymptote verticale éventuelle, tracée en traitillés. */
  pole?: number
  /** Écriture exacte d'une abscisse d'asymptote rationnelle. */
  poleTex?: string
  /** Asymptotes horizontales ou obliques y = mx + p, tracées en traitillés. */
  droites?: { m: number; p: number }[]
  /** Bord gauche fini du domaine, pour commencer le tracé. */
  debut?: number
  /** Intervalle inclus dans le domaine, pour comparer la dérivée saisie. */
  echantillon: [number, number]
  /** f(0) : calcul et valeur exacte ; absent quand 0 n'est pas dans le domaine. */
  ordonnee?: { calcul: string; valeur: string }
  /** Zéros exacts et leur recherche ; absent quand f(x) = 0 ne se résout pas algébriquement. */
  zeros?: { tex: string[]; num: number[]; redaction: string }
  /** Facteurs du tableau de signes, au-dessus de la ligne de f. */
  facteurs?: Facteur[]
  /** Justification du signe de f, pour les familles à zéros exacts. */
  signeFCorr?: string
}

const E = '\\mathrm{e}'
const plusInf = '+\\infty'
const moinsInf = '-\\infty'
const infini = (positif: boolean) => (positif ? plusInf : moinsInf)
const frac = (n: number, d = 1): F => new FractionEtendue(n, d).simplifie()
const tex = (q: F): string => q.texFractionSimplifiee
const lim = (borne: string) => `\\lim_{x\\to ${borne}}`
const intervalle = (a: string, b: string, fermeA = false) =>
  `${fermeA ? '[' : ']'}${a};${b}[`
const affiche = (intervalleTex: string) =>
  intervalleTex
    .replace(/^\]/, '\\left]')
    .replace(/^\[/, '\\left[')
    .replace(/\[$/, '\\right[')

/** Formule sur sa propre ligne. En Typst, une fraction en début de ligne décale la ligne de base. */
const bloc = (contenu: string) =>
  context.isTypst ? `$$${contenu}$$` : `<br>$${contenu}$<br>`
const aligne = (lignes: string[]) =>
  bloc(`\\begin{aligned}${lignes.join('\\\\')}\\end{aligned}`)
/** Une phrase (le théorème utilisé), puis les limites obtenues, alignées. */
const rediger = (...etapes: [string, string[]][]) =>
  etapes.map(([texte, lignes]) => `${texte}${aligne(lignes)}`).join('')

/** e^L avec L entier ou demi-entier, exposant en ligne (lisible en Typst). */
function expTex(L: F): string {
  if (L.num === 0) return '1'
  if (L.den === 1) return L.num === 1 ? E : `${E}^{${L.num}}`
  return `${E}^{${L.num}/${L.den}}`
}

/** t = x - c, écrit x quand c = 0. */
const tTex = (c: number) => (c === 0 ? 'x' : reduireAxPlusB(1, -c))
const tPar = (c: number) => (c === 0 ? 'x' : `(${tTex(c)})`)
const puissanceT = (c: number, n: number) =>
  n === 1 ? tTex(c) : `${tPar(c)}^{${n}}`
const lnT = (c: number) => `\\ln(${tTex(c)})`
/** Condition t > 0, écrite x > 0 quand c = 0. */
const conditionT = (c: number) =>
  c === 0 ? '$x>0$' : `$${tTex(c)}>0\\iff x>${c}$`
/** a + b ln(t), sans terme nul. */
function affineLn(
  a: number,
  b: number,
  c: number,
  logarithme = lnT(c),
): string {
  const terme = `${rienSi1(Math.abs(b))}${logarithme}`
  if (a === 0) return `${b < 0 ? '-' : ''}${terme}`
  return `${a}${b < 0 ? '-' : '+'}${terme}`
}
/** c + e^L, écrit e^L + c. */
const abscisseTex = (c: number, L: F) =>
  L.num === 0
    ? `${c + 1}`
    : `${expTex(L)}${c === 0 ? '' : ecritureAlgebrique(c)}`
/** Produit coefficient × e^L, par exemple -\dfrac{1}{2}e^{-1}. */
function produitExpTex(coef: F, L: F): string {
  if (L.num === 0) return tex(coef)
  const absolu = frac(Math.abs(coef.num), coef.den)
  const devant = absolu.num === 1 && absolu.den === 1 ? '' : tex(absolu)
  return `${coef.num < 0 ? '-' : ''}${devant}${expTex(L)}`
}

/**
 * Zéro et signe de a + b ln(u), avec u l'argument du logarithme : ln(u) = -a/b,
 * puis u = e^(-a/b), puis x. `L0` vaut -a/b et `xTex` est le zéro.
 */
function affineLnZeroSigne(
  num: string,
  ln: string,
  u: string,
  b: number,
  L0: F,
  xTex: string,
): { zero: string[]; signe: string[] } {
  const sens = b > 0 ? '>' : '<'
  return {
    zero: [
      `f(x)=0&\\iff ${num}=0`,
      `&\\iff ${ln}=${tex(L0)}`,
      `&\\iff ${u}=${expTex(L0)}`,
      ...(u === 'x' ? [] : [`&\\iff x=${xTex}`]),
    ],
    signe: [`${num}>0&\\iff ${ln}${sens}${tex(L0)}`, `&\\iff x${sens}${xTex}`],
  }
}

/** Extremum lisible sur le graphique : pas collé au bord du domaine, valeur modérée. */
const lisible = (ecartAuBord: number, valeur: number) =>
  ecartAuBord >= 0.3 && ecartAuBord <= 8 && Math.abs(valeur) <= 5

/** Exposant fractionnaire en \frac : dans le tableau, la barre oblique sépare les valeurs. */
const pourTableau = (t: string) =>
  t.replace(/\^\{(-?)(\d+)\/(\d+)\}/g, '^{$1\\frac{$2}{$3}}')

/** Largeur estimée en pixels d'une valeur du tableau, pour que les flèches ne la recouvrent pas. */
const largeur = (t: string) =>
  Math.max(
    15,
    5 *
      t.replace(/\\(mathrm|left|right|dfrac|frac)/g, '').replace(/[{}\\^]/g, '')
        .length,
  )

/** Phrase sur le sens de variation et l'extremum. */
const natureExtremum = (signeAvant: '+' | '-') =>
  signeAvant === '+' ? 'maximum' : 'minimum'

/** ln(x² + C) - ln(x - b), avec b² + C = s² : f' a pour racine b + s. */
function tirerDifference(): Etude {
  const s = randint(2, 4)
  const b = randint(-(s - 1), s - 1)
  const C = s * s - b * b
  const signe = choice([1, -1])
  const x0 = b + s
  const x1 = b - s
  const carre = `x^2+${C}`
  const lin = reduireAxPlusB(1, -b)
  const lnCarre = `\\ln(${carre})`
  const lnLin = `\\ln(${lin})`
  const denominateur = b === 0 ? `x(${carre})` : `(${carre})(${lin})`
  const deuxXFois = b === 0 ? '2x\\cdot x' : `2x(${lin})`
  const f = signe === 1 ? `${lnCarre}-${lnLin}` : `${lnLin}-${lnCarre}`
  const fNum = (x: number) => signe * (Math.log(x * x + C) - Math.log(x - b))
  const domaine = intervalle(`${b}`, plusInf)
  const facteurs = `(${reduireAxPlusB(1, -x0)})(${reduireAxPlusB(1, -x1)})`
  const deriveeNum = signe === 1 ? facteurs : `-${facteurs}`
  const derivee = `\\dfrac{${deriveeNum}}{${denominateur}}`
  const deriveeCalcul =
    signe === 1
      ? aligne([
          `f'(x)&=\\dfrac{2x}{${carre}}-\\dfrac{1}{${lin}}`,
          `&=\\dfrac{${deuxXFois}-(${carre})}{${denominateur}}`,
          `&=\\dfrac{${reduireAxPolynome(1, -2 * b, -C)}}{${denominateur}}`,
          `&=${derivee}`,
        ])
      : aligne([
          `f'(x)&=\\dfrac{1}{${lin}}-\\dfrac{2x}{${carre}}`,
          `&=\\dfrac{${carre}-${deuxXFois}}{${denominateur}}`,
          `&=\\dfrac{${reduireAxPolynome(-1, 2 * b, C)}}{${denominateur}}`,
          `&=${derivee}`,
        ])
  const signes: ('+' | '-')[] = signe === 1 ? ['-', '+'] : ['+', '-']
  const yTex = `${signe === 1 ? '' : '-'}\\ln(${2 * x0})`
  const L = lim(`${b}^{+}`)
  const Linf = lim(plusInf)
  // f(x) = 0 ⟺ x² - x + (C + b) = 0, de discriminant 1 - 4(C + b) < 0 pour tous les tirages.
  const trinomeZeros = reduireAxPolynome(1, -1, C + b)
  const lnArgument = (num: number, den: number) =>
    den === 1 ? `\\ln(${num})` : `\\ln\\left(${tex(frac(num, den))}\\right)`
  return {
    f,
    fNum,
    domaine,
    ordonnee:
      b < 0
        ? signe === 1
          ? { calcul: `\\ln(${C})-\\ln(${-b})`, valeur: lnArgument(C, -b) }
          : {
              calcul: `\\ln(${-b})-\\ln(${C})`,
              valeur: b === -1 ? `-\\ln(${C})` : lnArgument(-b, C),
            }
        : undefined,
    zeros: {
      tex: [],
      num: [],
      redaction:
        'Comme $\\ln$ est strictement croissante :' +
        aligne([
          `f(x)=0&\\iff ${lnCarre}=${lnLin}`,
          `&\\iff ${carre}=${lin}`,
          `&\\iff ${trinomeZeros}=0`,
        ]) +
        `Le discriminant vaut $\\Delta=1-4\\cdot ${C + b}=${1 - 4 * (C + b)}<0$ : l'équation n'a pas de solution.`,
    },
    signeFCorr: `Pour $x>${b}$, $${trinomeZeros}>0$ (son discriminant est négatif), donc $${carre}>${lin}>0$. Par croissance de $\\ln$, $${lnCarre}>${lnLin}$ : $f(x)${signe === 1 ? '>' : '<'}0$ sur tout le domaine.`,
    domaineCorr: `Le logarithme n'est défini que pour un argument strictement positif. Pour tout réel $x$, $${carre}>0$, et ${b === 0 ? '$x>0$' : `$${lin}>0\\iff x>${b}$`}.`,
    gauche: {
      borne: `${b}^{+}`,
      valeur: `${b}`,
      interdit: true,
      limite: infini(signe === 1),
      redaction: rediger(
        [
          `Par continuité de $\\ln$ en $${C + b * b}$ et par composition, $\\ln$ tendant vers $${moinsInf}$ en $0^{+}$ :`,
          [`${L}${lnCarre}&=\\ln(${C + b * b})`, `${L}${lnLin}&=${moinsInf}`],
        ],
        [
          'Par différence :',
          [`${L}f(x)&=${miseEnEvidence(infini(signe === 1))}`],
        ],
      ),
    },
    droite: {
      borne: plusInf,
      valeur: plusInf,
      interdit: false,
      limite: infini(signe === 1),
      redaction: rediger(
        [
          `La différence donne une forme indéterminée. On écrit $f(x)=${signe === 1 ? '' : '-'}\\ln\\left(\\dfrac{${carre}}{${lin}}\\right)$${b === 0 ? '' : ' et, pour $x>0$, on divise le numérateur et le dénominateur par $x$'} :`,
          b === 0
            ? [
                `\\dfrac{${carre}}{x}&=x+\\dfrac{${C}}{x}`,
                `${Linf}\\left(x+\\dfrac{${C}}{x}\\right)&=${plusInf}`,
              ]
            : [
                `\\dfrac{${carre}}{${lin}}&=\\dfrac{x+\\dfrac{${C}}{x}}{1${ecritureAlgebrique(-b)}\\cdot\\dfrac{1}{x}}`,
                `${Linf}\\left(x+\\dfrac{${C}}{x}\\right)&=${plusInf}`,
                `${Linf}\\left(1${ecritureAlgebrique(-b)}\\cdot\\dfrac{1}{x}\\right)&=1`,
              ],
        ],
        [
          `${b === 0 ? 'Par somme' : 'Par quotient'}, puis par composition, $\\ln$ tendant vers $${plusInf}$ en $${plusInf}$ :`,
          [`${Linf}f(x)&=${miseEnEvidence(infini(signe === 1))}`],
        ],
      ),
    },
    asymptotes: [`x=${b}`],
    asymptotesCorr: `La droite $x=${b}$ est une asymptote verticale. En $${plusInf}$, $f(x)$ tend vers l'infini et $\\dfrac{f(x)}{x}$ tend vers $0$ (croissance comparée) : il n'y a ni asymptote horizontale ni asymptote oblique.`,
    derivee,
    deriveeCalcul,
    signeCorr: `Sur $${affiche(domaine)}$, $${carre}>0$, $${lin}>0$ et $${reduireAxPlusB(1, -x1)}>0$ : $f'(x)$ a le signe de $${signe === 1 ? '' : '-'}(${reduireAxPlusB(1, -x0)})$.`,
    signes,
    extrema: [
      {
        x: `${x0}`,
        y: yTex,
        xNum: x0,
        yNum: fNum(x0),
        nature: natureExtremum(signes[0]),
      },
    ],
    pole: b,
    debut: b,
    echantillon: [b + 0.2, b + 6],
  }
}

/** Trinôme ax²+bx+c réduit, coefficients entiers. */
function reduireAxPolynome(a: number, b: number, c: number): string {
  const termes = [
    a === 0 ? '' : `${a === 1 ? '' : a === -1 ? '-' : a}x^2`,
    b === 0
      ? ''
      : `${b > 0 ? '+' : '-'}${Math.abs(b) === 1 ? '' : Math.abs(b)}x`,
    c === 0 ? '' : `${c > 0 ? '+' : '-'}${Math.abs(c)}`,
  ].join('')
  return termes.replace(/^\+/, '')
}

/** Décalage c de la variable : ln(x - c) au lieu de ln(x), une fois sur deux. */
const tirerDecalage = () => (choice([true, false]) ? 0 : randint(-2, 2, [0]))

/** (a + b ln t)/tⁿ : f'(x) = (b - na - nb ln t)/t^(n+1), nul pour ln t = 1/n - a/b. */
function tirerQuotient(): Etude {
  const c = tirerDecalage()
  let n = 1
  let a = 0
  let b = 1
  let L = frac(0)
  do {
    n = choice([1, 2])
    b = choice([1, 2, -1, -2])
    a = randint(-3, 3)
    L = frac(1, n).differenceFraction(frac(a, b)).simplifie()
  } while (
    L.den > 2 ||
    !lisible(
      Math.exp(L.valeurDecimale),
      (b / n) * Math.exp(-n * L.valeurDecimale),
    )
  )
  const t = tTex(c)
  const tn = puissanceT(c, n)
  const tnPar = n === 1 ? tPar(c) : tn
  const num = affineLn(a, b, c)
  const f = `\\dfrac{${num}}{${tn}}`
  const fNum = (x: number) => (a + b * Math.log(x - c)) / (x - c) ** n
  const A = b - n * a
  const B = -n * b
  const numDerivee = affineLn(A, B, c)
  const derivee = `\\dfrac{${numDerivee}}{${puissanceT(c, n + 1)}}`
  const deriveeTn = n === 1 ? '1' : `2${tPar(c)}`
  const deriveeCalcul = aligne([
    `f'(x)&=\\dfrac{\\dfrac{${b}}{${t}}\\cdot ${tnPar}-(${num})\\cdot ${deriveeTn}}{${puissanceT(c, 2 * n)}}`,
    ...(n === 1
      ? []
      : [
          `&=\\dfrac{${tPar(c)}\\left(${b}-2(${num})\\right)}{${puissanceT(c, 4)}}`,
        ]),
    `&=${derivee}`,
  ])
  const x0 = c + Math.exp(L.valeurDecimale)
  // f(x0) = (a + bL)/e^(nL) = (b/n) e^(-nL)
  const yTex = produitExpTex(frac(b, n), L.multiplieEntier(-n).simplifie())
  const signes: ('+' | '-')[] = b > 0 ? ['+', '-'] : ['-', '+']
  const domaine = intervalle(`${c}`, plusInf)
  const L0 = lim(`${c}^{+}`)
  const Linf = lim(plusInf)
  const versGauche = infini(b < 0)
  const sens = B > 0 ? '>' : '<'
  // Zéro : ln t = -a/b.
  const Lz = frac(-a, b)
  const zeroTex = abscisseTex(c, Lz)
  const resolution = affineLnZeroSigne(num, lnT(c), t, b, Lz, zeroTex)
  const t0 = -c
  return {
    f,
    fNum,
    domaine,
    ordonnee:
      c >= 0
        ? undefined
        : t0 === 1
          ? {
              calcul: `\\dfrac{${affineLn(a, b, 0, '\\ln(1)')}}{1}`,
              valeur: `${a}`,
            }
          : {
              calcul: `\\dfrac{${affineLn(a, b, 0, `\\ln(${t0})`)}}{${t0 ** n}}`,
              valeur: `\\dfrac{${affineLn(a, b, 0, `\\ln(${t0})`)}}{${t0 ** n}}`,
            },
    zeros: {
      tex: [zeroTex],
      num: [c + Math.exp(-a / b)],
      redaction: `Le dénominateur ne s'annule pas sur le domaine :${aligne(resolution.zero)}`,
    },
    facteurs: [
      { label: num, fNum: (x: number) => a + b * Math.log(x - c) },
      { label: tn, fNum: (x: number) => (x - c) ** n },
    ],
    signeFCorr: `Sur le domaine, $${tn}>0$ : $f(x)$ a le signe de $${num}$, et${aligne(resolution.signe)}`,
    domaineCorr: `Le logarithme n'est défini que pour un argument strictement positif : ${conditionT(c)}. Le dénominateur ne s'annule pas sur cet intervalle.`,
    gauche: {
      borne: `${c}^{+}`,
      valeur: `${c}`,
      interdit: true,
      limite: versGauche,
      redaction: rediger(
        [
          'On calcule les limites du numérateur et du dénominateur :',
          [`${L0}(${num})&=${versGauche}`, `${L0}${tnPar}&=0^{+}`],
        ],
        ['Par quotient :', [`${L0}f(x)&=${miseEnEvidence(versGauche)}`]],
      ),
    },
    droite: {
      borne: plusInf,
      valeur: plusInf,
      interdit: false,
      limite: '0',
      redaction: rediger(
        [
          `${a === 0 ? '' : `On sépare la fraction : $f(x)=${`${a < 0 ? '-' : ''}\\dfrac{${Math.abs(a)}}{${tn}}+${b === 1 ? '' : b === -1 ? '-' : `${b}\\cdot`}\\dfrac{${lnT(c)}}{${tn}}`.replace('+-', '-')}$. `}Par croissance comparée :`,
          [
            ...(a === 0 ? [] : [`${Linf}\\dfrac{${Math.abs(a)}}{${tn}}&=0`]),
            `${Linf}\\dfrac{${lnT(c)}}{${tn}}&=0`,
          ],
        ],
        [
          a === 0 ? 'Par produit :' : 'Par produit et par somme :',
          [`${Linf}f(x)&=${miseEnEvidence('0')}`],
        ],
      ),
    },
    asymptotes: [`x=${c}`, 'y=0'],
    droites: [{ m: 0, p: 0 }],
    asymptotesCorr: `La droite $x=${c}$ est une asymptote verticale et la droite $y=0$ est une asymptote horizontale en $${plusInf}$.`,
    derivee,
    deriveeCalcul,
    signeCorr:
      `Sur $${affiche(domaine)}$, $${puissanceT(c, n + 1)}>0$ : $f'(x)$ a le signe de $${numDerivee}$.` +
      aligne([
        `${numDerivee}>0&\\iff ${rienSi1(B)}${lnT(c)}>${-A}`,
        `&\\iff ${lnT(c)}${sens}${tex(L)}`,
        `&\\iff x${sens}${abscisseTex(c, L)}`,
      ]),
    signes,
    extrema: [
      {
        x: abscisseTex(c, L),
        y: yTex,
        xNum: x0,
        yNum: fNum(x0),
        nature: natureExtremum(signes[0]),
      },
    ],
    pole: c,
    debut: c,
    echantillon: [c + 0.2, c + 6],
  }
}

/** Quotient avec un argument affine non unitaire, à pente positive. */
function tirerQuotientAffine(): Etude {
  for (;;) {
    const k = choice([2, 3])
    const d = randint(-4, 4)
    const n = choice([1, 2])
    const a = randint(-3, 3)
    const b = choice([1, 2, -1, -2])
    const L = frac(1, n).differenceFraction(frac(a, b)).simplifie()
    const distance = Math.exp(L.valeurDecimale) / k
    const valeur = (b / n) * Math.exp(-n * L.valeurDecimale)
    if (L.den > 2 || !lisible(distance, valeur)) continue
    const u = reduireAxPlusB(k, d)
    const parU = `(${u})`
    const un = n === 1 ? parU : `${parU}^{${n}}`
    const unp = `${parU}^{${n + 1}}`
    const ln = `\\ln(${u})`
    const numerateur = affineLn(a, b, 0, ln)
    const f = `\\dfrac{${numerateur}}{${un}}`
    const pole = frac(-d, k)
    const poleNum = -d / k
    const pTex = tex(pole)
    const domaine = intervalle(pTex, plusInf)
    const numDerivee = affineLn(k * (b - n * a), -k * n * b, 0, ln)
    const derivee = `\\dfrac{${numDerivee}}{${unp}}`
    const numX0 = `${expTex(L)}${d === 0 ? '' : ecritureAlgebrique(-d)}`
    const x0Tex = L.num === 0 ? tex(frac(1 - d, k)) : `\\dfrac{${numX0}}{${k}}`
    const y0Tex = produitExpTex(frac(b, n), L.multiplieEntier(-n).simplifie())
    const gauche = lim(`${pTex}^{+}`)
    const droite = lim(plusInf)
    const limiteGauche = infini(b < 0)
    const sens = b > 0 ? '<' : '>'
    const fNum = (x: number) => (a + b * Math.log(k * x + d)) / (k * x + d) ** n
    // Zéro : ln(kx + d) = -a/b.
    const Lz = frac(-a, b)
    const zeroTex =
      Lz.num === 0
        ? tex(frac(1 - d, k))
        : `\\dfrac{${expTex(Lz)}${d === 0 ? '' : ecritureAlgebrique(-d)}}{${k}}`
    const resolution = affineLnZeroSigne(numerateur, ln, u, b, Lz, zeroTex)
    return {
      f,
      fNum,
      domaine,
      ordonnee:
        d <= 0
          ? undefined
          : d === 1
            ? {
                calcul: `\\dfrac{${affineLn(a, b, 0, '\\ln(1)')}}{1}`,
                valeur: `${a}`,
              }
            : {
                calcul: `\\dfrac{${affineLn(a, b, 0, `\\ln(${d})`)}}{${d ** n}}`,
                valeur: `\\dfrac{${affineLn(a, b, 0, `\\ln(${d})`)}}{${d ** n}}`,
              },
      zeros: {
        tex: [zeroTex],
        num: [(Math.exp(-a / b) - d) / k],
        redaction: `Le dénominateur ne s'annule pas sur le domaine :${aligne(resolution.zero)}`,
      },
      facteurs: [
        { label: numerateur, fNum: (x: number) => a + b * Math.log(k * x + d) },
        { label: un, fNum: (x: number) => (k * x + d) ** n },
      ],
      signeFCorr: `Sur le domaine, $${un}>0$ : $f(x)$ a le signe de $${numerateur}$, et${aligne(resolution.signe)}`,
      domaineCorr: `Il faut $${u}>0\\iff x>${pTex}$ pour le logarithme ; le dénominateur ne s'annule pas sur cet intervalle.`,
      gauche: {
        borne: `${pTex}^{+}`,
        valeur: pTex,
        interdit: true,
        limite: limiteGauche,
        redaction: rediger(
          [
            'Par composition, puis somme :',
            [`${gauche}(${numerateur})&=${limiteGauche}`],
          ],
          [
            'Le dénominateur est strictement positif sur le domaine et tend vers zéro. Par quotient :',
            [`${gauche}f(x)&=${limiteGauche}`],
          ],
        ),
      },
      droite: {
        borne: plusInf,
        valeur: plusInf,
        interdit: false,
        limite: '0',
        redaction: rediger([
          'Par croissance comparée et composition, puis somme :',
          [
            `${droite}\\dfrac{${ln}}{${un}}&=0`,
            ...(a === 0 ? [] : [`${droite}\\dfrac{${a}}{${un}}&=0`]),
            `${droite}f(x)&=0`,
          ],
        ]),
      },
      asymptotes: [`x=${pTex}`, 'y=0'],
      asymptotesCorr: `Les limites donnent l'asymptote verticale $x=${pTex}$ et l'asymptote horizontale $y=0$ en $${plusInf}$.`,
      derivee,
      deriveeCalcul: aligne([
        `f'(x)&=\\dfrac{\\dfrac{${b * k}}{${u}}${un}-(${numerateur})${n === 1 ? k : `${2 * k}${parU}`}}{${parU}^{${2 * n}}}`,
        `&=${derivee}`,
      ]),
      signeCorr:
        `Le dénominateur et $${k}$ sont strictement positifs sur le domaine.` +
        aligne([
          `f'(x)>0&\\iff ${ln}${sens}${tex(L)}`,
          `&\\iff x${sens}${x0Tex}`,
        ]),
      signes: b > 0 ? ['+', '-'] : ['-', '+'],
      extrema: [
        {
          x: x0Tex,
          y: y0Tex,
          xNum: poleNum + distance,
          yNum: valeur,
          nature: b > 0 ? 'maximum' : 'minimum',
        },
      ],
      pole: poleNum,
      poleTex: pTex,
      droites: [{ m: 0, p: 0 }],
      debut: poleNum,
      echantillon: [poleNum + 0.2, poleNum + 6],
    }
  }
}

/** tⁿ(a + b ln t) : f'(x) = t^(n-1)(na + b + nb ln t), nul pour ln t = -a/b - 1/n. */
function tirerProduit(): Etude {
  const c = tirerDecalage()
  let n = 1
  let a = 0
  let b = 1
  let L = frac(0)
  do {
    n = choice([1, 2])
    b = choice([1, 2, -1, -2])
    a = randint(-3, 3)
    L = frac(-a, b).differenceFraction(frac(1, n)).simplifie()
  } while (
    L.den > 2 ||
    !lisible(
      Math.exp(L.valeurDecimale),
      (-b / n) * Math.exp(n * L.valeurDecimale),
    )
  )
  const t = tTex(c)
  const tn = puissanceT(c, n)
  const devant = n === 1 ? tPar(c) : tn
  const tnPar = devant
  const num = affineLn(a, b, c)
  const f =
    a === 0
      ? `${b < 0 ? '-' : ''}${rienSi1(Math.abs(b))}${devant}${lnT(c)}`
      : `${devant}\\left(${num}\\right)`
  const fNum = (x: number) => (x - c) ** n * (a + b * Math.log(x - c))
  const A = n * a + b
  const B = n * b
  const numDerivee = affineLn(A, B, c)
  const derivee =
    n === 1 ? numDerivee : `${tPar(c)}\\left(${numDerivee}\\right)`
  const deriveeTn = n === 1 ? '1' : `2${tPar(c)}`
  const deriveeCalcul = aligne([
    `f'(x)&=${n === 1 ? '' : `${deriveeTn}`}(${num})+${tnPar}\\cdot\\dfrac{${b}}{${t}}`,
    `&=${derivee}`,
  ])
  const x0 = c + Math.exp(L.valeurDecimale)
  // f(x0) = e^(nL)(a + bL) = -(b/n) e^(nL)
  const yTex = produitExpTex(frac(-b, n), L.multiplieEntier(n).simplifie())
  const signes: ('+' | '-')[] = b > 0 ? ['-', '+'] : ['+', '-']
  const domaine = intervalle(`${c}`, plusInf)
  const L0 = lim(`${c}^{+}`)
  const Linf = lim(plusInf)
  const sens = B > 0 ? '>' : '<'
  const developpe =
    a === 0
      ? f
      : `${rienSi1(a)}${tnPar}${b > 0 ? '+' : '-'}${rienSi1(Math.abs(b))}${tnPar}${lnT(c)}`
  // Zéro : tⁿ > 0 sur le domaine, donc ln t = -a/b.
  const Lz = frac(-a, b)
  const zeroTex = abscisseTex(c, Lz)
  const resolution = affineLnZeroSigne(num, lnT(c), t, b, Lz, zeroTex)
  const t0 = -c
  return {
    f,
    fNum,
    domaine,
    ordonnee:
      c >= 0
        ? undefined
        : t0 === 1
          ? { calcul: affineLn(a, b, 0, '\\ln(1)'), valeur: `${a}` }
          : {
              calcul: `${t0 ** n}\\left(${affineLn(a, b, 0, `\\ln(${t0})`)}\\right)`,
              valeur:
                a === 0
                  ? `${rienSi1(t0 ** n * b)}\\ln(${t0})`
                  : `${t0 ** n}\\left(${affineLn(a, b, 0, `\\ln(${t0})`)}\\right)`,
            },
    zeros: {
      tex: [zeroTex],
      num: [c + Math.exp(-a / b)],
      redaction: `Sur le domaine, $${tn}>0$ :${aligne(resolution.zero)}`,
    },
    facteurs: [
      { label: tn, fNum: (x: number) => (x - c) ** n },
      { label: num, fNum: (x: number) => a + b * Math.log(x - c) },
    ],
    signeFCorr: `Sur le domaine, $${tn}>0$ : $f(x)$ a le signe de $${num}$, et${aligne(resolution.signe)}`,
    domaineCorr: `Le logarithme n'est défini que pour un argument strictement positif : ${conditionT(c)}.`,
    gauche: {
      borne: `${c}^{+}`,
      valeur: `${c}`,
      interdit: true,
      limite: '0',
      redaction: rediger(
        [
          `${a === 0 ? '' : `On développe : $f(x)=${developpe}$. `}Par croissance comparée :`,
          [...(a === 0 ? [] : [`${L0}${tn}&=0`]), `${L0}${tnPar}${lnT(c)}&=0`],
        ],
        [
          a === 0 ? 'Par produit :' : 'Par produit et par somme :',
          [`${L0}f(x)&=${miseEnEvidence('0')}`],
        ],
      ),
    },
    droite: {
      borne: plusInf,
      valeur: plusInf,
      interdit: false,
      limite: infini(b > 0),
      redaction: rediger(
        [
          'On calcule les limites des deux facteurs :',
          [`${Linf}${tn}&=${plusInf}`, `${Linf}(${num})&=${infini(b > 0)}`],
        ],
        ['Par produit :', [`${Linf}f(x)&=${miseEnEvidence(infini(b > 0))}`]],
      ),
    },
    asymptotes: [],
    asymptotesCorr: `En $${c}$, la limite est finie : il n'y a pas d'asymptote verticale. En $${plusInf}$, $\\dfrac{f(x)}{x}$ tend vers l'infini : il n'y a ni asymptote horizontale ni asymptote oblique.`,
    derivee,
    deriveeCalcul,
    signeCorr:
      (n === 1
        ? ''
        : `Sur $${affiche(domaine)}$, $${t}>0$ : $f'(x)$ a le signe de $${numDerivee}$.`) +
      aligne([
        `${numDerivee}>0&\\iff ${rienSi1(B)}${lnT(c)}>${-A}`,
        `&\\iff ${lnT(c)}${sens}${tex(L)}`,
        `&\\iff x${sens}${abscisseTex(c, L)}`,
      ]),
    signes,
    extrema: [
      {
        x: abscisseTex(c, L),
        y: yTex,
        xNum: x0,
        yNum: fNum(x0),
        nature: natureExtremum(signes[0]),
      },
    ],
    debut: c,
    echantillon: [c + 0.2, c + 6],
  }
}

/** αx + β + k ln t avec k = -αm : f'(x) = α(t - m)/t, nul en x = c + m. */
function tirerSomme(): Etude {
  const c = tirerDecalage()
  const alpha = choice([1, 2, -1, -2])
  const m = randint(1, 3)
  const k = -alpha * m
  // β ramène le minimum ou le maximum près de l'axe des abscisses.
  const beta = -Math.round(alpha * (c + m) + k * Math.log(m)) + randint(-2, 2)
  const t = tTex(c)
  const affine = reduireAxPlusB(alpha, beta)
  const f = `${affine}${k > 0 ? '+' : '-'}${rienSi1(Math.abs(k))}${lnT(c)}`
  const fNum = (x: number) => alpha * x + beta + k * Math.log(x - c)
  const x0 = c + m
  const numDerivee = reduireAxPlusB(alpha, -alpha * c + k)
  const derivee = `\\dfrac{${numDerivee}}{${t}}`
  const deriveeCalcul = aligne([
    `f'(x)&=${alpha}${k > 0 ? '+' : '-'}\\dfrac{${Math.abs(k)}}{${t}}`,
    `&=${derivee}`,
  ])
  const y0 = alpha * x0 + beta
  const yTex =
    m === 1
      ? `${y0}`
      : `${y0 === 0 ? '' : y0}${k > 0 ? (y0 === 0 ? '' : '+') : '-'}${rienSi1(Math.abs(k))}\\ln(${m})`
  const signes: ('+' | '-')[] = alpha > 0 ? ['-', '+'] : ['+', '-']
  const domaine = intervalle(`${c}`, plusInf)
  const L0 = lim(`${c}^{+}`)
  const Linf = lim(plusInf)
  const versGauche = infini(alpha > 0)
  const versDroite = infini(alpha > 0)
  const sens = alpha > 0 ? '>' : '<'
  const quotient = c === 0 ? '' : `\\cdot\\dfrac{${t}}{x}`
  /** β + k ln(u), sans terme nul. */
  const enZero = (u: number) =>
    `${beta === 0 ? '' : beta}${k > 0 ? (beta === 0 ? '' : '+') : '-'}${rienSi1(Math.abs(k))}\\ln(${u})`
  return {
    f,
    fNum,
    domaine,
    ordonnee:
      c >= 0
        ? undefined
        : c === -1
          ? { calcul: enZero(1), valeur: `${beta}` }
          : { calcul: enZero(-c), valeur: enZero(-c) },
    domaineCorr: `Le logarithme n'est défini que pour un argument strictement positif : ${conditionT(c)}.`,
    gauche: {
      borne: `${c}^{+}`,
      valeur: `${c}`,
      interdit: true,
      limite: versGauche,
      redaction: rediger(
        [
          'On calcule les limites des deux termes :',
          [
            `${L0}(${affine})&=${alpha * c + beta}`,
            `${L0}${lnT(c)}&=${moinsInf}`,
          ],
        ],
        [
          `Par produit par $${k}$, puis par somme :`,
          [`${L0}f(x)&=${miseEnEvidence(versGauche)}`],
        ],
      ),
    },
    droite: {
      borne: plusInf,
      valeur: plusInf,
      interdit: false,
      limite: versDroite,
      redaction: rediger(
        [
          `La somme donne une forme indéterminée. Pour $x>0$, on met $x$ en facteur : $f(x)=x\\left(${alpha}${beta === 0 ? '' : `${beta > 0 ? '+' : '-'}\\dfrac{${Math.abs(beta)}}{x}`}${k > 0 ? '+' : '-'}${Math.abs(k) === 1 ? '' : `${Math.abs(k)}\\cdot`}\\dfrac{${lnT(c)}}{${t}}${quotient}\\right)$. Par croissance comparée :`,
          [
            `${Linf}\\dfrac{${lnT(c)}}{${t}}&=0`,
            ...(c === 0 ? [] : [`${Linf}\\dfrac{${t}}{x}&=1`]),
          ],
        ],
        [
          `La parenthèse tend vers $${alpha}$. Par produit :`,
          [`${Linf}f(x)&=${miseEnEvidence(versDroite)}`],
        ],
      ),
    },
    asymptotes: [`x=${c}`],
    asymptotesCorr: `La droite $x=${c}$ est une asymptote verticale. En $${plusInf}$, $f(x)-(${affine})=${rienSi1(k)}${lnT(c)}$ tend vers l'infini : la droite $y=${affine}$ n'est pas une asymptote et il n'y a pas d'asymptote oblique.`,
    derivee,
    deriveeCalcul,
    signeCorr: `Sur $${affiche(domaine)}$, $${t}>0$ : $f'(x)$ a le signe de $${numDerivee}$, et $${numDerivee}>0\\iff x${sens}${x0}$.`,
    signes,
    extrema: [
      {
        x: `${x0}`,
        y: yTex,
        xNum: x0,
        yNum: fNum(x0),
        nature: natureExtremum(signes[0]),
      },
    ],
    pole: c,
    debut: c,
    echantillon: [c + 0.2, c + 6],
  }
}

/** ε(k ln(x² + C) - x) avec k = (r1 + r2)/2 et C = r1r2 : f' = -ε(x - r1)(x - r2)/(x² + C). */
function tirerTrinome(): Etude {
  // Avec r1 = 1, les deux extrema sont nettement à des hauteurs différentes.
  const [r1, r2] = choice([
    [1, 5],
    [1, 7],
    [1, 9],
  ])
  const miroir = choice([1, -1])
  const [p, q] = miroir === 1 ? [r1, r2] : [-r2, -r1]
  const k = (p + q) / 2
  const C = p * q
  const signe = choice([1, -1])
  const carre = `x^2+${C}`
  const lnCarre = `\\ln(${carre})`
  const kSigne = signe * k
  const base = (x: number) => signe * (k * Math.log(x * x + C) - x)
  // La constante d ramène la courbe près de l'axe des abscisses.
  const d = -Math.round((base(p) + base(q)) / 2)
  const constante = d === 0 ? '' : ecritureAlgebrique(d)
  const f =
    (signe === 1
      ? `${rienSi1(k)}${lnCarre}-x`
      : `x${kSigne > 0 ? '+' : '-'}${rienSi1(Math.abs(kSigne))}${lnCarre}`) +
    constante
  const fNum = (x: number) => base(x) + d
  const facteurs = `(${reduireAxPlusB(1, -p)})(${reduireAxPlusB(1, -q)})`
  const derivee = `\\dfrac{${signe === 1 ? '-' : ''}${facteurs}}{${carre}}`
  const deriveeCalcul = aligne([
    signe === 1
      ? `f'(x)&=\\dfrac{${2 * k}x}{${carre}}-1`
      : `f'(x)&=1${2 * kSigne > 0 ? '+' : '-'}\\dfrac{${Math.abs(2 * k)}x}{${carre}}`,
    signe === 1
      ? `&=\\dfrac{${reduireAxPolynome(-1, 2 * k, -C)}}{${carre}}`
      : `&=\\dfrac{${reduireAxPolynome(1, -2 * k, C)}}{${carre}}`,
    `&=${derivee}`,
  ])
  const signes: ('+' | '-')[] = signe === 1 ? ['-', '+', '-'] : ['+', '-', '+']
  const valeur = (r: number) => {
    const terme = `${rienSi1(kSigne)}\\ln(${r * r + C})`
    const entier = -signe * r + d
    return `${terme}${entier === 0 ? '' : ecritureAlgebrique(entier)}`
  }
  const Linf = lim(plusInf)
  const Lmoins = lim(moinsInf)
  const parenthese = `${rienSi1(kSigne)}\\cdot\\dfrac{${lnCarre}}{x}${signe === 1 ? '-' : '+'}1${d === 0 ? '' : `${d > 0 ? '+' : '-'}\\dfrac{${Math.abs(d)}}{x}`}`
  const fZero = `${rienSi1(kSigne)}\\ln(${C})${constante}`
  return {
    f,
    fNum,
    domaine: '\\mathbb{R}',
    ordonnee: { calcul: fZero, valeur: fZero },
    domaineCorr: `Le logarithme n'est défini que pour un argument strictement positif. Pour tout réel $x$, $${carre}>0$.`,
    gauche: {
      borne: moinsInf,
      valeur: moinsInf,
      interdit: false,
      limite: infini(signe === 1),
      redaction: rediger(
        [
          `Pour $x\\neq0$, on met $x$ en facteur : $f(x)=x\\left(${parenthese}\\right)$, avec $\\dfrac{${lnCarre}}{x}=2\\cdot\\dfrac{\\ln|x|}{x}+\\dfrac{1}{x}\\ln\\left(1+\\dfrac{${C}}{x^2}\\right)$. Par croissance comparée et par continuité de $\\ln$ en $1$ :`,
          [
            `${Lmoins}\\dfrac{\\ln|x|}{x}&=0`,
            `${Lmoins}\\dfrac{1}{x}\\ln\\left(1+\\dfrac{${C}}{x^2}\\right)&=0`,
          ],
        ],
        [
          `La parenthèse tend vers $${signe === 1 ? '-1' : '1'}$. Par produit :`,
          [`${Lmoins}f(x)&=${miseEnEvidence(infini(signe === 1))}`],
        ],
      ),
    },
    droite: {
      borne: plusInf,
      valeur: plusInf,
      interdit: false,
      limite: infini(signe !== 1),
      redaction: rediger(
        [
          'Avec la même écriture, par croissance comparée :',
          [
            `${Linf}\\dfrac{\\ln|x|}{x}&=0`,
            `${Linf}\\dfrac{1}{x}\\ln\\left(1+\\dfrac{${C}}{x^2}\\right)&=0`,
          ],
        ],
        [
          `La parenthèse tend vers $${signe === 1 ? '-1' : '1'}$. Par produit :`,
          [`${Linf}f(x)&=${miseEnEvidence(infini(signe !== 1))}`],
        ],
      ),
    },
    asymptotes: [],
    asymptotesCorr: `$f$ est définie sur $\\mathbb{R}$ : il n'y a pas d'asymptote verticale. En $\\pm\\infty$, $\\dfrac{f(x)}{x}$ tend vers $${signe === 1 ? '-1' : '1'}$, mais $f(x)${signe === 1 ? '+' : '-'}x=${rienSi1(kSigne)}${lnCarre}${constante}$ tend vers l'infini : il n'y a pas d'asymptote oblique.`,
    derivee,
    deriveeCalcul,
    signeCorr: `Pour tout réel $x$, $${carre}>0$ : $f'(x)$ a le signe de $${signe === 1 ? '-' : ''}${facteurs}$, qui s'annule en $${p}$ et en $${q}$.`,
    signes,
    extrema: [p, q].map((r, i) => ({
      x: `${r}`,
      y: valeur(r),
      xNum: r,
      yNum: fNum(r),
      nature: natureExtremum(signes[i]),
    })),
    echantillon: [-4, 4],
  }
}

const tirages: Record<Famille, () => Etude> = {
  difference: tirerDifference,
  quotient: tirerQuotient,
  produit: tirerProduit,
  somme: tirerSomme,
  trinome: tirerTrinome,
  quotientAffine: tirerQuotientAffine,
}

function tableau(e: Etude): string {
  const antecedents = [
    e.gauche.valeur,
    ...e.extrema.map((x) => x.x),
    e.droite.valeur,
  ]
  const ligneSignes: (string | number)[] = [
    'Line',
    30,
    e.gauche.interdit ? 'd' : '',
    10,
  ]
  e.signes.forEach((s, i) => {
    ligneSignes.push(s, 20, i < e.signes.length - 1 ? 'z' : '', 10)
  })
  // Hauteur de chaque valeur : + en haut, - en bas.
  const position = (monte: boolean) => (monte ? '+' : '-')
  const ligneVariations: (string | number)[] = ['Var', 10]
  ligneVariations.push(
    `${e.gauche.interdit ? 'D' : ''}${position(e.signes[0] === '-')}/$${e.gauche.limite}$`,
    largeur(e.gauche.limite),
  )
  e.extrema.forEach((x) => {
    ligneVariations.push(
      `${position(x.nature === 'maximum')}/$${pourTableau(x.y)}$`,
      largeur(x.y),
    )
  })
  ligneVariations.push(
    `${position(e.signes.at(-1) === '+')}/$${e.droite.limite}$`,
    largeur(e.droite.limite),
  )
  return tableauDeVariation({
    tabInit: [
      [
        ['$x$', 2, 20],
        ["$f'(x)$", 2, 25],
        ['$f(x)$', 4, 25],
      ],
      antecedents.flatMap((a) => [`$${pourTableau(a)}$`, largeur(a)]),
    ],
    tabLines: [ligneSignes, ligneVariations],
    espcl: 5,
    deltacl: 1,
    lgt: 2.5,
    scale: context.isHtml ? 0.85 : 0.7,
    hauteurLignes: [20, 20, 40],
  })
}

/** Signe (+1 ou -1) d'une limite infinie ou nulle, lue sur son écriture. */
const signeLimite = (limite: string) => (limite.startsWith('-') ? -1 : 1)

/**
 * Zéros de f : exacts quand ils se calculent, sinon approchés par dichotomie
 * sur chaque intervalle de monotonie (entre les bords et les extrema).
 */
function zerosNumeriques(e: Etude): number[] {
  if (e.zeros != null) return e.zeros.num
  const zeros = e.extrema
    .filter((x) => Math.abs(x.yNum) < 1e-9)
    .map((x) => x.xNum)
  const bornes = [
    e.debut ?? -Infinity,
    ...e.extrema.map((x) => x.xNum),
    Infinity,
  ]
  for (let j = 0; j + 1 < bornes.length; j++) {
    let u = bornes[j]
    let v = bornes[j + 1]
    // Bords infinis ou exclus : on s'en approche jusqu'à lire le signe de la limite.
    if (u === -Infinity) {
      u = v - 1
      for (
        let k = 0;
        k < 60 && Math.sign(e.fNum(u)) !== signeLimite(e.gauche.limite);
        k++
      )
        u = v - 2 * (v - u)
    } else if (j === 0) {
      u += 1e-9
    }
    if (v === Infinity) {
      v = u + 1
      for (
        let k = 0;
        k < 60 && Math.sign(e.fNum(v)) !== signeLimite(e.droite.limite);
        k++
      )
        v = u + 2 * (v - u)
    }
    if (e.fNum(u) * e.fNum(v) >= 0) continue
    for (let k = 0; k < 100; k++) {
      const w = (u + v) / 2
      if (e.fNum(u) * e.fNum(w) <= 0) v = w
      else u = w
    }
    zeros.push((u + v) / 2)
  }
  // Zéro entier exact (par exemple x = c + 1 quand ln(x - c) = 0) : on le garde exact.
  return zeros.map((z) => zeroEntier(e, z) ?? z).sort((a, b) => a - b)
}

/** L'entier le plus proche de z s'il annule exactement f, sinon null. */
function zeroEntier(e: Etude, z: number): number | null {
  const r = Math.round(z)
  return Math.abs(z - r) < 1e-6 && Math.abs(e.fNum(r)) < 1e-12 ? r : null
}

/** Écriture des zéros : exacte, entière, ou arrondie au centième. */
const zerosTex = (e: Etude, zeros: number[]) =>
  e.zeros?.tex ??
  zeros.map((z) => (zeroEntier(e, z) != null ? `${z}` : texNombre(z, 2)))
/** Égalité ou valeur approchée d'un zéro trouvé numériquement. */
const egalOuEnviron = (e: Etude, z: number) =>
  zeroEntier(e, z) != null ? `=${z}` : `\\approx ${texNombre(z, 2)}`

/** Un point de chaque intervalle délimité par le domaine et les zéros, pour y lire les signes. */
function pointsTests(e: Etude, zeros: number[]): number[] {
  const bornes = [e.debut ?? -Infinity, ...zeros, Infinity]
  return bornes.slice(0, -1).map((u, j) => {
    const v = bornes[j + 1]
    if (u === -Infinity) return v === Infinity ? 0 : v - 1
    return v === Infinity ? u + 1 : (u + v) / 2
  })
}

/** Lignes du tableau de signes : les facteurs éventuels, puis f. */
const lignesSignes = (e: Etude): Facteur[] => [
  ...(e.facteurs ?? []),
  { label: 'f(x)', fNum: e.fNum },
]

/** Tableau de signes de f pour la correction (HTML, LaTeX et Typst). */
function tableauSignes(e: Etude, zeros: number[]): string {
  const points = pointsTests(e, zeros)
  const antecedents = [e.gauche.valeur, ...zerosTex(e, zeros), e.droite.valeur]
  const lignes = lignesSignes(e)
  // Largeur de la colonne des étiquettes, en cm : environ 0,22 cm par caractère.
  const largeurLabel = Math.max(
    2.5,
    ...lignes.map((l) => (largeur(l.label) / 5) * 0.22),
  )
  return tableauDeVariation({
    tabInit: [
      [
        ['$x$', 2, 20],
        ...lignes.map((l): [string, number, number] => [
          `$${l.label}$`,
          2,
          largeur(l.label),
        ]),
      ],
      antecedents.flatMap((a) => [`$${pourTableau(a)}$`, largeur(a)]),
    ],
    tabLines: lignes.map((l) => {
      const ligne: (string | number)[] = [
        'Line',
        30,
        e.gauche.interdit ? 'd' : '',
        10,
      ]
      points.forEach((x, j) => {
        ligne.push(l.fNum(x) > 0 ? '+' : '-', 20)
        if (j < zeros.length)
          ligne.push(Math.abs(l.fNum(zeros[j])) < 1e-9 ? 'z' : 't', 10)
        else ligne.push('', 10)
      })
      return ligne
    }),
    espcl: 5,
    deltacl: 1,
    lgt: largeurLabel,
    scale: context.isHtml ? 0.85 : 0.7,
    hauteurLignes: [20, ...lignes.map(() => 20)],
  })
}

/** Tableau de signes à compléter : antécédents des zéros, signes et zéros de chaque ligne. */
function configSignes(e: Etude, zeros: number[]): TableauSVConfig {
  const points = pointsTests(e, zeros)
  // Antécédents attendus : écriture exacte, ou valeur arrondie au centième.
  const attendus =
    e.zeros?.tex ?? zeros.map((z) => String(Math.round(z * 100) / 100))
  return {
    variableName: 'x',
    colonnes: [
      colonne(e.gauche.valeur),
      ...attendus.map((t) =>
        colonne('', {
          editable: true,
          expected: t,
          clavier: KeyboardType.clavierFonctionsTerminales,
        }),
      ),
      colonne(e.droite.valeur),
    ],
    lignes: lignesSignes(e).map((l) =>
      ligneSigne(l.label, [
        celluleSigne(e.gauche.interdit ? '||' : ''),
        ...points.flatMap((x, j) => [
          celluleSigne('', {
            editable: true,
            expected: l.fNum(x) > 0 ? '+' : '-',
          }),
          ...(j < zeros.length
            ? [
                celluleSigne('|', {
                  editable: true,
                  expected: Math.abs(l.fNum(zeros[j])) < 1e-9 ? '0' : '',
                }),
              ]
            : []),
        ]),
        celluleSigne(''),
      ]),
    ),
  }
}

/**
 * Tableau de départ de l'élève : les bords du domaine et les lignes, sans les
 * zéros. Il ajoute lui-même leurs colonnes, ce qui ne donne pas leur nombre.
 */
function configSignesDepart(e: Etude): TableauSVConfig {
  return {
    variableName: 'x',
    colonnesEditables: true,
    colonnes: [colonne(e.gauche.valeur), colonne(e.droite.valeur)],
    lignes: lignesSignes(e).map((l) =>
      ligneSigne(l.label, [
        celluleSigne(e.gauche.interdit ? '||' : ''),
        celluleSigne('', { editable: true }),
        celluleSigne(''),
      ]),
    ),
  }
}

/**
 * Zéros approchés : sur chaque intervalle de monotonie, f est continue et
 * strictement monotone ; le théorème des valeurs intermédiaires donne au plus
 * un zéro, qui existe si f change de signe.
 */
function redactionZerosApproches(e: Etude, zeros: number[]): string {
  const xs = e.extrema.map((x) => x.x)
  const enX = (x: Extremum) =>
    `$f(${x.x})=${x.y}\\approx ${texNombre(x.yNum, 2)}$`
  const nul = e.extrema.find((x) => Math.abs(x.yNum) < 1e-9)
  if (nul != null) {
    return `Le ${nul.nature} vaut $f(${nul.x})=0$. De part et d'autre de $${nul.x}$, $f$ est strictement monotone : elle ne s'annule qu'en $x=${nul.x}$.`
  }
  const phrases: string[] = []
  let rang = 0
  for (let j = 0; j <= e.extrema.length; j++) {
    const gauche =
      j === 0 ? `\\left]${e.gauche.valeur};` : `\\left[${xs[j - 1]};`
    const droite =
      j === e.extrema.length ? `${e.droite.valeur}\\right[` : `${xs[j]}\\right]`
    const depart =
      j === 0
        ? `$${e.gauche.limite}$ (limite en $${e.gauche.borne}$)`
        : enX(e.extrema[j - 1])
    const arrivee =
      j === e.extrema.length
        ? `$${e.droite.limite}$ (limite en $${e.droite.borne}$)`
        : enX(e.extrema[j])
    const sens = e.signes[j] === '+' ? 'croissante' : 'décroissante'
    const vDepart =
      j === 0 ? signeLimite(e.gauche.limite) : Math.sign(e.extrema[j - 1].yNum)
    const vArrivee =
      j === e.extrema.length
        ? signeLimite(e.droite.limite)
        : Math.sign(e.extrema[j].yNum)
    let phrase = `Sur $${gauche}${droite}$, $f$ est continue et strictement ${sens}, de ${depart} à ${arrivee}. `
    if (vDepart * vArrivee < 0) {
      rang++
      phrase += `D'après le théorème des valeurs intermédiaires, $f$ s'annule une seule fois sur cet intervalle, en $x_${rang}${egalOuEnviron(e, zeros[rang - 1])}$${zeroEntier(e, zeros[rang - 1]) == null ? '' : ` : on vérifie que $f(${zeros[rang - 1]})=0$`}.`
    } else {
      phrase +=
        "$f$ ne change pas de signe : elle ne s'annule pas sur cet intervalle."
    }
    phrases.push(phrase)
  }
  return createList({ items: phrases, style: 'fleches' })
}

/** Courbe, asymptote verticale en traitillés et extrema marqués. */
/** Bord gauche fini, exclu du domaine, où la limite est finie. */
const aUnTrou = (e: Etude) =>
  e.debut != null && e.pole == null && e.gauche.interdit

/** Ce que l'on place sur la figure, dans l'ordre. */
function phraseFigure(e: Etude): string {
  const nb = (e.pole == null ? 0 : 1) + (e.droites?.length ?? 0)
  const asymptotes =
    nb === 0
      ? 'On place'
      : `On trace ${nb === 1 ? "l'asymptote" : 'les asymptotes'} en traitillés, on place`
  const trou = aUnTrou(e)
    ? `, un point vide en $x=${e.debut}$ où $f$ n'est pas définie`
    : ''
  return `${asymptotes} les extrema, les points d'intersection avec les axes (coordonnées arrondies au centième)${trou}, puis on trace la courbe :`
}

function figure(e: Etude): string {
  const extremaX = e.extrema.map((x) => x.xNum)
  const debut = e.debut ?? Math.min(...extremaX) - 4
  let xMin = Math.min(Math.floor(debut) - 1, -1)
  let xMax = Math.max(
    Math.ceil(Math.max(...extremaX) + 3),
    Math.ceil(debut) + 7,
  )
  if (e.debut == null) {
    xMin = Math.min(Math.floor(Math.min(...extremaX)) - 4, -1)
    xMax = Math.max(Math.ceil(Math.max(...extremaX)) + 4, 1)
  }
  const gauche = e.debut == null ? xMin : e.debut
  const valeurs = [
    ...e.extrema.map((x) => x.yNum),
    0,
    e.fNum(xMax),
    ...(e.debut == null ? [e.fNum(xMin)] : []),
    // Près du bord, pour montrer la courbe qui longe l'asymptote verticale.
    ...(e.debut == null ? [] : [e.fNum(e.debut + 0.02)]),
  ].filter((y) => Number.isFinite(y))
  // Fenêtre autour des extrema et de l'axe des abscisses ; les branches infinies sont coupées.
  const bas0 = Math.min(0, ...e.extrema.map((x) => x.yNum))
  const haut0 = Math.max(0, ...e.extrema.map((x) => x.yNum))
  const bas = Math.max(Math.min(...valeurs), bas0 - 4)
  const haut = Math.min(Math.max(...valeurs), haut0 + 4)
  const marge = 0.5
  const yMin = Math.floor(bas - marge)
  const yMax = Math.ceil(haut + marge)
  const xUnite = Math.min(1.5, 12 / (xMax - xMin))
  const yUnite = Math.min(2, 7 / (yMax - yMin))
  const pasY = Math.ceil((yMax - yMin) / 10)
  // Pas de nombre sous l'asymptote verticale : le trait le barrerait.
  const xLabels: number[] = []
  for (let k = Math.ceil(xMin); k <= xMax - 0.3; k++) {
    if (k !== 0 && k !== e.pole) xLabels.push(k)
  }
  const r = repere({
    xMin,
    xMax,
    yMin,
    yMax,
    xUnite,
    yUnite,
    grille: false,
    xThickMax: xMax - 0.3,
    xLabelMax: xMax - 0.3,
    xLabelListe: xLabels,
    yThickDistance: pasY,
    yLabelDistance: pasY,
    yThickMax: yMax - 0.3,
    yLabelMax: yMax - 0.3,
    xLegende: '$x$',
    xLegendePosition: [xMax * xUnite - 0.3, 0.5],
    yLegende: '$y$',
    yLegendePosition: [0.7, yMax * yUnite - 0.25],
  })
  const depart = e.debut == null ? xMin : gauche + 0.001
  const pas = (xMax - depart) / 400
  const objets: NestedObjetMathalea2dArray = [
    courbe(e.fNum, {
      repere: r,
      color: 'blue',
      step: pas,
      xMin: depart,
      xMax,
      epaisseur: 2,
    }),
  ]
  const point = (x: number, y: number, plein = true) =>
    cercle(
      pointAbstrait(x * xUnite, y * yUnite),
      0.08,
      'blue',
      plein ? 'blue' : 'white',
    )
  const dansFenetre = (x: number, y: number) =>
    x >= xMin && x <= xMax && y >= yMin && y <= yMax
  /** Valeur exacte si entière, sinon arrondie au centième (virgule décimale). */
  const valeurTex = (v: number) =>
    String(Math.round(v * 100) / 100 || 0).replace('.', '{,}')
  const coordonnees = (x: number, y: number) =>
    `(${valeurTex(x)}\\,;\\,${valeurTex(y)})`
  // Placement des étiquettes : rectangles (en cm) à éviter.
  type Boite = [number, number, number, number] // xmin, xmax, ymin, ymax
  const occupees: Boite[] = [
    // « x » et « y » des axes
    [xMax * xUnite - 0.55, xMax * xUnite - 0.05, 0.3, 0.75],
    [0.45, 0.95, yMax * yUnite - 0.5, yMax * yUnite],
    // graduations : sous l'axe des abscisses, à gauche de l'axe des ordonnées (axe compris)
    [xMin * xUnite, xMax * xUnite, -0.6, -0.05],
    [-0.65, 0.05, yMin * yUnite, yMax * yUnite],
  ]
  const courbeCm: [number, number][] = []
  for (let k = 0; k <= 400; k++) {
    const x = depart + (k * (xMax - depart)) / 400
    const y = e.fNum(x)
    if (Number.isFinite(y) && y >= yMin && y <= yMax)
      courbeCm.push([x * xUnite, y * yUnite])
  }
  /** Gêne d'une position : hors cadre, étiquettes et axes (beaucoup), courbe (un peu). */
  const gene = ([x0, x1, y0, y1]: Boite) =>
    (x0 < xMin * xUnite - 0.4 ||
    x1 > xMax * xUnite + 0.4 ||
    y0 < yMin * yUnite - 0.6 ||
    y1 > yMax * yUnite + 0.4
      ? 1000
      : 0) +
    100 *
      occupees.filter(
        ([a0, a1, b0, b1]) => !(x1 < a0 || x0 > a1 || y1 < b0 || y0 > b1),
      ).length +
    courbeCm.filter(
      ([x, y]) =>
        !(x < x0 - 0.05 || x > x1 + 0.05 || y < y0 - 0.05 || y > y1 + 0.05),
    ).length
  /** Étiquette du point (x ; y) à la position la moins gênante, la première à égalité. */
  const etiquette = (x: number, y: number, essais: [number, number][]) => {
    const texte = coordonnees(x, y)
    // Largeur approchée en scriptsize : 0,155 cm par caractère affiché.
    const largeur = 0.155 * texte.replace(/\\,|\{,\}/g, ',').length
    const [px, py] = [x * xUnite, y * yUnite]
    const boites = essais.map(([dx, dy]): [Boite, boolean] => {
      const versDroite = dx >= 0
      const bx = px + dx
      return [
        [
          versDroite ? bx : bx - largeur,
          versDroite ? bx + largeur : bx,
          py + dy - 0.2,
          py + dy + 0.2,
        ],
        versDroite,
      ]
    })
    const [boite, versDroite] = boites.reduce((meilleure, candidate) =>
      gene(candidate[0]) < gene(meilleure[0]) ? candidate : meilleure,
    )
    occupees.push(boite)
    objets.push(
      latex2d(
        texte,
        versDroite ? boite[0] : boite[1],
        (boite[2] + boite[3]) / 2,
        {
          letterSize: 'scriptsize',
          // « droite » : le texte part vers la droite du point.
          justify: versDroite ? 'droite' : 'gauche',
        },
      ),
    )
  }
  const autour: [number, number][] = [
    [0.15, 0.45],
    [-0.15, 0.45],
    [0.15, -0.45],
    [-0.15, -0.45],
    [0.15, 0.8],
    [-0.15, 0.8],
    [0.15, -0.85],
    [-0.15, -0.85],
    [0.15, 1.25],
    [-0.15, 1.25],
  ]
  // Asymptotes en traitillés, avec leur équation : visibles même sur un axe.
  if (e.pole != null) {
    // Le trait et son équation, écrite le long du trait.
    const xp = e.pole * xUnite
    const yEq = (yMax > -yMin ? yMax * 0.6 : yMin * 0.6) * yUnite
    // Sur l'axe des ordonnées, l'équation passe à gauche des graduations.
    const xEq = xp - (e.pole === 0 ? 0.9 : 0.25)
    occupees.push(
      [xp - 0.05, xp + 0.05, yMin * yUnite, yMax * yUnite],
      [xEq - 0.2, xEq + 0.2, yEq - 0.45, yEq + 0.45],
    )
    const av = segment(
      pointAbstrait(e.pole * xUnite, yMin * yUnite),
      pointAbstrait(e.pole * xUnite, yMax * yUnite),
      'red',
    )
    av.pointilles = 5
    av.epaisseur = 1.5
    objets.push(
      av,
      // Le long du trait, à gauche (la courbe est à droite), loin de l'axe des abscisses,
      // lu de haut en bas.
      latex2d(`x=${e.poleTex ?? e.pole}`, xEq, yEq, {
        letterSize: 'scriptsize',
        color: 'red',
        orientation: -90,
      }),
    )
  }
  for (const { m, p } of e.droites ?? []) {
    const x0 = e.debut ?? xMin
    const ad = segment(
      pointAbstrait(x0 * xUnite, (m * x0 + p) * yUnite),
      pointAbstrait(xMax * xUnite, (m * xMax + p) * yUnite),
      'red',
    )
    ad.pointilles = 5
    ad.epaisseur = 1.5
    const equation =
      m === 0
        ? `y=${p}`
        : `y=${rienSi1(m)}x${p === 0 ? '' : ecritureAlgebrique(p)}`
    objets.push(
      ad,
      latex2d(equation, xMax * xUnite + 0.15, (m * xMax + p) * yUnite - 0.35, {
        letterSize: 'scriptsize',
        color: 'red',
        justify: 'droite',
      }),
    )
  }
  for (const x of e.extrema) {
    if (dansFenetre(x.xNum, x.yNum)) objets.push(point(x.xNum, x.yNum))
  }
  const zeros = zerosNumeriques(e)
  for (const z of zeros) {
    if (!dansFenetre(z, 0)) continue
    objets.push(point(z, 0))
    etiquette(z, 0, autour)
  }
  // Ordonnée à l'origine, si 0 est dans le domaine et n'est pas déjà un zéro.
  const y0 = e.fNum(0)
  if (
    (e.debut == null || e.debut < 0) &&
    Number.isFinite(y0) &&
    dansFenetre(0, y0) &&
    zeros.every((z) => Math.abs(z) > 1e-6)
  ) {
    objets.push(point(0, y0))
    // À gauche, au-delà des graduations de l'axe des ordonnées, en dernier recours.
    etiquette(0, y0, [...autour, [-0.7, 0.35], [-0.7, -0.35]])
  }
  // Bord gauche exclu du domaine, sans asymptote verticale : un point vide.
  if (aUnTrou(e)) {
    const limite = e.fNum((e.debut as number) + 1e-9)
    if (Number.isFinite(limite) && dansFenetre(e.debut as number, limite))
      objets.push(point(e.debut as number, limite, false))
  }
  return mathalea2d(
    {
      xmin: xMin * xUnite - 0.5,
      xmax: xMax * xUnite + (e.droites?.length ? 1.3 : 0.5),
      ymin: yMin * yUnite - 0.7,
      ymax: yMax * yUnite + 0.5,
      pixelsParCm: 30,
      scale: 1,
      center: true,
      centerLatex: true,
    },
    r,
    ...objets,
  )
}

/** @author Nathan Scheinmann */
export default class EtudeFonctionLogarithme extends Exercice {
  /** Familles proposées : celles à zéros exacts ici, les autres dans 4mExpLog-9. */
  protected formulaireFamilles: FormulaireComplexe

  constructor(formulaireFamilles: FormulaireComplexe = formulaire) {
    super()
    this.formulaireFamilles = formulaireFamilles
    this.nbQuestions = 1
    this.spacingCorr = 2
    this.besoinFormulaireComplexe = formulaireFamilles
    this.sup = serialiseFormulaireComplexe(
      formulaireFamilles,
      valeursParDefaut(formulaireFamilles),
    )
    this.comment =
      "Chaque fonction est construite pour que sa dérivée se factorise et donne des extrema exacts (entiers, logarithmes d'entiers ou puissances de e d'exposant entier ou demi-entier), et pour que ses zéros se calculent exactement. " +
      'Pour les quotients et les produits, la variable est une fois sur deux décalée : ln(x - c) au lieu de ln(x). ' +
      'La famille « Quotient avec argument affine » utilise ln(kx+d), avec k égal à 2 ou 3, et des bornes rationnelles. ' +
      'Les fonctions dont les zéros ne se calculent pas exactement sont dans 4mExpLog-9. ' +
      COMMENTAIRE_INTERACTIF
  }

  nouvelleVersion() {
    const params = lireFormulaireComplexe(this.formulaireFamilles, this.sup)
    const familles = repartitionPonderee(
      shuffle(params.liste('familles')),
      this.nbQuestions,
      shuffle(params.declares('familles')),
    )
    this.listeQuestions = []
    this.listeCorrections = []
    for (let i = 0, essais = 0; i < this.nbQuestions && essais < 50; essais++) {
      const e = tirages[familles[i] as Famille]()
      if (!this.questionJamaisPosee(i, e.f)) continue
      // Le tableau de signes interactif n'entre pas dans un multi-mathfield : chaque
      // étude occupe quatre réponses, a), le tableau de signes, b) et c).
      const [iA, iSignes, iB, iC] = [0, 1, 2, 3].map((k) => 4 * i + k)
      const zeros = zerosNumeriques(e)
      const exacts = e.zeros != null
      const zerosEcrits = zerosTex(e, zeros)
      const vide = (liste: string[]) =>
        liste.length === 0 ? '\\emptyset' : liste.join(';')
      const zerosAttendus = vide(
        exacts
          ? zerosEcrits
          : zeros.map((z) => String(Math.round(z * 100) / 100)),
      )
      /** Énoncé d'une étape et ses champs, à l'index `index`. */
      const etape = (index: number, sq: SubQuestion) =>
        createSubQuestions(this, index, [sq], {
          labels: false,
          bareme: troisPointsProportionnels,
        }).question
      const tableauInteractif = this.interactif
        ? `<br>Tableau de signes de $f$ (ajouter une colonne par zéro avec le bouton $+$) :<br>${addTableauSignesVariations(this, iSignes, { config: configSignesDepart(e), configAttendue: configSignes(e, zeros), bareme: 3 })}`
        : ''
      const enTete = (titre: string) => `${texteGras(titre)}<br>`
      const parties = (items: string[]) => createList({ items, style: 'puces' })

      // a) Informations générales
      const questionA = etape(iA, {
        question:
          (exacts
            ? "Déterminer le domaine de définition de $f$, son ordonnée à l'origine, ses zéros et son tableau de signes."
            : "Déterminer le domaine de définition de $f$ et son ordonnée à l'origine. L'équation $f(x)=0$ ne se résout pas algébriquement : les zéros de $f$, arrondis au centième, et son tableau de signes sont demandés à la question c).") +
          (this.interactif
            ? "<br>$\\mathrm{Dom}_f=$ %{0}<br>Ordonnée à l'origine ($\\emptyset$ s'il n'y en a pas) : %{1}" +
              (exacts
                ? "<br>Zéros (séparés par des points-virgules, $\\emptyset$ s'il n'y en a pas) : %{2}"
                : '')
            : ''),
        correction: '',
        answer: [
          { value: e.domaine, compare: all([sameInterval()]) },
          {
            value: e.ordonnee?.valeur ?? '\\emptyset',
            compare: all([sameExpressionList()]),
          },
          ...(exacts
            ? [{ value: zerosAttendus, compare: all([sameExpressionList()]) }]
            : []),
        ],
        field: [
          { keyboard: KeyboardType.clavierEnsemble },
          { keyboard: KeyboardType.clavierFonctionsTerminalesEnsemble },
          { keyboard: KeyboardType.clavierFonctionsTerminalesEnsemble },
        ],
      })
      const ordonneeCorr =
        e.ordonnee == null
          ? `Comme $0\\notin\\mathrm{Dom}_f$, $f$ n'a pas d'ordonnée à l'origine : $${miseEnEvidence('\\emptyset')}$.`
          : `Comme $0\\in\\mathrm{Dom}_f$, $f(0)=${e.ordonnee.calcul === e.ordonnee.valeur ? '' : `${e.ordonnee.calcul}=`}${miseEnEvidence(e.ordonnee.valeur)}$.`
      const zerosCorr =
        e.zeros == null
          ? "L'équation $f(x)=0$ ne se résout pas algébriquement : on cherche les zéros de $f$ à la question c), à l'aide du tableau de croissance."
          : `${e.zeros.redaction}Donc $Z(f)=${miseEnEvidence(e.zeros.tex.length === 0 ? '\\emptyset' : `\\left\\{${e.zeros.tex.join(';')}\\right\\}`)}$.`
      const correctionA =
        enTete('Informations générales') +
        parties([
          `Domaine. ${e.domaineCorr} Donc $\\mathrm{Dom}_f=${miseEnEvidence(affiche(e.domaine))}$.`,
          `Ordonnée à l'origine. ${ordonneeCorr}`,
          `Zéros. ${zerosCorr}`,
          ...(exacts
            ? [`Signe. ${e.signeFCorr ?? ''}<br>${tableauSignes(e, zeros)}`]
            : []),
        ])

      const gauche = `$${lim(e.gauche.borne)}f(x)=$`
      const droite = `$${lim(e.droite.borne)}f(x)=$`
      const listeX = e.extrema.map((x) => x.x).join(';')
      const listeY = e.extrema.map((x) => x.y).join(';')
      const extremaTex = e.extrema
        .map(
          (x) =>
            `un ${x.nature} local en $x=${miseEnEvidence(x.x)}$, qui vaut $f(${x.x})=${miseEnEvidence(x.y)}$`,
        )
        .join(' et ')
      const asymptotesTex =
        e.asymptotes.length === 0
          ? `Il n'y a donc aucune asymptote : $${miseEnEvidence('\\emptyset')}$.`
          : `Asymptotes : $${miseEnEvidence(e.asymptotes.join(';'))}$.`
      // b) Limites et asymptotes
      const questionB = etape(iB, {
        question: `Calculer les limites aux bords de son domaine et donner les équations de ses asymptotes éventuelles.${this.interactif ? '<br>' + `${gauche} %{0}$\\quad$ ${droite} %{1}<br>Asymptotes (équations séparées par des points-virgules, $\\emptyset$ s'il n'y en a pas) : %{2}` : ''}`,
        correction: '',
        answer: [
          { value: e.gauche.limite, compare: seq([isEqual()]) },
          { value: e.droite.limite, compare: seq([isEqual()]) },
          {
            value:
              e.asymptotes.length === 0 ? '\\emptyset' : e.asymptotes.join(';'),
            compare: all([sameEquationSet()]),
          },
        ],
        field: [
          { keyboard: KeyboardType.clavierFonctionsTerminales },
          { keyboard: KeyboardType.clavierFonctionsTerminales },
          { keyboard: KeyboardType.clavierDeBaseAvecVariable },
        ],
      })
      const correctionB =
        enTete('Limites et asymptotes') +
        parties([
          `Limite en $${e.gauche.borne}$. ${e.gauche.redaction}`,
          `Limite en $${e.droite.borne}$. ${e.droite.redaction}`,
          `Asymptotes. ${e.asymptotesCorr}<br>${asymptotesTex}`,
        ])

      // c) Dérivée et tableau de croissance (et zéros approchés)
      const questionC = etape(iC, {
        question:
          'Calculer la dérivée de $f$ et construire son tableau de croissance ; préciser les extrema.' +
          (exacts
            ? ''
            : ' En déduire les zéros de $f$, arrondis au centième, et son tableau de signes.') +
          (this.interactif
            ? `<br>$f'(x)=$ %{0}<br>Abscisses des extrema (séparées par des points-virgules) : %{1}<br>Valeurs des extrema, dans le même ordre : %{2}` +
              (exacts
                ? ''
                : "<br>Zéros arrondis au centième (séparés par des points-virgules, $\\emptyset$ s'il n'y en a pas) : %{3}")
            : ''),
        correction: '',
        answer: [
          {
            value: e.derivee,
            compare: all([sameFunction({ domaine: e.echantillon })]),
          },
          { value: listeX, compare: all([sameExpressionList()]) },
          { value: listeY, compare: all([sameExpressionList()]) },
          ...(exacts
            ? []
            : [{ value: zerosAttendus, compare: all([sameExpressionList()]) }]),
        ],
        field: [
          { keyboard: KeyboardType.clavierFonctionsTerminales },
          { keyboard: KeyboardType.clavierFonctionsTerminales },
          { keyboard: KeyboardType.clavierFonctionsTerminales },
          { keyboard: KeyboardType.clavierFonctionsTerminalesEnsemble },
        ],
      })
      const correctionC =
        enTete('Dérivée et tableau de croissance') +
        parties([
          `Dérivée. Sur $${affiche(e.domaine)}$, on obtient :${e.deriveeCalcul}Donc $f'(x)=${miseEnEvidence(e.derivee)}$.`,
          `Signe de $f'$. ${e.signeCorr}`,
          `Tableau de croissance.<br>${tableau(e)}<br>La fonction $f$ admet ${extremaTex}.`,
          ...(exacts
            ? []
            : [
                `Zéros et signe de $f$.${redactionZerosApproches(e, zeros)}Donc ${zeros.length === 0 ? `$f$ n'a pas de zéro : $Z(f)=${miseEnEvidence('\\emptyset')}$` : `$Z(f)=\\left\\{${zeros.map((z, k) => `x_${k + 1}`).join(';')}\\right\\}$ avec ${zeros.map((z, k) => `$x_${k + 1}${zeroEntier(e, z) != null ? '=' : '\\approx '}${miseEnEvidence(zerosTex(e, [z])[0])}$`).join(', ')}`}.<br>${tableauSignes(e, zeros)}`,
              ]),
        ])

      // d) Représentation graphique
      const correctionD = `${enTete('Représentation graphique')}${phraseFigure(e)}<br>${figure(e)}`

      this.listeQuestions.push(
        `Soit $f$ la fonction définie par $f(x)=${e.f}$.` +
          createList({
            items: [
              questionA + (exacts ? tableauInteractif : ''),
              questionB,
              questionC + (exacts ? '' : tableauInteractif),
              'Représenter $f$ graphiquement.',
            ],
            style: 'alpha',
          }),
      )
      this.listeCorrections.push(
        createList({
          items: [correctionA, correctionB, correctionC, correctionD],
          style: 'alpha',
        }),
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}
