import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Calculer une limite en factorisant par le terme de plus haut degré'
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const uuid = '37ce7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
// exo en doublon avec le TSA2-31
type TypeQuestion = 'polynome' | 'quotient'
type SensLimite = '+' | '-'

function puissanceDeX(puissance: number): string {
  return puissance === 1 ? 'x' : `x^{${puissance}}`
}

function termeFactorise(coefficient: number, puissance: number): string {
  if (coefficient === 0) return ''
  const signe = coefficient > 0 ? '+' : '-'
  return `${signe}\\dfrac{${Math.abs(coefficient)}}{${puissanceDeX(puissance)}}`
}

function facteurDominant(coefficients: number[]): string {
  const degre = coefficients.length - 1
  let facteur = `${coefficients[degre]}`
  for (let puissance = degre - 1; puissance >= 0; puissance--) {
    facteur += termeFactorise(coefficients[puissance], degre - puissance)
  }
  return facteur
}

function limitePuissance(puissance: number, sens: SensLimite): string {
  return sens === '+' || puissance % 2 === 0 ? '+\\infty' : '-\\infty'
}

function ecritureMonome(coefficient: number, puissance: number): string {
  return new Polynome({
    coeffs: [...Array.from({ length: puissance }, () => 0), coefficient],
    letter: 'x',
  }).toString()
}

function limiteMonome(
  coefficient: number,
  puissance: number,
  sens: SensLimite,
): string {
  const signePuissance =
    limitePuissance(puissance, sens) === '+\\infty' ? 1 : -1
  return coefficient * signePuissance > 0 ? '+\\infty' : '-\\infty'
}

function limitePolynome(coefficients: number[], sens: SensLimite): string {
  const degre = coefficients.length - 1
  const signePuissance = limitePuissance(degre, sens) === '+\\infty' ? 1 : -1
  return coefficients[degre] * signePuissance > 0 ? '+\\infty' : '-\\infty'
}

function generePolynomeAvecIndetermination(sens: SensLimite): number[] {
  const degre = randint(2, 3)
  const signe = randint(0, 1) === 0 ? -1 : 1
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  coefficients[degre] = signe * randint(1, 5)
  coefficients[degre - 1] = (sens === '+' ? -signe : signe) * randint(1, 6)
  for (let puissance = 0; puissance <= degre - 2; puissance++) {
    coefficients[puissance] = randint(-6, 6, 0)
  }
  return coefficients
}

function generePolynome(degre: number): number[] {
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  coefficients[degre] = randint(-5, 5, 0)
  for (let puissance = 0; puissance < degre; puissance++) {
    coefficients[puissance] = randint(-6, 6)
  }
  return coefficients
}

function genereDenominateurSansRacine(): number[] {
  const signe = randint(0, 1) === 0 ? -1 : 1
  const coefficientDegreDeux = randint(1, 5)
  const coefficientLineaire = randint(-5, 5)
  const constanteMinimale =
    Math.floor(
      (coefficientLineaire * coefficientLineaire) / (4 * coefficientDegreDeux),
    ) + 1
  const constante = constanteMinimale + randint(0, 4)
  return [
    signe * constante,
    signe * coefficientLineaire,
    signe * coefficientDegreDeux,
  ]
}

/**
 * Limites de fonctions polynomiales et rationnelles obtenues en factorisant
 * par le terme de plus haut degré.
 * @author Stéphane Guyon
 */
