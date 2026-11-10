import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { bleuMathalea } from '../../lib/colors'
import { miseEnCouleur, miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une limite avec un théorème de comparaison'
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const uuid = '8399f'
export const refs = {
  'fr-fr': ['TSA2-43', 'TCA2-43'],
  'fr-ch': [],
}

type TypeQuestion =
  'comparaison' | 'gendarmesQuotient' | 'gendarmesExponentielle'
type SensLimite = '+' | '-'

function ecriturePolynome(
  coefficient: number,
  degre: number,
  constante: number,
): string {
  const coefficients = Array.from({ length: degre + 1 }, () => 0)
  coefficients[0] = constante
  coefficients[degre] = coefficient
  return new Polynome({ coeffs: coefficients, letter: 'x' }).toString()
}

function ecritureTermeTrigonometrie(
  coefficient: number,
  fonction: '\\cos' | '\\sin',
): string {
  const valeurAbsolue = Math.abs(coefficient)
  const coefficientTex = valeurAbsolue === 1 ? '' : `${valeurAbsolue}`
  return `${coefficient > 0 ? '+' : '-'}${coefficientTex}${fonction}(x)`
}

function ecritureProduitTrigonometrie(
  coefficient: number,
  fonction: '\\cos' | '\\sin',
): string {
  return `${rienSi1(coefficient)}${fonction}(x)`
}

/**
 * Lignes de l'encadrement de `coefficient × fonction(x)` à partir de
 * -1 ≤ fonction(x) ≤ 1. Si le coefficient est négatif, le changement de sens
 * des inégalités puis la réécriture dans l'ordre croissant sont deux étapes.
 */
function encadrementTrigonometrie(
  coefficient: number,
  fonction: '\\cos' | '\\sin',
): string {
  const valeurAbsolue = Math.abs(coefficient)
  const produit = ecritureProduitTrigonometrie(coefficient, fonction)
  const ligneCroissante = `&-${valeurAbsolue}\\leqslant ${produit}\\leqslant ${valeurAbsolue}`
  if (coefficient > 0) return `${ligneCroissante}\\\\`
  return `&${valeurAbsolue}\\geqslant ${produit}\\geqslant -${valeurAbsolue} &&${miseEnCouleur(`\\text{Car } ${coefficient}<0\\text{ : le sens change.}`, bleuMathalea)}\\\\
          ${ligneCroissante} &&${miseEnCouleur('\\text{On réécrit dans l’ordre croissant.}', bleuMathalea)}\\\\`
}

function signeLimitePolynome(
  coefficient: number,
  degre: number,
  sens: SensLimite,
): number {
  const signePuissance = sens === '+' || degre % 2 === 0 ? 1 : -1
  return coefficient * signePuissance > 0 ? 1 : -1
}

function infini(signe: number): '+\\infty' | '-\\infty' {
  return signe > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Limites avec le théorème de comparaison ou le théorème des gendarmes.
 * @author Stéphane Guyon
 */
export default class LimitesParComparaison extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Théorème utilisé',
      3,
      '1 : Théorème de comparaison\n2 : Théorème des gendarmes\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const types = combinaisonListes<TypeQuestion>(
      this.sup === 1
        ? ['comparaison']
        : this.sup === 2
          ? ['gendarmesQuotient', 'gendarmesExponentielle']
          : [
              'comparaison',
              choice([
                'gendarmesQuotient',
                'gendarmesExponentielle',
              ] as TypeQuestion[]),
            ],
      this.nbQuestions,
    )
    const sensDesLimites = combinaisonListes<SensLimite>(
      ['+', '-'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const sens = sensDesLimites[i]
      const indice = `x\\to${sens}\\infty`
      const fonctionTrigo = choice(['\\cos', '\\sin'] as Array<
        '\\cos' | '\\sin'
      >)
      const coefficientTrigo = randint(-6, 6, 0)
      const valeurAbsolueCoefficientTrigo = Math.abs(coefficientTrigo)
      const termeTrigonometrie = ecritureProduitTrigonometrie(
        coefficientTrigo,
        fonctionTrigo,
      )
      let domaine: string
      let expression: string
      let reponse: string
      let correction: string

      if (type === 'comparaison') {
        const degre = choice([1, 2])
        const coefficient = randint(-5, 5, 0)
        const constante = randint(-6, 6)
        const polynome = ecriturePolynome(coefficient, degre, constante)
        expression = `${polynome}${ecritureTermeTrigonometrie(coefficientTrigo, fonctionTrigo)}`
        domaine = '\\mathbb R'
        const signeLimite = signeLimitePolynome(coefficient, degre, sens)
        reponse = infini(signeLimite)
        const borneInferieure = ecriturePolynome(
          coefficient,
          degre,
          constante - valeurAbsolueCoefficientTrigo,
        )
        const borneSuperieure = ecriturePolynome(
          coefficient,
          degre,
          constante + valeurAbsolueCoefficientTrigo,
        )
        const borneUtile = signeLimite > 0 ? borneInferieure : borneSuperieure
        const comparaisonUtile =
          signeLimite > 0
            ? `f(x)\\geqslant ${borneInferieure}`
            : `f(x)\\leqslant ${borneSuperieure}`

        correction = `Soit $x\\in\\mathbb R$. On a :<br>
        $\\begin{aligned}
          &-1\\leqslant ${fonctionTrigo}(x)\\leqslant 1\\\\
          ${encadrementTrigonometrie(coefficientTrigo, fonctionTrigo)}
          &${borneInferieure}\\leqslant ${expression}\\leqslant ${borneSuperieure}.
        \\end{aligned}$<br>
        On a donc $${comparaisonUtile}$.<br>
        Comme $\\displaystyle \\lim_{${indice}}(${borneUtile})=${reponse}$, alors, d’après le théorème de comparaison, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else if (type === 'gendarmesQuotient') {
        const coefficient = randint(1, 5)
        const constante = randint(1, 8)
        domaine = '\\mathbb R'
        const polynome = ecriturePolynome(coefficient, 2, constante)
        const numerateur = termeTrigonometrie
        expression = `\\dfrac{${numerateur}}{${polynome}}`
        reponse = '0'

        correction = `Soit $x\\in\\mathbb R$. On a :<br>
        $\\begin{aligned}
          &-1\\leqslant ${fonctionTrigo}(x)\\leqslant 1\\\\
          ${encadrementTrigonometrie(coefficientTrigo, fonctionTrigo)}
          &-\\dfrac{${valeurAbsolueCoefficientTrigo}}{${polynome}}\\leqslant \\dfrac{${termeTrigonometrie}}{${polynome}}\\leqslant\\dfrac{${valeurAbsolueCoefficientTrigo}}{${polynome}}.
        \\end{aligned}$<br>
        La dernière inégalité est obtenue car $${polynome}>0$ : on peut diviser chaque membre par $${polynome}$ sans changer le sens des inégalités.<br>
        On a $\\displaystyle \\lim_{${indice}}\\left(-\\dfrac{${valeurAbsolueCoefficientTrigo}}{${polynome}}\\right)=0$ et $\\displaystyle \\lim_{${indice}}\\dfrac{${valeurAbsolueCoefficientTrigo}}{${polynome}}=0$.<br>
        D’après le théorème des gendarmes, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence('0')}$.`
      } else {
        const valeurAbsolueExposant = randint(1, 4)
        const coefficientExposant =
          sens === '+' ? -valeurAbsolueExposant : valeurAbsolueExposant
        const exposant = ecriturePolynome(coefficientExposant, 1, 0)
        const coefficientBorne =
          valeurAbsolueCoefficientTrigo === 1
            ? ''
            : `${valeurAbsolueCoefficientTrigo}`
        expression = `${termeTrigonometrie}\\times\\mathrm{e}^{${exposant}}`
        domaine = '\\mathbb R'
        reponse = '0'

        correction = `Soit $x\\in\\mathbb R$. On a :<br>
        $\\begin{aligned}
          &-1\\leqslant ${fonctionTrigo}(x)\\leqslant 1\\\\
          ${encadrementTrigonometrie(coefficientTrigo, fonctionTrigo)}
          &-${coefficientBorne}\\mathrm{e}^{${exposant}}\\leqslant ${expression}\\leqslant ${coefficientBorne}\\mathrm{e}^{${exposant}} &&\\text{car } \\mathrm{e}^{${exposant}}>0.
        \\end{aligned}$<br>
        On a $\\displaystyle \\lim_{${indice}}(${exposant})=-\\infty$ et $\\displaystyle \\lim_{X\\to-\\infty}\\mathrm{e}^{X}=0$.<br>
        Par composition :<br>
        $\\displaystyle \\lim_{${indice}}\\left(-${coefficientBorne}\\mathrm{e}^{${exposant}}\\right)=0$ et $\\displaystyle \\lim_{${indice}}${coefficientBorne}\\mathrm{e}^{${exposant}}=0$.<br>
        D’après le théorème des gendarmes, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence('0')}$.`
      }

      let texte = `Soit $f$ la fonction définie sur $D_f=${domaine}$ par $f(x)=${expression}$.<br>`
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
