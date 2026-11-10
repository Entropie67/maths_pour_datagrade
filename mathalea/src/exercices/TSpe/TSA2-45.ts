import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer une limite avec l’exponentielle'
export const dateDePublication = '23/10/2026'
export const interactifReady = true

export const uuid = '11c7b'
export const refs = {
  'fr-fr': ['TSA2-45'],
  'fr-ch': [],
}

// Limites obtenues directement par les règles de somme, de produit ou de quotient
type TypeOperation =
  | 'sommeEnPlusInfini'
  | 'sommeEnMoinsInfini'
  | 'produitEnPlusInfini'
  | 'exponentielleSurPuissanceEnMoinsInfini'
  | 'puissanceSurExponentielleEnMoinsInfini'

// Formes indéterminées levées par le théorème des croissances comparées (sans changement de variable)
type TypeCroissancesComparees =
  | 'exponentielleSurPuissance'
  | 'puissanceSurExponentielle'
  | 'puissanceFoisExponentielle'
  | 'exponentielleMoinsPolynome'

type TypeQuestion = TypeOperation | TypeCroissancesComparees

const typesOperations: TypeOperation[] = [
  'sommeEnPlusInfini',
  'sommeEnMoinsInfini',
  'produitEnPlusInfini',
  'exponentielleSurPuissanceEnMoinsInfini',
  'puissanceSurExponentielleEnMoinsInfini',
]

const typesCroissancesComparees: TypeCroissancesComparees[] = [
  'exponentielleSurPuissance',
  'puissanceFoisExponentielle',
  'exponentielleMoinsPolynome',
  'puissanceSurExponentielle',
]

type Operation = 'somme' | 'produit' | 'quotient' | 'différence'

function puissance(variable: string, exposant: number): string {
  return exposant === 1 ? variable : `${variable}^{${exposant}}`
}

function coefficientFois(coefficient: number, expression: string): string {
  return `${rienSi1(coefficient)}${expression}`
}

/** « de la somme », « du produit »… */
function reglesDe(operation: Operation): string {
  return operation === 'somme' || operation === 'différence'
    ? `de la ${operation}`
    : `du ${operation}`
}

/** Limite de x^n en −∞ : +∞ si n est pair, −∞ sinon. */
function limitePuissanceEnMoinsInfini(exposant: number): string {
  return exposant % 2 === 0 ? '+\\infty' : '-\\infty'
}

/** +∞ ou −∞ selon le signe. */
function infini(signe: number): '+\\infty' | '-\\infty' {
  return signe > 0 ? '+\\infty' : '-\\infty'
}

/** Signe de la limite de c·x^n en −∞ : celui de c, changé si n est impair. */
function signeEnMoinsInfini(coefficient: number, exposant: number): number {
  return Math.sign(coefficient) * (exposant % 2 === 0 ? 1 : -1)
}

/**
 * Remarque de fin de correction pour les croissances comparées : les limites des deux
 * termes donnent une forme indéterminée, ce qui justifie le recours au théorème.
 */
function remarqueFormeIndeterminee(
  sens: '+' | '-',
  termes: [terme: string, limite: string][],
  operation: Operation,
): string {
  const limites = termes
    .map(
      ([terme, limite]) =>
        `$\\displaystyle \\lim_{x\\to${sens}\\infty}${terme}=${limite}$`,
    )
    .join(' et ')
  return `<br><br>${texteEnCouleurEtGras('Remarque : ', bleuMathalea)}<br>On a utilisé les croissances comparées car on était face à une forme indéterminée.<br>
          En effet, ${limites} : on ne peut pas conclure en utilisant les règles ${reglesDe(operation)}.`
}

/** Remarque de fin de correction, en miroir, pour les limites calculées par opérations. */
function remarqueSansFormeIndeterminee(operation: Operation): string {
  return `<br><br>${texteEnCouleurEtGras('Remarque : ', bleuMathalea)}<br>Il n’y a pas de forme indéterminée : les règles ${reglesDe(operation)} suffisent, on n’a pas besoin des croissances comparées.`
}

/**
 * Limites avec l'exponentielle : par opérations ou par croissances comparées,
 * en proportions réglables.
 * @author Arnaud Meistermann
 */
