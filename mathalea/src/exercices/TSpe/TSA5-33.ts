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

export const titre = 'Calculer une limite avec le logarithme népérien'
export const dateDePublication = '26/10/2026'
export const interactifReady = true

export const uuid = '2b955'
export const refs = {
  'fr-fr': ['TSA5-33', 'TCA4-33'],
  'fr-ch': [],
}

// Limites obtenues directement par les règles de somme, de produit ou de quotient
type TypeOperation =
  | 'sommeEnPlusInfini'
  | 'sommeEnZero'
  | 'produitEnPlusInfini'
  | 'logarithmeSurPuissanceEnZero'
  | 'puissanceSurLogarithmeEnZero'
  | 'exponentiellePlusLogarithmeEnPlusInfini'
  | 'exponentiellePlusLogarithmeEnZero'
  | 'exponentielleFoisLogarithmeEnPlusInfini'
  | 'logarithmeSurExponentielleEnZero'

// Formes indéterminées levées par le théorème des croissances comparées
type TypeCroissancesComparees =
  | 'logarithmeSurPuissance'
  | 'puissanceFoisLogarithme'
  | 'puissanceSurLogarithme'
  | 'logarithmeMoinsPuissance'
  | 'logarithmeMoinsExponentielle'
  | 'exponentielleSurLogarithme'

type TypeQuestion = TypeOperation | TypeCroissancesComparees

const typesOperations: TypeOperation[] = [
  'sommeEnPlusInfini',
  'sommeEnZero',
  'produitEnPlusInfini',
  'logarithmeSurPuissanceEnZero',
  'puissanceSurLogarithmeEnZero',
]

const typesCroissancesComparees: TypeCroissancesComparees[] = [
  'logarithmeSurPuissance',
  'puissanceFoisLogarithme',
  'puissanceSurLogarithme',
  'logarithmeMoinsPuissance',
]

// Types ajoutés lorsque l'exponentielle est demandée
const typesOperationsExponentielle: TypeOperation[] = [
  'exponentiellePlusLogarithmeEnPlusInfini',
  'exponentiellePlusLogarithmeEnZero',
  'exponentielleFoisLogarithmeEnPlusInfini',
  'logarithmeSurExponentielleEnZero',
]

const typesCroissancescompareesExponentielle: TypeCroissancesComparees[] = [
  'logarithmeMoinsExponentielle',
  'exponentielleSurLogarithme',
]

type Operation = 'somme' | 'produit' | 'quotient' | 'différence'

const enPlusInfini = 'x\\to+\\infty'
const enZero = 'x\\to 0^+'
const ln = '\\ln(x)'
const exp = '\\mathrm{e}^{x}'

function puissance(variable: string, exposant: number): string {
  return exposant === 1 ? variable : `${variable}^{${exposant}}`
}

function coefficientFois(coefficient: number, expression: string): string {
  return `${rienSi1(coefficient)}${expression}`
}

/** Limite écrite en LaTeX, avec des parenthèses si l'expression commence par un signe moins. */
function limite(indice: string, expression: string, valeur: string): string {
  const terme = expression.startsWith('-')
    ? `\\left(${expression}\\right)`
    : expression
  return `$\\displaystyle \\lim_{${indice}}${terme}=${valeur}$`
}

/** « de la somme », « du produit »… */
function reglesDe(operation: Operation): string {
  return operation === 'somme' || operation === 'différence'
    ? `de la ${operation}`
    : `du ${operation}`
}

