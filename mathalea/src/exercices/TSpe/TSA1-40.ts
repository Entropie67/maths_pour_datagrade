import { choice } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Prouver la convergence d’une suite monotone'
export const dateDePublication = '04/08/2026'

export const uuid = '0ee2a'
export const refs = {
  'fr-fr': ['TSA1-40'],
  'fr-ch': [],
}

const raisons: Array<[number, number]> = [
  [1, 2],
  [1, 3],
  [2, 3],
  [1, 4],
  [3, 4],
  [2, 5],
  [3, 5],
  [4, 5],
]

/**
 * Démontrer qu'une suite affine décroissante et minorée converge.
 * @author Stéphane Guyon
 */
export default class ConvergenceSuiteMonotone extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    const [numerateur, denominateur] = choice(raisons)
    const q = new FractionEtendue(numerateur, denominateur)
    const k = randint(1, 3)
    const borne = denominateur * k
    const termeConstant = (denominateur - numerateur) * k
    const u0 = borne + randint(2, 8)
    const coefficientEcart = new FractionEtendue(
      denominateur - numerateur,
      denominateur,
    )

    let texte = `Soit la suite $(u_n)$ définie par $u_0=${u0}$ et, pour tout entier naturel $n$, par :<br>$u_{n+1}=${q.texFraction}u_n+${termeConstant}$.`
    texte += `<br><br>1. Montrer par récurrence que la suite $(u_n)$ est minorée par $${borne}$.`
    texte += `<br><br>2. En déduire que la suite $(u_n)$ est décroissante.`
    texte += `<br><br>3. Que peut-on en déduire pour la convergence de la suite $(u_n)$ ?`

    let correction = `1. Montrer par récurrence que la suite $(u_n)$ est minorée par $${borne}$.<br><br>`
    correction += `Pour tout entier naturel $n$, on nomme $\\mathcal P_n$ la propriété : $u_n\\geqslant ${borne}$.<br><br>`
    correction += `${texteEnCouleurEtGras('Initialisation :', 'black')}<br>`
    correction += `On a $u_0=${u0}$ et $${u0}\\geqslant ${borne}$. La propriété $\\mathcal P_0$ est donc vérifiée.<br><br>`
    correction += `${texteEnCouleurEtGras('Hérédité :', 'black')}<br>`
    correction += `Soit $n\\in\\mathbb N$. Supposons que $\\mathcal P_n$ est vraie, c’est-à-dire que $u_n\\geqslant ${borne}$.<br>`
    correction += `On veut montrer que $\\mathcal P_{n+1}$ est vraie, c’est-à-dire que $u_{n+1}\\geqslant ${borne}$.<br><br>`
    correction += `On a :<br>`
    correction += `$\\begin{aligned}
\\phantom{\\iff}&\\quad u_n\\geqslant ${borne}\\\\
&\\iff\\quad ${q.texFraction}u_n\\geqslant ${q.texFraction}\\times ${borne}&&\\text{car }${q.texFraction}>0\\\\
&\\iff\\quad ${q.texFraction}u_n+${termeConstant}\\geqslant ${q.texFraction}\\times ${borne}+${termeConstant}&&\\text{on ajoute }${termeConstant}\\\\
&\\iff\\quad u_{n+1}\\geqslant ${borne}&&\\text{car }${q.texFraction}\\times ${borne}+${termeConstant}=${borne}.
\\end{aligned}$<br>`
    correction += `Ainsi, $\\mathcal P_{n+1}$ est vraie. La propriété est donc héréditaire.<br><br>${texteEnCouleurEtGras('Conclusion :', 'black')}<br>`
    correction += `On a montré que la propriété $\\mathcal P_n$ est initialisée au rang $0$ et qu’elle est héréditaire. Par récurrence, $\\mathcal P_n$ est vraie pour tout entier naturel $n$.<br>`
    correction += `Ainsi, pour tout entier naturel $n$, $u_n\\geqslant ${borne}$.<br>`
    correction += texteEnCouleur(
      `La suite $(u_n)$ est donc minorée par $${borne}$.`,
      'red',
    )

    correction += `<br><br>2. En déduire que la suite $(u_n)$ est décroissante.<br><br>`
    correction += `Soit $n\\in\\mathbb N$.<br><br>`
    correction += `On a :<br>`
    correction += `$\\begin{aligned}
u_{n+1}-u_n&=${q.texFraction}u_n+${termeConstant}-u_n\\\\
&=-${coefficientEcart.texFraction}u_n+${termeConstant}\\\\
&=-${coefficientEcart.texFraction}\\left(u_n-${borne}\\right)
\\end{aligned}$<br>`
    correction += `Or, on a montré à la question précédente que, pour tout entier naturel $n$, $u_n\\geqslant ${borne}$. Donc $u_n-${borne}\\geqslant 0$.<br>`
    correction += `De plus, $-${coefficientEcart.texFraction}$ est strictement négatif. Donc $u_{n+1}-u_n\\leqslant 0$.<br>`
    correction += `On vient donc de montrer que, pour tout entier naturel $n$, $u_{n+1}\\leqslant u_n$.<br>`
    correction += `La suite $(u_n)$ est donc ${texteEnCouleurEtGras('décroissante')}.`

    correction += `<br><br>3. Que peut-on en déduire pour la convergence de la suite $(u_n)$ ?<br><br>`
    correction += `La suite $(u_n)$ est décroissante et minorée par $${borne}$.<br>`
    correction += `D’après le théorème de convergence monotone, la suite $(u_n)$ est donc ${texteEnCouleurEtGras('convergente')}.`

    this.listeQuestions.push(texte)
    this.listeCorrections.push(correction)
    listeQuestionsToContenu(this)
  }
}
