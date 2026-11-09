import type { MathfieldElement } from 'mathlive'
import {
  addMathaleaBranchingQcm,
  type MathaleaBranchingQcmData,
} from '../../lib/customElements/MathaleaBranchingQcm'
import {
  buildDataKeyboardFromStyle,
  KeyboardType,
} from '../../lib/interactif/claviers/keyboard'
import {
  comparerMatrices,
  lireMatriceSaisie,
} from '../../lib/interactif/comparaisonMatrices'
import { matrice, type Matrice } from '../../lib/mathFonctions/Matrice'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer des opérations sur les matrices'
export const interactifReady = true
export const dateDePublication = '28/09/2026'

/**
 * Calculer, si possible, des sommes, des produits (avec le détail de tous les coefficients)
 * et des combinaisons linéaires de matrices.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'b74bf'

export const refs = {
  'fr-fr': ['TEM1-12'],
  'fr-ch': [],
}

type Taille = [number, number]
type Detail = { texte: string; resultat: Matrice | null }

function matriceAleatoire([n, p]: Taille): Matrice {
  return matrice(
    Array.from({ length: n }, () =>
      Array.from({ length: p }, () => randint(-5, 5)),
    ),
  )
}

function taille(M: Matrice): Taille {
  const table = M.toArray()
  return [table.length, table[0].length]
}

function texTaille(M: Matrice): string {
  const [n, p] = taille(M)
  return `${n}\\times ${p}`
}

/** Taille d'une matrice non carrée dont les dimensions sont comprises entre 1 et 3. */
function tailleRectangulaire(): Taille {
  const n = randint(1, 3)
  return [n, randint(1, 3, n)]
}

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

function rouge(texte: string | number): string {
  return `\\textcolor{red}{${texte}}`
}

function bleu(texte: string | number): string {
  return `\\textcolor{blue}{${texte}}`
}

/**
 * Correction du produit XY, avec le détail de tous les coefficients.
 */
function detailProduit(
  X: Matrice,
  Y: Matrice,
  nomX: string,
  nomY: string,
  nomProduit: string,
  enEvidence: boolean,
): Detail {
  const [n, p] = taille(X)
  const [q, r] = taille(Y)
  const nomsFacteurs =
    nomX === nomY
      ? `$${nomX}$ est de taille $${texTaille(X)}$`
      : `$${nomX}$ est de taille $${texTaille(X)}$ et $${nomY}$ est de taille $${texTaille(Y)}$`
  if (p !== q) {
    const conclusion = texteEnCouleurEtGras("n'existe pas")
    return {
      texte: `${nomsFacteurs}. Le nombre de colonnes de $${nomX}$ n'est pas égal au nombre de lignes de $${nomY}$, donc le produit $${nomProduit}$ ${conclusion}.`,
      resultat: null,
    }
  }
  const P = X.multiply(Y)
  let texte = `${nomsFacteurs}. Le nombre de colonnes de $${nomX}$ est égal au nombre de lignes de $${nomY}$, donc le produit $${nomProduit}$ existe et est de taille $${n}\\times ${r}$.<br>`
  texte += `$\\begin{array}{cc} & ${bleu(Y.toTex())}\\\\${rouge(X.toTex())} & ${P.toTex()}\\end{array}$<br>`
  // Le coefficient de la ligne i et de la colonne j est le produit de la ligne i de X par la colonne j de Y.
  const calculs = Array.from({ length: n }, (_, i) =>
    Array.from({ length: r }, (_, j) =>
      Array.from({ length: p }, (_, k) => {
        const x = X.getValue(i, k)
        const y = Y.getValue(k, j)
        return `${rouge(k === 0 ? x : ecritureParentheseSiNegatif(x))}\\times ${bleu(ecritureParentheseSiNegatif(y))}`
      }).join('+'),
    ),
  )
  texte += `Chaque coefficient de $${nomProduit}$ s'obtient en multipliant une ligne de $${nomX}$ par une colonne de $${nomY}$ :<br>`
  texte += `$\\begin{aligned}${nomProduit}&=${texPmatrix(calculs)}\\\\&=${enEvidence ? miseEnEvidence(P.toTex()) : P.toTex()}\\end{aligned}$`
  return { texte, resultat: P }
}

