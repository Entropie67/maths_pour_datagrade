import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Démontrer une divisibilité par récurrence'
export const dateDePublication = '30/09/2026'
export const uuid = 'd2921'

export const refs = {
  'fr-fr': ['TEA1-15'],
  'fr-ch': [],
}

/**
 * Démontrer par récurrence que a^(pn) - 1 est divisible par a^p - 1,
 * avec p égal à 1 ou 2.
 *
 * @author Stéphane Guyon
 */
export default class DivisibilitePuissanceRecurrence extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const exposant = choice([1, 2])
    const base = exposant === 1 ? randint(4, 10) : choice([2, 3, 4, 5, 6, 7])
    const puissanceBase = base ** exposant
    const diviseur = puissanceBase - 1
    const terme = exposant === 1 ? `${base}^n` : `${base}^{2n}`
    const termeSuivant = exposant === 1 ? `${base}^{n+1}` : `${base}^{2(n+1)}`
    const decompositionExposant =
      exposant === 1
        ? `${base}\\times ${base}^n`
        : `${base}^2\\times ${base}^{2n}`
    const facteur = exposant === 1 ? `${base}` : `${base}^2`

    this.listeQuestions[0] = `Démontrer par récurrence que, pour tout entier naturel $n$, $${terme}-1$ est divisible par $${diviseur}$.`

    this.listeCorrections[0] = `Pour tout entier naturel $n$, notons $\\mathcal P(n)$ la propriété : «${sp()}$${terme}-1$ est divisible par $${diviseur}$${sp()}».<br><br>
    ${texteEnCouleur('Initialisation.', bleuMathalea)}<br>
    Pour $n=0$, on a $${base}^{${exposant}\\times 0}-1=1-1=0$. Or $0$ est divisible par $${diviseur}$. La propriété $\\mathcal P(0)$ est donc vraie.<br><br>
    ${texteEnCouleur('Hérédité.', bleuMathalea)}<br>
    Soit $n\\in\\mathbb N$. Supposons que $\\mathcal P(n)$ est vraie, c’est-à-dire que $${terme}-1$ est divisible par $${diviseur}$. Il existe donc un entier $k\\in\\mathbb Z$ tel que
    $${terme}-1=${diviseur}k$.<br>
    La propriété $\\mathcal P(n+1)$ s’énonce : «${sp()}$${termeSuivant}-1$ est divisible par $${diviseur}$${sp()}».<br>
    Montrons que $\\mathcal P(n+1)$ est vraie. On a :<br>
    $\\begin{aligned}
    ${termeSuivant}-1
      &= ${decompositionExposant}-1\\\\
      &= ${facteur}\\times${terme}-${puissanceBase}+${puissanceBase}-1&\\text{On ajoute et on soustrait } ${puissanceBase}.\\\\
       &= ${facteur}\\left(${terme}-1\\right)+${puissanceBase}-1&\\text{On factorise par } ${puissanceBase}\\text{ les deux premiers termes. }\\\\
      &= ${facteur}\\times ${diviseur}k+${diviseur}&\\text{On utilise l'hypothèse de récurrence. }\\\\
      &= ${diviseur}\\left(${facteur}k+1\\right)&\\text{On factorise par } ${diviseur}.\\\\
    \\end{aligned}$<br>
    Comme $${facteur}k+1$ est un entier, $${termeSuivant}-1$ est divisible par $${diviseur}$. Ainsi, $\\mathcal P(n+1)$ est vraie.<br><br>
    ${texteEnCouleur('Conclusion.', bleuMathalea)}<br>
    La propriété est initialisée au rang $0$ et elle est héréditaire. <br>D’après le principe de récurrence, pour tout entier naturel $n$, $${miseEnEvidence(`${terme}-1`)}$ est divisible par $${miseEnEvidence(String(diviseur))}$.`

    listeQuestionsToContenu(this)
  }
}
