import { bleuMathalea } from '../../lib/colors'
import { matrice } from '../../lib/mathFonctions/Matrice'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import { context } from '../../modules/context'
import Exercice from '../Exercice'

export const titre =
  "Utiliser la récurrence pour calculer les puissances d'une matrice"
export const dateDePublication = '30/09/2026'

/**
 * On donne une matrice A d'ordre 2 et une expression de Aⁿ, à démontrer par
 * récurrence : matrice diagonale, triangulaire ou symétrique.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '1bd2b'

export const refs = {
  'fr-fr': ['TEM1-13'],
  'fr-ch': [],
}

const couleurTitre = context.isHtml ? bleuMathalea : 'black'

/** Exposant n, n+1, ou 1 pour l'initialisation. */
type Exposant = 'n' | 'n+1' | '1'

type Tirage = {
  A: number[][]
  /** Facteur scalaire devant la matrice, par exemple \dfrac{1}{2}. */
  facteur: string
  /** Coefficients de la matrice (sans le facteur) pour l'exposant e. */
  texM: (e: Exposant) => string[][]
  /** Valeurs de la matrice (sans le facteur) pour n = 1. */
  M1: number[][]
  /** Valeur exacte de Aᵏ donnée par la formule (facteur compris). */
  valeur: (k: number) => number[][]
  /** Calculs détaillés des coefficients de Mₙ×A qui le nécessitent. */
  details: (developpe: string[][], final: string[][]) => string[]
}

/**
 * Formule de la forme Σ coefs[i][j][b]·bases[b]ⁿ pour chaque coefficient
 * (une base égale à 1 donne un terme constant).
 */
type Lineaire = { bases: number[]; coefs: number[][][] }

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

