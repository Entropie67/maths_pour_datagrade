import { bleuMathalea } from '../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les entiers naturels dont la somme avec un entier est divisible par un autre'
export const dateDePublication = '22/09/2026'
export const uuid = '0274d'

export const refs = {
  'fr-fr': ['TEA1-12'],
  'fr-ch': [],
}

/** Déterminer les solutions naturelles de d | (n + b), sans congruences. */
export default class DivisibiliteSommeEntier extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const diviseur = randint(3, 9)
    const quotient = randint(1, 4)
    const reste = randint(1, diviseur - 1)
    const constante = diviseur * quotient + reste
    const premierTerme = diviseur - reste

    this.listeQuestions[0] = `Déterminer l'ensemble des entiers naturels $n$ tels que $${diviseur}$ divise $n+${constante}$.`

    this.listeCorrections[0] = `${texteEnCouleur('Analyse.', bleuMathalea)}<br>
   Soit $n$ un entier naturel tel que $${diviseur}$ divise $n+${constante}$, cela signifie qu'il existe un entier naturel $k$ tel que $n+${constante}=${diviseur}k$, ou encore $n=${diviseur}k-${constante}$.<br><br>
    Pour que $n$ soit un entier naturel, on doit avoir :<br>
    $\\begin{aligned}
    ${diviseur}k-${constante}&\\geqslant 0\\\\
    ${diviseur}k&\\geqslant ${constante}\\\\
    k&\\geqslant \\dfrac{${constante}}{${diviseur}}=${quotient}+\\dfrac{${reste}}{${diviseur}}
    \\end{aligned}$<br>
    Ainsi, comme $k\\in\\mathbb N$, on a $k\\geqslant ${quotient + 1}$.<br><br>
    On calcule les premières valeurs de $n$ :<br>
    Pour $k=${quotient + 1}$, $n=${diviseur}\\times ${quotient + 1}-${constante}=${premierTerme}$.<br>
    Pour $k=${quotient + 2}$, $n=${diviseur}\\times ${quotient + 2}-${constante}=${premierTerme + diviseur}$.<br>
    Pour $k=${quotient + 3}$, $n=${diviseur}\\times ${quotient + 3}-${constante}=${premierTerme + 2 * diviseur}$.<br><br>
    ${texteEnCouleur('Synthèse.', bleuMathalea)}<br>
    Réciproquement, pour tout entier naturel $k\\geqslant ${quotient + 1}$, le nombre $n=${diviseur}k-${constante}$ est un entier naturel. De plus, $n+${constante}=${diviseur}k$, donc $${diviseur}$ divise $n+${constante}$.<br><br>
    Ainsi, l'ensemble des solutions est $S=${miseEnEvidence(`\\left\\{${diviseur}k-${constante}\\mid k\\in\\mathbb N,\\ k\\geqslant ${quotient + 1}\\right\\}`)}$.`

    listeQuestionsToContenu(this)
  }
}