/** Correction de la somme X+Y. */
function detailSomme(
  X: Matrice,
  Y: Matrice,
  nomX: string,
  nomY: string,
  nomSomme: string,
  enEvidence: boolean,
): Detail {
  const [n, p] = taille(X)
  const [q, r] = taille(Y)
  if (n !== q || p !== r) {
    return {
      texte: `$${nomX}$ est de taille $${texTaille(X)}$ et $${nomY}$ est de taille $${texTaille(Y)}$. Ces deux matrices n'ont pas la même taille, donc la somme $${nomSomme}$ ${texteEnCouleurEtGras("n'existe pas")}.`,
      resultat: null,
    }
  }
  const S = X.add(Y)
  const termes = X.toArray().map((ligne, i) =>
    ligne.map((x, j) => `${x}${ecritureAlgebrique(Y.getValue(i, j))}`),
  )
  return {
    texte: `$${nomX}$ et $${nomY}$ ont la même taille $${texTaille(X)}$, donc la somme $${nomSomme}$ existe. On additionne les coefficients situés à la même place :<br>$${nomSomme}=${texPmatrix(termes)}=${enEvidence ? miseEnEvidence(S.toTex()) : S.toTex()}$.`,
    resultat: S,
  }
}

/**
 * QCM ramifié : le calcul est-il possible ? Si oui, l'élève saisit la matrice résultat.
 */
function qcmCalculPossible(
  nom: string,
  resultat: Matrice | null,
): MathaleaBranchingQcmData {
  const feedbackCalculPossible =
    nom === 'AB'
      ? 'Le produit est possible : le nombre de colonnes de $A$ est égal au nombre de lignes de $B$.'
      : nom === 'A^2'
        ? 'Le produit est possible car $A$ est une matrice carrée.'
        : nom === 'A+BC'
          ? 'Le calcul est possible : le produit $BC$ existe et sa matrice résultat a la même taille que $A$.'
          : 'Le calcul est possible car les deux matrices ont la même taille.'
  return {
    choices: [
      {
        texte: 'Oui',
        statut: resultat != null,
        points: 1,
        feedback: 'Le calcul est impossible.',
        followup: {
          prompt: `Saisir la matrice $${nom}$ à l'aide de la touche « Matrice ».`,
          texteAvant: `$${nom}=$`,
          dataKeyboard: buildDataKeyboardFromStyle(
            KeyboardType.clavierMatrice!,
          ).join(' '),
          points: 1,
          callback: (answer, _choice, mathfield?: MathfieldElement) => {
            if (resultat == null) return { isOk: false }
            const saisie = lireMatriceSaisie(answer)
            const { isOk, feedback, coefficientsOk } = comparerMatrices(
              saisie,
              resultat.toArray(),
            )
            let promptIndex = 0
            coefficientsOk.forEach((ligne) =>
              ligne.forEach((coefficientOk) => {
                mathfield?.setPromptState(
                  `matrix${promptIndex++}`,
                  coefficientOk ? 'correct' : 'incorrect',
                  true,
                )
              }),
            )
            return { isOk, feedback }
          },
        },
      },
      {
        texte: 'Non',
        statut: resultat == null,
        points: 2,
        feedback: feedbackCalculPossible,
      },
    ],
  }
}

function texEnonce(matrices: [string, Matrice][]): string {
  const liste = matrices.map(([nom, M]) => `$${nom}=${M.toTex()}$`)
  if (liste.length === 1) return `Soit ${liste[0]}.`
  return `Soient ${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}.`
}