function texMatriceNumerique(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

/** x, entre parenthèses s'il est négatif. */
function paren(x: number): string {
  return x < 0 ? `\\left(${texNombre(x)}\\right)` : texNombre(x)
}

/** xᵉ (1 reste 1 ; l'exposant 1 est écrit, pour l'initialisation). */
function puissance(x: number, e: string): string {
  if (x === 1) return '1'
  const base =
    x < 0 || !Number.isInteger(x)
      ? `\\left(${texNombre(x)}\\right)`
      : texNombre(x)
  return `${base}^{${e}}`
}

/** Terme k×facteur d'une somme (facteur vide pour une constante). */
function terme(k: number, facteur: string, premier: boolean): string {
  if (facteur === '') return premier ? texNombre(k) : ecritureAlgebrique(k)
  if (k === 1) return premier ? facteur : `+${facteur}`
  if (k === -1) return `-${facteur}`
  return `${premier ? texNombre(k) : ecritureAlgebrique(k)}\\times ${facteur}`
}

function somme(termes: [number, string][]): string {
  const nonNuls = termes.filter(([k]) => k !== 0)
  if (nonNuls.length === 0) return '0'
  return nonNuls.map(([k, facteur], i) => terme(k, facteur, i === 0)).join('')
}

/** Vrai si l'expression contient un + ou un - hors parenthèses et accolades. */
function estSomme(expr: string): boolean {
  let niveau = 0
  for (let i = 0; i < expr.length; i++) {
    const c = expr[i]
    if ('({['.includes(c)) niveau++
    else if (')}]'.includes(c)) niveau--
    else if (niveau === 0 && i > 0 && (c === '+' || c === '-')) return true
  }
  return false
}

/** Coefficients du produit M×A, écrits sans calcul (les termes nuls sont omis). */
function developpe(M: string[][], A: number[][]): string[][] {
  return M.map((ligne) =>
    A[0].map((_, j) => {
      const termes: string[] = []
      ligne.forEach((expr, k) => {
        const coef = A[k][j]
        if (expr === '0' || coef === 0) return
        const facteur = estSomme(expr) ? `\\left(${expr}\\right)` : expr
        if (expr === '1') termes.push(texNombre(coef))
        else if (coef === 1) termes.push(facteur)
        else termes.push(`${facteur}\\times ${paren(coef)}`)
      })
      if (termes.length === 0) return '0'
      return termes
        .map((t, i) => (i > 0 && !t.startsWith('-') ? `+${t}` : t))
        .join('')
    }),
  )
}

/** Enchaîne les étapes d'un calcul en supprimant les répétitions. */
function chaine(etapes: string[]): string {
  const distinctes = etapes.filter((e, i) => i === 0 || e !== etapes[i - 1])
  return `\\begin{aligned}${distinctes[0]}${distinctes
    .slice(1)
    .map((e) => `&=${e}`)
    .join('\\\\')}\\end{aligned}`
}

function texLineaire(l: Lineaire, i: number, j: number, e: Exposant): string {
  return somme(
    l.bases.map((x, b) => [l.coefs[i][j][b], x === 1 ? '' : puissance(x, e)]),
  )
}

/**
 * Tirage défini par une formule linéaire en les puissances des bases.
 * Pour chaque coefficient de Mₙ×A comportant plusieurs termes, on développe,
 * on regroupe selon les bases, puis on reconnaît les puissances n+1.
 */
function depuisLineaire(
  A: number[][],
  l: Lineaire,
  facteur = '',
  facteurNum = 1,
  texCoef?: (i: number, j: number, e: Exposant) => string | undefined,
): Tirage {
  const valeurSansFacteur = (k: number) =>
    l.coefs.map((ligne) =>
      ligne.map((coef) =>
        arrondi(
          coef.reduce((s, c, b) => s + c * l.bases[b] ** k, 0),
          8,
        ),
      ),
    )
  return {
    A,
    facteur,
    texM: (e) =>
      l.coefs.map((ligne, i) =>
        ligne.map((_, j) => texCoef?.(i, j, e) ?? texLineaire(l, i, j, e)),
      ),
    M1: valeurSansFacteur(1),
    valeur: (k) =>
      valeurSansFacteur(k).map((ligne) =>
        ligne.map((x) => arrondi(facteurNum * x, 8)),
      ),
    details: (dev, final) => {
      const chaines: string[] = []
      const puissanceN = (b: number) =>
        l.bases[b] === 1 ? '' : puissance(l.bases[b], 'n')
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 2; j++) {
          const developpes: [number, string][] = []
          for (let k = 0; k < 2; k++) {
            l.bases.forEach((_, b) => {
              const K = arrondi(l.coefs[i][k][b] * A[k][j], 8)
              if (K !== 0) developpes.push([K, puissanceN(b)])
            })
          }
          if (developpes.length < 2) continue
          const regroupes: [number, string][] = l.bases.map((_, b) => [
            arrondi(l.coefs[i][0][b] * A[0][j] + l.coefs[i][1][b] * A[1][j], 8),
            puissanceN(b),
          ])
          const reconnus: [number, string][] = l.bases.map((x, b) => [
            l.coefs[i][j][b],
            x === 1 ? '' : `${paren(x)}\\times ${puissance(x, 'n')}`,
          ])
          chaines.push(
            chaine([
              dev[i][j],
              somme(developpes),
              somme(regroupes),
              somme(reconnus),
              texLineaire(l, i, j, 'n+1'),
              final[i][j],
            ]),
          )
        }
      }
      return chaines
    },
  }
}

/** A = (a 0 ; 0 d) et Aⁿ = (aⁿ 0 ; 0 dⁿ). */
function tirageDiagonale(): Tirage {
  const a = randint(-3, 5, [0, 1])
  const d = randint(-3, 5, [0, 1, a])
  return depuisLineaire(
    [
      [a, 0],
      [0, d],
    ],
    {
      bases: [a, d],
      coefs: [
        [
          [1, 0],
          [0, 0],
        ],
        [
          [0, 0],
          [0, 1],
        ],
      ],
    },
  )
}

