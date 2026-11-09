import {
  addPossibleMultiLinesAnswer,
  baremeMultiLignes,
  besoinFormulaireVerificationMultiLignes,
  commentaireMultiLignes,
} from '../../lib/customElements/PossibleMultiLinesAnswerElement'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer $ax^2+bx+c$ pour différentes valeurs de $x$'
export const interactifReady = true

export const dateDePublication = '17/08/2026'
export const uuid = '94f58'
export const refs = { 'fr-fr': ['2L10-6'], 'fr-ch': ['NR'] }

type TypeValeur = 'entier positif' | 'entier négatif' | 'fraction' | 'racine'

function produit(
  coefficient: number,
  facteur: string,
  premier = false,
): string {
  const signe = coefficient < 0 ? '-' : premier ? '' : '+'
  const abs = Math.abs(coefficient)
  return signe + (abs === 1 ? facteur : abs + '\\times ' + facteur)
}

function entier(valeur: number, premier = false): string {
  return valeur < 0 ? String(valeur) : (premier ? '' : '+') + valeur
}

function termeRadical(
  coefficient: number,
  radical: string,
  premier = false,
): string {
  const signe = coefficient < 0 ? '-' : premier ? '' : '+'
  const abs = Math.abs(coefficient)
  return signe + (abs === 1 ? '' : abs) + radical
}

function fraction(
  numerateur: number,
  denominateur: number,
  premier = false,
): string {
  const signe = numerateur < 0 ? '-' : premier ? '' : '+'
  return signe + '\\dfrac{' + Math.abs(numerateur) + '}{' + denominateur + '}'
}

function polynome(a: number, b: number, c: number): string {
  const quadratique = a === 1 ? 'x^2' : a === -1 ? '-x^2' : a + 'x^2'
  const lineaire =
    b === 1 ? '+x' : b === -1 ? '-x' : (b < 0 ? b : '+' + b) + 'x'
  return quadratique + lineaire + (c < 0 ? c : '+' + c)
}

function sansDoublonsConsecutifs(lignes: string[]): string[] {
  return lignes.filter(
    (ligne, index) => index === 0 || ligne !== lignes[index - 1],
  )
}

/**
 * @author Arnaud Meistermann
 */
export default class CalculerExpressionPourDifferentesValeurs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Type de valeur de $x$',
      'Nombres séparés par des tirets :\n1 : Entier positif\n2 : Entier négatif\n3 : Fraction\n4 : Racine carrée\n5 : Mélange',
    ]
    this.sup = 5
    this.besoinFormulaire2Numerique = besoinFormulaireVerificationMultiLignes
    this.sup2 = 2
    this.comment = commentaireMultiLignes
  }

  nouvelleVersion() {
    const types: TypeValeur[] = [
      'entier positif',
      'entier négatif',
      'fraction',
      'racine',
    ]
    const listeTypes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      listeOfCase: types,
      nbQuestions: this.nbQuestions,
    }) as TypeValeur[]
    const signesFractions = combinaisonListes([-1, 1], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const a = randint(-5, 5, [0])
      const b = randint(-5, 5, [0])
      const c = randint(-5, 5, [0])
      const type = listeTypes[i]
      const expression = polynome(a, b, c)
      let xLatex: string
      let resultat: string
      let lignes: string[]

      if (type === 'entier positif' || type === 'entier négatif') {
        const x = type === 'entier positif' ? randint(1, 5) : -randint(1, 5)
        xLatex = String(x)
        const xSubstitue = x < 0 ? '(' + x + ')' : String(x)
        const carre = x ** 2
        resultat = String(a * carre + b * x + c)
        lignes = sansDoublonsConsecutifs([
          produit(a, xSubstitue + '^2', true) +
            produit(b, xSubstitue) +
            entier(c),
          produit(a, String(carre), true) + produit(b, xSubstitue) + entier(c),
          entier(a * carre, true) + entier(b * x) + entier(c),
          resultat,
        ])
      } else if (type === 'fraction') {
        const d0 = choice([2, 3, 4, 5])
        const n0 = signesFractions[i] * randint(1, 2 * d0 - 1, [d0])
        const xFraction = new FractionEtendue(n0, d0).simplifie()
        const n = xFraction.signe * xFraction.n
        const d = xFraction.d
        const d2 = d ** 2
        const nq = a * n ** 2
        const nl = b * n * d
        const nc = c * d2
        const total = nq + nl + nc
        xLatex = xFraction.texFractionSimplifiee
        resultat = new FractionEtendue(total, d2).simplifie()
          .texFractionSimplifiee
        const xParenthese = '\\left(' + xLatex + '\\right)'
        lignes = sansDoublonsConsecutifs([
          produit(a, xParenthese + '^2', true) +
            produit(b, xParenthese) +
            entier(c),
          produit(a, fraction(n ** 2, d2, true), true) +
            produit(b, xParenthese) +
            entier(c),
          fraction(nq, d2, true) + fraction(b * n, d) + entier(c),
          fraction(nq, d2, true) + fraction(nl, d2) + fraction(nc, d2),
          '\\dfrac{' + total + '}{' + d2 + '}',
          resultat,
        ])
      } else {
        const n = choice([2, 3, 5, 6, 7, 10, 11, 13, 14, 15])
        const rationnel = a * n + c
        xLatex = '\\sqrt{' + n + '}'
        const radical = termeRadical(b, xLatex, rationnel === 0)
        resultat = rationnel === 0 ? radical : String(rationnel) + radical
        lignes = sansDoublonsConsecutifs([
          produit(a, '(' + xLatex + ')^2', true) +
            produit(b, xLatex) +
            entier(c),
          produit(a, String(n), true) + termeRadical(b, xLatex) + entier(c),
          resultat,
        ])
      }

      const lettre = lettreDepuisChiffre(i + 1)
      let texte = 'Pour $x=' + xLatex + '$, calculer $' + expression + '$.'
      if (this.interactif) {
        texte = `Pour $x=${xLatex}$, calculer $${lettre}=${expression}$.`
      }

      let correction =
        'On remplace $x$ par $' + xLatex + "$ dans l'expression.<br>"
      correction += '$\\begin{aligned}' + lignes[0]
      correction += lignes
        .slice(1)
        .map((ligne) => '&=' + ligne)
        .join('\\\\')
      correction += '\\end{aligned}$<br>'
      correction += 'Le résultat est donc $' + miseEnEvidence(resultat) + '$.'

      handleAnswers(this, i, { reponse: { value: resultat } })
      texte += addPossibleMultiLinesAnswer(this, i, {
        prefix: `${lettre} =`,
        style: KeyboardType.lycee,
        bareme: baremeMultiLignes(this.sup2),
      })
      if (this.questionJamaisPosee(i, a, b, c, xLatex)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
