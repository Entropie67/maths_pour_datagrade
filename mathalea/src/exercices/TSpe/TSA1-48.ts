import { bleuMathalea, vertMathalea } from '../../lib/colors'
import {
  lireFormulaireComplexe,
  serialiseFormulaireComplexe,
  valeursParDefaut,
  type FormulaireComplexe,
} from '../../lib/formulaireComplexe'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
  texteGras,
} from '../../lib/outils/embellissements'
import { scriptPython } from '../../lib/outils/scriptPython'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer si une affirmation sur les suites est vraie ou fausse'
export const dateDePublication = '13/10/2026'
export const dateDeModifImportante = '17/10/2026'

export const uuid = '14891'
export const refs = { 'fr-fr': ['TSA1-48'], 'fr-ch': [] }

export type Theme =
  | 'python'
  | 'logarithme'
  | 'integrale'
  | 'limite'
  | 'pointFixe'
  | 'cours'
  | 'recurrence'
  | 'arithmeticoGeo'
  | 'arithGeo'
  | 'bornee'
  | 'calculTermes'
type Affirmation = {
  id: number
  tags: Theme[]
  enonce: string
  vraie: boolean
  correction: string
  /** Variante aléatoire de l’énoncé et de la correction (valeurs par défaut : celles ci-dessus). */
  generer?: () => { enonce: string; correction: string }
}

/** Affirmation 1 : $u_n=\dfrac{(-1)^n}{an+b}$ avec $a\geqslant1$ et $b\geqslant1$. */
function suiteBornee(a: number, b: number) {
  const coef = a === 1 ? '' : String(a)
  return {
    enonce: `La suite $u$ définie pour tout entier naturel $n$ par $u_n = \\dfrac{(-1)^n}{${coef}n + ${b}}$ est bornée.`,
    correction:
      'Pour tout entier naturel $n$, on a $-1\\leqslant(-1)^n\\leqslant1$ et ' +
      `$${coef}n+${b}\\geqslant1$. Ainsi, ` +
      `\\[\\begin{aligned}u_n&\\leqslant\\dfrac{1}{${coef}n+${b}}\\leqslant1\\\\` +
      `u_n&\\geqslant-\\dfrac{1}{${coef}n+${b}}\\geqslant-1\\end{aligned}\\]` +
      'La suite $(u_n)$ est donc minorée par $-1$ et ' +
      'majorée par $1$ : elle est bornée.',
  }
}

/** Affirmation 4 : $u_n=\dfrac{c+(-1)^n}{n}$ avec $c\geqslant2$. */
function suiteDivergente(c: number) {
  return {
    enonce: `On considère la suite $(u_n)$ définie pour tout entier naturel non nul $n$ par $u_n = \\dfrac{${c} + (-1)^n}{n}$. <br><br>Affirmation : La suite $(u_n)$ est divergente.`,
    correction:
      'Pour tout entier naturel $n\\geqslant1$, on a ' +
      `:\\[\\begin{aligned}-1&\\leqslant(-1)^n\\leqslant1\\\\${c - 1}&\\leqslant${c}+(-1)^n` +
      `\\leqslant${c + 1}&&\\text{en ajoutant }${c}\\\\\\dfrac{${c - 1}}{n}&\\leqslant ` +
      `u_n\\leqslant\\dfrac{${c + 1}}{n}&&\\text{car }n>0\\end{aligned}\\]Or, ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${c - 1}}{n}=0$ et ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${c + 1}}{n}=0$.<br>D’après le théorème des ` +
      'gendarmes, $\\displaystyle\\lim_{n\\to+\\infty}u_n=0$. La suite est donc convergente.',
  }
}

/** Paramètres de $u_{n+1}=\dfrac1pu_n+c$ : limite entière $\ell=pm$, $c=m(p-1)$, $u_0>\ell$. */
function parametresSuiteAffine(p: number, m: number, k: number) {
  const limite = p * m
  return { p, c: m * (p - 1), m, limite, u0: limite + k }
}

function tirerSuiteAffine() {
  return parametresSuiteAffine(randint(2, 5), randint(1, 3), randint(2, 9))
}

/** Affirmation 8 : $u_{n+1}=\dfrac1pu_n+c$ n’a pas pour limite $0$. */
function limiteSuiteAffine({
  p,
  c,
  m,
  limite,
  u0,
}: ReturnType<typeof tirerSuiteAffine>) {
  const unSurP = `\\dfrac1${p}`
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_0=${u0}$ et, pour tout entier naturel $n$, $u_{n+1}=${unSurP}u_n+${c}$.<br><br>Affirmation : $\\displaystyle\\lim_{n \\to +\\infty} u_n = 0$.`,
    correction:
      `Supposons que la suite $(u_n)$ converge vers un réel $\\ell$.<br><br> La fonction $f$ ` +
      `définie sur $\\mathbb R$ par $f(x)=${unSurP}x+${c}$ est continue sur $\\mathbb R$, donc en ` +
      '$\\ell$, et $u_{n+1}=f(u_n)$ pour tout entier naturel $n$.<br>D’après le théorème du ' +
      'point fixe pour une suite convergente définie par une fonction continue, ' +
      '$\\ell=f(\\ell)$.<br><br> Ainsi, ' +
      `$\\ell=${unSurP}\\ell+${c}$, donc $\\dfrac{${p - 1}}{${p}}\\ell=${c}$ et $\\ell=${limite}$.<br><br> ` +
      `La seule valeur possible pour sa limite est $${limite}$, donc la limite de $(u_n)$ ne peut pas être $0$.`,
  }
}

/** Affirmation 9 : $v_n=u_n-\ell$ est géométrique de raison $\dfrac1p$. */
function geometriqueSuiteAffine({
  p,
  c,
  m,
  limite,
  u0,
}: ReturnType<typeof tirerSuiteAffine>) {
  const unSurP = `\\dfrac1${p}`
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_0=${u0}$ et, pour tout entier naturel $n$, $u_{n+1}=${unSurP}u_n+${c}$.<br><br>Affirmation : La suite $(v_n)$ définie pour tout entier naturel $n$ par $v_n = u_n - ${limite}$ est géométrique.`,
    correction:
      'Soit $n$ un entier naturel.<br>D’après les définitions de $(u_n)$ et de $(v_n)$, ' +
      `\\[\\begin{aligned}v_{n+1}&= u_{n+1}-${limite}\\\\&= ${unSurP}u_n+${c}-${limite}\\\\&= ${unSurP}u_n-${m}\\\\&= ` +
      `${unSurP}(u_n-${limite})\\\\&= ${unSurP}v_n\\end{aligned}\\]Ainsi, pour tout entier naturel $n$, ` +
      `$v_{n+1}=${unSurP}v_n$. Par définition, la suite $(v_n)$ est géométrique de raison ` +
      `$${unSurP}$.`,
  }
}

/** Affirmation 10 : $an-b\leqslant S_n\leqslant an+b$ donc $u_n=S_n/n$ converge vers $a$. */
function encadrementSomme(a: number, b: number) {
  return {
    enonce: `On considère une suite $(S_n)$ qui vérifie pour tout entier naturel $n$ non nul : $${a}n - ${b} \\leqslant S_n \\leqslant ${a}n + ${b}$. La suite $(u_n)$ est définie pour tout entier naturel $n$ non nul par $u_n = \\dfrac{S_n}{n}$. <br><br>Affirmation : La suite $(u_n)$ converge.`,
    correction:
      `Pour tout entier naturel $n\\geqslant1$, on a :\\[\\begin{aligned}${a}n-${b}&\\leqslant ` +
      `S_n\\leqslant${a}n+${b}&&\\text{d’après l’énoncé}\\\\${a}-\\dfrac${b}n&\\leqslant\\dfrac{S_n}{n}` +
      `\\leqslant${a}+\\dfrac${b}n&&\\text{car }n>0\\\\${a}-\\dfrac${b}n&\\leqslant ` +
      `u_n\\leqslant${a}+\\dfrac${b}n&&\\text{car }u_n=\\dfrac{S_n}{n}\\end{aligned}\\]Or, ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac${b}n=0$. Par les règles d’opérations sur les ` +
      `limites, $\\displaystyle\\lim_{n\\to+\\infty}\\left(${a}-\\dfrac${b}n\\right)=${a}$ et ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(${a}+\\dfrac${b}n\\right)=${a}$.<br><br> D’après le ` +
      `théorème des gendarmes, $\\displaystyle\\lim_{n\\to+\\infty}u_n=${a}$. La suite $(u_n)$ ` +
      `converge donc vers $${a}$.`,
  }
}

function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b)
}

/** Tirer un entier de [min ; max] premier avec `autre`. */
function tirerPremierAvec(autre: number, min: number, max: number) {
  let n = randint(min, max)
  while (pgcd(n, autre) !== 1) n = randint(min, max)
  return n
}

/** Affirmation 11 : $v_1=\dfrac{k+1}{k}$, $v_{n+1}=2-\dfrac1{v_n}$ et $v_n=\dfrac{n+k}{n+k-1}$. */
function formuleRecurrenceHomographique(k: number) {
  const num = `n+${k}`
  const den = k === 1 ? 'n' : `n+${k - 1}`
  const denParenthese = k === 1 ? den : `(${den})`
  const v1 = k === 1 ? '2' : `\\dfrac{${k + 1}}{${k}}`
  return {
    enonce: `On considère la suite $(v_n)$ définie par $v_1 = ${v1}$ et pour tout entier naturel $n \\geqslant 1$, $v_{n+1} = 2 - \\dfrac{1}{v_n}$. <br><br>Affirmation : Pour tout entier naturel $n \\geqslant 1$, $v_n = \\dfrac{${num}}{${den}}$.`,
    correction:
      'Pour tout entier naturel $n\\geqslant1$, notons $\\mathcal P_n$ la propriété : ' +
      `$v_n=\\dfrac{${num}}{${den}}$.<br><br> Initialisation : \\[\\begin{aligned}v_1&= ${v1}\\\\&= ` +
      `\\dfrac{1+${k}}{${k}}\\end{aligned}\\] La propriété $\\mathcal P_1$ est vraie.<br><br> Hérédité ` +
      ': soit $n$ un entier naturel tel que $n\\geqslant1$. Supposons que $\\mathcal P_n$ est ' +
      `vraie. On a alors $v_n=\\dfrac{${num}}{${den}}>0$, donc $v_n\\neq0$, et ` +
      `\\[\\begin{aligned}v_{n+1}&= 2-\\dfrac1{v_n}\\\\&= 2-\\dfrac{${den}}{${num}}\\\\&= ` +
      `\\dfrac{2(${num})-${denParenthese}}{${num}}\\\\&= \\dfrac{n+${k + 1}}{${num}}\\\\&= ` +
      `\\dfrac{(n+1)+${k}}{${num}}\\end{aligned}\\] La propriété $\\mathcal P_{n+1}$ est donc ` +
      'vraie.<br><br> Conclusion : la propriété est vraie au rang $1$ et elle est héréditaire. ' +
      `Par le principe de récurrence, pour tout entier naturel $n\\geqslant1$, ` +
      `$v_n=\\dfrac{${num}}{${den}}$.`,
  }
}

