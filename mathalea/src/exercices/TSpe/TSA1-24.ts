import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Lever une indétermination'
export const dateDePublication = '03/08/2026'
export const interactifReady = true

export const uuid = 'e81f4'
export const refs = {
  'fr-fr': ['TSA1-24', 'TCA1-14'],
  'fr-ch': [],
}

type TypeQuestion = 'polynome' | 'quotient'

function ecriturePuissanceDeN(puissance: number) {
  return puissance === 1 ? 'n' : `n^{${puissance}}`
}

function termeDansFactorisation(
  coefficient: number,
  puissanceDenominateur: number,
) {
  if (coefficient === 0) return ''
  const signe = coefficient < 0 ? '-' : '+'
  const numerateur = Math.abs(coefficient)
  return `${signe}\\dfrac{${numerateur}}{n${puissanceDenominateur === 1 ? '' : `^{${puissanceDenominateur}}`}}`
}

function facteurDominant(coefficients: number[]) {
  const degre = coefficients.length - 1
  let facteur = `${coefficients[degre]}`
  for (let puissance = degre - 1; puissance >= 0; puissance--) {
    facteur += termeDansFactorisation(
      coefficients[puissance],
      degre - puissance,
    )
  }
  return facteur
}

function limitePolynome(coefficients: number[]) {
  return coefficients[coefficients.length - 1] > 0 ? '+\\infty' : '-\\infty'
}

function generePolynomeAvecIndetermination() {
  const degre = randint(2, 3)
  const signe = randint(0, 1) === 0 ? -1 : 1
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  coefficients[degre] = signe * randint(1, 5)
  coefficients[degre - 1] = -signe * randint(1, 6)
  for (let puissance = 0; puissance <= degre - 2; puissance++) {
    coefficients[puissance] = randint(-6, 6, 0)
  }
  return coefficients
}

function generePolynome(degre: number) {
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  coefficients[degre] = randint(-5, 5, 0)
  for (let puissance = 0; puissance < degre; puissance++) {
    coefficients[puissance] = randint(-6, 6)
  }
  return coefficients
}

function genereDenominateur(degre: number) {
  const signe = randint(0, 1) === 0 ? -1 : 1
  return Array.from({ length: degre + 1 }, () => signe * randint(1, 6))
}

/**
 * Limites de polynômes et de quotients obtenues en factorisant par le terme
 * de plus haut degré.
 * @author Stéphane Guyon
 */
