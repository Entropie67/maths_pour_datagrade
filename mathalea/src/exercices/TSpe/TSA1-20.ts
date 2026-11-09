import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureAlgebriqueSauf1, rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Déterminer des limites de suites de référence'
export const dateDePublication = '04/08/2026'
export const interactifReady = true

export const uuid = '958a4'
export const refs = {
  'fr-fr': ['TSA1-20', 'TCA1-10'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'lineaire'
  | 'quadratique'
  | 'inverse'
  | 'inverseCarre'
  | 'exponentielleDecroissante'
  | 'exponentielleCroissante'
  | 'alternee'
  | 'cosinus'
  | 'sinus'

type DonneesQuestion = {
  expression: string
  reponse: string
  correction: string
}

function termePolynomial(coefficient: number, puissance: 1 | 2) {
  const coefficientTexte =
    coefficient === 1
      ? ''
      : coefficient === -1
        ? '-'
        : ecritureAlgebriqueSauf1(coefficient).replace('+', '')
  return `${coefficientTexte}n${puissance === 1 ? '' : '^2'}`
}

/**
 * Limites de suites de référence, sans opération sur les limites.
 * @author Stéphane Guyon
 */
export default class LimitesSuitesDeReference extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer, si elle existe, la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer, si elle existe, la limite de chacune des suites lorsque $n$ tend vers $+\\infty$.'

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'lineaire',
        'quadratique',
        'inverse',
        'inverseCarre',
        'exponentielleDecroissante',
        'exponentielleCroissante',
        'alternee',
        'cosinus',
        'sinus',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const coefficient = choice([-1, 1]) * randint(2, 6)
      const valeurAbsolue = Math.abs(coefficient)
      const coefficientArgument = randint(2, 6)
      let donnees: DonneesQuestion

      switch (type) {
        case 'lineaire': {
          const expression = termePolynomial(coefficient, 1)
          const reponse = coefficient > 0 ? '+\\infty' : '-\\infty'
          donnees = {
            expression,
            reponse,
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}n=+\\infty$. Comme le coefficient de $n$ est ${coefficient > 0 ? 'positif' : 'négatif'}, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'quadratique': {
          const expression = termePolynomial(coefficient, 2)
          const reponse = coefficient > 0 ? '+\\infty' : '-\\infty'
          donnees = {
            expression,
            reponse,
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}n^2=+\\infty$. Comme le coefficient de $n^2$ est ${coefficient > 0 ? 'positif' : 'négatif'}, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'inverse': {
          const expression = `\\dfrac{${coefficient}}{n}`
          donnees = {
            expression,
            reponse: '0',
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}\\dfrac{1}{n}=0$. Le numérateur est ici égal à $${coefficient}$, donc $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'inverseCarre': {
          const expression = `\\dfrac{${coefficient}}{n^2}`
          donnees = {
            expression,
            reponse: '0',
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}\\dfrac{1}{n^2}=0$. Le numérateur est ici égal à $${coefficient}$, donc $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'exponentielleDecroissante': {
          const expression = `\\mathrm{e}^{-${rienSi1(valeurAbsolue)}n}`
          donnees = {
            expression,
            reponse: '0',
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}\\mathrm{e}^{-n}=0$. Plus généralement, pour tout réel $a>0$, $\\displaystyle \\lim_{n\\to+\\infty}\\mathrm{e}^{-an}=0$.<br>Ici, $a=${valeurAbsolue}$, donc $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`,
          }
          break
        }
        case 'exponentielleCroissante': {
          const expression = `\\mathrm{e}^{${rienSi1(valeurAbsolue)}n}`
          donnees = {
            expression,
            reponse: '+\\infty',
            correction: `On sait que $\\displaystyle \\lim_{n\\to+\\infty}\\mathrm{e}^{n}=+\\infty$. Plus généralement, pour tout réel $a>0$, $\\displaystyle \\lim_{n\\to+\\infty}\\mathrm{e}^{an}=+\\infty$.<br>Ici, $a=${valeurAbsolue}$, donc $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('+\\infty')}$.`,
          }
          break
        }
        case 'alternee':
          donnees = {
            expression: `${coefficient}\\times(-1)^n`,
            reponse: '\\not\\exists',
            correction: `Pour tout entier naturel $n$, $${coefficient}\\times(-1)^{2n}=${coefficient}$ et $${coefficient}\\times(-1)^{2n+1}=${-coefficient}$.<br>Donc la suite $(u_n)$ ${texteEnCouleurEtGras("n'a pas de limite")}.`,
          }
          break
        case 'cosinus':
          donnees = {
            expression: `${rienSi1(coefficient)}\\cos(n)`,
            reponse: '\\not\\exists',
            correction: `La fonction cosinus est périodique. La suite $(u_n)$ ${texteEnCouleurEtGras("n'admet donc pas de limite")}.`,
          }
          break
        case 'sinus':
          donnees = {
            expression: `${rienSi1(coefficient)}\\sin(${coefficientArgument}n)`,
            reponse: '\\not\\exists',
            correction: `La fonction sinus est périodique. La suite $(u_n)$ ${texteEnCouleurEtGras("n'admet donc pas de limite")}.`,
          }
          break
      }

      let texte = `La suite $(u_n)$ est définie, pour tout entier naturel $n$ non nul, par :<br>$u_n=${donnees.expression}$.`
      if (this.interactif) {
        texte += `<br>$\\displaystyle \\lim_{n\\to+\\infty}u_n=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLectureLimites)}`
      }

      if (this.questionJamaisPosee(i, donnees.expression)) {
        handleAnswers(this, i, { reponse: { value: donnees.reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = donnees.correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