/** Affirmation 15 : $u_n\leqslant\dfrac{-a^n+b^n}{c^n}$ avec $a>c>b>0$, donc $u_n\to-\infty$. */
function comparaisonGeometrique(a: number, b: number, c: number) {
  const g = pgcd(a, b)
  const rapport = `\\dfrac{${b / g}}{${a / g}}`
  const raison = `\\dfrac{${a}}{${c}}`
  return {
    enonce: `On considère une suite $(u_n)$ définie sur $\\mathbb{N}$ telle que, pour tout entier $n$, $u_n \\leqslant \\dfrac{-${a}^n + ${b}^n}{${c}^n}$. <br><br>Affirmation : $\\displaystyle\\lim_{n \\to +\\infty} u_n = -\\infty$.`,
    correction:
      `Pour tout entier naturel $n$, on factorise le numérateur par $${a}^n$, la plus grande puissance : ` +
      `\\[\\begin{aligned}u_n&\\leqslant\\dfrac{-${a}^n+${b}^n}{${c}^n}\\\\&= ` +
      `\\dfrac{${a}^n\\left(-1+\\left(${rapport}\\right)^n\\right)}{${c}^n}\\\\&= ` +
      `\\left(${raison}\\right)^n\\left(-1+\\left(${rapport}\\right)^n\\right)\\end{aligned}\\]` +
      `Comme $${raison}>1$, la propriété des limites des suites géométriques donne ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(${raison}\\right)^n=+\\infty$. Comme ` +
      `\\[\\begin{aligned}0&&lt;${rapport}&lt;1\\end{aligned}\\] cette même propriété donne ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(${rapport}\\right)^n=0$, donc ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(-1+\\left(${rapport}\\right)^n\\right)=-1$.<br><br> ` +
      'Par la règle du produit de limites, ' +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(${raison}\\right)^n\\left(-1+\\left(${rapport}\\right)^n\\right)=-\\infty$.<br><br> ` +
      'La suite $(u_n)$ est majorée, pour tout entier naturel $n$, par une suite de limite ' +
      '$-\\infty$.<br>D’après le théorème de comparaison, ' +
      '$\\displaystyle\\lim_{n\\to+\\infty}u_n=-\\infty$.',
  }
}

/** Affirmation 20 : $\dfrac pq<u_n\leqslant\dfrac{pkn^2+bn+c}{qkn^2+d}$, limite $\dfrac pq$. */
function gendarmesQuotient(
  p: number,
  q: number,
  k: number,
  b: number,
  c: number,
  d: number,
) {
  const pk = p * k
  const qk = q * k
  const quotient = `\\dfrac{${pk}n^2+${b}n+${c}}{${qk}n^2+${d}}`
  const minorant = `\\dfrac${p}${q}`
  return {
    enonce: `Soit $(u_n)$ une suite définie pour tout entier naturel $n$ et vérifiant : $${minorant} < u_n \\leqslant \\dfrac{${pk}n^2 + ${b}n + ${c}}{${qk}n^2 + ${d}}$. <br><br>Affirmation : $\\displaystyle\\lim_{n \\to +\\infty} u_n = ${minorant}$.`,
    correction:
      'Pour tout entier naturel $n$, l’énoncé donne ' +
      `\\[\\begin{aligned}${minorant}&&lt;u_n\\leqslant${quotient}\\end{aligned}\\]<br><br> Pour tout entier naturel ` +
      `$n\\geqslant1$, on peut diviser le numérateur et le dénominateur du majorant par $n^2>0$ ` +
      `: $${quotient}=\\dfrac{${pk}+\\dfrac{${b}}{n}+\\dfrac{${c}}{n^2}}{${qk}+\\dfrac{${d}}{n^2}}$.<br><br> Comme ` +
      '$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac1n=0$ et ' +
      '$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac1{n^2}=0$, les règles d’opérations sur les ' +
      `limites donnent une limite $${pk}$ au numérateur et une limite $${qk}$ au dénominateur. Le ` +
      'dénominateur ayant une limite non nulle, la règle du quotient de limites donne ' +
      `\\[\\begin{aligned}\\displaystyle\\lim_{n\\to+\\infty}${quotient}&= ` +
      `\\dfrac{${pk}}{${qk}}\\\\&= ${minorant}\\end{aligned}\\]La suite constante égale à $${minorant}$ a ` +
      `également pour limite $${minorant}$.<br>D’après le théorème des gendarmes, ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}u_n=${minorant}$.`,
  }
}

function tirerGendarmesQuotient() {
  const [p, q] = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [2, 5],
  ][randint(0, 5)]
  const k = randint(2, 5)
  const d = randint(1, 5)
  // $q(bn+c)>pd$ pour tout $n\geqslant0$ garantit que le majorant dépasse le minorant.
  const c = randint(Math.floor((p * d) / q) + 1, 9)
  return gendarmesQuotient(p, q, k, randint(1, 9), c, d)
}

/** Affirmation 21 : $\sum_{i=0}^n\left(\dfrac pr\right)^i\to\dfrac r{r-p}$, jamais $0$. */
function sommeGeometrique(p: number, r: number) {
  const q = `\\dfrac${p}${r}`
  const g = pgcd(r, r - p)
  const [numLimite, denLimite] = [r / g, (r - p) / g]
  const limite =
    denLimite === 1 ? `${numLimite}` : `\\dfrac{${numLimite}}{${denLimite}}`
  return {
    enonce: `On considère la suite $(u_n)$ définie sur $\\mathbb{N}$ par $u_n = 1 + \\dfrac{${p}}{${r}} + \\left(\\dfrac{${p}}{${r}}\\right)^2 + \\dots + \\left(\\dfrac{${p}}{${r}}\\right)^n$. <br><br>Affirmation : La suite $(u_n)$ a pour limite $0$.`,
    correction:
      'Pour tout entier naturel $n$, $u_n$ est la somme de $n+1$ termes consécutifs d’une suite ' +
      `géométrique de premier terme $1$ et de raison $q=${q}\\neq1$. Pour tout réel ` +
      '$q\\neq1$ et tout entier naturel $n$, la formule du cours est ' +
      '$1+q+q^2+\\cdots+q^n=\\dfrac{1-q^{n+1}}{1-q}$.<br><br> En l’appliquant avec ' +
      `$q=${q}$, on obtient \\[\\begin{aligned}u_n&= \\dfrac{1-\\left(${q}\\right)^{n+1}}{1-${q}}\\\\&= ` +
      `${limite}\\left(1-\\left(${q}\\right)^{n+1}\\right)\\end{aligned}\\]Comme ` +
      `\\[\\begin{aligned}0&&lt;${q}&lt;1\\end{aligned}\\] la propriété des limites des ` +
      `suites géométriques donne $\\displaystyle\\lim_{n\\to+\\infty}\\left(${q}` +
      '\\right)^{n+1}=0$.<br><br> Par les règles d’opérations sur les limites, ' +
      `$\\displaystyle\\lim_{n\\to+\\infty}u_n=${limite}$. La suite converge donc vers $${limite}$ ; sa limite ` +
      'n’est donc pas $0$.',
  }
}

function tirerSommeGeometrique() {
  const ratios = [
    [1, 2],
    [1, 3],
    [2, 3],
    [1, 4],
    [3, 4],
    [2, 5],
    [3, 5],
    [4, 5],
  ]
  const [p, r] = ratios[randint(0, ratios.length - 1)]
  return sommeGeometrique(p, r)
}

/** Affirmation 22 : le script ajoute $q^k$ au lieu de $q^i$ et ne fait que $k$ itérations. */
function scriptSommeGeometrique(p: number, r: number, k: number) {
  const q = `\\dfrac${p}${r}`
  return {
    enonce:
      `On considère la suite définie par $u_n=\\displaystyle\\sum_{i=0}^n\\left(\\dfrac{${p}}{${r}}\\right)^i$. <br><br>Affirmation : L'instruction $\\texttt{suite(${k})}$ ci-dessous, écrite en langage Python, renvoie $u_{${k}}$. ` +
      scriptPython(
        `def suite(k):\n    S = 0\n    for i in range(k):\n        S = S + (${p}/${r})**k\n    return S`,
        2,
      ),
    correction:
      `Lors de l’appel suite(${k}), la variable $k$ reste égale à $${k}$. La boucle range(k) ` +
      `effectue $${k}$ itérations, pour les valeurs de $i$ allant de $0$ à $${k - 1}$. À chaque ` +
      `itération, elle ajoute la même quantité $\\left(${q}\\right)^{${k}}$ à la variable ` +
      `$S$, initialisée à $0$. La fonction renvoie donc ` +
      `$${k}\\left(${q}\\right)^{${k}}$.<br><br> Or, ` +
      `$u_{${k}}=\\displaystyle\\sum_{i=0}^{${k}}\\left(${q}\\right)^i$ contient $${k + 1}$ termes. ` +
      `Comme \\[\\begin{aligned}0&&lt;${q}&lt;1\\end{aligned}\\] pour tout entier $i$ ` +
      `compris entre $0$ et $${k}$, $\\left(${q}\\right)^i\\geqslant\\left(${q}` +
      `\\right)^{${k}}$. En additionnant ces $${k + 1}$ inégalités, on obtient ` +
      `\\[\\begin{aligned}u_{${k}}&\\geqslant${k + 1}\\left(${q}\\right)^{${k}}>${k}\\left(${q}` +
      `\\right)^{${k}}\\end{aligned}\\] la dernière inégalité étant stricte puisque ` +
      `$\\left(${q}\\right)^{${k}}>0$.<br><br> La valeur renvoyée est donc strictement ` +
      `inférieure à $u_{${k}}$. Pour calculer $u_k$, il faut effectuer $k+1$ itérations avec ` +
      `range(k + 1), et ajouter (${p}/${r})**i à chaque itération.`,
  }
}

function tirerScriptSommeGeometrique() {
  const ratios = [
    [1, 2],
    [2, 3],
    [3, 4],
    [4, 5],
    [3, 5],
    [5, 6],
  ]
  const [p, r] = ratios[randint(0, ratios.length - 1)]
  return scriptSommeGeometrique(p, r, randint(20, 60))
}