/** +∞ ou −∞ selon le signe. */
function infini(signe: number): '+\\infty' | '-\\infty' {
  return signe > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Remarque de fin de correction pour les croissances comparées : les limites des deux
 * termes donnent une forme indéterminée, ce qui justifie le recours au théorème.
 */
function remarqueFormeIndeterminee(
  indice: string,
  termes: [terme: string, limite: string][],
  operation: Operation,
): string {
  const limites = termes
    .map(([terme, valeur]) => limite(indice, terme, valeur))
    .join(' et ')
  return `<br><br>${texteEnCouleurEtGras('Remarque : ', bleuMathalea)}<br>On a utilisé les croissances comparées car on était face à une forme indéterminée.<br>
          En effet, ${limites} : on ne peut pas conclure en utilisant les règles ${reglesDe(operation)}.`
}

/** Remarque de fin de correction, en miroir, pour les limites calculées par opérations. */
function remarqueSansFormeIndeterminee(operation: Operation): string {
  return `<br><br>${texteEnCouleurEtGras('Remarque : ', bleuMathalea)}<br>Il n’y a pas de forme indéterminée : les règles ${reglesDe(operation)} suffisent, on n’a pas besoin des croissances comparées.`
}

/**
 * Limites avec le logarithme népérien : par opérations ou par croissances comparées,
 * en proportions réglables, avec l'exponentielle en option.
 * @author Arnaud Meistermann
 */
export default class LimitesLogarithmeOperationsOuCroissancesComparees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.besoinFormulaireTexte = [
      'Type de limites',
      'Nombres séparés par des tirets :\n1 : Par opérations\n2 : Par croissances comparées\n3 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Autoriser la fonction exponentielle',
      false,
    ]
    this.sup = '3'
    this.sup2 = false
  }

  nouvelleVersion(): void {
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
    const operations = combinaisonListes(
      this.sup2
        ? [...typesOperations, ...typesOperationsExponentielle]
        : typesOperations,
      this.nbQuestions,
    )
    const croissances = combinaisonListes(
      this.sup2
        ? [
            ...typesCroissancesComparees,
            ...typesCroissancescompareesExponentielle,
          ]
        : typesCroissancesComparees,
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
      const exposant = randint(1, 4)
      const coefficient = randint(-5, 5, 0)
      const puissanceDeX = puissance('x', exposant)
      let expression: string
      let indice: string
      let domaine = '\\left]0\\,;+\\infty\\right['
      let reponse: '0' | '+\\infty' | '-\\infty'
      let correction: string

      switch (type) {
        // ---- Par opérations ----
        case 'sommeEnPlusInfini': {
          const termePolynomial = coefficientFois(
            Math.abs(coefficient),
            puissanceDeX,
          )
          expression = `${ln}+${termePolynomial}`
          indice = enPlusInfini
          reponse = '+\\infty'
          correction = `On a ${limite(indice, ln, '+\\infty')} et ${limite(indice, termePolynomial, '+\\infty')}.<br>
          Par somme, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'sommeEnZero': {
          const termePolynomial = coefficientFois(coefficient, puissanceDeX)
          expression = `${ln}${coefficient > 0 ? '+' : ''}${termePolynomial}`
          indice = enZero
          reponse = '-\\infty'
          correction = `On a ${limite(indice, ln, '-\\infty')} et ${limite(indice, termePolynomial, '0')}.<br>
          Par somme, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'produitEnPlusInfini': {
          const termePolynomial = coefficientFois(coefficient, puissanceDeX)
          expression = coefficientFois(coefficient, `${puissanceDeX}${ln}`)
          indice = enPlusInfini
          reponse = infini(coefficient)
          correction = `On a ${limite(indice, termePolynomial, reponse)} et ${limite(indice, ln, '+\\infty')}.<br>
          Par produit, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('produit')}`
          break
        }
        case 'logarithmeSurPuissanceEnZero': {
          const numerateur = coefficientFois(coefficient, ln)
          expression = `\\dfrac{${numerateur}}{${puissanceDeX}}`
          indice = enZero
          reponse = infini(-coefficient)
          correction = `On a ${limite(indice, numerateur, reponse)} et ${limite(indice, puissanceDeX, '0^+')}.<br>
          Par quotient, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('quotient')}`
          break
        }
        case 'puissanceSurLogarithmeEnZero': {
          const numerateur = coefficientFois(coefficient, puissanceDeX)
          expression = `\\dfrac{${numerateur}}{${ln}}`
          indice = enZero
          // ln s'annule en 1 : on se place sur ]0 ; 1[
          domaine = '\\left]0\\,;1\\right['
          reponse = '0'
          correction = `On a ${limite(indice, numerateur, '0')} et ${limite(indice, ln, '-\\infty')}.<br>
          Par quotient, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('quotient')}`
          break
        }
        case 'exponentiellePlusLogarithmeEnPlusInfini': {
          const termeExponentiel = coefficientFois(Math.abs(coefficient), exp)
          expression = `${termeExponentiel}+${ln}`
          indice = enPlusInfini
          reponse = '+\\infty'
          correction = `On a ${limite(indice, termeExponentiel, '+\\infty')} et ${limite(indice, ln, '+\\infty')}.<br>
          Par somme, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'exponentiellePlusLogarithmeEnZero': {
          const termeExponentiel = coefficientFois(coefficient, exp)
          expression = `${ln}${coefficient > 0 ? '+' : ''}${termeExponentiel}`
          indice = enZero
          reponse = '-\\infty'
          // e^x tend vers e^0 = 1 en 0
          correction = `On a ${limite(indice, ln, '-\\infty')} et ${limite(indice, termeExponentiel, String(coefficient))}.<br>
          Par somme, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('somme')}`
          break
        }
        case 'exponentielleFoisLogarithmeEnPlusInfini': {
          const termeExponentiel = coefficientFois(coefficient, exp)
          expression = coefficientFois(coefficient, `${exp}${ln}`)
          indice = enPlusInfini
          reponse = infini(coefficient)
          correction = `On a ${limite(indice, termeExponentiel, reponse)} et ${limite(indice, ln, '+\\infty')}.<br>
          Par produit, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('produit')}`
          break
        }
        case 'logarithmeSurExponentielleEnZero': {
          const numerateur = coefficientFois(coefficient, ln)
          expression = `\\dfrac{${numerateur}}{${exp}}`
          indice = enZero
          reponse = infini(-coefficient)
          correction = `On a ${limite(indice, numerateur, reponse)} et ${limite(indice, exp, '1')}.<br>
          Par quotient, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueSansFormeIndeterminee('quotient')}`
          break
        }
        // ---- Par croissances comparées ----
        case 'logarithmeSurPuissance': {
          const quotient = `\\dfrac{${ln}}{${puissanceDeX}}`
          expression = `\\dfrac{${coefficientFois(coefficient, ln)}}{${puissanceDeX}}`
          indice = enPlusInfini
          reponse = '0'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n\\geqslant 1$,<br>
          ${limite(indice, '\\dfrac{\\ln(x)}{x^n}', '0')}.<br>
          On a donc ${limite(indice, quotient, '0')}, puis<br>
          ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [ln, '+\\infty'],
              [puissanceDeX, '+\\infty'],
            ],
            'quotient',
          )}`
          break
        }
        case 'puissanceFoisLogarithme': {
          const produit = `${puissanceDeX}${ln}`
          expression = coefficientFois(coefficient, produit)
          indice = enZero
          reponse = '0'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n\\geqslant 1$,<br>
          ${limite(indice, 'x^n\\ln(x)', '0')}.<br>
          On a donc ${limite(indice, produit, '0')}, puis<br>
          ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [puissanceDeX, '0'],
              [ln, '-\\infty'],
            ],
            'produit',
          )}`
          break
        }
        case 'puissanceSurLogarithme': {
          const quotient = `\\dfrac{${ln}}{${puissanceDeX}}`
          expression = `\\dfrac{${coefficientFois(coefficient, puissanceDeX)}}{${ln}}`
          indice = enPlusInfini
          // ln s'annule en 1 : on se place sur ]1 ; +∞[
          domaine = '\\left]1\\,;+\\infty\\right['
          reponse = infini(coefficient)
          correction = `Pour tout $x>1$, $\\dfrac{${puissanceDeX}}{${ln}}=\\dfrac{1}{${quotient}}$.<br>
          D’après le théorème des croissances comparées, ${limite(indice, quotient, '0')}, avec $${quotient}>0$ pour $x>1$.<br>
          Par quotient, ${limite(indice, `\\dfrac{${puissanceDeX}}{${ln}}`, '+\\infty')}.<br>
          Comme $${coefficient}${coefficient > 0 ? '>0' : '<0'}$, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [puissanceDeX, '+\\infty'],
              [ln, '+\\infty'],
            ],
            'quotient',
          )}`
          break
        }
        case 'logarithmeMoinsExponentielle': {
          const coefficientExponentielle = randint(1, 6)
          const termeExponentiel = coefficientFois(
            coefficientExponentielle,
            exp,
          )
          const quotient = `\\dfrac{${ln}}{${exp}}`
          expression = `${ln}-${termeExponentiel}`
          indice = enPlusInfini
          reponse = '-\\infty'
          correction = `Pour tout $x>0$, on factorise par $${exp}$ :<br>
          $\\begin{aligned}
          f(x)&=${ln}-${termeExponentiel}\\\\
          &=${exp}\\left(${quotient}-${coefficientExponentielle}\\right)
          \\end{aligned}$<br>
          Pour tout $x>0$, $${quotient}=\\dfrac{${ln}}{x}\\times\\dfrac{x}{${exp}}$.<br>
          D’après le théorème des croissances comparées, ${limite(indice, `\\dfrac{${ln}}{x}`, '0')} et ${limite(indice, `\\dfrac{x}{${exp}}`, '0')}.<br>
          Par produit, ${limite(indice, quotient, '0')}.<br>
          Ainsi, ${limite(indice, `\\left(${quotient}-${coefficientExponentielle}\\right)`, `-${coefficientExponentielle}`)}.<br>
          De plus, ${limite(indice, exp, '+\\infty')}.<br>
          Par produit, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [ln, '+\\infty'],
              [termeExponentiel, '+\\infty'],
            ],
            'différence',
          )}`
          break
        }
        case 'exponentielleSurLogarithme': {
          const quotient = `\\dfrac{${exp}}{${ln}}`
          expression = `\\dfrac{${coefficientFois(coefficient, exp)}}{${ln}}`
          indice = enPlusInfini
          // ln s'annule en 1 : on se place sur ]1 ; +∞[
          domaine = '\\left]1\\,;+\\infty\\right['
          reponse = infini(coefficient)
          correction = `Pour tout $x>1$, $${quotient}=\\dfrac{${exp}}{x}\\times\\dfrac{x}{${ln}}$.<br>
          D’après le théorème des croissances comparées, ${limite(indice, `\\dfrac{${exp}}{x}`, '+\\infty')} et ${limite(indice, `\\dfrac{${ln}}{x}`, '0')}, avec $\\dfrac{${ln}}{x}>0$ pour $x>1$.<br>
          Par quotient, ${limite(indice, `\\dfrac{x}{${ln}}`, '+\\infty')}, puis, par produit, ${limite(indice, quotient, '+\\infty')}.<br>
          Comme $${coefficient}${coefficient > 0 ? '>0' : '<0'}$, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [exp, '+\\infty'],
              [ln, '+\\infty'],
            ],
            'quotient',
          )}`
          break
        }
        case 'logarithmeMoinsPuissance':
        default: {
          const coefficientPolynome = randint(1, 6)
          const termePolynomial = coefficientFois(
            coefficientPolynome,
            puissanceDeX,
          )
          const quotient = `\\dfrac{${ln}}{${puissanceDeX}}`
          expression = `${ln}-${termePolynomial}`
          indice = enPlusInfini
          reponse = '-\\infty'
          correction = `Pour tout $x>0$, on factorise par $${puissanceDeX}$ :<br>
          $\\begin{aligned}
          f(x)&=${ln}-${termePolynomial}\\\\
          &=${puissanceDeX}\\left(${quotient}-${coefficientPolynome}\\right)
          \\end{aligned}$<br>
          D’après le théorème des croissances comparées, ${limite(indice, quotient, '0')}.<br>
          Ainsi, ${limite(indice, `\\left(${quotient}-${coefficientPolynome}\\right)`, `-${coefficientPolynome}`)}.<br>
          De plus, ${limite(indice, puissanceDeX, '+\\infty')}.<br>
          Par produit, ${limite(indice, 'f(x)', miseEnEvidence(reponse))}.${remarqueFormeIndeterminee(
            indice,
            [
              [ln, '+\\infty'],
              [termePolynomial, '+\\infty'],
            ],
            'différence',
          )}`
          break
        }
      }

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