export default class LeverUneIndetermination extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Polynômes\n2 : Quotients de polynômes\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la suite lorsque $n$ tend vers $+\\infty$.'
        : 'Déterminer la limite de chaque suite lorsque $n$ tend vers $+\\infty$.'

    const typesDisponibles: TypeQuestion[] =
      this.sup === 1
        ? ['polynome']
        : this.sup === 2
          ? ['quotient']
          : ['polynome', 'quotient']
    const typesDeQuestions = combinaisonListes(
      typesDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      let expression: string
      let reponse: string
      let texteCorr: string

      if (type === 'polynome') {
        const coefficients = generePolynomeAvecIndetermination()
        const degre = coefficients.length - 1
        const polynome = new Polynome({
          coeffs: coefficients,
          letter: 'n',
        }).toString()
        const facteur = facteurDominant(coefficients)
        reponse = limitePolynome(coefficients)
        expression = polynome

        texteCorr = `Les deux premiers termes donnent une forme indéterminée du type $\\infty-\\infty$.<br>Soit $n$ un entier naturel non nul. On factorise par le terme de plus haut degré :<br>`
        texteCorr += `$\\begin{aligned}u_n&=${polynome}\\\\&=${ecriturePuissanceDeN(degre)}\\left(${facteur}\\right).\\end{aligned}$<br>`
        texteCorr += `D’après les limites de référence, pour tout entier $k\\geqslant 1$, $\\displaystyle \\lim_{n\\to+\\infty}\\dfrac{1}{n^k}=0$.<br>`
        texteCorr += `Par somme, $\\displaystyle \\lim_{n\\to+\\infty}\\left(${facteur}\\right)=${coefficients[degre]}$.<br>`
        texteCorr += `Comme $\\displaystyle \\lim_{n\\to+\\infty}${ecriturePuissanceDeN(degre)}=+\\infty$, par produit, $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`
      } else {
        const degreNumerateur = randint(1, 3)
        const degreDenominateur = randint(1, 3)
        const numerateur = generePolynome(degreNumerateur)
        const denominateur = genereDenominateur(degreDenominateur)
        const polynomeNumerateur = new Polynome({
          coeffs: numerateur,
          letter: 'n',
        }).toString()
        const polynomeDenominateur = new Polynome({
          coeffs: denominateur,
          letter: 'n',
        }).toString()
        const facteurNumerateur = facteurDominant(numerateur)
        const facteurDenominateur = facteurDominant(denominateur)
        const coefficientDominantNumerateur = numerateur[degreNumerateur]
        const coefficientDominantDenominateur = denominateur[degreDenominateur]
        const limiteNumerateur = limitePolynome(numerateur)
        const limiteDenominateur = limitePolynome(denominateur)
        const differenceDegres = degreNumerateur - degreDenominateur
        const signeLimite =
          coefficientDominantNumerateur * coefficientDominantDenominateur > 0
            ? 1
            : -1

        expression = `\\dfrac{${polynomeNumerateur}}{${polynomeDenominateur}}`
        if (differenceDegres < 0) {
          reponse = '0'
        } else if (differenceDegres === 0) {
          reponse = new FractionEtendue(
            coefficientDominantNumerateur,
            coefficientDominantDenominateur,
          ).texFractionSimplifiee
        } else {
          reponse = signeLimite > 0 ? '+\\infty' : '-\\infty'
        }

        const puissanceHorsFraction =
          differenceDegres === 0
            ? ''
            : differenceDegres > 0
              ? `n${differenceDegres === 1 ? '' : `^{${differenceDegres}}`}\\times`
              : `\\dfrac{1}{n${differenceDegres === -1 ? '' : `^{${-differenceDegres}}`}}\\times`

        const termeDominantNumerateur = new Polynome({
          coeffs: [
            ...Array.from({ length: degreNumerateur }, () => 0),
            coefficientDominantNumerateur,
          ],
          letter: 'n',
        }).toString()
        const termeDominantDenominateur = new Polynome({
          coeffs: [
            ...Array.from({ length: degreDenominateur }, () => 0),
            coefficientDominantDenominateur,
          ],
          letter: 'n',
        }).toString()

        texteCorr = `Le numérateur est un polynôme de terme dominant $${termeDominantNumerateur}$, donc sa limite est $${limiteNumerateur}$.<br>`
        texteCorr += `Le dénominateur est un polynôme de terme dominant $${termeDominantDenominateur}$, donc sa limite est $${limiteDenominateur}$.<br>`
        texteCorr += `On obtient ainsi une forme indéterminée du type $\\dfrac{\\infty}{\\infty}$.<br>`
        texteCorr += `Soit $n$ un entier naturel non nul. On factorise le numérateur et le dénominateur par leurs termes de plus haut degré :<br>`
        texteCorr += `$\\begin{aligned}u_n&=\\dfrac{${polynomeNumerateur}}{${polynomeDenominateur}}\\\\&=\\dfrac{${ecriturePuissanceDeN(degreNumerateur)}\\left(${facteurNumerateur}\\right)}{${ecriturePuissanceDeN(degreDenominateur)}\\left(${facteurDenominateur}\\right)}\\\\&=${puissanceHorsFraction}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}.\\end{aligned}$<br>`
        texteCorr += `D’après les limites de référence, pour tout entier $k\\geqslant 1$, $\\displaystyle \\lim_{n\\to+\\infty}\\dfrac{1}{n^k}=0$.<br>`
        texteCorr += `Par somme puis par quotient, $\\displaystyle \\lim_{n\\to+\\infty}\\dfrac{${facteurNumerateur}}{${facteurDenominateur}}=${new FractionEtendue(coefficientDominantNumerateur, coefficientDominantDenominateur).texFractionSimplifiee}$.<br>`
        texteCorr += `On en déduit que $\\displaystyle \\lim_{n\\to+\\infty}u_n=${miseEnEvidence(reponse)}$.`
      }

      let texte = `La suite $(u_n)$ est définie, pour tout entier naturel $n$, par :<br>$u_n=${expression}$.`
      if (this.interactif) {
        texte += `<br>$\\displaystyle \\lim_{n\\to+\\infty}u_n=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
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