/** Affirmation 23 : $u_0=1$, $u_{n+1}=\dfrac{u_n}{1+au_n}$ et $u_N=\dfrac1{aN+1}$. */
function calculTermeSuiteHomographique(a: number, N: number) {
  const etapes: string[] = []
  for (let k = 0; k < N; k++) {
    const d = a * k + 1
    const suivant = a * (k + 1) + 1
    const calcul =
      k === 0
        ? `\\dfrac1{1+${a}}`
        : `\\dfrac{\\frac{1}{${d}}}{1+\\frac{${a}}{${d}}}\\\\&= \\dfrac{\\frac{1}{${d}}}{\\frac{${suivant}}{${d}}}`
    etapes.push(
      `\\[\\begin{aligned}u_${k + 1}&= \\dfrac{u_${k}}{1+${a}u_${k}}\\\\&= ${calcul}\\\\&= \\dfrac1{${suivant}}\\end{aligned}\\]`,
    )
  }
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_0=1$ et, pour tout entier naturel $n$, $u_{n+1}=\\dfrac{u_n}{1+${a}u_n}$.<br><br>Affirmation : $u_${N} = \\dfrac{1}{${a * N + 1}}$.`,
    correction:
      'En appliquant successivement la relation de récurrence, on obtient :<br><br> ' +
      etapes.join('') +
      ' Tous les dénominateurs intervenant dans ces calculs sont strictement positifs.',
  }
}

/** Affirmation 24 : $u_0=1$, $u_{n+1}=\dfrac{u_n}{1+au_n}$ et $u_n=\dfrac1{an+1}$ pour tout $n$. */
function formuleSuiteHomographique(a: number) {
  const f = (n: string) => `\\dfrac1{${a}${n}+1}`
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_0=1$ et, pour tout entier naturel $n$, $u_{n+1}=\\dfrac{u_n}{1+${a}u_n}$.<br><br>Affirmation : Pour tout entier naturel $n$, $u_n = \\dfrac{1}{${a}n + 1}$.`,
    correction:
      'Pour tout entier naturel $n$, notons $\\mathcal P_n$ la propriété : ' +
      `$u_n=${f('n')}$.<br><br> Initialisation : \\[\\begin{aligned}u_0&= 1\\\\&= ` +
      `${f('\\times0')}\\end{aligned}\\] La propriété $\\mathcal P_0$ est vraie.<br><br> ` +
      'Hérédité : soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est vraie, ' +
      `c’est-à-dire que $u_n=${f('n')}$. Montrons que $\\mathcal P_{n+1}$ est vraie, ` +
      `c’est-à-dire que $u_{n+1}=${f('(n+1)')}$.<br><br> Alors, $u_n=${f('n')}>0$, ` +
      `donc $1+${a}u_n>0$, et \\[\\begin{aligned}u_{n+1}&= \\dfrac{u_n}{1+${a}u_n}\\\\&= ` +
      `\\dfrac{\\dfrac1{${a}n+1}}{1+\\dfrac{${a}}{${a}n+1}}\\\\&= \\dfrac{\\dfrac1{${a}n+1}}{\\dfrac{${a}n+${a + 1}}{${a}n+1}}\\\\&= ` +
      `\\dfrac1{${a}n+${a + 1}}\\\\&= ${f('(n+1)')}\\end{aligned}\\] La propriété $\\mathcal P_{n+1}$ ` +
      'est donc vraie.<br><br> Conclusion : la propriété est vraie au rang $0$ et elle est ' +
      'héréditaire. Par le principe de récurrence, pour tout entier naturel $n$, ' +
      `$u_n=${f('n')}$.`,
  }
}

/** Affirmation 25 : $u_n=\dfrac1{an+b}$ n’est pas minorée par $10^{-m}$. */
function minorantSuiteInverse(a: number, b: number, m: number) {
  const seuil = (10 ** m - b) / a
  const rang = Math.floor(seuil) + 1
  return {
    enonce:
      'On considère la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
      `$u_n=\\dfrac1{${a}n+${b}}$.<br><br>Affirmation : La suite $(u_n)$ est minorée par $10^{-${m}}$.`,
    correction:
      'On cherche un contre-exemple. Déterminons s’il existe des entiers naturels $n$ tels que ' +
      `$u_n&lt;10^{-${m}}$.<br>Pour tout entier naturel $n$, $${a}n+${b}>0$, et la fonction inverse est ` +
      `strictement décroissante sur $]0;+\\infty[$. Ainsi :\\[\\begin{aligned}u_n& ` +
      `&lt;10^{-${m}}\\\\\\iff\\dfrac1{${a}n+${b}}& &lt;\\dfrac1{10^{${m}}}\\\\\\iff${a}n+${b}&>10^{${m}}&&` +
      `\\text{par stricte décroissance de la fonction inverse sur }]0;+\\infty[\\\\\\iff ` +
      `n&>\\dfrac{10^{${m}}-${b}}{${a}}\\\\\\iff n&>${texNombre(seuil, 2).replace(/(?<!\\),/, '{,}')}\\\\\\iff ` +
      `n&\\geqslant${texNombre(rang, 0)}&&\\text{car }n\\in\\mathbb N\\end{aligned}\\]Ainsi, dès le rang ` +
      `$${texNombre(rang, 0)}$, on a $u_n&lt;10^{-${m}}$. Le nombre $10^{-${m}}$ n’est donc pas un minorant ` +
      'de la suite $(u_n)$.',
  }
}

function tirerMinorantSuiteInverse() {
  return minorantSuiteInverse(
    [2, 4, 5][randint(0, 2)],
    [1, 3][randint(0, 1)],
    randint(6, 10),
  )
}

/** Affirmation 26 : $g(x)=\ln(ax+1)+c$, $u_0$ et $u_1<u_0$ car $\mathrm e^d>2^d>au_0+1$ avec $d=u_0-c$. */
function suiteLogarithmeDecroissante(a: number, c: number, u0: number) {
  const d = u0 - c
  const w = a * u0 + 1
  return {
    enonce: `On considère la fonction $g$ définie sur $]0~;~+\\infty[$ par $g(x) = \\ln(${a}x + 1) + ${c}$. On considère la suite $(u_n)$ définie par $u_0 = ${u0}$ et pour tout $n \\in \\mathbb{N}$, $u_{n+1} = g(u_n)$. On admet que $(u_n)$ est strictement positive. <br><br>Affirmation : La suite $(u_n)$ est décroissante.`,
    correction:
      `La fonction $g$ est dérivable sur $]0;+\\infty[$, car $${a}x+1>0$ pour tout réel $x>0$. Pour ` +
      `tout réel $x>0$, $g'(x)=\\dfrac${a}{${a}x+1}>0$. La fonction $g$ est donc strictement ` +
      'croissante sur $]0;+\\infty[$.<br><br> Démontrons par récurrence que, pour tout entier ' +
      `naturel $n$, $u_{n+1}&lt;u_n$.<br><br> Initialisation : \\[\\begin{aligned}u_1&= ` +
      `g(${u0})\\\\&= \\ln(${w})+${c}\\end{aligned}\\] Comme $\\mathrm e>2$, on a ` +
      `\\[\\begin{aligned}\\mathrm e^{${d}}&>2^{${d}}=${texNombre(2 ** d, 0)}>${w}\\end{aligned}\\] La fonction ` +
      `logarithme népérien étant strictement croissante sur $]0;+\\infty[$, ` +
      `$\\ln(${w})&lt;\\ln(\\mathrm e^{${d}})=${d}$. Ainsi, \\[\\begin{aligned}u_1&&lt; ${d}+${c}\\\\&= ` +
      `${u0}\\\\&= u_0\\end{aligned}\\] La propriété est vraie au rang $0$.<br><br> Hérédité : soit ` +
      '$n$ un entier naturel. Supposons que $u_{n+1}&lt;u_n$. On admet que tous les termes sont ' +
      'strictement positifs : $u_{n+1}$ et $u_n$ appartiennent donc au domaine de $g$. Comme $g$ ' +
      'est strictement croissante, $g(u_{n+1})&lt;g(u_n)$, soit $u_{n+2}&lt;u_{n+1}$. La ' +
      'propriété est héréditaire.<br><br> Conclusion : par le principe de récurrence, pour tout ' +
      'entier naturel $n$, $u_{n+1}&lt;u_n$. La suite $(u_n)$ est donc strictement décroissante, ' +
      'et en particulier décroissante.',
  }
}

function tirerSuiteLogarithmeDecroissante() {
  return suiteLogarithmeDecroissante(
    randint(2, 5),
    randint(4, 12),
    randint(20, 40),
  )
}

/** Affirmation 27 : $v_n=\dfrac n{a+\cos n}$ (ou $\sin$) diverge vers $+\infty$. */
function divergenceQuotientTrigonometrique(a: number, fonction: 'cos' | 'sin') {
  const f = `\\${fonction}(n)`
  const inverse = (x: number) => (x === 1 ? '1' : `\\dfrac1${x}`)
  const fraction = (x: number) => (x === 1 ? 'n' : `\\dfrac n${x}`)
  return {
    enonce: `Soit $(v_n)$ la suite définie pour tout entier naturel $n$ par $v_n = \\dfrac{n}{${a} + ${f}}$. <br><br>Affirmation : La suite $(v_n)$ diverge vers $+\\infty$.`,
    correction:
      `Pour tout entier naturel $n$, on a :\\[\\begin{aligned}-1&\\leqslant${f}\\leqslant1` +
      `\\\\${a - 1}&\\leqslant${a}+${f}\\leqslant${a + 1}&&\\text{en ajoutant ` +
      `}${a}\\\\${inverse(a + 1)}&\\leqslant\\dfrac1{${a}+${f}}\\leqslant${inverse(a - 1)}&&\\text{par passage aux ` +
      `inverses de nombres positifs}\\\\${fraction(a + 1)}&\\leqslant\\dfrac n{${a}+${f}}\\leqslant ` +
      `${fraction(a - 1)}&&\\text{car }n\\geqslant0\\\\${fraction(a + 1)}&\\leqslant v_n\\leqslant ${fraction(a - 1)}&&\\text{par ` +
      `définition de }v_n\\end{aligned}\\]Or, $\\displaystyle\\lim_{n\\to+\\infty}${fraction(a + 1)}=+\\infty$. ` +
      'La suite $(v_n)$ est donc minorée par une suite de limite ' +
      '$+\\infty$.<br>D’après le théorème de comparaison, ' +
      '$\\displaystyle\\lim_{n\\to+\\infty}v_n=+\\infty$.',
  }
}

/** Tirer au hasard la version « miroir » (décroissante et $-\infty$ au lieu de croissante et $+\infty$). */
const tirerMiroir = () => randint(0, 1) === 1

/** Coefficient entier devant une variable : omis lorsqu’il vaut 1. */
const coef = (k: number) => (k === 1 ? '' : String(k))

