import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { matrice, type Matrice } from '../../lib/mathFonctions/Matrice'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Calculer l'inverse d'une matrice à l'aide d'une relation polynomiale"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '28/09/2026'

/**
 * Calculer A²+aA+bI (qui vaut 0) ou A²+aA (qui vaut bI), puis en déduire que A
 * est inversible et donner A⁻¹.
 *
 * @author Arnaud Meistermann
 */
export const uuid = '1b8e7'

export const refs = {
  'fr-fr': ['TEM1-23'],
  'fr-ch': [],
}

type Tirage = { A: Matrice; a: number; b: number }

function identite(n: number): Matrice {
  return matrice(
    Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
    ),
  )
}

function fois(M: Matrice, k: number): Matrice {
  return matrice(M.toArray().map((ligne) => ligne.map((x) => k * x)))
}

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/**
 * Matrice 2×2 : d'après le théorème de Cayley-Hamilton,
 * A²-tr(A)A+det(A)I₂=0.
 */
function tirage2(): Tirage | null {
  const table = Array.from({ length: 2 }, () =>
    Array.from({ length: 2 }, () => randint(-5, 5)),
  )
  const [[p, q], [r, s]] = table
  const a = -(p + s)
  const b = p * s - q * r
  // A ne doit pas être scalaire et la relation doit comporter tous ses termes.
  if (q === 0 && r === 0) return null
  if (a === 0 || b === 0 || Math.abs(b) > 12) return null
  return { A: matrice(table), a, b }
}

/**
 * Matrice 3×3 : A=λI₃+k·uvᵀ.
 * Si vᵀu=1, uvᵀ est un projecteur et (A-λI₃)(A-(λ+k)I₃)=0.
 * Si vᵀu=0, uvᵀ est nilpotente et (A-λI₃)²=0.
 */
function tirage3(): Tirage | null {
  const u = Array.from({ length: 3 }, () => randint(-2, 2))
  const v = Array.from({ length: 3 }, () => randint(-2, 2))
  const produitScalaire = u.reduce((somme, x, i) => somme + x * v[i], 0)
  if (produitScalaire !== 0 && produitScalaire !== 1) return null
  const lambda = randint(-3, 3, 0)
  const k = randint(-3, 3, 0)
  const table = u.map((x, i) =>
    v.map((y, j) => (i === j ? lambda : 0) + k * x * y),
  )
  // On veut une matrice assez « remplie » et des coefficients raisonnables.
  const nbTermesNonDiagonaux = table
    .flatMap((ligne, i) => ligne.filter((_, j) => j !== i))
    .filter((x) => x !== 0).length
  if (nbTermesNonDiagonaux < 3) return null
  if (table.flat().some((x) => Math.abs(x) > 6)) return null
  const [a, b] =
    produitScalaire === 1
      ? [-(2 * lambda + k), lambda * (lambda + k)]
      : [-2 * lambda, lambda * lambda]
  if (a === 0 || b === 0) return null
  return { A: matrice(table), a, b }
}

