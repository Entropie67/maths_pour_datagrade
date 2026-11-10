import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer des limites simples de fonctions en l'infini"
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const uuid = '2ace1'
export const refs = {
  'fr-fr': ['TSA2-22', 'TCA2-22'],
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

type SensLimite = '+' | '-'

const typesLimiteFinie: TypeQuestion[] = [
  'constanteEtInverse',
  'constanteEtDeuxInverses',
  'quotient',
]

const typesLimiteInfinie: TypeQuestion[] = [
  'lineaire',
  'quadratiqueEtInverse',
  'polynomeDegreDeux',
]

function ecritureInverse(coefficient: number, puissance: number): string {
  const valeurAbsolue = Math.abs(coefficient)
  const numerateur = valeurAbsolue === 1 ? '1' : `${valeurAbsolue}`
  const denominateur = puissance === -1 ? 'x' : `x^{${-puissance}}`
  return `\\dfrac{${numerateur}}{${denominateur}}`
}

function ecritureTerme(coefficient: number, puissance: number): string {
  if (puissance >= 0) {
    return new Polynome({
      coeffs: [...Array.from({ length: puissance }, () => 0), coefficient],
      letter: 'x',
    }).toString()
  }
  return `${coefficient < 0 ? '-' : ''}${ecritureInverse(coefficient, puissance)}`
}

function ecritureSomme(termes: Terme[]): string {
  const termesPolynomiaux = termes.filter(({ puissance }) => puissance >= 0)
  const degre = Math.max(...termesPolynomiaux.map(({ puissance }) => puissance))
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  for (const { coefficient, puissance } of termesPolynomiaux) {
    coefficients[puissance] += coefficient
  }
  let expression = new Polynome({
    coeffs: coefficients,
    letter: 'x',
  }).toString()
  for (const { coefficient, puissance } of termes.filter(
    ({ puissance }) => puissance < 0,
  )) {
    const inverse = ecritureInverse(coefficient, puissance)
    expression += coefficient < 0 ? `-${inverse}` : `+${inverse}`
  }
  return expression
}

function limitePuissance(puissance: number, sens: SensLimite): string {
  if (sens === '+' || puissance % 2 === 0) return '+\\infty'
  return '-\\infty'
}

function limiteTerme(
  coefficient: number,
  puissance: number,
  sens: SensLimite,
): string {
  if (puissance < 0) return '0'
  if (puissance === 0) return `${coefficient}`
  const signePuissance =
    limitePuissance(puissance, sens) === '+\\infty' ? 1 : -1
  return coefficient * signePuissance > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Limites de fonctions par somme ou quotient, sans forme indéterminée.
 * @author Stéphane Guyon
 */
export default class LimitesFonctionsParSomme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la fonction.'
        : 'Déterminer les limites des fonctions.'

    const typesDisponibles = [...typesLimiteFinie, ...typesLimiteInfinie]
    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      typesDisponibles,
      this.nbQuestions,
    )
    const sensDesLimites = combinaisonListes<SensLimite>(
      ['+', '-'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const sens = sensDesLimites[i]
      const signe = choice([-1, 1])
      let termes: Terme[] = []
      let quotient: { numerateur: number; constante: number } | undefined

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
        case 'quadratiqueEtInverse': {
          const signeCoefficientLineaire = sens === '+' ? signe : -signe
          termes = [
            { coefficient: signe * randint(1, 6), puissance: 2 },
            {
              coefficient: signeCoefficientLineaire * randint(1, 6),
              puissance: 1,
            },
            { coefficient: randint(-6, 6, 0), puissance: -randint(1, 2) },
          ]
          break
        }
        case 'polynomeDegreDeux': {
          const signeCoefficientLineaire = sens === '+' ? signe : -signe
          termes = [
            { coefficient: signe * randint(1, 6), puissance: 2 },
            {
              coefficient: signeCoefficientLineaire * randint(1, 6),
              puissance: 1,
            },
            { coefficient: randint(-6, 6, 0), puissance: 0 },
          ]
          break
        }
        case 'quotient':
          quotient = {
            numerateur: randint(-6, 6, 0),
            constante: randint(1, 9),
          }
          break
      }

      const expression = quotient
        ? `\\dfrac{${quotient.numerateur}}{x^2+${quotient.constante}}`
        : ecritureSomme(termes)
      const termesDivergents = termes.filter(({ puissance }) => puissance > 0)
      const termeConstant = termes.find(({ puissance }) => puissance === 0)
      const reponse = quotient
        ? '0'
        : termesDivergents.length > 0
          ? limiteTerme(
              termesDivergents[0].coefficient,
              termesDivergents[0].puissance,
              sens,
            )
          : `${termeConstant?.coefficient ?? 0}`
      const domaine = termes.some(({ puissance }) => puissance < 0)
        ? '\\mathbb R^*'
        : '\\mathbb R'
      const indiceLimite = `x\\to${sens}\\infty`

      let texte = `Soit $f$ la fonction définie sur $${domaine}$ par :<br>$f(x)=${expression}$.<br>`
      if (this.interactif) {
        texte += `$\\displaystyle \\lim_{${indiceLimite}}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      } else {
        texte += `Calculer $\\displaystyle \\lim_{${indiceLimite}}f(x)$.`
      }

      let texteCorr = 'D’après les limites de référence :<br>'
      if (quotient) {
        texteCorr += `$\\displaystyle \\lim_{${indiceLimite}}x^2=+\\infty$ et $\\displaystyle \\lim_{${indiceLimite}}${quotient.constante}=${quotient.constante}$.<br>`
        texteCorr += `Par somme, $\\displaystyle \\lim_{${indiceLimite}}\\left(x^2+${quotient.constante}\\right)=+\\infty$.<br>`
        texteCorr += `$\\displaystyle \\lim_{${indiceLimite}}${quotient.numerateur}=${quotient.numerateur}$.<br>`
        texteCorr += `Par quotient, $\\displaystyle \\lim_{${indiceLimite}}f(x)=${miseEnEvidence('0')}$.`
      } else {
        texteCorr += termes
          .map(
            ({ coefficient, puissance }) =>
              `$\\displaystyle \\lim_{${indiceLimite}}${ecritureTerme(coefficient, puissance)}=${limiteTerme(coefficient, puissance, sens)}$`,
          )
          .join(',<br>')
        texteCorr += '.<br>'
        texteCorr += `Par somme, $\\displaystyle \\lim_{${indiceLimite}}f(x)=${miseEnEvidence(reponse)}$.`
      }

      if (this.questionJamaisPosee(i, expression, sens)) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