/** Affirmation 28 : $u_n=\dfrac{s+a^n}{t+b^n}$ tend vers $+\infty$, pas vers $\dfrac ab$. */
function quotientExponentielles(s: number, t: number, a: number, b: number) {
  return {
    enonce: `La suite $(u_n)$ est définie pour tout entier naturel $n$ par $u_n = \\dfrac{${s} + ${a}^n}{${t} + ${b}^n}$. <br><br>Affirmation : La suite $(u_n)$ converge vers $\\dfrac{${a}}{${b}}$.`,
    correction:
      `Pour tout entier naturel $n$, on factorise le numérateur par $${a}^n$ et le dénominateur par ` +
      `$${b}^n$, qui sont strictement positifs : \\[\\begin{aligned}u_n&= ` +
      `\\dfrac{${a}^n(1+${coef(s)}${s === 1 ? '' : '\\times'}${a}^{-n})}{${b}^n(1+${coef(t)}${t === 1 ? '' : '\\times'}${b}^{-n})}\\\\&= ` +
      `\\left(\\dfrac${a}${b}\\right)^n\\dfrac{1+${coef(s)}${s === 1 ? '' : '\\times'}${a}^{-n}}{1+${coef(t)}${t === 1 ? '' : '\\times'}${b}^{-n}}\\end{aligned}\\]Comme ` +
      `\\[\\begin{aligned}0&&lt;\\dfrac1${a}&lt;1\\end{aligned}\\] et ` +
      `\\[\\begin{aligned}0&&lt;\\dfrac1${b}&lt;1\\end{aligned}\\] la propriété des limites des ` +
      `suites géométriques donne $\\displaystyle\\lim_{n\\to+\\infty}${a}^{-n}=0$ et ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}${b}^{-n}=0$.<br><br> Par les règles de la somme et du ` +
      'produit par une constante, le numérateur du second facteur a pour limite $1$ et son ' +
      'dénominateur a pour limite $1$. Cette dernière limite étant non nulle, la règle du ' +
      `quotient de limites donne $\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{1+${coef(s)}${s === 1 ? '' : '\\times'}${a}^{-n}}{1+${coef(t)}${t === 1 ? '' : '\\times'}${b}^{-n}}=1$.<br><br> ` +
      `De plus, $\\dfrac${a}${b}>1$, donc ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\left(\\dfrac${a}${b}\\right)^n=+\\infty$. Par la règle du ` +
      'produit de limites, le second facteur ayant une limite strictement positive, ' +
      `$\\displaystyle\\lim_{n\\to+\\infty}u_n=+\\infty$. La suite ne converge donc pas vers ` +
      `$\\dfrac${a}${b}$.`,
  }
}

function tirerQuotientExponentielles() {
  const b = randint(2, 4)
  return quotientExponentielles(
    randint(1, 3),
    randint(1, 4),
    tirerPremierAvec(b, b + 1, b + 4),
    b,
  )
}

/** Affirmation 29 : $w_0=0$, $w_{n+1}=aw_n-bn+c$ avec $a>b\geqslant1$, $c\geqslant1$ : $w_n\geqslant n$. */
function minorationRecurrence(a: number, b: number, c: number) {
  const reste = `${coef(a - b)}n+${c}`
  return {
    enonce: `On considère la suite $(w_n)$ définie par $w_0 = 0$ et pour tout entier naturel $n$, $w_{n+1} = ${a}w_n - ${coef(b)}n + ${c}$. <br><br>Affirmation : Pour tout entier naturel $n$, $w_n \\geqslant n$.`,
    correction:
      'Pour tout entier naturel $n$, notons $\\mathcal P_n$ la propriété : $w_n\\geqslant ' +
      'n$.<br><br> Initialisation : $w_0=0\\geqslant0$. La propriété $\\mathcal P_0$ est ' +
      'vraie.<br><br> Hérédité : soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est ' +
      `vraie, c’est-à-dire $w_n\\geqslant n$. Comme $${a}>0$, on a $${a}w_n\\geqslant${a}n$. En ajoutant ` +
      `$-${coef(b)}n+${c}$ aux deux membres, on obtient \\[\\begin{aligned}w_{n+1}&= ` +
      `${a}w_n-${coef(b)}n+${c}\\\\&\\geqslant ${a}n-${coef(b)}n+${c}\\\\&= ${reste}\\\\&\\geqslant n+1\\end{aligned}\\] La ` +
      'propriété $\\mathcal P_{n+1}$ est donc vraie.<br><br> Conclusion : la propriété est vraie ' +
      'au rang $0$ et elle est héréditaire. Par le principe de récurrence, pour tout entier ' +
      'naturel $n$, $w_n\\geqslant n$.',
  }
}

function tirerMinorationRecurrence() {
  const a = randint(2, 5)
  return minorationRecurrence(a, randint(1, a - 1), randint(1, 5))
}

/** Affirmation 30 : $u_n=(x-k)\mathrm e^n+\cos n$ avec $x\in[0;k[$ diverge vers $-\infty$. */
function divergenceExponentielleTrigo(k: number, fonction: 'cos' | 'sin') {
  const f = `\\${fonction}(n)`
  return {
    enonce: `Soit $x \\in [0~;~${k}[$. On considère la suite $(u_n)$ définie pour tout $n \\in \\mathbb{N}$ par $u_n = (x - ${k})\\text{e}^n + ${f}$. <br><br>Affirmation : La suite $(u_n)$ diverge vers $-\\infty$.`,
    correction:
      `Pour tout entier naturel $n$, on a :\\[\\begin{aligned}${f}&\\leqslant1\\\\u_n&` +
      `\\leqslant\\mathrm e^n(x-${k})+1&&\\text{par définition de }u_n\\end{aligned}\\]Comme ` +
      `$x\\in[0;${k}[$, on a $x-${k}&lt;0$. Or, $\\displaystyle\\lim_{n\\to+\\infty}\\mathrm ` +
      `e^n=+\\infty$, donc $\\displaystyle\\lim_{n\\to+\\infty}\\left(\\mathrm ` +
      `e^n(x-${k})+1\\right)=-\\infty$.<br><br> D’après le théorème de comparaison, ` +
      '$\\displaystyle\\lim_{n\\to+\\infty}u_n=-\\infty$.',
  }
}

/** Affirmation 31 : $v_n=\dfrac{an+\sin n}{n+b}$ converge vers $a$. */
function convergenceQuotientTrigo(
  a: number,
  b: number,
  fonction: 'cos' | 'sin',
) {
  const f = `\\${fonction}(n)`
  return {
    enonce: `On considère la suite $(v_n)$ définie pour tout entier naturel $n$ par $v_n = \\dfrac{${a}n + ${f}}{n + ${b}}$. <br><br>Affirmation : La suite $(v_n)$ diverge.`,
    correction:
      `Pour tout entier naturel $n$, on a :\\[\\begin{aligned}-1&\\leqslant${f}\\leqslant1` +
      `\\\\${a}n-1&\\leqslant${a}n+${f}\\leqslant${a}n+1&&\\text{en ajoutant ` +
      `}${a}n\\\\\\dfrac{${a}n-1}{n+${b}}&\\leqslant\\dfrac{${a}n+${f}}{n+${b}}\\leqslant` +
      `\\dfrac{${a}n+1}{n+${b}}&&\\text{car }n+${b}>0\\\\\\dfrac{${a}n-1}{n+${b}}&\\leqslant ` +
      `v_n\\leqslant\\dfrac{${a}n+1}{n+${b}}&&\\text{par définition de }v_n\\end{aligned}\\]Pour tout ` +
      `entier naturel $n\\geqslant1$, on écrit :\\[\\begin{aligned}\\dfrac{${a}n-1}{n+${b}}&=` +
      `\\dfrac{${a}-\\frac{1}{n}}{1+\\frac{${b}}{n}}\\\\\\dfrac{${a}n+1}{n+${b}}&=\\dfrac{${a}+` +
      `\\frac{1}{n}}{1+\\frac{${b}}{n}}\\end{aligned}\\] Par quotient, ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${a}n-1}{n+${b}}=${a}$ et ` +
      `$\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{${a}n+1}{n+${b}}=${a}$.<br><br> D’après le théorème ` +
      `des gendarmes, $\\displaystyle\\lim_{n\\to+\\infty}v_n=${a}$. La suite $(v_n)$ est donc ` +
      'convergente.',
  }
}

/** Affirmation 32 : $u_1=p+q+r$, $u_{n+1}=u_n+2pn+(p+q)$ et $u_n=pn^2+qn+r$. */
function formulePolynomiale(p: number, q: number, r: number) {
  const polynome = (variable: string, numerique = false) => {
    const fois = (k: number) =>
      k === 1 ? '' : numerique ? `${k}\\times` : String(k)
    const parts = [
      p !== 0 ? `${fois(p)}${variable}^2` : '',
      q !== 0 ? `${fois(q)}${variable}` : '',
      r !== 0 ? `${r}` : '',
    ].filter(Boolean)
    return parts.length > 0 ? parts.join('+') : '0'
  }
  const u1 = p + q + r
  const lignes = [
    `u_n+${2 * p}n+${p + q}`,
    `${polynome('n')}+${2 * p}n+${p + q}`,
    `${coef(p)}n^2+${2 * p + q}n+${p + q + r}`,
    polynome('(n+1)'),
  ]
  // Supprimer les lignes consécutives identiques (cas $p=1$, $q=r=0$).
  const etapes = lignes.filter((ligne, i) => i === 0 || ligne !== lignes[i - 1])
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_1 = ${u1}$ et pour tout $n \\geqslant 1$, $u_{n+1} = u_n + ${2 * p}n + ${p + q}$. <br><br>Affirmation : Pour tout entier naturel $n \\geqslant 1$, $u_n = ${polynome('n')}$.`,
    correction:
      'Pour tout entier naturel $n\\geqslant1$, notons $\\mathcal P_n$ la propriété : ' +
      `$u_n=${polynome('n')}$.<br><br> Initialisation : \\[\\begin{aligned}u_1&= ${u1}\\\\&= ${polynome('1', true)}\\end{aligned}\\] ` +
      'La propriété $\\mathcal P_1$ est vraie.<br><br> Hérédité : soit $n$ un entier naturel tel ' +
      `que $n\\geqslant1$. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire $u_n=${polynome('n')}$. ` +
      `Montrons que $\\mathcal P_{n+1}$ est vraie, c’est-à-dire que $u_{n+1}=${polynome('(n+1)')}$.<br><br> ` +
      `D’après la relation de récurrence, \\[\\begin{aligned}u_{n+1}&= ${etapes.join('\\\\&= ')}\\end{aligned}\\] La propriété $\\mathcal P_{n+1}$ est donc ` +
      'vraie.<br><br> Conclusion : la propriété est vraie au rang $1$ et elle est héréditaire. ' +
      `Par le principe de récurrence, pour tout entier naturel $n\\geqslant1$, $u_n=${polynome('n')}$.`,
  }
}

/** Affirmation 33 : $S_n=\sum_{i=0}^n\mathrm e^{-ki}$ tend vers $\dfrac{\mathrm e^k}{\mathrm e^k-1}$. */
function sommeExponentielle(k: number) {
  const ek = k === 1 ? '\\mathrm e' : `\\mathrm e^{${k}}`
  const eMoinsK = `\\mathrm e^{-${k}}`
  const enonceEk = k === 1 ? '\\text{e}' : `\\text{e}^{${k}}`
  const kn = k === 1 ? '' : String(k)
  const kn1 = k === 1 ? '(n+1)' : `${k}(n+1)`
  return {
    enonce: `On considère la suite $(u_n)$ définie par $u_n = \\text{e}^{-${kn}n}$. On pose $S_n = u_0 + u_1 + \\dots + u_n$. <br><br>Affirmation : $\\displaystyle\\lim_{n \\to +\\infty} S_n = \\dfrac{${enonceEk}}{${enonceEk} - 1}$.`,
    correction:
      `Pour tout entier naturel $n$, \\[\\begin{aligned}u_n&= \\mathrm e^{-${kn}n}\\\\&= (${eMoinsK})^n\\end{aligned}\\] ` +
      `La suite $(u_n)$ est donc géométrique de premier terme $u_0=1$ et de raison $q=${eMoinsK}$. ` +
      'Comme $\\mathrm e>1$, on a ' +
      '\\[\\begin{aligned}0&&lt;q&lt;1\\end{aligned}\\] et en particulier $q\\neq1$.<br><br> La ' +
      'somme $S_n$ contient $n+1$ termes.<br>D’après la formule de la somme des termes d’une ' +
      'suite géométrique, \\[\\begin{aligned}S_n&= \\dfrac{1-q^{n+1}}{1-q}\\\\&= ' +
      `\\dfrac{1-\\mathrm e^{-${kn1}}}{1-${eMoinsK}}\\end{aligned}\\]Comme ` +
      '\\[\\begin{aligned}0&&lt;q&lt;1\\end{aligned}\\] la propriété des limites des suites ' +
      `géométriques donne $\\displaystyle\\lim_{n\\to+\\infty}\\mathrm e^{-${kn1}}=0$. Le ` +
      `dénominateur $1-${eMoinsK}$ est une constante strictement positive. Par les règles ` +
      'd’opérations sur les limites, \\[\\begin{aligned}\\displaystyle\\lim_{n\\to+\\infty}S_n&= ' +
      `\\dfrac1{1-${eMoinsK}}\\\\&= \\dfrac{${ek}}{${ek}-1}\\end{aligned}\\]`,
  }
}

/** Affirmation 34 : $u_n=\dfrac{\sin n}{n^p}$ tend vers $0$ : elle admet donc une limite. */
function limiteQuotientTrigo(fonction: 'cos' | 'sin', puissance: number) {
  const f = `\\${fonction}(n)`
  const d = puissance === 1 ? 'n' : `n^${puissance}`
  return {
    enonce: `La suite $(u_n)$ est définie pour tout entier naturel $n$ non nul par $u_n = \\dfrac{${f}}{${d}}$. <br><br>Affirmation : La suite $(u_n)$ n'admet pas de limite.`,
    correction:
      'Pour tout entier naturel $n\\geqslant1$, on a ' +
      `:\\[\\begin{aligned}-1&\\leqslant${f}\\leqslant1\\\\-\\dfrac1{${d}}&\\leqslant\\dfrac{${f}}${puissance === 1 ? 'n' : `{${d}}`}` +
      `\\leqslant\\dfrac1{${d}}&&\\text{car }${d}>0\\\\-\\dfrac1{${d}}&\\leqslant u_n\\leqslant\\dfrac1{${d}}&&\\text{car ` +
      `}u_n=\\dfrac{${f}}${puissance === 1 ? 'n' : `{${d}}`}\\end{aligned}\\]Or, $\\displaystyle\\lim_{n\\to+\\infty}\\left(-` +
      `\\dfrac1{${d}}\\right)=0$ et $\\displaystyle\\lim_{n\\to+\\infty}\\dfrac1{${d}}=0$.<br>D’après le ` +
      'théorème des gendarmes, $\\displaystyle\\lim_{n\\to+\\infty}u_n=0$. La suite $(u_n)$ ' +
      'admet donc une limite finie : elle converge vers $0$.',
  }
}

