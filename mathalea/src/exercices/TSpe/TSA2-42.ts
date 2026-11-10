import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { bleuMathalea } from '../../lib/colors'
import { rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  'Calculer une limite avec le théorème des croissances comparées'
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const dateDeModifImportante = '10/10/2026'

export const uuid = 'a7c42'
export const refs = {
  'fr-fr': ['TSA2-42'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'exponentielleSurPuissance'
  | 'puissanceSurExponentielle'
  | 'puissanceFoisExponentielle'
  | 'exponentielleMoinsPolynome'
  | 'exponentielleComposeeSurPuissance'
  | 'puissanceFoisExponentielleComposee'
  | 'exponentielleComposeeMoinsPolynome'

const typesSansChangementDeVariable: TypeQuestion[] = [
  'exponentielleSurPuissance',
  'puissanceFoisExponentielle',
  'exponentielleMoinsPolynome',
  'puissanceSurExponentielle',
]

const typesAvecChangementDeVariable: TypeQuestion[] = [
  'exponentielleComposeeSurPuissance',
  'puissanceFoisExponentielleComposee',
  'exponentielleComposeeMoinsPolynome',
]

function puissance(variable: string, exposant: number): string {
  return exposant === 1 ? variable : `${variable}^{${exposant}}`
}

function coefficientFois(coefficient: number, expression: string): string {
  return `${rienSi1(coefficient)}${expression}`
}

/**
 * Remarque de fin de correction : les limites des deux termes donnent une forme indéterminée,
 * ce qui justifie le recours aux croissances comparées.
 * @param sens limite en +∞ ou en −∞
 * @param termes les deux termes et leur limite, en LaTeX
 * @param operation l'opération dont les règles ne permettent pas de conclure
 */
function constatFormeIndeterminee(
  sens: '+' | '-',
  termes: [terme: string, limite: string][],
  operation: 'produit' | 'quotient' | 'différence',
): string {
  const limites = termes
    .map(
      ([terme, limite]) =>
        `$\\displaystyle \\lim_{x\\to${sens}\\infty}${terme}=${limite}$`,
    )
    .join(' et ')
  const regles =
    operation === 'différence' ? 'de la différence' : `du ${operation}`
  return `<br><br>${texteEnCouleurEtGras('Remarque : ', bleuMathalea)}<br>On a utilisé les croissances comparées car on était face à une forme indéterminée.<br>
          En effet, ${limites} : on ne peut pas conclure en utilisant les règles ${regles}.`
}

/**
 * Début de correction pour un changement de variable X = ax (a > 0),
 * avec le calcul de la limite de la nouvelle variable.
 * @param coefficient le coefficient a strictement positif
 * @param sens limite en +∞ ou en −∞
 */
function changementDeVariable(coefficient: number, sens: '+' | '-'): string {
  return `On pose $X=${coefficient}x$, donc $x=\\dfrac{1}{${coefficient}}X$.<br>
          Comme $${coefficient}>0$, $\\displaystyle \\lim_{x\\to${sens}\\infty}${coefficient}x=${sens}\\infty$, donc $\\displaystyle \\lim_{x\\to${sens}\\infty}X=${sens}\\infty$.<br>`
}

/** Limite de x^n en −∞ : +∞ si n est pair, −∞ sinon. */
function limitePuissanceEnMoinsInfini(exposant: number): string {
  return exposant % 2 === 0 ? '+\\infty' : '-\\infty'
}

/**
 * Limites obtenues directement avec le théorème des croissances comparées.
 * @author Stéphane Guyon
 */
export default class CroissancesComparees extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 2
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de calcul',
      3,
      '1 : Sans changement de variable\n2 : Avec changement de variable\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const typesDisponibles =
      this.sup === 1
        ? typesSansChangementDeVariable
        : this.sup === 2
          ? typesAvecChangementDeVariable
          : [...typesSansChangementDeVariable, ...typesAvecChangementDeVariable]
    const types = combinaisonListes<TypeQuestion>(
      typesDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const exposant = randint(1, 5)
      const coefficient = randint(-5, 5, 0)
      const coefficientExponentielle = randint(2, 4)
      const puissanceDeX = puissance('x', exposant)
      const puissanceDeXMajuscule = puissance('X', exposant)
      let expression: string
      let sens: '+' | '-'
      let reponse: '0' | '+\\infty' | '-\\infty'
      let correction: string

      switch (type) {
        case 'puissanceSurExponentielle': {
          expression = `\\dfrac{${coefficientFois(coefficient, puissanceDeX)}}{\\mathrm{e}^{x}}`
          sens = '+'
          reponse = '0'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n$,<br>
          $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{x^n}{\\mathrm{e}^{x}}=0$.<br>
          On a donc $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{${puissanceDeX}}{\\mathrm{e}^{x}}=0$, puis<br>
          $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.`
          break
        }
        case 'exponentielleSurPuissance': {
          expression = `\\dfrac{${coefficientFois(coefficient, '\\mathrm{e}^{x}')}}{${puissanceDeX}}`
          sens = '+'
          reponse = coefficient > 0 ? '+\\infty' : '-\\infty'
          correction = `D’après le théorème des croissances comparées, pour tout entier naturel $n$,<br>
          $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}}{x^n}=+\\infty$.<br>
          On a donc $\\displaystyle \\lim_{x\\to+\\infty}\\dfrac{\\mathrm{e}^{x}}{${puissanceDeX}}=+\\infty$.<br>
          Comme $${coefficient}${coefficient > 0 ? '>0' : '<0'}$, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.`
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
          $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence('0')}$.`
          break
        }
        case 'exponentielleMoinsPolynome': {
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
          Par produit, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence('+\\infty')}$.`
          break
        }
        case 'exponentielleComposeeSurPuissance': {
          const coefficientFinal =
            coefficient * coefficientExponentielle ** exposant
          const puissanceApresSubstitution =
            exposant === 1
              ? `\\dfrac{1}{${coefficientExponentielle}}X`
              : `\\left(\\dfrac{1}{${coefficientExponentielle}}X\\right)^{${exposant}}`
          expression = `\\dfrac{${coefficientFois(coefficient, `\\mathrm{e}^{${coefficientExponentielle}x}`)}}{${puissanceDeX}}`
          sens = '+'
          reponse = coefficient > 0 ? '+\\infty' : '-\\infty'
          correction = `${changementDeVariable(coefficientExponentielle, sens)}
          Ainsi,<br>
          $\\begin{aligned}
          f(x)&=\\dfrac{${coefficientFois(coefficient, `\\mathrm{e}^{${coefficientExponentielle}x}`)}}{${puissanceDeX}}\\\\
          &=\\dfrac{${coefficientFois(coefficient, '\\mathrm{e}^{X}')}}{${puissanceApresSubstitution}}\\\\
          &=${coefficientFois(coefficientFinal, `\\dfrac{\\mathrm{e}^{X}}{${puissanceDeXMajuscule}}`)}.
          \\end{aligned}$<br>
          D’après le théorème des croissances comparées, $\\displaystyle \\lim_{X\\to+\\infty}\\dfrac{\\mathrm{e}^{X}}{${puissanceDeXMajuscule}}=+\\infty$.<br>
          Comme $${texNombre(coefficientFinal)}${coefficientFinal > 0 ? '>0' : '<0'}$, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence(reponse)}$.`
          break
        }
        case 'puissanceFoisExponentielleComposee': {
          const denominateurCoefficient = coefficientExponentielle ** exposant
          const puissanceApresSubstitution =
            exposant === 1
              ? `\\dfrac{1}{${coefficientExponentielle}}X`
              : `\\left(\\dfrac{1}{${coefficientExponentielle}}X\\right)^{${exposant}}`
          expression = coefficientFois(
            coefficient,
            `${puissanceDeX}\\mathrm{e}^{${coefficientExponentielle}x}`,
          )
          sens = '-'
          reponse = '0'
          correction = `${changementDeVariable(coefficientExponentielle, sens)}
          Ainsi,<br>
          $\\begin{aligned}
          f(x)&=${expression}\\\\
          &=${coefficientFois(coefficient, puissanceApresSubstitution)}\\mathrm{e}^{X}\\\\
          &=\\dfrac{${coefficient}}{${texNombre(denominateurCoefficient)}}${puissanceDeXMajuscule}\\mathrm{e}^{X}.
          \\end{aligned}$<br>
          D’après le théorème des croissances comparées, $\\displaystyle \\lim_{X\\to-\\infty}${puissanceDeXMajuscule}\\mathrm{e}^{X}=0$.<br>
          On en déduit que $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${miseEnEvidence('0')}$.`
          break
        }
        case 'exponentielleComposeeMoinsPolynome': {
          const coefficientPolynome = randint(1, 6)
          const denominateurCoefficient = coefficientExponentielle ** exposant
          const termePolynomial = coefficientFois(
            coefficientPolynome,
            puissanceDeX,
          )
          const puissanceApresSubstitution =
            exposant === 1
              ? `\\dfrac{1}{${coefficientExponentielle}}X`
              : `\\left(\\dfrac{1}{${coefficientExponentielle}}X\\right)^{${exposant}}`
          expression = `\\mathrm{e}^{${coefficientExponentielle}x}-${termePolynomial}`
          sens = '+'
          reponse = '+\\infty'
          correction = `${changementDeVariable(coefficientExponentielle, sens)}
          Ainsi,<br>
          $\\begin{aligned}
          f(x)&=\\mathrm{e}^{${coefficientExponentielle}x}-${termePolynomial}\\\\
          &=\\mathrm{e}^{X}-${coefficientFois(coefficientPolynome, puissanceApresSubstitution)}\\\\
          &=${puissanceDeXMajuscule}\\left(\\dfrac{\\mathrm{e}^{X}}{${puissanceDeXMajuscule}}-\\dfrac{${coefficientPolynome}}{${texNombre(denominateurCoefficient)}}\\right).
          \\end{aligned}$<br>
          D’après le théorème des croissances comparées, $\\displaystyle \\lim_{X\\to+\\infty}\\dfrac{\\mathrm{e}^{X}}{${puissanceDeXMajuscule}}=+\\infty$.<br>
          Ainsi, $\\displaystyle \\lim_{X\\to+\\infty}\\left(\\dfrac{\\mathrm{e}^{X}}{${puissanceDeXMajuscule}}-\\dfrac{${coefficientPolynome}}{${texNombre(denominateurCoefficient)}}\\right)=+\\infty$.<br>
          De plus, $\\displaystyle \\lim_{X\\to+\\infty}${puissanceDeXMajuscule}=+\\infty$.<br>
          Par produit, $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${miseEnEvidence('+\\infty')}$.`
          break
        }
      }

      // Remarque en fin de correction : la forme indéterminée justifie les croissances comparées
      const exponentielle = type.includes('Composee')
        ? `\\mathrm{e}^{${coefficientExponentielle}x}`
        : '\\mathrm{e}^{x}'
      const formesIndeterminees: Record<TypeQuestion, string> = {
        puissanceSurExponentielle: constatFormeIndeterminee(
          '+',
          [
            [puissanceDeX, '+\\infty'],
            [exponentielle, '+\\infty'],
          ],
          'quotient',
        ),
        exponentielleSurPuissance: constatFormeIndeterminee(
          '+',
          [
            [exponentielle, '+\\infty'],
            [puissanceDeX, '+\\infty'],
          ],
          'quotient',
        ),
        exponentielleComposeeSurPuissance: constatFormeIndeterminee(
          '+',
          [
            [exponentielle, '+\\infty'],
            [puissanceDeX, '+\\infty'],
          ],
          'quotient',
        ),
        puissanceFoisExponentielle: constatFormeIndeterminee(
          '-',
          [
            [puissanceDeX, limitePuissanceEnMoinsInfini(exposant)],
            [exponentielle, '0'],
          ],
          'produit',
        ),
        puissanceFoisExponentielleComposee: constatFormeIndeterminee(
          '-',
          [
            [puissanceDeX, limitePuissanceEnMoinsInfini(exposant)],
            [exponentielle, '0'],
          ],
          'produit',
        ),
        exponentielleMoinsPolynome: constatFormeIndeterminee(
          '+',
          [
            [exponentielle, '+\\infty'],
            [puissanceDeX, '+\\infty'],
          ],
          'différence',
        ),
        exponentielleComposeeMoinsPolynome: constatFormeIndeterminee(
          '+',
          [
            [exponentielle, '+\\infty'],
            [puissanceDeX, '+\\infty'],
          ],
          'différence',
        ),
      }
      correction += formesIndeterminees[type]

      const indice = `x\\to${sens}\\infty`
      let texte = `Soit $f$ la fonction définie sur $\\mathbb R$ par $f(x)=${expression}$.<br>`
      if (type.includes('SurPuissance')) {
        texte = `Soit $f$ la fonction définie sur $\\mathbb R^*$ par $f(x)=${expression}$.<br>`
      }
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