export default class InverseMatriceRelationPolynomiale extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ["Matrices carrée d'ordre 2", true]
    this.besoinFormulaire2CaseACocher = ["Matrices carrée d'ordre 3", false]
    this.besoinFormulaire3Numerique = [
      'Relation',
      3,
      '1 : A²+aA+bI=0\n2 : A²+aA=bI\n3 : Mélange',
    ]
    this.sup = true
    this.sup2 = false
    this.sup3 = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const ordres: number[] = []
    if (this.sup) ordres.push(2)
    if (this.sup2) ordres.push(3)
    if (ordres.length === 0) ordres.push(2)
    const listeOrdres = combinaisonListes(ordres, this.nbQuestions)
    const listeRelations = combinaisonListes(
      this.sup3 === 1 || this.sup3 === 2 ? [this.sup3] : [1, 2],
      this.nbQuestions,
    )
    let indiceChamp = 0
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const n = listeOrdres[i]
      const relationNulle = listeRelations[i] === 1
      let tirageFinal: Tirage | null = null
      for (let essai = 0; essai < 1000 && tirageFinal == null; essai++) {
        tirageFinal = n === 2 ? tirage2() : tirage3()
      }
      if (tirageFinal == null) continue
      const { A, a, b } = tirageFinal
      const I = identite(n)
      const A2 = A.multiply(A)
      // Résultat attendu à l'étape 1 : 0 (relation nulle) ou cI avec c=-b.
      const c = -b
      const R = A2.add(fois(A, a)).add(fois(I, relationNulle ? b : 0))
      if (
        R.toArray().some((ligne, k) =>
          ligne.some((x, l) => x !== (relationNulle ? 0 : k === l ? c : 0)),
        )
      )
        continue

      const In = `I_${n}`
      // Même clavier pour les deux champs : matrice, A et I_n.
      const dataKeys = ['A', In]
      const texRelation = `A^2${ecritureAlgebriqueSauf1(a)}A${relationNulle ? `${ecritureAlgebriqueSauf1(b)}${In}` : ''}`
      const texCIn = `${rienSi1(c)}${In}`
      // A⁻¹ = (1/c)(A+aI) = αA+βI avec α=1/c et β=a/c.
      const alpha = fraction(1, c).simplifie()
      const beta = fraction(a, c).simplifie()
      const texInverseDeveloppe = `${rienSi1(alpha)}A${ecritureAlgebriqueSauf1(beta)}${In}`

      // Champs : matrice de l'étape 1, λ (relation A²+aA=λI), puis A⁻¹.
      const indiceMatrice = indiceChamp
      const indiceLambda = indiceChamp + 1
      const indiceInverse = indiceChamp + (relationNulle ? 1 : 2)

      let texte = `Soit $A=${A.toTex()}$.<br>`
      const texDefIn = `avec $${In}=${I.toTex()}$`
      texte += relationNulle
        ? `${numAlpha(0)}Calculer $${texRelation}$, ${texDefIn}.`
        : `${numAlpha(0)}Calculer $${texRelation}$ et montrer qu'il existe un réel $\\lambda$ tel que $${texRelation}=\\lambda ${In}$, ${texDefIn}.`
      if (this.interactif) {
        texte +=
          "<br>Saisir la matrice à l'aide de la touche «\u00a0Matrice\u00a0».<br>" +
          ajouteChampTexteMathLive(
            this,
            indiceMatrice,
            KeyboardType.clavierMatrice,
            { texteAvant: `$${texRelation}=$`, dataKeys },
          )
        if (!relationNulle) {
          // Sur la même ligne que la matrice.
          texte += ajouteChampTexteMathLive(
            this,
            indiceLambda,
            KeyboardType.clavierDeBase,
            { texteAvant: '$\\qquad\\lambda=$' },
          )
        }
      }
      texte += `<br>${numAlpha(1)}${relationNulle ? 'En déduire' : "En factorisant l'expression précédente, montrer"} que $A$ est inversible et exprimer $A^{-1}$ en fonction de $A$ et de $${In}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            indiceInverse,
            KeyboardType.clavierMatrice,
            { texteAvant: '$A^{-1}=$', dataKeys },
          )
      }
      handleAnswers(this, indiceMatrice, {
        reponse: { value: R.toTex(), compare: matriceCompare },
      })
      if (!relationNulle) {
        handleAnswers(this, indiceLambda, { reponse: { value: c } })
      }
      // Toute expression équivalente est acceptée, par exemple -\dfrac{1}{6}\left(A+4I_2\right).
      handleAnswers(this, indiceInverse, {
        reponse: { value: texInverseDeveloppe },
      })

      // Étape 1 : calcul de la combinaison.
      const termes = A2.toArray().map((ligne, k) =>
        ligne.map(
          (x, l) =>
            `${x}${ecritureAlgebrique(a * A.getValue(k, l))}${relationNulle && k === l ? ecritureAlgebrique(b) : ''}`,
        ),
      )
      let texteCorr = `${numAlpha(0)}$A^2=A\\times A=${A2.toTex()}$<br>`
      texteCorr += `Ainsi,<br>$\\begin{aligned}${texRelation}&=${A2.toTex()}${ecritureAlgebriqueSauf1(a)}${A.toTex()}${relationNulle ? `${ecritureAlgebriqueSauf1(b)}${I.toTex()}` : ''}\\\\&=${texPmatrix(termes)}\\\\&=${miseEnEvidence(R.toTex())}\\end{aligned}$<br>`
      if (!relationNulle) {
        texteCorr += `Ainsi, $${texRelation}=${texCIn}$, donc la relation est vérifiée avec $\\lambda=${miseEnEvidence(c)}$.<br>`
      }

      // Étape 2 : on factorise par A.
      const texAplusAI = `A${ecritureAlgebriqueSauf1(a)}${In}`
      const texFacteur =
        c === 1 ? '' : c === -1 ? '-' : fraction(1, c).simplifie().texFSD
      const texInverse = `${texFacteur}\\left(${texAplusAI}\\right)`
      // Un facteur négatif doit être parenthésé après le signe ×.
      const texInverseApresFois =
        c < 0 ? `\\left(${texInverse}\\right)` : texInverse
      const equivalences = [
        ...(relationNulle ? [`${texRelation}=0_${n}`] : []),
        `A^2${ecritureAlgebriqueSauf1(a)}A=${texCIn}`,
        `A\\left(${texAplusAI}\\right)=${texCIn}`,
        `A\\times ${texInverseApresFois}=${In}`,
      ]
      texteCorr += `D'après la relation précédente, on a :<br>`
      texteCorr += `$\\begin{aligned}${equivalences.map((ligne, k) => `${k === 0 ? '' : '\\iff{}'}&${ligne}`).join('\\\\')}\\end{aligned}$<br>`
      texteCorr += `Par conséquent, $A$ est inversible et $A^{-1}=${texInverse}$.<br>`
      texteCorr += `On obtient donc : $A^{-1}=${miseEnEvidence(texInverseDeveloppe)}$`

      if (this.questionJamaisPosee(i, A.toString(), listeRelations[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        indiceChamp = indiceInverse + 1
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