export default class FactoriserPourCalculerUneLimite extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 1
    this.besoinFormulaireNumerique = [
      'Type de questions',
      2,
      '1 : Polynômes\n2 : Fonctions rationnelles',
    ]
  }

  nouvelleVersion(): void {
    const typesDisponibles: TypeQuestion[] =
      this.sup === 2 ? ['quotient'] : ['polynome']
    const types = combinaisonListes(typesDisponibles, this.nbQuestions)
    const sensDesLimites = combinaisonListes<SensLimite>(
      ['+', '-'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const sens = sensDesLimites[i]
      const indice = `x\\to${sens}\\infty`
      let expression: string
      let reponse: string
      let correction: string

      if (types[i] === 'polynome') {
        const coefficients = generePolynomeAvecIndetermination(sens)
        const degre = coefficients.length - 1
        const polynome = new Polynome({
          coeffs: coefficients,
          letter: 'x',
        }).toString()
        const puissance = puissanceDeX(degre)
        const facteur = facteurDominant(coefficients)
        const termeDominant = ecritureMonome(coefficients[degre], degre)
        const termeSuivant = ecritureMonome(coefficients[degre - 1], degre - 1)
        expression = polynome
        reponse = limitePolynome(coefficients, sens)

        correction = `On a $\\displaystyle \\lim_{${indice}}${termeDominant}=${limiteMonome(coefficients[degre], degre, sens)}$ et $\\displaystyle \\lim_{${indice}}${termeSuivant}=${limiteMonome(coefficients[degre - 1], degre - 1, sens)}$.<br>`
        correction += `Ces deux monômes conduisent à une forme indéterminée du type «${sp()}$\\infty-\\infty$${sp()}» : la limite ne peut pas être calculée directement par somme.<br>`
        correction += `On factorise alors par le terme de plus haut degré.<br>Soit $x\\neq 0$.<br>`
        correction += `$\\begin{aligned}
          f(x)&=${polynome}\\\\
          &=${puissance}\\left(${facteur}\\right).
        \\end{aligned}$<br>`
        correction += `D’après les limites de référence, pour tout entier $k\\geqslant 1$, $\\displaystyle \\lim_{${indice}}\\dfrac{1}{x^k}=0$.<br>`
        correction += `Par somme, $\\displaystyle \\lim_{${indice}}\\left(${facteur}\\right)=${coefficients[degre]}$.<br>`
        correction += `On sait que $\\displaystyle \\lim_{${indice}}${puissance}=${limitePuissance(degre, sens)}$.<br>`
        correction += `Par produit, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else {
        const degreNumerateur = randint(1, 3)
        const degreDenominateur = 2
        const numerateur = generePolynome(degreNumerateur)
        const denominateur = genereDenominateurSansRacine()
        const polynomeNumerateur = new Polynome({
          coeffs: numerateur,
          letter: 'x',
        }).toString()
        const polynomeDenominateur = new Polynome({
          coeffs: denominateur,
          letter: 'x',
        }).toString()
        const facteurNumerateur = facteurDominant(numerateur)
        const facteurDenominateur = facteurDominant(denominateur)
        const coefficientNumerateur = numerateur[degreNumerateur]
        const coefficientDenominateur = denominateur[degreDenominateur]
        const differenceDegres = degreNumerateur - degreDenominateur
        const limiteFacteurs = new FractionEtendue(
          coefficientNumerateur,
          coefficientDenominateur,
        ).texFractionSimplifiee

        expression = `\\dfrac{${polynomeNumerateur}}{${polynomeDenominateur}}`
        if (differenceDegres < 0) {
          reponse = '0'
        } else if (differenceDegres === 0) {
          reponse = limiteFacteurs
        } else {
          const signePuissance =
            limitePuissance(differenceDegres, sens) === '+\\infty' ? 1 : -1
          const signeQuotient =
            coefficientNumerateur * coefficientDenominateur > 0 ? 1 : -1
          reponse = signePuissance * signeQuotient > 0 ? '+\\infty' : '-\\infty'
        }

        const facteurExterieur =
          differenceDegres === 0
            ? ''
            : differenceDegres > 0
              ? `${puissanceDeX(differenceDegres)}\\times`
              : `\\dfrac{1}{${puissanceDeX(-differenceDegres)}}\\times`
        const derniereLigne = `${facteurExterieur}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}`

        correction = `On obtient une forme indéterminée du type «${sp()}$\\dfrac{\\infty}{\\infty}$${sp()}».<br>`
        correction += `On factorise le numérateur et le dénominateur par leurs termes de plus haut degré.<br>Soit $x\\neq 0$.<br>`
        correction += `$\\begin{aligned}
          f(x)&=\\dfrac{${polynomeNumerateur}}{${polynomeDenominateur}}\\\\
          &=\\dfrac{${puissanceDeX(degreNumerateur)}\\left(${facteurNumerateur}\\right)}{${puissanceDeX(degreDenominateur)}\\left(${facteurDenominateur}\\right)}\\\\
          &=${derniereLigne}.
        \\end{aligned}$<br>`
        correction += `D’après les limites de référence, pour tout entier $k\\geqslant 1$, $\\displaystyle \\lim_{${indice}}\\dfrac{1}{x^k}=0$.<br>`
        correction += `Par somme puis par quotient, $\\displaystyle \\lim_{${indice}}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}=${limiteFacteurs}$.<br>`

        if (differenceDegres > 0) {
          const puissance = puissanceDeX(differenceDegres)
          correction += `On sait que $\\displaystyle \\lim_{${indice}}${puissance}=${limitePuissance(differenceDegres, sens)}$.<br>`
          correction += `Par produit, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
        } else if (differenceDegres < 0) {
          const inverse = `\\dfrac{1}{${puissanceDeX(-differenceDegres)}}`
          correction += `On sait que $\\displaystyle \\lim_{${indice}}${inverse}=0$.<br>`
          correction += `Par produit, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence('0')}$.`
        } else {
          correction += `On en déduit que $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
        }
      }

      let texte = `Soit $f$ la fonction définie sur $\\mathbb R$ par $f(x)=${expression}$.<br>`
      if (this.interactif) {
        texte += `$\\displaystyle \\lim_{${indice}}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      } else {
        texte += `Calculer $\\displaystyle \\lim_{${indice}}f(x)$.`
      }

      if (this.questionJamaisPosee(i, expression, sens)) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
