import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une limite par composition'
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const dateDeModifImportante = '04/11/2026'

export const uuid = 'dbe69'
export const refs = {
  'fr-fr': ['TSA2-35', 'TCA2-35'],
  'fr-ch': [],
}

type SensLimite = '+' | '-'
type TypeQuestion =
  | 'racinePolynome'
  | 'racineExponentielle'
  | 'exponentiellePolynome'
  | 'puissance'
  | 'logarithme'

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

function correctionLimitePolynome(
  coefficient: number,
  degre: number,
  constante: number,
  indice: string,
  limite: string,
): string {
  const puissanceDeX = degre === 1 ? 'x' : `x^{${degre}}`
  const limitePuissance = infini(
    signeLimiteMonome(1, degre, indice.includes('to+') ? '+' : '-'),
  )
  const limiteMonome = infini(
    signeLimiteMonome(coefficient, degre, indice.includes('to+') ? '+' : '-'),
  )
  return `On sait que $\\displaystyle \\lim_{${indice}}${puissanceDeX}=${limitePuissance}$.<br>
  Comme $${coefficient}${coefficient > 0 ? '>0' : '<0'}$, $\\displaystyle \\lim_{${indice}}${ecriturePolynome(coefficient, degre, 0)}=${limiteMonome}$.<br>
  De plus, $\\displaystyle \\lim_{${indice}}${constante}=${constante}$.<br>
  Par somme, $\\displaystyle \\lim_{${indice}}u(x)=${limite}$.`
}

function signeLimiteMonome(
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

function limitePuissanceDeX(
  limiteInterieure: '+\\infty' | '-\\infty',
  exposant: number,
): '+\\infty' | '-\\infty' {
  if (limiteInterieure === '+\\infty' || exposant % 2 === 0) {
    return '+\\infty'
  }
  return '-\\infty'
}

/**
 * Limites obtenues par composition de fonctions usuelles.
 * @author Stéphane Guyon
 */
export default class LimitesParComposition extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '1-2-3'
    this.besoinFormulaireTexte = [
      'Type de fonctions',
      [
        'Nombres séparés par des tirets  :',
        '1 : Racine carrée',
        '2 : Exponentielle',
        '3 : Puissance',
        '4 : Logarithme népérien',
      ].join('\n'),
    ]
  }

  nouvelleVersion(): void {
    const familles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 4,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    })
    const types = familles.map((famille): TypeQuestion => {
      switch (famille) {
        case 1:
          return choice(['racinePolynome', 'racineExponentielle'])
        case 2:
          return 'exponentiellePolynome'
        case 3:
          return 'puissance'
        default:
          return 'logarithme'
      }
    })
    const sensDesLimites = combinaisonListes<SensLimite>(
      ['+', '-'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const sens = sensDesLimites[i]
      const indice = `x\\to${sens}\\infty`
      const domaine = '\\mathbb R'
      let expression: string
      let reponse: string
      let correction: string

      if (type === 'racinePolynome') {
        const coefficient = randint(1, 5)
        const degre = choice([2, 4])
        const constante = randint(1, 8)
        const u = ecriturePolynome(coefficient, degre, constante)
        expression = `\\sqrt{${u}}`
        reponse = '+\\infty'
        correction = `On pose $u$ la fonction définie sur $${domaine}$ par $u(x)=${u}$.<br>
        Ainsi, pour tout $x\\in D_f$, $f(x)=\\sqrt{u(x)}$.<br>
        ${correctionLimitePolynome(coefficient, degre, constante, indice, '+\\infty')}<br>
        Or $\\displaystyle \\lim_{X\\to+\\infty}\\sqrt X=+\\infty$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else if (type === 'racineExponentielle') {
        // e^(kx) tend vers 0 quand kx tend vers -infini
        const k = randint(1, 3) * (sens === '+' ? -1 : 1)
        const racineConstante = randint(1, 4)
        const constante = racineConstante * racineConstante
        const exposant = `${rienSi1(k)}x`
        const u = `\\mathrm{e}^{${exposant}}+${constante}`
        const limiteExposant = infini(-1)
        expression = `\\sqrt{${u}}`
        reponse = `${racineConstante}`
        correction = `On pose $u$ la fonction définie sur $${domaine}$ par $u(x)=${u}$.<br>
        Ainsi, pour tout $x\\in D_f$, $f(x)=\\sqrt{u(x)}$.<br>
        On a $\\displaystyle \\lim_{${indice}}${exposant}=${limiteExposant}$ et $\\displaystyle \\lim_{X\\to-\\infty}\\mathrm{e}^{X}=0$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}\\mathrm{e}^{${exposant}}=0$.<br>
        Par somme, $\\displaystyle \\lim_{${indice}}u(x)=${constante}$.<br>
        Or $\\displaystyle \\lim_{X\\to${constante}}\\sqrt X=${racineConstante}$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else if (type === 'exponentiellePolynome') {
        const coefficient = randint(-5, 5, 0)
        const degre = randint(1, 3)
        const constante = randint(-6, 6)
        const u = ecriturePolynome(coefficient, degre, constante)
        const limiteU = infini(signeLimiteMonome(coefficient, degre, sens))
        reponse = limiteU === '+\\infty' ? '+\\infty' : '0'
        expression = `\\mathrm{e}^{${u}}`
        correction = `On pose $u$ la fonction définie sur $${domaine}$ par $u(x)=${u}$.<br>
        Ainsi, pour tout $x\\in D_f$, $f(x)=\\mathrm{e}^{u(x)}$.<br>
        ${correctionLimitePolynome(coefficient, degre, constante, indice, limiteU)}<br>
        Or $\\displaystyle \\lim_{X\\to${limiteU}}\\mathrm{e}^{X}=${reponse}$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else if (type === 'logarithme') {
        const coefficient = randint(1, 5)
        const degre = choice([2, 4])
        const constante = randint(1, 8)
        const u = ecriturePolynome(coefficient, degre, constante)
        expression = `\\ln\\left(${u}\\right)`
        reponse = '+\\infty'
        correction = `On pose $u$ la fonction définie sur $${domaine}$ par $u(x)=${u}$.<br>
        Ainsi, pour tout $x\\in D_f$, $f(x)=\\ln(u(x))$.<br>
        ${correctionLimitePolynome(coefficient, degre, constante, indice, '+\\infty')}<br>
        Or $\\displaystyle \\lim_{X\\to+\\infty}\\ln(X)=+\\infty$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
      } else {
        const uCoefficient = randint(-4, 4, 0)
        const uDegre = randint(1, 3)
        const uConstante = randint(-5, 5)
        const u = ecriturePolynome(uCoefficient, uDegre, uConstante)
        const limiteU = infini(signeLimiteMonome(uCoefficient, uDegre, sens))
        const exposant = choice([3, 4, 5])
        expression = `\\left(${u}\\right)^{${exposant}}`
        reponse = limitePuissanceDeX(limiteU, exposant)
        correction = `On pose $u$ la fonction définie sur $${domaine}$ par $u(x)=${u}$.<br>
        Ainsi, pour tout $x\\in D_f$, $f(x)=u(x)^{${exposant}}$.<br>
        ${correctionLimitePolynome(uCoefficient, uDegre, uConstante, indice, limiteU)}<br>
        Or $\\displaystyle \\lim_{X\\to${limiteU}}X^{${exposant}}=${reponse}$.<br>
        Par composition, $\\displaystyle \\lim_{${indice}}f(x)=${miseEnEvidence(reponse)}$.`
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