export default class OperationsMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Opérations',
      'Nombres séparés par des tirets :\n1 : A+B\n2 : AB\n3 : A²\n4 : A+λB\n5 : A+BC\n6 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Taille des matrices',
      4,
      "1 : Carrées d'ordre 2\n2 : Carrées d'ordre 3\n3 : Rectangulaires\n4 : Mélange",
    ]
    this.sup = '2'
    this.sup2 = 4
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 5,
      defaut: 2,
      melange: 6,
    }).map(Number)
    const tailles = combinaisonListes(
      this.sup2 === 4 ? [1, 2, 3] : [this.sup2],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      // 0 pour des matrices rectangulaires, sinon l'ordre des matrices carrées
      const ordre = tailles[i] === 1 ? 2 : tailles[i] === 2 ? 3 : 0
      const carree: Taille = [ordre, ordre]

      let nom: string
      let texteCorr: string
      let resultat: Matrice | null
      let matrices: [string, Matrice][]

      switch (type) {
        case 1:
        case 4: {
          const possible = ordre > 0 || choice([true, false])
          const tA = ordre > 0 ? carree : tailleRectangulaire()
          const A = matriceAleatoire(tA)
          const B = matriceAleatoire(possible ? tA : [tA[1], tA[0]])
          matrices = [
            ['A', A],
            ['B', B],
          ]
          if (type === 1) {
            nom = 'A+B'
            ;({ texte: texteCorr, resultat } = detailSomme(
              A,
              B,
              'A',
              'B',
              nom,
              true,
            ))
          } else {
            const lambda = choice([-3, -2, 2, 3])
            const LB = matrice(
              B.toArray().map((ligne) => ligne.map((x) => lambda * x)),
            )
            const produits = B.toArray().map((ligne) =>
              ligne.map(
                (x) => `${lambda}\\times ${ecritureParentheseSiNegatif(x)}`,
              ),
            )
            nom = `A${ecritureAlgebrique(lambda)}B`
            const somme = detailSomme(A, LB, 'A', `${lambda}B`, nom, true)
            resultat = somme.resultat
            texteCorr = `On commence par calculer $${lambda}B$ en multipliant chaque coefficient de $B$ par $${lambda}$ :<br>$${lambda}B=${texPmatrix(produits)}=${LB.toTex()}$.<br>${somme.texte}`
          }
          break
        }
        case 2: {
          let tA: Taille
          let tB: Taille
          if (ordre > 0) {
            tA = carree
            tB = carree
          } else {
            const possible = choice([true, true, false])
            tA = tailleRectangulaire()
            tB = [possible ? tA[1] : randint(1, 3, tA[1]), randint(1, 3)]
          }
          const A = matriceAleatoire(tA)
          const B = matriceAleatoire(tB)
          matrices = [
            ['A', A],
            ['B', B],
          ]
          nom = 'AB'
          ;({ texte: texteCorr, resultat } = detailProduit(
            A,
            B,
            'A',
            'B',
            nom,
            true,
          ))
          break
        }
        case 3: {
          const possible = ordre > 0 || choice([true, false])
          const m = randint(2, 3)
          const A = matriceAleatoire(
            ordre > 0 ? carree : possible ? [m, m] : tailleRectangulaire(),
          )
          matrices = [['A', A]]
          nom = 'A^2'
          const detail = detailProduit(A, A, 'A', 'A', nom, true)
          resultat = detail.resultat
          texteCorr = `$A^2=A\\times A$.<br>${detail.texte}`
          break
        }
        default: {
          // A+BC
          let tA: Taille
          let tB: Taille
          let tC: Taille
          if (ordre > 0) {
            tA = carree
            tB = carree
            tC = carree
          } else {
            tB = tailleRectangulaire()
            const [n, p] = tB
            const q = randint(1, 3)
            const cas = choice(['possible', 'possible', 'BC', 'somme'])
            tC = [cas === 'BC' ? randint(1, 3, p) : p, q]
            tA =
              cas === 'somme'
                ? n !== q
                  ? [q, n]
                  : [n, randint(1, 3, q)]
                : [n, q]
          }
          const A = matriceAleatoire(tA)
          const B = matriceAleatoire(tB)
          const C = matriceAleatoire(tC)
          matrices = [
            ['A', A],
            ['B', B],
            ['C', C],
          ]
          nom = 'A+BC'
          const BC = detailProduit(B, C, 'B', 'C', 'BC', false)
          texteCorr = `On commence par calculer $BC$.<br>${BC.texte}`
          resultat = null
          if (BC.resultat == null) {
            texteCorr += `<br>Donc $A+BC$ ${texteEnCouleurEtGras("n'existe pas")}.`
          } else {
            const somme = detailSomme(A, BC.resultat, 'A', 'BC', nom, true)
            texteCorr += `<br>${somme.texte}`
            resultat = somme.resultat
          }
        }
      }

      const cle = [type, ...matrices.map(([, M]) => M.toString())].join('|')
      if (!this.questionJamaisPosee(i, cle)) continue

      let texte = `${texEnonce(matrices)}<br>Le calcul de $${nom}$ est-il possible ? Si oui, donner le résultat.`
      if (this.interactif) {
        texte += addMathaleaBranchingQcm(
          this,
          i,
          qcmCalculPossible(nom, resultat),
        )
      }
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
