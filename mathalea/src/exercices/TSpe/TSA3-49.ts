import { createQuestion } from '../../lib/interactif/createQuestion'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser la convexité pour démontrer une inégalité'
export const dateDePublication = '06/11/2026'
export const uuid = 'd69ac'

export const refs = {
  'fr-fr': ['TSA3-49', 'TCA7-47'],
  'fr-ch': [],
}

/**
 * Écrit coefficient × e^{exposant} en LaTeX (coefficient non nul).
 */
function termeExponentiel(coefficient: number, exposant: string): string {
  const facteur =
    coefficient === 1 ? '' : coefficient === -1 ? '-' : texNombre(coefficient)
  return `${facteur}\\mathrm e^{${exposant}}`
}

/**
 * Écrit le calcul de a×x0⁴+b×x0²+c×x0+d en sautant les coefficients nuls.
 */
function substitutionPolynome(
  coefficients: Array<[number, number]>,
  x0: number,
): string {
  let resultat = ''
  for (const [coefficient, degre] of coefficients) {
    if (coefficient === 0) continue
    const puissance =
      degre === 0
        ? ''
        : `\\times ${ecritureParentheseSiNegatif(x0)}${degre > 1 ? `^${degre}` : ''}`
    const terme = `${texNombre(coefficient)}${puissance}`
    resultat += resultat === '' || coefficient < 0 ? terme : `+${terme}`
  }
  return resultat === '' ? '0' : resultat
}

/**
 * On donne une fonction convexe ou concave sur ℝ : déterminer une tangente,
 * étudier la convexité, puis en déduire une inégalité sur la forme développée
 * de f(x) moins l'équation de la tangente.
 * @author Arnaud Meistermann
 */
