import { bleuMathalea, vertMathalea } from '../../lib/colors'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Démontrer l’expression explicite d’une suite arithmético-géométrique'
export const dateDePublication = '29/08/2026'

export const uuid = 'a73e2'
export const refs = {
  'fr-fr': ['TSA1-14'],
  'fr-ch': [],
}

const couleurTitre = context.isHtml ? bleuMathalea : 'black'
const couleurRemarque = context.isHtml ? vertMathalea : 'black'

/**
 * Démontrer par récurrence l'expression explicite d'une suite
 * arithmético-géométrique dont le point fixe est entier.
 * @author Stéphane Guyon
 */
export default class ExpressionSuiteArithmeticoGeometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const raison = randint(2, 5)
    const pointFixe = randint(1, 9)
    const coefficient = randint(2, 9)
    const termeInitial = pointFixe + coefficient
    const termeConstant = pointFixe * (1 - raison)
    const recurrence = `${raison}u_n${ecritureAlgebrique(termeConstant)}`
    const expression = `${pointFixe}+${coefficient}\\times ${raison}^n`
    const expressionSuivante = `${pointFixe}+${coefficient}\\times ${raison}^{n+1}`
    const couleurCommentaire = context.isHtml ? 'forestgreen' : 'black'
    const commentaire = (texte: string) =>
      `\\color{${couleurCommentaire}}{\\quad\\text{${texte}}}`

    const texte = `On considère la suite $(u_n)$ telle que $u_0=${termeInitial}$ et, pour tout entier naturel $n$, $u_{n+1}=${recurrence}$.<br><br>
    Montrer par récurrence que, pour tout entier naturel $n$, $u_n=${expression}$.`

    let correction = `Pour tout entier naturel $n$, on note $\\mathcal P_n$ la propriété : $u_n=${expression}$.<br><br>`

    correction += `${texteEnCouleurEtGras('Initialisation :', couleurTitre)}<br><br>`
    correction += `Pour $n=0$, le membre de droite de l’égalité à démontrer vaut :<br><br>
    $${pointFixe}+${coefficient}\\times ${raison}^0=${pointFixe}+${coefficient}=${termeInitial}$.<br><br>
    Or, par définition, $u_0=${termeInitial}$. La propriété $\\mathcal P_0$ est donc vraie.<br><br>`

    correction += `${texteEnCouleurEtGras('Hérédité :', couleurTitre)}<br><br>`
    correction += `Soit $n$ un entier naturel. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n=${expression}$. ${texteEnCouleur('Hypothèse de récurrence.', couleurRemarque)}<br><br>
    Montrons que $\\mathcal P_{n+1}$ est vraie, c’est-à-dire que $u_{n+1}=${expressionSuivante}$.<br><br>
    $\\begin{aligned}
    u_{n+1}
    &=${recurrence}&&${commentaire('relation de récurrence')}\\\\
    &=${raison}\\left(${expression}\\right)${ecritureAlgebrique(termeConstant)}&&${commentaire('hypothèse de récurrence')}\\\\
    &=${raison * pointFixe}+${raison * coefficient}\\times ${raison}^n${ecritureAlgebrique(termeConstant)}\\\\
    &=${expressionSuivante}.
    \\end{aligned}$<br><br>
    La propriété $\\mathcal P_{n+1}$ est donc vraie. La propriété est héréditaire.<br><br>`

    correction += `${texteEnCouleurEtGras('Conclusion :', couleurTitre)}<br><br>`
    correction += `La propriété est vraie au rang $0$ et elle est héréditaire. Donc, par récurrence, pour tout entier naturel $n$, $u_n=${expression}$.`

    this.listeQuestions.push(texte)
    this.listeCorrections.push(correction)
    listeQuestionsToContenu(this)
  }
}
