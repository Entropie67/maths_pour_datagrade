import { bleuMathalea } from '../../lib/colors'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  "Démontrer par récurrence des propriétés d'une suite de matrices colonnes"
export const dateDePublication = '17/10/2026'

/**
 * Démonstrations par récurrence sur des suites de matrices colonnes :
 * U_n=A^n(U_0-C)+C, expression de A^n puis de U_n, et calcul d'un terme.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'bf894'

export const refs = {
  'fr-fr': ['TEM1-33'],
  'fr-ch': [],
}

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/** Matrice à coefficients décimaux, écrits à la française. */
function texMatrice(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

function colonne(valeurs: number[]): number[][] {
  return valeurs.map((x) => [x])
}

function produit(A: number[][], U: number[]): number[] {
  return A.map((ligne) => ligne.reduce((s, a, j) => s + a * U[j], 0))
}

function produitMatrices(A: number[][], B: number[][]): number[][] {
  return A.map((ligne) =>
    B[0].map((_, j) => ligne.reduce((s, a, k) => s + a * B[k][j], 0)),
  )
}

function puissanceMatrice(A: number[][], k: number): number[][] {
  let M = A
  for (let i = 1; i < k; i++) M = produitMatrices(M, A)
  return M
}

/** Détail du produit AU, ligne par ligne. */
function texDetailProduit(A: number[][], U: number[]): string {
  return texPmatrix(
    A.map((ligne) => [
      ligne
        .map(
          (a, j) =>
            `${j === 0 ? texNombre(a) : ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(U[j])}`,
        )
        .join('+'),
    ]),
  )
}

/** Matrice carrée d'ordre p à coefficients entiers, avec au plus p - 1 zéros. */
function matriceEntiere(p: number): number[][] | null {
  const A = Array.from({ length: p }, () =>
    Array.from({ length: p }, () => randint(-3, 3)),
  )
  return A.flat().filter((a) => a === 0).length > p - 1 ? null : A
}

/** Colonne d'entiers avec au plus un zéro. */
function colonneEntiere(p: number): number[] | null {
  const U = Array.from({ length: p }, () => randint(-5, 5))
  return U.filter((u) => u === 0).length > 1 ? null : U
}

/** Rédaction d'une démonstration par récurrence, sur le modèle de TEA1-15. */
function redactionRecurrence({
  rang = 0,
  enonce,
  enonceSuivant,
  initialisation,
  heredite,
  resultat,
}: {
  /** Rang d'initialisation (0 ou 1). */
  rang?: number
  /** Énoncés de P(n) et de P(n+1), en texte. */
  enonce: string
  enonceSuivant: string
  /** Vérification au rang d'initialisation. */
  initialisation: string
  /** Démonstration de P(n+1). */
  heredite: string
  /** Résultat démontré, en texte, mis en évidence. */
  resultat: string
}): string {
  const pourTout = rang === 0 ? '$n$' : `$n\\geqslant ${rang}$`
  const soit =
    rang === 0
      ? '$n\\in\\mathbb N$'
      : `$n$ un entier naturel tel que $n\\geqslant ${rang}$`
  return `Pour tout entier naturel ${pourTout}, notons $\\mathcal P(n)$ la propriété : «${sp()}${enonce}${sp()}».<br><br>
    ${texteEnCouleur('Initialisation.', bleuMathalea)}<br>
    ${initialisation} La propriété $\\mathcal P(${rang})$ est donc vraie.<br><br>
    ${texteEnCouleur('Hérédité.', bleuMathalea)}<br>
    Soit ${soit}. Supposons que $\\mathcal P(n)$ est vraie, c’est-à-dire que ${enonce}.<br>
    La propriété $\\mathcal P(n+1)$ s’énonce : «${sp()}${enonceSuivant}${sp()}».<br>
    Montrons que $\\mathcal P(n+1)$ est vraie. ${heredite}<br>
    Ainsi, $\\mathcal P(n+1)$ est vraie.<br><br>
    ${texteEnCouleur('Conclusion.', bleuMathalea)}<br>
    La propriété est initialisée au rang $${rang}$ et elle est héréditaire. <br>D’après le principe de récurrence, pour tout entier naturel ${pourTout}, ${resultat}.`
}

type Question = {
  texte: string
  /** Consignes sans réponse attendue, chacune avec sa correction. */
  sousQuestions: { question: string; correction: string }[]
  cle: string
}

/** U_{n+1}=AU_n+B avec C=AC+B : démontrer que U_n=A^n(U_0-C)+C. */
function questionPointFixe(p: number): Question | null {
  const A = matriceEntiere(p)
  const C = colonneEntiere(p)
  const U0 = colonneEntiere(p)
  if (A == null || C == null || U0 == null) return null
  if (C.every((c) => c === 0) || U0.every((u, i) => u === C[i])) return null
  const AC = produit(A, C)
  // B = C - AC
  const B = C.map((c, i) => c - AC[i])
  if (B.every((b) => b === 0) || B.some((b) => Math.abs(b) > 30)) return null

  const texC = texMatrice(colonne(C))
  const texte = `Soit $(U_n)$ la suite de matrices colonnes définie par $U_0=${texMatrice(colonne(U0))}$ et, pour tout entier naturel $n$, $U_{n+1}=AU_n+B$, où $A=${texMatrice(A)}$ et $B=${texMatrice(colonne(B))}$.<br>On pose $C=${texC}$.`

  const correctionA = `Calculons $AC+B$ :<br>$\\begin{aligned}AC+B&=${texMatrice(A)}\\times ${texC}+${texMatrice(colonne(B))}\\\\&=${texDetailProduit(A, C)}+${texMatrice(colonne(B))}\\\\&=${texMatrice(colonne(AC))}+${texMatrice(colonne(B))}\\\\&=${texC}\\end{aligned}$<br>Donc $C=AC+B$.`

  const correctionB = redactionRecurrence({
    enonce: '$U_n=A^n(U_0-C)+C$',
    enonceSuivant: '$U_{n+1}=A^{n+1}(U_0-C)+C$',
    initialisation: `Pour $n=0$, on a $A^0(U_0-C)+C=I_${p}(U_0-C)+C=U_0-C+C=U_0$.`,
    heredite:
      "On a :<br>$\\begin{aligned}U_{n+1}&=AU_n+B&\\text{Par définition de la suite}\\\\&=A\\left(A^n(U_0-C)+C\\right)+B&\\text{On utilise l'hypothèse de récurrence}\\\\&=A^{n+1}(U_0-C)+AC+B&\\text{On développe}\\\\&=A^{n+1}(U_0-C)+C&\\text{Car }AC+B=C\\text{ d'après la question précédente}\\end{aligned}$",
    resultat: `$${miseEnEvidence('U_n=A^n(U_0-C)+C')}$`,
  })

  // U_k = A^k(U_0-C)+C, pour un rang k dont les calculs restent raisonnables.
  const D = U0.map((u, i) => u - C[i])
  const rangs = [6, 7, 8].filter((k) => {
    const Ak = puissanceMatrice(A, k)
    const Uk = produit(Ak, D).map((x, i) => x + C[i])
    return (
      Ak.flat().every((x) => Math.abs(x) <= 1000) &&
      Uk.every((x) => Math.abs(x) <= 2000)
    )
  })
  if (rangs.length === 0) return null
  const k = choice(rangs)
  const Ak = puissanceMatrice(A, k)
  const AkD = produit(Ak, D)
  const Uk = AkD.map((x, i) => x + C[i])
  const texD = texMatrice(colonne(D))
  let correctionC = `D'après la question précédente, $U_${k}=A^${k}(U_0-C)+C$.<br>`
  correctionC += `On a $U_0-C=${texMatrice(colonne(U0))}-${texC}=${texD}$ et la calculatrice donne $A^${k}=${texMatrice(Ak)}$.<br>`
  correctionC += `Donc :<br>$\\begin{aligned}U_${k}&=${texMatrice(Ak)}\\times ${texD}+${texC}\\\\&=${texMatrice(colonne(AkD))}+${texC}\\\\&=${miseEnEvidence(texMatrice(colonne(Uk)))}\\end{aligned}$`

  return {
    texte,
    sousQuestions: [
      { question: 'Vérifier que $C=AC+B$.', correction: correctionA },
      {
        question:
          'Démontrer par récurrence que, pour tout entier naturel $n$, $U_n=A^n(U_0-C)+C$.',
        correction: correctionB,
      },
      {
        question: `À l'aide de la calculatrice, calculer $U_${k}$ en justifiant.`,
        correction: correctionC,
      },
    ],
    cle: ['pointFixe', ...A.flat(), ...C, ...U0].join('|'),
  }
}

/**
 * A=(a b ; 0 a) : démontrer que A^n=(a^n  bna^{n-1} ; 0  a^n) pour n ≥ 1,
 * puis en déduire U_n lorsque U_{n+1}=AU_n.
 */
function questionTriangulaire(): Question | null {
  const a = randint(-3, 3, [0, 1])
  const b = randint(-5, 5, 0)
  const x0 = randint(-5, 5, 0)
  const y0 = randint(-5, 5, 0)
  const A = [
    [a, b],
    [0, a],
  ]

  const puissance = (e: string) => `${ecritureParentheseSiNegatif(a)}^{${e}}`
  /** b × expr, sans « 1× ». */
  const fois = (k: number, expr: string) =>
    k === 1 ? expr : k === -1 ? `-${expr}` : `${k}\\times ${expr}`
  /** b n × a^{n-1} ou b(n+1) × a^n. */
  const terme = (k: number, facteur: string, e: string) =>
    `${rienSi1(k)}${facteur}\\times ${puissance(e)}`
  const signe = b < 0 ? '-' : '+'
  const texAn = (m: string, e: string, f: string) =>
    texPmatrix([
      [puissance(m), terme(b, f, e)],
      ['0', puissance(m)],
    ])
  const propriete = `A^n=${texAn('n', 'n-1', 'n')}`

  const texte = `Soit $A=${texMatrice(A)}$.<br>On considère la suite de matrices colonnes $(U_n)$ définie par $U_0=${texMatrice(colonne([x0, y0]))}$ et, pour tout entier naturel $n$, $U_{n+1}=AU_n$.`

  const texA1 = texPmatrix([
    [puissance('1'), `${texNombre(b)}\\times 1\\times ${puissance('0')}`],
    ['0', puissance('1')],
  ])
  let heredite = `On a :<br>$\\begin{aligned}A^{n+1}&=A^n\\times A\\\\&=${texAn('n', 'n-1', 'n')}\\times ${texMatrice(A)}&\\text{On utilise l'hypothèse de récurrence}`
  heredite += `\\\\&=${texPmatrix([
    [
      `${puissance('n')}\\times ${ecritureParentheseSiNegatif(a)}`,
      `${puissance('n')}\\times ${ecritureParentheseSiNegatif(b)}${signe}${terme(Math.abs(b), 'n', 'n-1')}\\times ${ecritureParentheseSiNegatif(a)}`,
    ],
    ['0', `${puissance('n')}\\times ${ecritureParentheseSiNegatif(a)}`],
  ])}&\\text{On effectue le produit}`
  heredite += `\\\\&=${texPmatrix([
    [
      puissance('n+1'),
      `${fois(b, puissance('n'))}${signe}${terme(Math.abs(b), 'n', 'n')}`,
    ],
    ['0', puissance('n+1')],
  ])}`
  heredite += `\\\\&=${texAn('n+1', 'n', '(n+1)')}&\\text{On factorise par }${puissance('n')}\\end{aligned}$`
  const correctionA = redactionRecurrence({
    rang: 1,
    enonce: `$${propriete}$`,
    enonceSuivant: `$A^{n+1}=${texAn('n+1', 'n', '(n+1)')}$`,
    initialisation: `Pour $n=1$, on a $${texA1}=${texMatrice(A)}=A^1$.`,
    heredite,
    resultat: `$${miseEnEvidence(propriete)}$`,
  })

  // U_n = A^nU_0 : première ligne x0 a^n + b y0 n a^{n-1}, seconde y0 a^n.
  const texUn = texPmatrix([
    [
      `${fois(x0, puissance('n'))}${b * y0 < 0 ? '-' : '+'}${terme(Math.abs(b * y0), 'n', 'n-1')}`,
    ],
    [fois(y0, puissance('n'))],
  ])
  let correctionB = `Pour tout entier naturel $n\\geqslant 1$, $U_n=A^nU_0=${texAn('n', 'n-1', 'n')}\\times ${texMatrice(colonne([x0, y0]))}$.<br>`
  correctionB += `Donc, pour tout entier naturel $n\\geqslant 1$, $${miseEnEvidence(`U_n=${texUn}`)}$.`

  // U_k = A^kU_0, pour un rang k dont les calculs restent raisonnables.
  const U0 = [x0, y0]
  const rangs = [6, 7, 8].filter((k) => {
    const Ak = puissanceMatrice(A, k)
    return (
      Ak.flat().every((x) => Math.abs(x) <= 1000) &&
      produit(Ak, U0).every((x) => Math.abs(x) <= 2000)
    )
  })
  if (rangs.length === 0) return null
  const k = choice(rangs)
  const Ak = puissanceMatrice(A, k)
  const texU0 = texMatrice(colonne(U0))
  let correctionC = `On a $U_${k}=A^${k}U_0$ et la calculatrice donne $A^${k}=${texMatrice(Ak)}$.<br>`
  correctionC += `Donc $U_${k}=${texMatrice(Ak)}\\times ${texU0}=${miseEnEvidence(texMatrice(colonne(produit(Ak, U0))))}$.`

  return {
    texte,
    sousQuestions: [
      {
        question: `Démontrer par récurrence que, pour tout entier naturel $n\\geqslant 1$, $${propriete}$.`,
        correction: correctionA,
      },
      {
        question:
          "On admet que, pour tout entier naturel $n$, $U_n=A^nU_0$. En déduire l'expression de $U_n$ en fonction de $n$, pour tout entier naturel $n\\geqslant 1$.",
        correction: correctionB,
      },
      {
        question: `À l'aide de la calculatrice, calculer $U_${k}$ en justifiant.`,
        correction: correctionC,
      },
    ],
    cle: ['triangulaire', a, b, x0, y0].join('|'),
  }
}

export default class RecurrenceSuitesDeMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets :\n1 : Un = A^n (U0 - C) + C\n2 : Expression de A^n\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Taille des matrices (question 1)',
      3,
      "1 : Carrées d'ordre 2\n2 : Carrées d'ordre 3\n3 : Mélange",
    ]
    this.sup = '3'
    this.sup2 = 1
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
    }).map(Number)
    const tailles = combinaisonListes(
      this.sup2 === 3 ? [2, 3] : [this.sup2 + 1],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      const generer = [
        () => questionPointFixe(p),
        questionTriangulaire,
      ][typesDeQuestions[i] - 1]
      let question: Question | null = null
      for (let essai = 0; essai < 1000 && question == null; essai++) {
        question = generer()
      }
      if (question == null) continue
      if (!this.questionJamaisPosee(i, question.cle)) continue

      const { texte, sousQuestions } = question
      if (sousQuestions.length === 1) {
        createQuestion(this, i, {
          question: `${texte}<br>${sousQuestions[0].question}`,
          correction: sousQuestions[0].correction,
        })
      } else {
        createQuestion(this, i, {
          question: texte,
          subQuestions: sousQuestions,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