/** A = (a b ; 0 a) et Aⁿ = (aⁿ nbaⁿ⁻¹ ; 0 aⁿ). */
function tirageTriangulaireDiagonaleConstante(): Tirage {
  const a = choice([1, 2, 3, -1, -2])
  const b = randint(-5, 5, 0)
  const texM = (e: Exposant): string[][] => {
    if (e === '1') {
      const haut =
        a === 1
          ? `${texNombre(b)}\\times 1`
          : `${texNombre(b)}\\times 1\\times ${puissance(a, '0')}`
      return [
        [puissance(a, '1'), haut],
        ['0', puissance(a, '1')],
      ]
    }
    const [facteurN, exposant] = e === 'n' ? ['n', 'n-1'] : ['(n+1)', 'n']
    const haut =
      a === 1
        ? `${rienSi1(b)}${facteurN}`
        : `${rienSi1(b)}${facteurN}\\times ${puissance(a, exposant)}`
    return [
      [puissance(a, e), haut],
      ['0', puissance(a, e)],
    ]
  }
  return {
    A: [
      [a, b],
      [0, a],
    ],
    facteur: '',
    texM,
    M1: [
      [a, b],
      [0, a],
    ],
    valeur: (k) => [
      [a ** k, k * b * a ** (k - 1)],
      [0, a ** k],
    ],
    details: (dev, final) => {
      const etapes = [dev[0][1]]
      if (a !== 1) {
        const signeN = b === 1 ? '+' : b === -1 ? '-' : ecritureAlgebrique(b)
        etapes.push(
          `${terme(b, puissance(a, 'n'), true)}${signeN}n\\times ${puissance(a, 'n')}`,
        )
      }
      etapes.push(final[0][1])
      return [chaine(etapes)]
    },
  }
}

/** A = (a b ; 0 c) avec b = m(a-c) et Aⁿ = (aⁿ m(aⁿ-cⁿ) ; 0 cⁿ). */
function tirageTriangulaireDiagonaleDistincte(): Tirage | null {
  const a = randint(-2, 3, 0)
  const c = randint(-2, 3, [0, a])
  const m = choice([-2, -1, 1, 2])
  const b = m * (a - c)
  if (Math.abs(b) > 8) return null
  return depuisLineaire(
    [
      [a, b],
      [0, c],
    ],
    {
      bases: [a, c],
      coefs: [
        [
          [1, 0],
          [m, -m],
        ],
        [
          [0, 0],
          [0, 1],
        ],
      ],
    },
    '',
    1,
    (i, j, e) =>
      i === 0 && j === 1
        ? m === 1
          ? `${puissance(a, e)}-${puissance(c, e)}`
          : `${rienSi1(m)}\\left(${puissance(a, e)}-${puissance(c, e)}\\right)`
        : undefined,
  )
}

/**
 * A = (a b ; b a) et Aⁿ = ½(sⁿ+dⁿ sⁿ-dⁿ ; sⁿ-dⁿ sⁿ+dⁿ)
 * avec s = a+b et d = a-b.
 */
function tirageSymetrique(): Tirage | null {
  // s > 0 pour que le premier terme soit une puissance d'un nombre positif.
  const s = randint(2, 5)
  const d = randint(-3, 5, [0, s])
  if ((s + d) % 2 !== 0) return null
  const a = (s + d) / 2
  const b = (s - d) / 2
  return depuisLineaire(
    [
      [a, b],
      [b, a],
    ],
    {
      bases: [s, d],
      coefs: [
        [
          [1, 1],
          [1, -1],
        ],
        [
          [1, -1],
          [1, 1],
        ],
      ],
    },
    '\\dfrac{1}{2}',
    0.5,
  )
}

/** Vérifie numériquement que la formule donne bien Aᵏ pour k = 1…4. */
function formuleCorrecte(t: Tirage): boolean {
  const A = matrice(t.A)
  let Ak = matrice(t.A)
  for (let k = 1; k <= 4; k++) {
    const attendu = t.valeur(k)
    if (
      Ak.toArray().some((ligne, i) =>
        ligne.some((x, j) => Math.abs(x - attendu[i][j]) > 1e-9),
      )
    )
      return false
    Ak = Ak.multiply(A)
  }
  return true
}