/** Affirmation 35 : $u_n=b-an$ (ou $an-b$ dans la version miroir), monotone et bornée d’un côté, sans limite finie. */
function contreExempleDecroissante(a: number, b: number, miroir = false) {
  const constante = b === 0 ? '' : miroir ? `-${b}` : `+${b}`
  const terme = miroir ? `${coef(a)}n${constante}` : `-${coef(a)}n${constante}`
  const suivant = miroir
    ? `${coef(a)}(n+1)${constante}`
    : `-${coef(a)}(n+1)${constante}`
  return {
    enonce: miroir
      ? 'Toute suite croissante et minorée converge.'
      : 'Toute suite décroissante et majorée converge.',
    correction:
      'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
      `$u_n=${terme}$.<br><br> Pour tout entier naturel $n$, ` +
      `\\[\\begin{aligned}u_{n+1}-u_n&= (${suivant})-(${terme})\\\\&= ${miroir ? '' : '-'}${a}\\\\&${miroir ? '>' : '&lt;'} 0\\end{aligned}\\] La suite ` +
      (miroir
        ? `$(u_n)$ est donc croissante. De plus, pour tout entier naturel $n$, $u_n\\geqslant${-b}$ : ` +
          `elle est minorée par $${-b}$.<br><br> Or, $\\displaystyle\\lim_{n\\to+\\infty}u_n=+\\infty$ : `
        : `$(u_n)$ est donc décroissante. De plus, pour tout entier naturel $n$, $u_n\\leqslant${b}$ : ` +
          `elle est majorée par $${b}$.<br><br> Or, $\\displaystyle\\lim_{n\\to+\\infty}u_n=-\\infty$ : `) +
      'cette suite ne converge pas. Elle constitue donc un contre-exemple à l’affirmation.',
  }
}

/** Affirmation 36 : $u_n=\pm(n+c(-1)^n)$ a une limite infinie sans être monotone à partir d’un rang. */
function contreExempleNonMonotone(c: number, miroir = false) {
  const signe = miroir ? '-' : ''
  return {
    enonce: miroir
      ? 'Toute suite qui tend vers $-\\infty$ est décroissante à partir d’un certain rang.'
      : 'Toute suite qui tend vers $+\\infty$ est croissante à partir d’un certain rang.',
    correction:
      'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
      (miroir
        ? `$u_n=-n-${coef(c)}(-1)^n$.<br><br> Pour tout entier naturel $n$, $(-1)^n\\geqslant-1$, donc ` +
          `$-${coef(c)}(-1)^n\\leqslant${c}$ et $u_n\\leqslant-n+${c}$. Or, $\\displaystyle\\lim_{n\\to+\\infty}(-n+${c})=-\\infty$. D’après le ` +
          'théorème de comparaison, $\\displaystyle\\lim_{n\\to+\\infty}u_n=-\\infty$.<br><br> ' +
          `Pour tout entier naturel $n$ pair, \\[\\begin{aligned}u_{n+1}-u_n&= ` +
          `(-(n+1)+${c})-(-n-${c})\\\\&= ${2 * c - 1}\\\\&> 0\\end{aligned}\\] Il existe donc des entiers $n$ ` +
          'arbitrairement grands tels que $u_{n+1}>u_n$ : la suite $(u_n)$ n’est décroissante à ' +
          'partir d’aucun rang, alors qu’elle tend vers $-\\infty$. Elle constitue donc un ' +
          'contre-exemple à l’affirmation.'
        : `$u_n=n+${coef(c)}(-1)^n$.<br><br> Pour tout entier naturel $n$, $(-1)^n\\geqslant-1$, donc ` +
          `$u_n\\geqslant n-${c}$. Or, $\\displaystyle\\lim_{n\\to+\\infty}(n-${c})=+\\infty$. D’après le ` +
          'théorème de comparaison, $\\displaystyle\\lim_{n\\to+\\infty}u_n=+\\infty$.<br><br> ' +
          `Pour tout entier naturel $n$ pair, \\[\\begin{aligned}u_{n+1}-u_n&= ` +
          `(n+1-${c})-(n+${c})\\\\&= ${1 - 2 * c}\\\\&&lt; 0\\end{aligned}\\] Il existe donc des entiers $n$ ` +
          'arbitrairement grands tels que $u_{n+1}<u_n$ : la suite $(u_n)$ n’est croissante à ' +
          'partir d’aucun rang, alors qu’elle tend vers $+\\infty$. Elle constitue donc un ' +
          'contre-exemple à l’affirmation.'),
  }
}

/** Affirmation 3 : une suite monotone peut ne pas tendre vers l’infini (version miroir : décroissante, $-\infty$). */
function monotoneSansLimiteInfinie(c: number, miroir = false) {
  const terme = miroir ? `-${c}+\\dfrac1{n+1}` : `${c}-\\dfrac1{n+1}`
  return {
    enonce: miroir
      ? 'Toute suite décroissante tend vers $-\\infty$.'
      : 'Toute suite croissante tend vers $+\\infty$.',
    correction:
      'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
      `$u_n=${terme}$.<br><br> Soit $n$ un entier naturel, ` +
      (miroir
        ? '\\[\\begin{aligned}u_{n+1}-u_n&= \\dfrac1{n+2}-\\dfrac1{n+1}\\\\&= ' +
          '-\\dfrac1{(n+1)(n+2)}\\end{aligned}\\] On a $u_{n+1}-u_n&lt;0$ pour tout entier naturel $n$. ' +
          `<br>Cette suite est donc décroissante.<br> Or, pour tout entier $n$, on a $u_n\\geqslant -${c}$.<br> ` +
          'Cette suite est décroissante et minorée : elle ne tend donc pas vers $-\\infty$, ce ' +
          'qui fournit un contre-exemple.'
        : '\\[\\begin{aligned}u_{n+1}-u_n&= \\dfrac1{n+1}-\\dfrac1{n+2}\\\\&= ' +
          '\\dfrac1{(n+1)(n+2)}\\end{aligned}\\] On a $u_{n+1}-u_n>0$ pour tout entier naturel $n$. ' +
          `<br>Cette suite est donc croissante.<br> Or, pour tout entier $n$, on a $u_n\\leqslant ${c}$.<br> ` +
          'Cette suite est croissante et majorée : elle ne tend donc pas vers $+\\infty$, ce ' +
          'qui fournit un contre-exemple.'),
  }
}

/** Affirmation 14 : monotone et bornée par 0 mais de limite différente (version miroir : croissante, majorée). */
function limiteDifferenteDuBorne(c: number, miroir = false) {
  const terme = miroir ? `-${c}-\\dfrac1{n+1}` : `${c}+\\dfrac1{n+1}`
  return {
    enonce: miroir
      ? 'Toute suite croissante et majorée par $0$ converge vers $0$.'
      : 'Toute suite décroissante et minorée par $0$ converge vers $0$.',
    correction: miroir
      ? 'Le théorème de convergence monotone garantit qu’une suite croissante et majorée ' +
        'converge, mais il n’impose pas que sa limite soit égale à un majorant donné.<br><br> ' +
        'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
        `$u_n=${terme}$. Pour tout entier naturel $n$, ` +
        `\\[\\begin{aligned}u_n&&lt;-${c}&lt;0\\end{aligned}\\] donc cette suite est majorée par $0$. De ` +
        'plus, \\[\\begin{aligned}u_{n+1}-u_n&= -\\dfrac1{n+2}+\\dfrac1{n+1}\\\\&= ' +
        '\\dfrac1{(n+1)(n+2)}\\\\&> 0\\end{aligned}\\] Elle est donc strictement ' +
        'croissante.<br><br> Comme $\\displaystyle\\lim_{n\\to+\\infty}\\dfrac1{n+1}=0$, par la ' +
        `règle de la somme de limites, $\\displaystyle\\lim_{n\\to+\\infty}u_n=-${c}$. Cette suite ` +
        'constitue donc un contre-exemple à l’affirmation.'
      : 'Le théorème de convergence monotone garantit qu’une suite décroissante et minorée ' +
        'converge, mais il n’impose pas que sa limite soit égale à un minorant donné.<br><br> ' +
        'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
        `$u_n=${terme}$. Pour tout entier naturel $n$, ` +
        `\\[\\begin{aligned}u_n&>${c}>0\\end{aligned}\\] donc cette suite est minorée par $0$. De ` +
        'plus, \\[\\begin{aligned}u_{n+1}-u_n&= \\dfrac1{n+2}-\\dfrac1{n+1}\\\\&= ' +
        '-\\dfrac1{(n+1)(n+2)}\\\\&&lt; 0\\end{aligned}\\] Elle est donc strictement ' +
        'décroissante.<br><br> Comme $\\displaystyle\\lim_{n\\to+\\infty}\\dfrac1{n+1}=0$, par la ' +
        `règle de la somme de limites, $\\displaystyle\\lim_{n\\to+\\infty}u_n=${c}$. Cette suite ` +
        'constitue donc un contre-exemple à l’affirmation.',
  }
}

