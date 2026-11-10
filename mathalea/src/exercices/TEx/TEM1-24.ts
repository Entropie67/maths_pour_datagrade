import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { matrice, type Matrice } from '../../lib/mathFonctions/Matrice'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import {
  texMembreGauche,
  texSystemeEquations,
} from '../../lib/outils/systemeEquations'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Résoudre un système linéaire à l'aide des matrices"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '30/09/2026'

/**
 * Écrire un système linéaire sous la forme AX=B, déterminer A⁻¹ à la
 * calculatrice, puis résoudre le système.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '196c4'

export const refs = {
  'fr-fr': ['TEM1-24'],
  'fr-ch': [],
}

type Tirage = { A: Matrice; X: Matrice; B: Matrice; det: number }

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/**
 * A est tirée au hasard avec |det A|=1 (A⁻¹ à coefficients entiers) ou
 * 2≤|det A|≤10 (A⁻¹ à coefficients fractionnaires). La solution X est entière
 * et B=AX.
 */
function tirage(n: number, inverseEntiere: boolean): Tirage | null {
  const borne = n === 2 ? 5 : 3
  const table = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randint(-borne, borne)),
  )
  // On veut une matrice assez « remplie ».
  if (table.flat().filter((x) => x === 0).length > n - 1) return null
  const A = matrice(table)
  const det = A.determinant()
  if (inverseEntiere ? Math.abs(det) !== 1 : Math.abs(det) < 2) return null
  if (Math.abs(det) > 10) return null
  const solution = Array.from({ length: n }, () => [randint(-5, 5)])
  if (solution.every(([x]) => x === 0)) return null
  const X = matrice(solution)
  const B = A.multiply(X)
  if (
    B.toArray()
      .flat()
      .some((x) => Math.abs(x) > 30)
  )
    return null
  return { A, X, B, det }
}

export default class SystemeMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = [
      'Systèmes de 2 équations à 2 inconnues',
      true,
    ]
    this.besoinFormulaire2CaseACocher = [
      'Systèmes de 3 équations à 3 inconnues',
      false,
    ]
    this.besoinFormulaire3Numerique = [
      'Coefficients de A⁻¹',
      3,
      '1 : Entiers\n2 : Fractions\n3 : Mélange',
    ]
    this.sup = true
    this.sup2 = false
    this.sup3 = 1
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const ordres: number[] = []
    if (this.sup) ordres.push(2)
    if (this.sup2) ordres.push(3)
    if (ordres.length === 0) ordres.push(2)
    const listeOrdres = combinaisonListes(ordres, this.nbQuestions)
    const listeInverses = combinaisonListes(
      this.sup3 === 1 || this.sup3 === 2 ? [this.sup3] : [1, 2],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const n = listeOrdres[i]
      const inverseEntiere = listeInverses[i] === 1
      let tirageFinal: Tirage | null = null
      for (let essai = 0; essai < 5000 && tirageFinal == null; essai++) {
        tirageFinal = tirage(n, inverseEntiere)
      }
      if (tirageFinal == null) continue
      const { A, X, B, det } = tirageFinal
      const variables = ['x', 'y', 'z'].slice(0, n)
      const systeme = texSystemeEquations(
        A.toArray().map(
          (ligne, k) =>
            `${texMembreGauche(ligne, variables)}&=${B.toArray()[k][0]}`,
        ),
      )
      const texX = texPmatrix(variables.map((v) => [v]))
      // A⁻¹ = (1/det)×comatrice transposée.
      const inverse = texPmatrix(
        A.inverse()
          .toArray()
          .map((ligne) =>
            ligne.map(
              (x) => fraction(Math.round(x * det), det).simplifie().texFSD,
            ),
          ),
      )
      // On espace les lignes à l'affichage (la réponse attendue reste sans \def).
      // Le convertisseur Typst ne connaît pas \def : on n'espace pas en Typst.
      const inverseAffiche =
        inverse.includes('\\dfrac') && !context.isTypst
          ? `{\\def\\arraystretch{1.8}${inverse}}`
          : inverse
      const valeurs = X.toArray().map(([x]) => x)
      const texSolution = `(${valeurs.join(';')})`

      const inconnues = n === 2 ? '$x$ et $y$' : '$x$, $y$ et $z$'
      let texte = `On considère le système d'équations $(S)$ suivant, où ${inconnues} sont des nombres réels : $${systeme}$<br>`
      texte += `${numAlpha(0)}Écrire le système d'équations $(S)$ sous la forme $AX=B$, où $A$, $X$ et $B$ sont des matrices à préciser.`
      if (this.interactif) {
        texte +=
          "<br>Saisir les matrices à l'aide de la touche «\u00a0Matrice\u00a0».<br>" +
          ['A', 'X', 'B']
            .map((nom, k) =>
              ajouteChampTexteMathLive(
                this,
                5 * i + k,
                KeyboardType.clavierMatrice,
                { texteAvant: `$${nom}=$` },
              ),
            )
            .join('<br>')
      }
      texte += `<br>${numAlpha(1)}Déterminer, à l'aide de la calculatrice, la matrice $A^{-1}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            5 * i + 3,
            KeyboardType.clavierMatrice,
            { texteAvant: '$A^{-1}=$' },
          )
      }
      texte += `<br>${numAlpha(2)}Résoudre le système d'équations $(S)$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            5 * i + 4,
            KeyboardType.lyceeClassique,
            { texteAvant: '$S=\\Big\\{$', texteApres: '$\\Big\\}$' },
          )
      }
      handleAnswers(this, 5 * i, {
        reponse: { value: A.toTex(), compare: matriceCompare },
      })
      handleAnswers(this, 5 * i + 1, {
        reponse: { value: texX, compare: matriceCompare },
      })
      handleAnswers(this, 5 * i + 2, {
        reponse: { value: B.toTex(), compare: matriceCompare },
      })
      handleAnswers(this, 5 * i + 3, {
        reponse: { value: inverse, compare: matriceCompare },
      })
      // Barème : 3 points pour a), 1 pour b) et 4 pour c).
      handleAnswers(this, 5 * i + 4, {
        bareme: (points) => [4 * points[0], 4],
        reponse: { value: texSolution, options: { coordonnees: true } },
      })

      let texteCorr = `${numAlpha(0)}En posant $A=${miseEnEvidence(A.toTex())}$, $X=${miseEnEvidence(texX)}$ et $B=${miseEnEvidence(B.toTex())}$, le système d'équations $(S)$ s'écrit $AX=B$.<br>`
      texteCorr += `${numAlpha(1)}La calculatrice donne $A^{-1}=${miseEnEvidence(inverseAffiche)}$.<br>`
      texteCorr += `${numAlpha(2)}Comme la matrice $A$ est inversible, <br> $AX=B \\iff X=A^{-1}B$<br>`
      texteCorr += `Or, $A^{-1}B=${inverseAffiche}\\times${B.toTex()}=${X.toTex()}$<br>`
      texteCorr += `Le système d'équations $(S)$ admet donc une unique solution : $S=\\left\\{${miseEnEvidence(texSolution)}\\right\\}$.`

      if (this.questionJamaisPosee(i, A.toString(), X.toString())) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
