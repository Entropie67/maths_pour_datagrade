import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiMoins } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer des limites simples de suites par somme ou quotient'
export const dateDePublication = '03/08/2026'
export const interactifReady = true

export const uuid = '70151'
export const refs = {
  'fr-fr': ['TSA1-22', 'TCA1-12'],
  'fr-ch': [],
}

type Terme = {
  coefficient: number
  puissance: number
}

type TypeQuestion =
  | 'constanteEtInverse'
  | 'constanteEtDeuxInverses'
  | 'lineaire'
  | 'quadratiqueEtInverse'
  | 'polynomeDegreDeux'
  | 'quotient'

function ecritureInverse(coefficient: number, puissance: number) {
  const valeurAbsolue = Math.abs(coefficient)
  const numerateur = valeurAbsolue === 1 ? '1' : `${valeurAbsolue}`
  const denominateur = puissance === -1 ? 'n' : `n^{${-puissance}}`
  return `\\dfrac{${numerateur}}{${denominateur}}`
}

function ecritureTerme(coefficient: number, puissance: number) {
  if (puissance >= 0) {
    return new Polynome({
      coeffs: [...Array.from({ length: puissance }, () => 0), coefficient],
      letter: 'n',
    }).toString()
  }
  return `${coefficient < 0 ? '-' : ''}${ecritureInverse(coefficient, puissance)}`
}

function ecritureSomme(termes: Terme[]) {
  const termesPolynomiaux = termes.filter(({ puissance }) => puissance >= 0)
  const degre = Math.max(...termesPolynomiaux.map(({ puissance }) => puissance))
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  for (const { coefficient, puissance } of termesPolynomiaux) {
    coefficients[puissance] += coefficient
  }
  let expression = new Polynome({
    coeffs: coefficients,
    letter: 'n',
  }).toString()
  for (const { coefficient, puissance } of termes.filter(
    ({ puissance }) => puissance < 0,
  )) {
    const inverse = ecritureInverse(coefficient, puissance)
    expression += coefficient < 0 ? `-${inverse}` : `+${inverse}`
  }
  return expression
}

function limiteTerme(coefficient: number, puissance: number) {
  if (puissance < 0) return '0'
  if (puissance === 0) return `${coefficient}`
  return coefficient > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Limites de sommes simples sans forme indéterminée.
 * @author Stéphane Guyon
 */
export default class LimitesSimplesParSomme extends Exercice {
  constructor() {
    super()
    this.consigne =
      'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'
    this.nbQuestions = 5
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'
    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'constanteEtInverse',
        'constanteEtDeuxInverses',
        'lineaire',
        'quadratiqueEtInverse',
        'polynomeDegreDeux',
        'quotient',
      ],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const signe = randint(0, 1) === 0 ? -1 : 1
      let termes: Terme[]
      let quotient:
        { numerateur: number; puissance: number; constante: number } | undefined

      switch (type) {
        case 'constanteEtInverse':
          termes = [
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-6, 6, 0), puissance: -1 },
          ]
          break
        case 'constanteEtDeuxInverses':
          termes = [
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-6, 6, 0), puissance: -1 },
            { coefficient: randint(-6, 6, 0), puissance: -2 },
          ]
          break
        case 'lineaire':
          termes = [
            { coefficient: signe * randint(1, 6), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
            { coefficient: randint(-6, 6, 0), puissance: -1 },
          ]
          break
        case 'quadratiqueEtInverse':
          termes = [
            { coefficient: signe * randint(1, 6), puissance: 2 },
            { coefficient: signe * randint(1, 6), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: -randint(1, 2) },
          ]
          break
        case 'polynomeDegreDeux':
          termes = [
            { coefficient: signe * randint(1, 6), puissance: 2 },
            { coefficient: signe * randint(1, 6), puissance: 1 },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          break
        case 'quotient':
          quotient = {
            numerateur: randint(-6, 6, 0),
            puissance: randint(1, 2),
            constante: randint(1, 9),
          }
          termes = []
          break
      }

      const expression = quotient
        ? `\\dfrac{${quotient.numerateur}}{n${quotient.puissance === 1 ? '' : `^{${quotient.puissance}}`}+${quotient.constante}}`
        : ecritureSomme(termes)
      const termesDivergents = termes.filter(({ puissance }) => puissance > 0)
      const termeConstant = termes.find(({ puissance }) => puissance === 0)
      const reponse = quotient
        ? '0'
        : termesDivergents.length > 0
          ? limiteTerme(
              termesDivergents[0].coefficient,
              termesDivergents[0].puissance,
            )
          : `${termeConstant?.coefficient ?? 0}`

      let texte = `La suite $(u_n)$ est définie, pour tout entier naturel $n$ non nul, par :<br>$u_n=${expression}$.`
      if (this.interactif) {
        texte += `<br>$\\displaystyle \\lim_{n\\to+\\infty}u_n=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      }

      let texteCorr: string
      if (quotient) {
        const puissance =
          quotient.puissance === 1 ? 'n' : `n^{${quotient.puissance}}`
        texteCorr = 'D’après les limites de référence :<br>'
        texteCorr += `$\\displaystyle \\lim_{n\\to+\\infty}${puissance}=+\\infty$ et $\\displaystyle \\lim_{n\\to+\\infty}${quotient.constante}=${quotient.constante}$.<br>`
        texteCorr += `Par somme, $\\displaystyle \\lim_{n\\to+\\infty}\\left(${puissance}+${quotient.constante}\\right)=+\\infty$.<br>`
        texteCorr += `Le numérateur est constant, donc $\\displaystyle \\lim_{n\\to+\\infty}${quotient.numerateur}=${quotient.numerateur}$.<br>`
        texteCorr += `Par quotient, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence('0')}$.`
      } else {
        texteCorr = 'D’après les limites de référence :<br>'
        texteCorr += termes
          .map(
            ({ coefficient, puissance }) =>
              `$\\displaystyle \\lim_{n\\to+\\infty}${ecritureParentheseSiMoins(ecritureTerme(coefficient, puissance))}=${limiteTerme(coefficient, puissance)}$`,
          )
          .join(',<br>')
        texteCorr += '.<br>'
        texteCorr += `Par somme, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`
      }

      if (this.questionJamaisPosee(i, expression)) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
