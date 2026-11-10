import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Démontrer une expression explicite par récurrence'
export const dateDePublication = '28/08/2026'

export const uuid = 'ed3cf'
export const refs = {
  'fr-fr': ['TSA1-12'],
  'fr-ch': [],
}

function coefficientDeU(coefficient: number): string {
  return coefficient === 1 ? 'u_n' : `${coefficient}u_n`
}

function denominateur(a: number, b: number, indice = 'n'): string {
  const termeVariable = b === 1 ? indice : `${b}${indice}`
  return `${termeVariable}+${a}`
}

/**
 * Démontrer par récurrence l'expression explicite d'une suite homographique.
 * @author Stéphane Guyon
 */
export default class ExpressionSuiteHomographique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion(): void {
    const couples = combinaisonListes(
      Array.from({ length: 25 }, (_, index) => ({
        a: (index % 5) + 1,
        b: Math.floor(index / 5) + 1,
      })),
      this.nbQuestions,
    )

    for (let i = 0; i < this.nbQuestions; i++) {
      const { a, b } = couples[i]
      const u0 = new FractionEtendue(1, a).simplifie()
      const coefficientU = coefficientDeU(b)
      const expressionDenominateur = denominateur(a, b)
      const expressionDenominateurAugmente = denominateur(a + b, b)
      const expressionDenominateurSuivant = denominateur(a, b, '(n+1)')
      const couleurCommentaire = context.isHtml ? 'forestgreen' : 'black'
      const commentaire = (texte: string) =>
        `\\color{${couleurCommentaire}}{\\longleftarrow\\ \\text{${texte}}}`

      const texte = `On considère la suite $(u_n)$ définie par $u_0=${u0.texFractionSimplifiee}$ et, pour tout entier naturel $n$, par :<br>
    $u_{n+1}=\\dfrac{u_n}{1+${coefficientU}}$.<br><br>
    Démontrer que, pour tout entier naturel $n$, $u_n=\\dfrac{1}{${expressionDenominateur}}$.`

      let correction = `Nous allons procéder à un raisonnement par récurrence.<br>
    Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété : $u_n=\\dfrac{1}{${expressionDenominateur}}$.<br><br>`
      correction += `${texteEnCouleurEtGras('Initialisation :', 'black')}<br>`
      correction += `Pour $n=0$, l’expression proposée donne :<br>
    $\\dfrac{1}{${b === 1 ? '' : `${b}\\times`}0+${a}}=${u0.texFractionSimplifiee}$.<br>
    Or, $u_0=${u0.texFractionSimplifiee}$. Donc la propriété $\\mathcal P_0$ est vraie.<br><br>`
      correction += `${texteEnCouleurEtGras('Hérédité :', 'black')}<br>`
      correction += `Soit $n\\in\\mathbb N$. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire $u_n=\\dfrac{1}{${expressionDenominateur}}$.<br>
    La propriété $\\mathcal P_{n+1}$ s’écrit : $u_{n+1}=\\dfrac{1}{${expressionDenominateurSuivant}}$.<br>
    Montrons que $\\mathcal P_{n+1}$ est vraie.<br><br>`
      correction += `$\\begin{aligned}
u_{n+1}
&=\\dfrac{u_n}{1+${coefficientU}}&&${commentaire('définition de la suite')}\\\\
&=\\dfrac{\\dfrac{1}{${expressionDenominateur}}}{1+\\dfrac{${b}}{${expressionDenominateur}}}&&${commentaire('hypothèse de récurrence')}\\\\
&=\\dfrac{\\dfrac{1}{${expressionDenominateur}}}{\\dfrac{${expressionDenominateurAugmente}}{${expressionDenominateur}}}&&${commentaire('réduction au même dénominateur')}\\\\
&=\\dfrac{1}{${expressionDenominateur}}\\times\\dfrac{${expressionDenominateur}}{${expressionDenominateurAugmente}}&&${commentaire('on multiplie par l’inverse')}\\\\
&=\\dfrac{1}{${expressionDenominateurAugmente}}&&${commentaire('simplification')}\\\\
&=\\dfrac{1}{${expressionDenominateurSuivant}}&&${commentaire(`car ${expressionDenominateurAugmente}=${expressionDenominateurSuivant}`)}.
\\end{aligned}$<br>
La propriété $\\mathcal P_{n+1}$ est donc vraie.<br><br>`
      correction += `${texteEnCouleurEtGras('Conclusion :', 'black')}<br>`
      correction += `La propriété est vraie au rang $0$ et elle est héréditaire. Par récurrence, pour tout entier naturel $n$ :<br>
    $u_n=\\dfrac{1}{${expressionDenominateur}}$.`

      this.listeQuestions.push(texte)
      this.listeCorrections.push(correction)
    }
    listeQuestionsToContenu(this)
  }
}