export default class ConvexiteEtTangente extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de fonctions',
      [
        'Nombres séparés par des tirets :',
        '1 : Polynôme de degré 4',
        '2 : Exponentielle et polynôme de degré 2',
        '3 : Exponentielle et fonction affine',
        '4 : Mélange',
      ].join('\n'),
    ]
  }

  nouvelleVersion(): void {
    const typesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })
    const listeTypes = combinaisonListes(typesDisponibles, this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      // signe = 1 : f convexe ; signe = -1 : f concave.
      const signe = choice([-1, 1])
      const convexe = signe > 0
      let expressionF: string
      let expressionFPrime: string
      let expressionFSeconde: string
      let x0: number
      let imageX0: number
      let deriveeX0: number
      let calculImage: string
      let calculDerivee: string
      let justificationSigne: string
      let cle: number[]
      // f(x) = partieExponentielle + partiePolynome(x)
      let partieExponentielle = ''
      let partiePolynome: Polynome

      switch (listeTypes[i]) {
        case 1: {
          // f(x) = ax⁴+bx²+cx+d avec a et b de même signe (b éventuellement nul)
          const a = signe * randint(1, 2)
          const b = signe * randint(0, 4)
          const c = randint(-5, 5)
          const d = randint(-5, 5)
          x0 = choice([-2, -1, 1, 2])
          const f = new Polynome({ coeffs: [d, c, b, 0, a] })
          partiePolynome = f
          const fPrime = f.derivee()
          const fSeconde = fPrime.derivee()
          expressionF = f.toLatex()
          expressionFPrime = fPrime.toLatex()
          expressionFSeconde = fSeconde.toLatex()
          imageX0 = f.image(x0)
          deriveeX0 = fPrime.image(x0)
          calculImage = `f(${texNombre(x0)})=${substitutionPolynome(
            [
              [a, 4],
              [b, 2],
              [c, 1],
              [d, 0],
            ],
            x0,
          )}=${texNombre(imageX0)}`
          calculDerivee = `f'(${texNombre(x0)})=${substitutionPolynome(
            [
              [4 * a, 3],
              [2 * b, 1],
              [c, 0],
            ],
            x0,
          )}=${texNombre(deriveeX0)}`
          const signeTexte = convexe ? '\\geqslant' : '\\leqslant'
          justificationSigne = `Pour tout réel $x$, $x^2\\geqslant 0$ et $${texNombre(12 * a)}${convexe ? '>' : '<'}0$, donc $${texNombre(12 * a)}x^2${signeTexte} 0$.<br>`
          justificationSigne +=
            b === 0
              ? `Ainsi, pour tout réel $x$, $f''(x)${signeTexte} 0$.`
              : `De plus, $${texNombre(2 * b)}${convexe ? '>' : '<'}0$. Ainsi, pour tout réel $x$, $f''(x)${convexe ? '>' : '<'}0$.`
          cle = [a, b, c, d, x0]
          break
        }
        case 2: {
          // f(x) = a e^x + bx²+cx+d avec a et b de même signe
          const a = signe * randint(1, 3)
          const b = signe * randint(1, 3)
          const c = randint(-5, 5)
          const d = randint(-5, 5)
          x0 = 0
          partiePolynome = new Polynome({ coeffs: [d, c, b] })
          partieExponentielle = termeExponentiel(a, 'x')
          const partiePolynomePrime = partiePolynome.derivee()
          expressionF = `${termeExponentiel(a, 'x')}${partiePolynome.toLatex(true)}`
          expressionFPrime = `${termeExponentiel(a, 'x')}${partiePolynomePrime.toLatex(true)}`
          expressionFSeconde = `${termeExponentiel(a, 'x')}${ecritureAlgebrique(2 * b)}`
          imageX0 = a + d
          deriveeX0 = a + c
          calculImage = `f(0)=${termeExponentiel(a, '0')}${ecritureAlgebrique(d)}=${texNombre(a)}${ecritureAlgebrique(d)}=${texNombre(imageX0)}`
          calculDerivee = `f'(0)=${termeExponentiel(a, '0')}${ecritureAlgebrique(c)}=${texNombre(a)}${ecritureAlgebrique(c)}=${texNombre(deriveeX0)}`
          justificationSigne = `Pour tout réel $x$, $\\mathrm e^x>0$${Math.abs(a) === 1 ? '' : ` et $${texNombre(a)}${convexe ? '>' : '<'}0$`}, donc $${termeExponentiel(a, 'x')}${convexe ? '>' : '<'}0$.<br>
          De plus, $${texNombre(2 * b)}${convexe ? '>' : '<'}0$. Ainsi, pour tout réel $x$, $f''(x)${convexe ? '>' : '<'}0$.`
          cle = [a, b, c, d]
          break
        }
        case 3:
        default: {
          // f(x) = a e^{kx} + bx + c
          const a = signe * randint(1, 4)
          const k = choice([-3, -2, -1, 2, 3])
          const b = randint(-5, 5, 0)
          const c = randint(-5, 5)
          x0 = 0
          const exposant = k === -1 ? '-x' : `${texNombre(k)}x`
          partiePolynome = new Polynome({ coeffs: [c, b] })
          partieExponentielle = termeExponentiel(a, exposant)
          expressionF = `${partieExponentielle}${partiePolynome.toLatex(true)}`
          expressionFPrime = `${termeExponentiel(a * k, exposant)}${ecritureAlgebrique(b)}`
          expressionFSeconde = termeExponentiel(a * k * k, exposant)
          imageX0 = a + c
          deriveeX0 = a * k + b
          calculImage = `f(0)=${termeExponentiel(a, '0')}${ecritureAlgebrique(c)}=${texNombre(a)}${ecritureAlgebrique(c)}=${texNombre(imageX0)}`
          calculDerivee = `f'(0)=${termeExponentiel(a * k, '0')}${ecritureAlgebrique(b)}=${texNombre(a * k)}${ecritureAlgebrique(b)}=${texNombre(deriveeX0)}`
          justificationSigne = `Pour tout réel $x$, $\\mathrm e^{${exposant}}>0$ et $${texNombre(a * k * k)}${convexe ? '>' : '<'}0$. Ainsi, pour tout réel $x$, $f''(x)${convexe ? '>' : '<'}0$.`
          cle = [a, k, b, c]
          break
        }
      }

      if (!this.questionJamaisPosee(i, listeTypes[i], ...cle)) continue

      const m = deriveeX0
      const p = imageX0 - m * x0
      const tangente = reduireAxPlusB(m, p)
      const difference =
        m === 0
          ? p === 0
            ? 'f(x)'
            : `f(x)${ecritureAlgebrique(-p)}`
          : `f(x)-\\left(${tangente}\\right)`
      const polynomeDifference = partiePolynome.add(
        new Polynome({ coeffs: [-p, -m] }),
      )
      const differenceDeveloppee =
        partieExponentielle === ''
          ? polynomeDifference.toLatex()
          : polynomeDifference.isEqual(0)
            ? partieExponentielle
            : `${partieExponentielle}${polynomeDifference.toLatex(true)}`
      const inegalite = convexe ? '\\geqslant' : '\\leqslant'
      const xMoinsX0 =
        x0 === 0 ? '(x-0)' : `\\left(x${ecritureAlgebrique(-x0)}\\right)`

      const correctionTangente = `La fonction $f$ est dérivable sur $\\mathbb R$ et, pour tout réel $x$,<br>
      $f'(x)=${expressionFPrime}$<br>
      Une équation de la tangente $T$ au point d'abscisse $${texNombre(x0)}$ est $y=f'(${texNombre(x0)})${xMoinsX0}+f(${texNombre(x0)})$.<br>
      $${calculImage}$<br>
      $${calculDerivee}$<br>
      ${
        x0 === 0 || m === 0
          ? `Donc $T$ a pour équation réduite $${miseEnEvidence(`y=${tangente}`)}$.`
          : `Donc $T$ a pour équation $y=${m === 1 ? '' : m === -1 ? '-' : ecritureParentheseSiNegatif(m)}${xMoinsX0}${ecritureAlgebrique(imageX0)}$, soit $${miseEnEvidence(`y=${tangente}`)}$.`
      }`

      const correctionConvexite = `La fonction $f'$ est dérivable sur $\\mathbb R$ et, pour tout réel $x$,<br>
      $f''(x)=${expressionFSeconde}$<br>
      ${justificationSigne}<br>
      La dérivée seconde de $f$ est ${convexe ? 'positive' : 'négative'} sur $\\mathbb R$, donc la fonction $f$ est ${texteEnCouleurEtGras(convexe ? 'convexe' : 'concave')} sur $\\mathbb R$.`

      const correctionPosition = `La fonction $f$ est ${convexe ? 'convexe' : 'concave'} sur $\\mathbb R$, donc sa courbe $\\mathcal C_f$ est située ${convexe ? 'au-dessus' : 'en dessous'} de chacune de ses tangentes, en particulier ${convexe ? 'au-dessus' : 'en dessous'} de la tangente $T$.<br>
      Ainsi, pour tout réel $x$, $f(x)${inegalite} ${tangente}$, c'est-à-dire $${difference}${inegalite} 0$.<br>
      En développant, on obtient, pour tout réel $x$, $${miseEnEvidence(`${differenceDeveloppee}${inegalite} 0`)}$.`

      createQuestion(this, i, {
        question: `On considère la fonction $f$ définie sur $\\mathbb R$ par $f(x)=${expressionF}$.<br>
        On note $\\mathcal C_f$ sa courbe représentative dans un repère et $T$ la tangente à $\\mathcal C_f$ au point d'abscisse $${texNombre(x0)}$.`,
        subQuestions: [
          {
            question: "Déterminer l'équation réduite de la tangente $T$.",
            correction: correctionTangente,
          },
          {
            question:
              'Étudier la convexité de la fonction $f$ sur $\\mathbb R$.',
            correction: correctionConvexite,
          },
          {
            question: `Déduire des questions précédentes que pour tout réel $x$, $${differenceDeveloppee}${inegalite} 0$.`,
            correction: correctionPosition,
          },
        ],
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