/** Affirmation 2 : une suite bornée peut diverger en alternant entre deux valeurs ($u_n=k(-1)^n$). */
function borneeSansConvergence(k: number, variante = false) {
  const terme = `${coef(k)}(-1)^n`
  return {
    enonce: variante
      ? 'Une suite bornée ne peut pas être divergente.'
      : 'Toute suite bornée est convergente.',
    correction:
      'Considérons la suite $(u_n)$ définie, pour tout entier naturel $n$, par ' +
      `$u_n=${terme}$.<br><br> Pour tout entier naturel $n$, \\[\\begin{aligned}${-k}&\\leqslant ` +
      `u_n\\leqslant${k}\\end{aligned}\\] Cette suite est bornée.<br><br> Cette suite prend ` +
      `alternativement les valeurs $${-k}$ et $${k}$ : elle diverge en alternant, ` +
      'alors qu’elle est bornée. Elle constitue donc un contre-exemple à l’affirmation.',
  }
}

// Les tags couvrent l’énoncé ET les outils nécessaires à sa justification.
// Un tableau vide désigne une affirmation générale sans ces prérequis.
export const affirmations: Affirmation[] = [
  {
    id: 1,
    tags: ['bornee'],
    enonce: suiteBornee(1, 1).enonce,
    vraie: true,
    correction: suiteBornee(1, 1).correction,
    generer: () => suiteBornee(randint(1, 5), randint(1, 6)),
  },
  {
    id: 2,
    tags: ['limite', 'cours', 'bornee'],
    enonce: borneeSansConvergence(1).enonce,
    vraie: false,
    correction: borneeSansConvergence(1).correction,
    generer: () => borneeSansConvergence(randint(1, 3), tirerMiroir()),
  },
  {
    id: 3,
    tags: ['limite', 'cours'],
    enonce: monotoneSansLimiteInfinie(1).enonce,
    vraie: false,
    correction: monotoneSansLimiteInfinie(1).correction,
    generer: () => monotoneSansLimiteInfinie(randint(1, 3), tirerMiroir()),
  },
  {
    id: 4,
    tags: ['limite'],
    enonce: suiteDivergente(25).enonce,
    vraie: false,
    correction: suiteDivergente(25).correction,
    generer: () => suiteDivergente(randint(5, 60)),
  },
  {
    id: 5,
    tags: ['arithGeo'],
    enonce:
      'On considère la suite $(w_n)$ définie par $w_0=1$ et, pour tout entier naturel $n$, $w_{n+1}=\\dfrac{w_n}{1+w_n}$. <br> On admet que pour tout entier naturel $n$, $w_n > 0$. On considère la suite $(t_n)$ définie pour tout entier naturel $n$ par $t_n = \\dfrac{k}{w_n}$ où $k$ est un nombre réel strictement positif. <br><br>Affirmation : La suite $(t_n)$ est une suite arithmétique strictement croissante.',
    vraie: true,
    correction:
      'Soit $n$ un entier naturel. On admet que $w_n>0$ et $w_{n+1}>0$, donc les quotients ' +
      'définissant $t_n$ et $t_{n+1}$ existent. On calcule :<br><br> ' +
      '\\[\\begin{aligned}t_{n+1}&= \\dfrac{k}{w_{n+1}}\\\\&= \\dfrac{k}{\\dfrac{w_n}{1+w_n}}\\\\&= ' +
      '\\dfrac{k(1+w_n)}{w_n}\\\\&= \\dfrac{k}{w_n}+k\\\\&= t_n+k\\end{aligned}\\]Ainsi, pour ' +
      'tout entier naturel $n$, $t_{n+1}-t_n=k$. Par définition, la suite $(t_n)$ est ' +
      'arithmétique de raison $k$. Comme $k>0$, $t_{n+1}-t_n>0$ pour tout entier naturel $n$ : ' +
      'elle est strictement croissante.',
  },
  {
    id: 6,
    tags: ['logarithme'],
    enonce:
      'On considère la suite $(v_n)$ définie par $v_0=1$ et, pour tout entier naturel $n$, $v_{n+1}=\\ln(1+v_n)$. <br> On admet que pour tout entier naturel $n$, $v_n > 0$. <br><br>Affirmation : La suite $(v_n)$ est décroissante.',
    vraie: true,
    correction:
      'Considérons la fonction $h$ définie sur $[0;+\\infty[$ par $h(x)=x-\\ln(1+x)$. Elle est ' +
      'dérivable sur cet intervalle et, pour tout réel $x\\geqslant0$, ' +
      "\\[\\begin{aligned}h'(x)&= 1-\\dfrac1{1+x}\\\\&= \\dfrac{x}{1+x}\\end{aligned}\\]Pour " +
      "tout réel $x>0$, $h'(x)>0$. La fonction $h$ est donc strictement croissante sur " +
      '$[0;+\\infty[$. Comme $h(0)=0$, pour tout réel $x>0$, $h(x)>0$, soit ' +
      '$\\ln(1+x)&lt;x$.<br><br> Pour tout entier naturel $n$, on admet que $v_n>0$. En ' +
      'appliquant cette inégalité à $x=v_n$, on obtient $v_{n+1}=\\ln(1+v_n)&lt;v_n$. La suite ' +
      '$(v_n)$ est donc strictement décroissante, et en particulier décroissante.',
  },
  {
    id: 7,
    tags: ['logarithme', 'integrale'],
    enonce:
      'On considère la suite $(I_n)$ définie pour tout entier naturel $n$ par $I_n = \\displaystyle\\int_1^{\\text{e}} [\\ln(x)]^n\\,\\text{d}x$. <br><br>Affirmation : Pour tout entier naturel $n$, $I_{n+1} = \\text{e} - (n + 1) I_n$.',
    vraie: true,
    correction:
      'Soit $n$ un entier naturel. Posons, pour tout réel $x\\in[1;\\mathrm e]$, $u(x)=(\\ln ' +
      'x)^{n+1}$ et $v(x)=x$.<br><br> Les fonctions $u$ et $v$ sont dérivables sur ' +
      "$[1;\\mathrm e]$, avec $u'(x)=\\dfrac{n+1}{x}(\\ln x)^n$ et $v'(x)=1$.<br> Les " +
      "fonctions $u'$ et $v'$ sont continues sur $[1;\\mathrm e]$.<br><br> La formule " +
      'd’intégration par parties donne :<br><br> \\[\\begin{aligned}I_{n+1}&= ' +
      "\\displaystyle\\int_1^{\\mathrm e}u(x)v'(x)\\,\\mathrm dx\\\\&= [u(x)v(x)]_1^{\\mathrm " +
      "e}-\\displaystyle\\int_1^{\\mathrm e}u'(x)v(x)\\,\\mathrm dx\\\\&= [x(\\ln " +
      'x)^{n+1}]_1^{\\mathrm e}-\\displaystyle\\int_1^{\\mathrm e}\\dfrac{n+1}{x}(\\ln ' +
      'x)^n\\times x\\,\\mathrm dx\\\\&= [x(\\ln x)^{n+1}]_1^{\\mathrm ' +
      'e}-(n+1)\\displaystyle\\int_1^{\\mathrm e}(\\ln x)^n\\,\\mathrm dx\\\\&= ' +
      '[x(\\ln x)^{n+1}]_1^{\\mathrm e}-(n+1)I_n\\end{aligned}\\]Dans l’intégrale, ' +
      '$\\dfrac{n+1}{x}\\times x=n+1$ : le facteur constant $n+1$ sort de l’intégrale par ' +
      'linéarité, et il reste $\\displaystyle\\int_1^{\\mathrm e}(\\ln x)^n\\,\\mathrm dx$, ' +
      'qui est par définition $I_n$.<br><br> Comme $\\ln(\\mathrm e)=1$, $\\ln(1)=0$ et ' +
      '$n+1\\geqslant1$, le terme entre crochets vaut ' +
      '$\\mathrm e\\times1^{n+1}-1\\times0^{n+1}=\\mathrm e$. Ainsi, pour tout entier naturel ' +
      '$n$, $I_{n+1}=\\mathrm e-(n+1)I_n$.',
  },
  {
    id: 8,
    tags: ['limite', 'pointFixe', 'arithmeticoGeo'],
    enonce: limiteSuiteAffine(parametresSuiteAffine(3, 1, 7)).enonce,
    vraie: false,
    correction: limiteSuiteAffine(parametresSuiteAffine(3, 1, 7)).correction,
    generer: () => limiteSuiteAffine(tirerSuiteAffine()),
  },
  {
    id: 9,
    tags: ['arithmeticoGeo'],
    enonce: geometriqueSuiteAffine(parametresSuiteAffine(3, 1, 7)).enonce,
    vraie: true,
    correction: geometriqueSuiteAffine(parametresSuiteAffine(3, 1, 7))
      .correction,
    generer: () => geometriqueSuiteAffine(tirerSuiteAffine()),
  },
  {
    id: 10,
    tags: ['limite'],
    enonce: encadrementSomme(3, 4).enonce,
    vraie: true,
    correction: encadrementSomme(3, 4).correction,
    generer: () => encadrementSomme(randint(2, 9), randint(2, 9)),
  },
  {
    id: 11,
    tags: ['recurrence'],
    enonce: formuleRecurrenceHomographique(1).enonce,
    vraie: true,
    correction: formuleRecurrenceHomographique(1).correction,
    generer: () => formuleRecurrenceHomographique(randint(1, 6)),
  },
  {
    id: 12,
    tags: ['limite'],
    enonce:
      'On considère la suite $(u_n)$ définie pour tout entier naturel $n$ par $u_n = \\text{e}^n - n$. <br><br>Affirmation : La suite $(u_n)$ converge.',
    vraie: false,
    correction:
      'Pour tout entier naturel $n$, on factorise par $\\mathrm e^n>0$ : ' +
      '\\[\\begin{aligned}u_n&= \\mathrm e^n-n\\\\&= \\mathrm e^n\\left(1-\\dfrac{n}{\\mathrm ' +
      'e^n}\\right)\\end{aligned}\\]<br>D’après le théorème de croissance comparée de ' +
      'l’exponentielle et des puissances, $\\displaystyle\\lim_{n\\to+\\infty}\\dfrac{n}{' +
      '\\mathrm e^n}=0$. <br>Par somme, $\\displaystyle\\lim_{n\\to+\\infty}\\left(1-' +
      '\\dfrac{n}{\\mathrm e^n}\\right)=1$.<br><br> De plus, ' +
      '$\\displaystyle\\lim_{n\\to+\\infty}\\mathrm e^n=+\\infty$. <br>Par produit, ' +
      '$\\displaystyle\\lim_{n\\to+\\infty}u_n=+\\infty$. La suite $(u_n)$ est donc divergente.',
  },
  {
    id: 13,
    tags: ['python', 'limite', 'pointFixe'],
    enonce:
      "On considère la suite $(u_n)$ définie à l'aide du script écrit ci-dessous en langage Python : " +
      scriptPython(
        'def u(n):\n    valeur = 2\n    for k in range(n):\n        valeur = 0.5 * (valeur + 2 / valeur)\n    return valeur',
        2,
      ) +
      '<br>On admet que $(u_n)$ est décroissante et vérifie pour tout entier naturel $n$ : $\\sqrt{2} \\leqslant u_n \\leqslant 2$. <br><br>Affirmation : La suite $(u_n)$ converge vers $\\sqrt{2}$.',
    vraie: true,
    correction:
      'La variable valeur est initialisée à $2$. La boucle range(n) effectue $n$ itérations, qui ' +
      "calculent les termes successifs d'une suite récurrente $(u_n)$. On en déduit que $u_0=2$ " +
      'et, pour tout entier naturel $n$, $u_{n+1}=\\dfrac12\\left(u_n+\\dfrac2{u_n}\\right)$. ' +
      'Les quotients existent puisque \\[\\begin{aligned}u_n&\\geqslant\\sqrt2>0\\end{aligned}' +
      '\\]<br><br> On admet que la suite $(u_n)$ est décroissante et minorée par ' +
      '$\\sqrt2$.<br>D’après le théorème de convergence monotone, elle converge vers un réel ' +
      '$\\ell$. Par passage à la limite dans \\[\\begin{aligned}\\sqrt2&\\leqslant ' +
      'u_n\\leqslant2\\end{aligned}\\] on obtient \\[\\begin{aligned}\\sqrt2&\\leqslant\\ell' +
      '\\leqslant2\\end{aligned}\\] donc $\\ell>0$.<br><br> La fonction $f$ définie sur ' +
      '$]0;+\\infty[$ par $f(x)=\\dfrac12\\left(x+\\dfrac2x\\right)$ est continue sur cet ' +
      'intervalle, donc en $\\ell$. Comme $u_{n+1}=f(u_n)$ et que $(u_n)$ converge, le théorème ' +
      'du point fixe s’applique et donne $\\ell=f(\\ell)$.<br><br> On obtient ' +
      '$\\ell=\\dfrac12\\left(\\ell+\\dfrac2\\ell\\right)$. Comme $\\ell>0$, on peut multiplier ' +
      'par $2\\ell$ : $2\\ell^2=\\ell^2+2$, donc $\\ell^2=2$. Puisque $\\ell>0$, ' +
      '$\\ell=\\sqrt2$. Ainsi, $\\displaystyle\\lim_{n\\to+\\infty}u_n=\\sqrt2$.',
  },
  {
    id: 14,
    tags: ['limite', 'cours', 'bornee'],
    enonce: limiteDifferenteDuBorne(1).enonce,
    vraie: false,
    correction: limiteDifferenteDuBorne(1).correction,
    generer: () => limiteDifferenteDuBorne(randint(1, 3), tirerMiroir()),
  },
  {
    id: 15,
    tags: ['limite', 'arithGeo'],
    enonce: comparaisonGeometrique(9, 3, 7).enonce,
    vraie: true,
    correction: comparaisonGeometrique(9, 3, 7).correction,
    generer: () => {
      const c = randint(4, 9)
      return comparaisonGeometrique(
        tirerPremierAvec(c, c + 1, c + 4),
        tirerPremierAvec(c, 2, c - 1),
        c,
      )
    },
  },
  {
    id: 16,
    tags: ['arithGeo'],
    enonce:
      'Lors d’un concours, le gagnant choisit entre deux prix. Prix A : recevoir $1000$ euros par jour pendant $15$ jours. Prix B : recevoir $1$ euro le premier jour, puis doubler chaque jour la somme reçue pendant $15$ jours.<br><br>Affirmation : La valeur du prix A est plus élevée que la valeur du prix B.',
    vraie: false,
    correction:
      'Le montant total du prix A est $15\\times1000=15000$ euros.<br><br> Les montants ' +
      'journaliers du prix B sont les $15$ premiers termes de la suite géométrique de premier ' +
      'terme $1$ et de raison $2$ : le premier jour correspond à $2^0$ et le quinzième à ' +
      '$2^{14}$.<br><br> D’après la formule de la somme des termes d’une suite géométrique, ' +
      'puisque la raison $2$ est différente de $1$, le montant total du prix B est ' +
      '\\[\\begin{aligned}1+2+2^2+\\cdots+2^{14}&= \\dfrac{1-2^{15}}{1-2}\\\\&= 2^{15}-1\\\\&= ' +
      '32767\\end{aligned}\\] euros.<br><br> Comme $32767>15000$, le montant total du prix B est ' +
      'supérieur à celui du prix A.',
  },
  {
    id: 17,
    tags: ['logarithme', 'integrale'],
    enonce:
      'On considère la suite $(v_n)$ définie pour tout entier $n \\geqslant 1$ par $v_n = \\displaystyle\\int_1^n \\ln(x)\\,\\text{d}x$. <br><br>Affirmation : La suite $(v_n)$ est croissante.',
    vraie: true,
    correction:
      'Soit $n$ un entier naturel tel que $n\\geqslant1$. La fonction logarithme népérien est ' +
      'continue sur $[1;n+1]$, donc les intégrales considérées existent.<br>D’après la relation ' +
      'de Chasles, \\[\\begin{aligned}v_{n+1}-v_n&= ' +
      '\\displaystyle\\int_1^{n+1}\\ln(x)\\,\\mathrm ' +
      'dx-\\displaystyle\\int_1^n\\ln(x)\\,\\mathrm dx\\\\&= ' +
      '\\displaystyle\\int_n^{n+1}\\ln(x)\\,\\mathrm dx\\end{aligned}\\]Pour tout réel ' +
      '$x\\in[n;n+1]$, on a $x\\geqslant1$, donc $\\ln(x)\\geqslant\\ln(1)=0$, puisque la ' +
      'fonction logarithme népérien est croissante sur $]0;+\\infty[$.<br>D’après la positivité ' +
      'de l’intégrale, $\\displaystyle\\int_n^{n+1}\\ln(x)\\,\\mathrm dx\\geqslant0$.<br><br> ' +
      'Ainsi, pour tout entier naturel $n\\geqslant1$, $v_{n+1}-v_n\\geqslant0$. La suite ' +
      '$(v_n)$ est donc croissante.',
  },
  {
    id: 18,
    tags: ['limite'],
    enonce:
      "On considère les suites $(u_n)$, $(v_n)$ et $(w_n)$ telles que, pour tout entier naturel $n$ : $u_n \\leqslant v_n \\leqslant w_n$. De plus, la suite $(u_n)$ converge vers $-1$ et la suite $(w_n)$ converge vers $1$. <br><br>Affirmation : La suite $(v_n)$ converge vers un nombre réel $\\ell$ appartenant à l'intervalle $[-1~;~1]$.",
    vraie: false,
    correction:
      'Le théorème des gendarmes nécessite que les deux suites encadrantes convergent vers la ' +
      'même limite. Ici, leurs limites sont différentes ; ce théorème ne permet donc pas de ' +
      'conclure à la convergence de $(v_n)$.<br><br> Pour construire un contre-exemple, posons, ' +
      'pour tout entier naturel $n$, $u_n=-1$, $w_n=1$ et $v_n=(-1)^n$. On a bien ' +
      '\\[\\begin{aligned}u_n&\\leqslant v_n\\leqslant w_n\\end{aligned}\\] pour tout entier ' +
      'naturel $n$, et les suites constantes $(u_n)$ et $(w_n)$ ont respectivement pour limites ' +
      '$-1$ et $1$.<br><br> Or, la suite $v_n=(-1)^n$ est divergente.<br><br> Ainsi, $(v_n)$ ne ' +
      'converge pas, alors que toutes les hypothèses de l’énoncé sont respectées. L’affirmation ' +
      'est donc réfutée par ce contre-exemple.',
  },
  {
    id: 19,
    tags: ['limite'],
    enonce:
      'On considère des suites telles que, pour tout $n\\in\\mathbb N$, $u_n\\leqslant v_n\\leqslant w_n$. On suppose que $(u_n)$ est croissante et converge vers $-1$, et que $(w_n)$ est décroissante et converge vers $1$.<br><br>Affirmation : Pour tout entier naturel $n$, $u_0\\leqslant v_n\\leqslant w_0$.',
    vraie: true,
    correction:
      'Soit $n$ un entier naturel. Comme $n\\geqslant0$ et que la suite $(u_n)$ est croissante, ' +
      '$u_0\\leqslant u_n$. De même, puisque la suite $(w_n)$ est décroissante, $w_n\\leqslant ' +
      'w_0$.<br><br> L’hypothèse d’encadrement donne \\[\\begin{aligned}u_n&\\leqslant ' +
      'v_n\\leqslant w_n\\end{aligned}\\] Par transitivité des inégalités, ' +
      '\\[\\begin{aligned}u_0&\\leqslant u_n\\leqslant v_n\\leqslant w_n\\leqslant ' +
      'w_0\\end{aligned}\\]<br><br> Ainsi, pour tout entier naturel $n$, ' +
      '\\[\\begin{aligned}u_0&\\leqslant v_n\\leqslant w_0\\end{aligned}\\]',
  },
  {
    id: 20,
    tags: ['limite'],
    enonce: gendarmesQuotient(1, 2, 3, 4, 7, 1).enonce,
    vraie: true,
    correction: gendarmesQuotient(1, 2, 3, 4, 7, 1).correction,
    generer: tirerGendarmesQuotient,
  },
  {
    id: 21,
    tags: ['limite', 'arithGeo'],
    enonce: sommeGeometrique(3, 4).enonce,
    vraie: false,
    correction: sommeGeometrique(3, 4).correction,
    generer: tirerSommeGeometrique,
  },
  {
    id: 22,
    tags: ['python', 'arithGeo'],
    enonce: scriptSommeGeometrique(3, 4, 50).enonce,
    vraie: false,
    correction: scriptSommeGeometrique(3, 4, 50).correction,
    generer: tirerScriptSommeGeometrique,
  },
  {
    id: 23,
    tags: ['calculTermes'],
    enonce: calculTermeSuiteHomographique(2, 4).enonce,
    vraie: true,
    correction: calculTermeSuiteHomographique(2, 4).correction,
    generer: () => calculTermeSuiteHomographique(randint(2, 5), randint(3, 5)),
  },
  {
    id: 24,
    tags: ['recurrence'],
    enonce: formuleSuiteHomographique(2).enonce,
    vraie: true,
    correction: formuleSuiteHomographique(2).correction,
    generer: () => formuleSuiteHomographique(randint(2, 5)),
  },
  {
    id: 25,
    tags: ['bornee'],
    enonce: minorantSuiteInverse(2, 1, 10).enonce,
    vraie: false,
    correction: minorantSuiteInverse(2, 1, 10).correction,
    generer: tirerMinorantSuiteInverse,
  },
  {
    id: 26,
    tags: ['logarithme', 'recurrence'],
    enonce: suiteLogarithmeDecroissante(3, 8, 25).enonce,
    vraie: true,
    correction: suiteLogarithmeDecroissante(3, 8, 25).correction,
    generer: tirerSuiteLogarithmeDecroissante,
  },
  {
    id: 27,
    tags: ['limite'],
    enonce: divergenceQuotientTrigonometrique(2, 'cos').enonce,
    vraie: true,
    correction: divergenceQuotientTrigonometrique(2, 'cos').correction,
    generer: () =>
      divergenceQuotientTrigonometrique(
        randint(2, 5),
        randint(0, 1) === 0 ? 'cos' : 'sin',
      ),
  },
  {
    id: 28,
    tags: ['limite', 'arithGeo'],
    enonce: quotientExponentielles(1, 2, 5, 3).enonce,
    vraie: false,
    correction: quotientExponentielles(1, 2, 5, 3).correction,
    generer: tirerQuotientExponentielles,
  },
  {
    id: 29,
    tags: ['recurrence'],
    enonce: minorationRecurrence(3, 2, 3).enonce,
    vraie: true,
    correction: minorationRecurrence(3, 2, 3).correction,
    generer: tirerMinorationRecurrence,
  },
  {
    id: 30,
    tags: ['limite'],
    enonce: divergenceExponentielleTrigo(1, 'cos').enonce,
    vraie: true,
    correction: divergenceExponentielleTrigo(1, 'cos').correction,
    generer: () =>
      divergenceExponentielleTrigo(
        randint(1, 4),
        randint(0, 1) === 0 ? 'cos' : 'sin',
      ),
  },
  {
    id: 31,
    tags: ['limite'],
    enonce: convergenceQuotientTrigo(2, 1, 'sin').enonce,
    vraie: false,
    correction: convergenceQuotientTrigo(2, 1, 'sin').correction,
    generer: () =>
      convergenceQuotientTrigo(
        randint(2, 5),
        randint(1, 4),
        randint(0, 1) === 0 ? 'cos' : 'sin',
      ),
  },
  {
    id: 32,
    tags: ['recurrence'],
    enonce: formulePolynomiale(1, 0, 0).enonce,
    vraie: true,
    correction: formulePolynomiale(1, 0, 0).correction,
    generer: () =>
      formulePolynomiale(randint(1, 3), randint(0, 3), randint(0, 3)),
  },
  {
    id: 33,
    tags: ['limite', 'arithGeo'],
    enonce: sommeExponentielle(1).enonce,
    vraie: true,
    correction: sommeExponentielle(1).correction,
    generer: () => sommeExponentielle(randint(1, 3)),
  },
  {
    id: 34,
    tags: ['limite'],
    enonce: limiteQuotientTrigo('sin', 1).enonce,
    vraie: false,
    correction: limiteQuotientTrigo('sin', 1).correction,
    generer: () =>
      limiteQuotientTrigo(randint(0, 1) === 0 ? 'cos' : 'sin', randint(1, 2)),
  },
  {
    id: 35,
    tags: ['limite', 'cours', 'bornee'],
    enonce: contreExempleDecroissante(1, 0).enonce,
    vraie: false,
    correction: contreExempleDecroissante(1, 0).correction,
    generer: () =>
      contreExempleDecroissante(randint(1, 5), randint(0, 5), tirerMiroir()),
  },
  {
    id: 36,
    tags: ['limite', 'cours'],
    enonce: contreExempleNonMonotone(1).enonce,
    vraie: false,
    correction: contreExempleNonMonotone(1).correction,
    generer: () => contreExempleNonMonotone(randint(1, 3), tirerMiroir()),
  },
]

