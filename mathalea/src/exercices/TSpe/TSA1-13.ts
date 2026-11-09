import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { reduireAxPlusB, rienSi1 } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer la forme explicite d’une suite par récurrence'
export const dateDePublication = '28/08/2026'

export const uuid = '4c1f5'
export const refs = {
  'fr-fr': ['TSA1-13'],
  'fr-ch': [],
}

const couleurTitre = context.isHtml ? bleuMathalea : 'black'
const couleurRemarque = context.isHtml ? vertMathalea : 'black'

/**
 * Démontrer par récurrence l'expression explicite d'une suite homographique.
 * @author Stéphane Guyon
 */
export default class ExpressionSuiteHomographique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.reponseCourteDisponible = false // Démonstration par récurrence : pas de réponse courte.
  }

  nouvelleVersion(): void {
    const valeursK = combinaisonListes(
      Array.from({ length: 9 }, (_, i) => i + 1),
      this.nbQuestions,
    )

    for (let i = 0; i < this.nbQuestions; i++) {
      const k = valeursK[i]
      const numerateurRecurrence = reduireAxPlusB(k - 1, 1, 'u_n')
      const numerateurApresSubstitution =
        k === 1
          ? '1'
          : `1+${k - 1}\\times\\dfrac{n}{${reduireAxPlusB(1, k, 'n')}}`
      const denominateurRecurrence = `${k + 1}-u_n`
      const denominateurExplicite = reduireAxPlusB(1, k, 'n')
      const denominateurExpliciteSuivant = reduireAxPlusB(1, k + 1, 'n')
      const numerateurMemeDenominateur =
        k === 1 ? denominateurExplicite : `${denominateurExplicite}+${rienSi1(k - 1)}n`

      const texte = `La suite $(u_n)$ est définie par $u_0=0$ et, pour tout entier naturel $n$, par :
    $u_{n+1}=\\dfrac{${numerateurRecurrence}}{${denominateurRecurrence}}$.<br><br>
    Démontrer par récurrence que, pour tout entier naturel $n$, $u_n=\\dfrac{n}{${denominateurExplicite}}$.`

      let correction = `Nous allons procéder à un raisonnement par récurrence.<br><br>
    Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété : $u_n=\\dfrac{n}{${denominateurExplicite}}$.<br><br>`

      correction += `${texteEnCouleurEtGras('Initialisation :', couleurTitre)}<br><br>`
      correction += `Pour $n=0$, le membre de droite de l’égalité à démontrer vaut $\\dfrac{0}{0+${k}}=0$.<br><br>
    Or, par définition, $u_0=0$. On a donc bien $u_0=\\dfrac{0}{0+${k}}$.<br><br>
    La propriété $\\mathcal P_0$ est donc vraie.<br><br>`

      correction += `${texteEnCouleurEtGras('Hérédité :', couleurTitre)}<br><br>`
      correction += `Soit $n$ un entier naturel.<br><br>
    Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n=\\dfrac{n}{${denominateurExplicite}}$. ${texteEnCouleur('Hypothèse de récurrence.', couleurRemarque)}<br><br>
    Montrons alors que $\\mathcal P_{n+1}$ est vraie, c’est-à-dire que $u_{n+1}=\\dfrac{n+1}{${denominateurExpliciteSuivant}}$.<br><br>
    $u_{n+1}=\\dfrac{${numerateurRecurrence}}{${denominateurRecurrence}}\\qquad$ ${texteEnCouleur('D’après la relation de récurrence.', couleurRemarque)}<br><br>
    $u_{n+1}=\\dfrac{${numerateurApresSubstitution}}{${k + 1}-\\dfrac{n}{${denominateurExplicite}}}\\qquad$ ${texteEnCouleur('On utilise l’hypothèse de récurrence.', couleurRemarque)}<br><br>
    $u_{n+1}=\\dfrac{\\dfrac{${numerateurMemeDenominateur}}{${denominateurExplicite}}}{\\dfrac{${k + 1}(${denominateurExplicite})-n}{${denominateurExplicite}}}\\qquad$ ${texteEnCouleur('On réduit au même dénominateur.', couleurRemarque)}<br><br>
    $u_{n+1}=\\dfrac{\\dfrac{${k}(n+1)}{${denominateurExplicite}}}{\\dfrac{${k}(${denominateurExpliciteSuivant})}{${denominateurExplicite}}}\\qquad$ ${texteEnCouleur('On développe puis on factorise.', couleurRemarque)}<br><br>
    $u_{n+1}=\\dfrac{n+1}{${denominateurExpliciteSuivant}}\\qquad$ ${texteEnCouleur('On simplifie le quotient.', couleurRemarque)}<br><br>
    On obtient bien l’égalité attendue. La propriété $\\mathcal P_{n+1}$ est donc vraie.<br><br>
    La propriété est donc héréditaire.<br><br>`

      correction += `${texteEnCouleurEtGras('Conclusion :', couleurTitre)}<br><br>`
      correction += `La propriété est vraie au rang $0$ et elle est héréditaire à partir de ce rang. Donc, par récurrence, pour tout entier naturel $n$, $u_n=\\dfrac{n}{${denominateurExplicite}}$.`

      this.listeQuestions.push(texte)
      this.listeCorrections.push(correction)
    }
    listeQuestionsToContenu(this)
  }
}
