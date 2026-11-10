import { bleuMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les entiers relatifs vérifiant une divisibilité'
export const dateDePublication = '22/09/2026'
export const uuid = 'bd40f'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TEA1-11'],
  'fr-ch': [],
}

/**
 * Résoudre a n + b | p en examinant les diviseurs signés du nombre premier p.
 * @author Stéphane Guyon
 */
export default class DivisibiliteExpressionAffine extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const coefficient = randint(3, 8)
    const nombre = choice([5, 7, 11, 13, 17, 19])
    const valeursK = [1, -1, nombre, -nombre]
    const restes = [
      ...new Set(
        valeursK.map(
          (k) => (((nombre / k) % coefficient) + coefficient) % coefficient,
        ),
      ),
    ].filter((reste) => reste > 0)
    const constante = choice(restes)
    const expression = `${coefficient}n+${constante}`

    const cas = valeursK.map((k) => {
      const diviseur = nombre / k
      const numerateur = diviseur - constante
      const quotient = numerateur / coefficient
      const calcul = `\\dfrac{${numerateur}}{${coefficient}}`
      return `Pour $k=${k}$, $${expression}=${diviseur}$, donc $${coefficient}n=${numerateur}$ et $n=${calcul}${Number.isInteger(quotient) ? `=${quotient}\\in\\mathbb Z` : '\\notin\\mathbb Z'}$.`
    })
    const solutions = valeursK
      .map((k) => (nombre / k - constante) / coefficient)
      .filter(Number.isInteger)
      .sort((a, b) => a - b)
    const reponse = `\\{${solutions.join(';')}\\}`
    const conclusionAnalyse = `${texteEnCouleur('Conclusion', bleuMathalea)} : si $n$ est tel que $${expression}$ divise $${nombre}$, alors nécessairement $n\\in${reponse}$.`
    const verifications = solutions.map((n) => {
      const diviseur = coefficient * n + constante
      return `Si $n=${n}$, alors $${expression}=${diviseur}$, qui divise $${nombre}$.`
    })
    const synthese =
      solutions.length === 1
        ? `Réciproquement, supposons que $n=${solutions[0]}$. Alors $${expression}=${coefficient * solutions[0] + constante}$, qui divise $${nombre}$.`
        : `Réciproquement, supposons que $n\\in${reponse}$.<br>${createList({ items: verifications, style: 'fleches' })}`

    this.listeQuestions[0] =
      `Déterminer l'ensemble des entiers relatifs $n$ tels que $${expression}$ divise $${nombre}$.<br>` +
      ajouteChampTexteMathLive(this, 0, KeyboardType.clavierEnsemble, {
        texteAvant: ' $S=$',
      })

    this.listeCorrections[0] = `${texteEnCouleur('Analyse', bleuMathalea)}<br>
    Soit $n\\in\\mathbb Z$ tel que $${expression}$ divise $${nombre}$. Il existe alors un entier $k\\in\\mathbb Z$ tel que $${nombre}=(${expression})\\times k$.<br>
    L'entier $k$ est donc un diviseur de $${nombre}$. Comme $${nombre}$ est premier, ses diviseurs relatifs sont $D_{${nombre}}=\\{-${nombre};-1;1;${nombre}\\}$. On procède à une disjonction des cas selon les quatre valeurs possibles de $k$ :<br>
    ${createList({ items: cas, style: 'fleches' })}<br>
    ${conclusionAnalyse}<br><br>
    ${texteEnCouleur('Synthèse', bleuMathalea)}<br>
    ${synthese}<br>
    Ainsi, l'ensemble des solutions est $S=${miseEnEvidence(reponse)}$.`

    handleAnswers(this, 0, {
      reponse: { value: reponse, options: { ensembleDeNombres: true } },
    })
    listeQuestionsToContenu(this)
  }
}