/** Retenir toute affirmation dont au moins un thème est coché. */
export function filtrerAffirmations(themesAutorises: Theme[]): Affirmation[] {
  return affirmations.filter(({ tags }) =>
    tags.some((tag) => themesAutorises.includes(tag)),
  )
}

/** Nombre d’affirmations proposées lorsque ce thème est coché. */
export function nombreAffirmations(theme: Theme): number {
  return filtrerAffirmations([theme]).length
}

const avecNombre = (label: string, theme: Theme) =>
  `${label} (${nombreAffirmations(theme)})`

const selectionForm: FormulaireComplexe = {
  titre:
    'Entre parenthèses : nombre d’affirmations de chaque thème. ' +
    'On ne peut pas demander plus de questions que d’affirmations disponibles.',
  champs: [
    {
      type: 'case',
      nom: 'python',
      label: avecNombre('Python', 'python'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'pointFixe',
      label: avecNombre('Théorème du point fixe', 'pointFixe'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'cours',
      label: avecNombre('Applications directes du cours', 'cours'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'recurrence',
      label: avecNombre('Récurrence', 'recurrence'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'arithmeticoGeo',
      label: avecNombre('Suites arithmético-géométriques', 'arithmeticoGeo'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'arithGeo',
      label: avecNombre('Suites arithmétiques ou géométriques', 'arithGeo'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'bornee',
      label: avecNombre('Suites bornées, majorées, minorées', 'bornee'),
      defaut: true,
    },
    {
      type: 'case',
      nom: 'calculTermes',
      label: avecNombre('Calculs de termes', 'calculTermes'),
      defaut: true,
    },
  ],
}

/** Consigne au singulier lorsqu’une seule affirmation est posée. */
const consigneDe = (nbAffirmations: number) =>
  nbAffirmations === 1
    ? 'Indiquer si l’affirmation est vraie ou fausse et justifier la réponse.'
    : 'Indiquer si chaque affirmation est vraie ou fausse et justifier la réponse.'

/** Reprendre les repères de récurrence des TSA1-13 et TSA1-14. */
function formatRecurrenceCorrection(correction: string): string {
  if (!correction.includes('Hérédité :')) return correction
  const titleColor = context.isHtml ? bleuMathalea : 'black'
  const remarkColor = context.isHtml ? vertMathalea : 'black'
  for (const title of ['Initialisation :', 'Hérédité :', 'Conclusion :']) {
    correction = correction.replaceAll(
      title,
      texteEnCouleurEtGras(title, titleColor),
    )
  }
  return correction.replace(/Supposons que[^.]*\./g, (hypothesis) =>
    texteEnCouleur(hypothesis, remarkColor),
  )
}

export default class AffirmationsSuites extends Exercice {
  /** Numéros des affirmations tirées, dans l’ordre des questions. */
  idsAffirmations: number[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.consigne = consigneDe(1)
    this.sup = serialiseFormulaireComplexe(
      selectionForm,
      valeursParDefaut(selectionForm),
    )
    this.sup2 = this.sup3 = this.sup4 = true
    // Emplacement réservé : un booléen indique un ancien lien (voir nouvelleVersion).
    this.sup5 = '0'
    this.besoinFormulaireComplexe = selectionForm
    this.besoinFormulaire2CaseACocher = [
      avecNombre('Logarithme népérien', 'logarithme'),
      true,
    ]
    this.besoinFormulaire3CaseACocher = [
      avecNombre('Calcul intégral', 'integrale'),
      true,
    ]
    this.besoinFormulaire4CaseACocher = [
      avecNombre('Limites de suites', 'limite'),
      true,
    ]
  }

  nouvelleVersion(): void {
    // Migrer les anciens liens à cinq cases sans changer leur sélection
    // ni consommer de nombre aléatoire supplémentaire.
    const legacyPython = typeof this.sup === 'boolean'
    const legacyFixedPoint = typeof this.sup5 === 'boolean'
    const parameters = lireFormulaireComplexe(selectionForm, this.sup)
    const python = legacyPython ? this.sup === true : parameters.case('python')
    const fixedPoint = legacyFixedPoint
      ? this.sup5 === true
      : parameters.case('pointFixe')
    if (legacyPython || legacyFixedPoint) {
      this.sup = serialiseFormulaireComplexe(selectionForm, {
        python,
        pointFixe: fixedPoint,
        cours: parameters.case('cours'),
        recurrence: parameters.case('recurrence'),
        arithmeticoGeo: parameters.case('arithmeticoGeo'),
        arithGeo: parameters.case('arithGeo'),
        bornee: parameters.case('bornee'),
        calculTermes: parameters.case('calculTermes'),
      })
      if (legacyFixedPoint) this.sup5 = '0'
    }
    const autorisations: [Theme, boolean][] = [
      ['python', python],
      ['logarithme', Boolean(this.sup2)],
      ['integrale', Boolean(this.sup3)],
      ['limite', Boolean(this.sup4)],
      ['pointFixe', fixedPoint],
      ['cours', parameters.case('cours')],
      ['recurrence', parameters.case('recurrence')],
      ['arithmeticoGeo', parameters.case('arithmeticoGeo')],
      ['arithGeo', parameters.case('arithGeo')],
      ['bornee', parameters.case('bornee')],
      ['calculTermes', parameters.case('calculTermes')],
    ]
    const available = filtrerAffirmations(
      autorisations.filter(([, autorise]) => autorise).map(([theme]) => theme),
    )
    const selected = shuffle(available).slice(0, this.nbQuestions)
    this.consigne =
      available.length > 0
        ? consigneDe(selected.length)
        : 'Aucune affirmation ne correspond aux thèmes choisis.'
    this.idsAffirmations = selected.map(({ id }) => id)
    for (const [i, affirmation] of selected.entries()) {
      const { enonce, correction: corrigeBrut } =
        affirmation.generer?.() ?? affirmation
      this.listeQuestions[i] = enonce.replace(
        'Affirmation :',
        texteGras('Affirmation :'),
      )
      const verdict = affirmation.vraie ? 'Vraie' : 'Fausse'
      const correction = formatRecurrenceCorrection(corrigeBrut)
      this.listeCorrections[i] =
        `${correction}<br><br>L’affirmation est ${texteEnCouleurEtGras(verdict)}.`
      this.listeReponsesCourtes[i] = `$\\text{${verdict}}$`
    }
    listeQuestionsToContenu(this)
  }
}