export default class LimitesExponentielleOperationsOuCroissancesComparees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Type de limites',
      'Nombres séparés par des tirets :\n1 : Par opérations\n2 : Par croissances comparées\n3 : Mélange',
    ]
    this.sup = '3'
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite de la fonction.'
        : 'Déterminer les limites des fonctions.'

    // 1 : par opérations, 2 : par croissances comparées, selon les poids choisis
    const familles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
    }).map(Number)
    // Dans chaque famille, les types se succèdent sans se répéter trop tôt
    const operations = combinaisonListes(typesOperations, this.nbQuestions)
    const croissances = combinaisonListes(
      typesCroissancesComparees,
      this.nbQuestions,
    )
    const types: TypeQuestion[] = []
    let rangOperation = 0
    let rangCroissance = 0
    for (const famille of familles) {
      types.push(
        famille === 1
          ? operations[rangOperation++]
          : croissances[rangCroissance++],
      )
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const exposant = randint(1, 5)
      const coefficient = randint(-5, 5, 0)
      const puissanceDeX = puissance('x', exposant)
      let expression: string
      let sens: '+' | '-'
      let reponse: '0' | '+\\infty' | '-\\infty'
      let correction: string

      switch (type) {
        // ---- Par opérations ----
        case 'sommeEnPlusInfini': {
          const termePolynomial = coefficientFois(
            Math.abs(coefficient),
            puissanceDeX,
          )
          expression = `\\mathrm{e}^{x}+${termePolynomial}`
          sens = '+'
          reponse = '+\\infty'
          correction = `On a $\\displaystyle \\lim_{x\\to+\\infty}\\mathrm{e}^{x}=+\\infty$ et $\\displaystyle \\lim_{x\\to+\\infty}${termePolynomial}=+\\infty$.<br>
          Par somme, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'sommeEnMoinsInfini': {
          const termePolynomial = coefficientFois(coefficient, puissanceDeX)
          expression = `${termePolynomial}+\\mathrm{e}^{x}`
          sens = '-'
          reponse = infini(signeEnMoinsInfini(coefficient, exposant))
          correction = `On a $\\displaystyle \\lim_{x\\to-\\infty}${termePolynomial}=${reponse}$ et $\\displaystyle \\lim_{x\\to-\\infty}\\mathrm{e}^{x}=0$.<br>
          Par somme, $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'produitEnPlusInfini': {
          const termePolynomial = coefficientFois(coefficient, puissanceDeX)
          expression = coefficientFois(
            coefficient,
            `${puissanceDeX}\\mathrm{e}^{x}`,
          )
          sens = '+'
          reponse = infini(coefficient)
          correction = `On a $\\displaystyle \\lim_{x\\to+\\infty}${termePolynomial}=${reponse}$ et $\\displaystyle \\lim_{x\\to+\\infty}\\mathrm{e}^{x}=+\\infty$.<br>
          Par produit, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueSansFormeIndeterminee('produit')}`
          break
        }
        case 'exponentielleSurPuissanceEnMoinsInfini': {
          const numerateur = coefficientFois(coefficient, '\\mathrm{e}^{x}')
          expression = `\\dfrac{${numerateur}}{${puissanceDeX}}`
          sens = '-'
          reponse = '0'
          correction = `On a $\\displaystyle \\lim_{x\\to-\\infty}${numerateur}=0$ et $\\displaystyle \\lim_{x\\to-\\infty}${puissanceDeX}=${limitePuissanceEnMoinsInfini(exposant)}$.<br>
          Par quotient, $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueSansFormeIndeterminee('quotient')}`
          break
        }
        case 'puissanceSurExponentielleEnMoinsInfini': {
          const numerateur = coefficientFois(coefficient, puissanceDeX)
          expression = `\\dfrac{${numerateur}}{\\mathrm{e}^{x}}`
          sens = '-'
          reponse = infini(signeEnMoinsInfini(coefficient, exposant))
          correction = `On a $\\displaystyle \\lim_{x\\to-\\infty}${numerateur}=${reponse}$ et $\\displaystyle \\lim_{x\\to-\\infty}\\mathrm{e}^{x}=0$ avec $\\mathrm{e}^{x}>0$.<br>
          Par quotient, $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueSansFormeIndeterminee('quotient')}`
          break
        }
        // ---- Par croissances comparées ----
        case 'puissanceSurExponentielle': {
          expression = `\\dfrac{${coefficientFois(coefficient, puissanceDeX)}}{\\mathrm{e}^{x}}`
          sens = '+'
          reponse = '0'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n$,<br>
          $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{x^n}{\\mathrm{e}^{x}}=0$.<br>
          On a donc $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{${puissanceDeX}}{\\mathrm{e}^{x}}=0$, puis<br>
          $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueFormeIndeterminee(
            '+',
            [
              [puissanceDeX, '+\\infty'],
              ['\\mathrm{e}^{x}', '+\\infty'],
            ],
            'quotient',
          )}`
          break
        }
        case 'exponentielleSurPuissance': {
          expression = `\\dfrac{${coefficientFois(coefficient, '\\mathrm{e}^{x}')}}{${puissanceDeX}}`
          sens = '+'
          reponse = infini(coefficient)
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n$,<br>
          $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}}{x^n}=+\\infty$.<br>
          On a donc $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}}{${puissanceDeX}}=+\\infty$.<br>
          Comme $${coefficient}${coefficient > 0 ? '>0' : '<0'}$, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueFormeIndeterminee(
            '+',
            [
              ['\\mathrm{e}^{x}', '+\\infty'],
              [puissanceDeX, '+\\infty'],
            ],
            'quotient',
          )}`
          break
        }
        case 'puissanceFoisExponentielle': {
          expression = coefficientFois(
            coefficient,
            `${puissanceDeX}\\mathrm{e}^{x}`,
          )
          sens = '-'
          reponse = '0'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n$,<br>
          $\\displaystyle \\lim_{x\\to-\\infty}x^n\\mathrm{e}^{x}=0$.<br>
          On a donc $\\displaystyle \\lim_{x\\to-\\infty}${puissanceDeX}\\mathrm{e}^{x}=0$, puis<br>
          $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueFormeIndeterminee(
            '-',
            [
              [puissanceDeX, limitePuissanceEnMoinsInfini(exposant)],
              ['\\mathrm{e}^{x}', '0'],
            ],
            'produit',
          )}`
          break
        }
        case 'exponentielleMoinsPolynome':
        default: {
          const coefficientPolynome = randint(1, 6)
          const termePolynomial = coefficientFois(
            coefficientPolynome,
            puissanceDeX,
          )
          expression = `\\mathrm{e}^{x}-${termePolynomial}`
          sens = '+'
          reponse = '+\\infty'
          correction = `Pour tout $x\\neq 0$, on factorise par $${puissanceDeX}$ :<br>
          $\\begin{aligned}
          f(x)&=\\mathrm{e}^{x}-${termePolynomial}\\\\
          &=${puissanceDeX}\\left(\\dfrac{\\mathrm{e}^{x}}{${puissanceDeX}}-${coefficientPolynome}\\right).
          \\end{aligned}$<br>
          D’après le théorème des croissances comparées, $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}}{${puissanceDeX}}=+\\infty$.<br>
          Ainsi, $\\displaystyle \\lim_{x\\to+\\infty}\\left(\\dfrac{\\mathrm{e}^{x}}{${puissanceDeX}}-${coefficientPolynome}\\right)=+\\infty$.<br>
          De plus, $\\displaystyle \\lim_{x\\to+\\infty}${puissanceDeX}=+\\infty$.<br>
          Par produit, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.${remarqueFormeIndeterminee(
            '+',
            [
              ['\\mathrm{e}^{x}', '+\\infty'],
              [puissanceDeX, '+\\infty'],
            ],
            'différence',
          )}`
          break
        }
      }

      const indice = `x\\to${sens}\\infty`
      // Une puissance de x au dénominateur exclut 0 du domaine
      const domaine = type.startsWith('exponentielleSurPuissance')
        ? '\\mathbb R^*'
        : '\\mathbb R'
      let texte = `Soit $f$ la fonction définie sur $${domaine}$ par $f(x)=${expression}$.<br>`
      if (this.interactif) {
        texte += `$\\displaystyle \\lim_{${indice}}f(x)=$${ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimites)}`
      } else {
        texte += `Calculer $\\displaystyle \\lim_{${indice}}f(x)$.`
      }

      if (this.questionJamaisPosee(i, type, expression)) {
        handleAnswers(this, i, { reponse: { value: reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