export default class PuissanceMatriceRecurrence extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '1-2-3'
    this.besoinFormulaireTexte = [
      'Type de matrice',
      'Nombres séparés par des tirets :\n1 : Diagonale\n2 : Triangulaire (diagonale constante)\n3 : Triangulaire (coefficients diagonaux distincts)\n4 : Symétrique\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
    }).map(Number)
    const tirages: Record<number, () => Tirage | null> = {
      1: tirageDiagonale,
      2: tirageTriangulaireDiagonaleConstante,
      3: tirageTriangulaireDiagonaleDistincte,
      4: tirageSymetrique,
    }
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      let t: Tirage | null = null
      for (let essai = 0; essai < 1000 && t == null; essai++) {
        t = tirages[listeTypes[i]]()
      }
      if (t == null || !formuleCorrecte(t)) continue

      const f = t.facteur
      const texA = texMatriceNumerique(t.A)
      const Mn = t.texM('n')
      const Mn1 = t.texM('n+1')
      const texAn = `${f}${texPmatrix(Mn)}`
      const texAn1 = `${f}${texPmatrix(Mn1)}`

      const texte = `Soit $A=${texA}$.<br>
      Démontrer par récurrence que, pour tout entier naturel $n\\geqslant 1$, $A^n=${texAn}$.`

      let texteCorr = `Pour tout entier naturel $n\\geqslant 1$, on note $\\mathcal P_n$ la propriété : $A^n=${texAn}$.<br><br>`

      // Initialisation
      const etapesInit = [
        `${f}${texPmatrix(t.texM('1'))}`,
        `${f}${texMatriceNumerique(t.M1)}`,
        texA,
      ].filter((e, k, liste) => k === 0 || e !== liste[k - 1])
      texteCorr += `${texteEnCouleurEtGras('Initialisation :', couleurTitre)}<br>`
      texteCorr += `Pour $n=1$, le membre de droite de l’égalité à démontrer vaut :<br>
      $${etapesInit.join('=')}=A$.<br>
      Or $A^1=A$. La propriété $\\mathcal P_1$ est donc vraie.<br><br>`

      // Hérédité
      const dev = developpe(Mn, t.A)
      const details = t.details(dev, Mn1)
      texteCorr += `${texteEnCouleurEtGras('Hérédité :', couleurTitre)}<br>`
      texteCorr += `Soit $n\\geqslant 1$ un entier. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $A^n=${texAn}$.<br>
      Montrons que $\\mathcal P_{n+1}$ est vraie, c’est-à-dire que $A^{n+1}=${texAn1}$.<br>
      $\\begin{aligned}
      A^{n+1}
      &=A^n\\times A\\\\
      &=${texAn}\\times ${texA}\\\\
      &=${f}${texPmatrix(dev)}${details.length === 0 ? `\\\\&=${texAn1}.` : '.'}
      \\end{aligned}$<br>`
      if (details.length > 0) {
        texteCorr += `Or :<br>${details.map((d) => `$${d}$`).join('<br>')}<br>`
        texteCorr += `Donc $A^{n+1}=${texAn1}$.<br>`
      }
      texteCorr +=
        'La propriété $\\mathcal P_{n+1}$ est donc vraie. La propriété est héréditaire.<br><br>'

      // Conclusion
      texteCorr += `${texteEnCouleurEtGras('Conclusion :', couleurTitre)}<br>`
      texteCorr += `La propriété est vraie au rang $1$ et elle est héréditaire. Donc, par récurrence, pour tout entier naturel $n\\geqslant 1$, $${miseEnEvidence(`A^n=${texAn}`)}$.`

      if (this.questionJamaisPosee(i, listeTypes[i], t.A.toString())) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
