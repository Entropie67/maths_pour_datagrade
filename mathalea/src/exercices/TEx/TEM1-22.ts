import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { matrice, type Matrice } from '../../lib/mathFonctions/Matrice'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer l'inverse d'une matrice à l'aide d'un produit"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '30/09/2026'

/**
 * Calculer AB (qui vaut I ou λI), puis en déduire que A est inversible et
 * donner A⁻¹.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'ff4b8'

export const refs = {
  'fr-fr': ['TEM1-22'],
  'fr-ch': [],
}

type Tirage = { A: Matrice; B: Matrice; lambda: number }

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/**
 * A est tirée au hasard et B est la comatrice transposée de A, divisée par le
 * PGCD de ses coefficients : on a alors AB=λIₙ avec λ entier.
 * Si λ=±1, on prend B=A⁻¹ (AB=Iₙ).
 */
function tirage(n: number, produitIdentite: boolean): Tirage | null {
  const borne = n === 2 ? 5 : 3
  const table = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => randint(-borne, borne)),
  )
  // On veut une matrice assez « remplie ».
  if (table.flat().filter((x) => x === 0).length > n - 1) return null
  const A = matrice(table)
  const det = A.determinant()
  if (det === 0) return null
  const adj = A.inverse()
    .toArray()
    .map((ligne) => ligne.map((x) => Math.round(x * det)))
  const g = pgcd(...adj.flat().map((x) => Math.abs(x)))
  // A×(adj/g) = (det/g)Iₙ.
  const lambda0 = det / g
  let B: number[][]
  let lambda: number
  if (produitIdentite) {
    if (Math.abs(lambda0) !== 1) return null
    B = adj.map((ligne) => ligne.map((x) => x / det))
    lambda = 1
  } else {
    if (Math.abs(lambda0) < 2 || Math.abs(lambda0) > 10) return null
    const signe = randint(0, 1) === 0 ? 1 : -1
    B = adj.map((ligne) => ligne.map((x) => (signe * x) / g))
    lambda = signe * lambda0
  }
  if (B.flat().some((x) => Math.abs(x) > 9)) return null
  return { A, B: matrice(B), lambda }
}

export default class InverseMatriceProduit extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireCaseACocher = ["Matrices carrée d'ordre 2", true]
    this.besoinFormulaire2CaseACocher = ["Matrices carrée d'ordre 3", false]
    this.besoinFormulaire3Numerique = [
      'Produit',
      3,
      '1 : AB=I\n2 : AB=λI\n3 : Mélange',
    ]
    this.sup = true
    this.sup2 = false
    this.sup3 = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const ordres: number[] = []
    if (this.sup) ordres.push(2)
    if (this.sup2) ordres.push(3)
    if (ordres.length === 0) ordres.push(2)
    const listeOrdres = combinaisonListes(ordres, this.nbQuestions)
    const listeProduits = combinaisonListes(
      this.sup3 === 1 || this.sup3 === 2 ? [this.sup3] : [1, 2],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const n = listeOrdres[i]
      const produitIdentite = listeProduits[i] === 1
      let tirageFinal: Tirage | null = null
      for (let essai = 0; essai < 5000 && tirageFinal == null; essai++) {
        tirageFinal = tirage(n, produitIdentite)
      }
      if (tirageFinal == null) continue
      const { A, B, lambda } = tirageFinal
      const AB = A.multiply(B)
      const In = `I_${n}`
      const texLambdaIn = `${lambda === 1 ? '' : lambda === -1 ? '-' : lambda}${In}`
      // A⁻¹ = (1/λ)B.
      const inverse = texPmatrix(
        B.toArray().map((ligne) =>
          ligne.map((x) => fraction(x, lambda).simplifie().texFSD),
        ),
      )
      // On espace les lignes à l'affichage (la réponse attendue reste sans \def).
      // Le convertisseur Typst ne connaît pas \def : on n'espace pas en Typst.
      const inverseAffiche =
        inverse.includes('\\dfrac') && !context.isTypst
          ? `{\\def\\arraystretch{1.8}${inverse}}`
          : inverse

      let texte = `Soient $A=${A.toTex()}$ et $B=${B.toTex()}$.<br>`
      texte += `${numAlpha(0)}Calculer $AB$.`
      if (this.interactif) {
        texte +=
          "<br>Saisir la matrice à l'aide de la touche «\u00a0Matrice\u00a0».<br>" +
          ajouteChampTexteMathLive(this, 2 * i, KeyboardType.clavierMatrice, {
            texteAvant: '$AB=$',
          })
      }
      texte += `<br>${numAlpha(1)}En déduire que $A$ est inversible, puis déterminer $A^{-1}$.`
      if (this.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            this,
            2 * i + 1,
            KeyboardType.clavierMatrice,
            { texteAvant: '$A^{-1}=$' },
          )
      }
      handleAnswers(this, 2 * i, {
        reponse: { value: AB.toTex(), compare: matriceCompare },
      })
      handleAnswers(this, 2 * i + 1, {
        reponse: { value: inverse, compare: matriceCompare },
      })

      let texteCorr = `${numAlpha(0)}$AB=${A.toTex()}\\times${B.toTex()}=${miseEnEvidence(AB.toTex())}$<br>`
      texteCorr += `${numAlpha(1)}`
      if (lambda === 1) {
        texteCorr += `D'après le cours, comme $AB=${In}$, $A$ est inversible et $A^{-1}=B$.<br>`
        texteCorr += `On obtient donc : $A^{-1}=${miseEnEvidence(B.toTex())}$`
      } else {
        const texFacteur =
          lambda === -1 ? '-' : fraction(1, lambda).simplifie().texFSD
        // Un facteur négatif doit être parenthésé après le signe ×.
        const texFacteurB = `${texFacteur}B`
        const texFacteurBApresFois =
          lambda < 0 ? `\\left(${texFacteurB}\\right)` : texFacteurB
        texteCorr += `On vient de prouver que $AB=${texLambdaIn}$, c'est-à-dire $A \\times ${texFacteurBApresFois}=${In}$.<br>`
        texteCorr += `D'après le cours, comme $A\\times ${texFacteurBApresFois}=${In}$, $A$ est inversible et $A^{-1}=${texFacteurB}$.<br>`
        texteCorr += `On obtient donc : $A^{-1}=${miseEnEvidence(inverseAffiche)}$`
      }

      if (this.questionJamaisPosee(i, A.toString(), B.toString())) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
