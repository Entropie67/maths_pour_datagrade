import {
  ComputeEngine,
  isFunction,
  type Expression,
} from '@cortex-js/compute-engine'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre =
  "Déterminer la forme canonique d'un polynôme du second degré"

/**
 * Déterminer la forme canonique d'un polynôme du second degré
 * @author Stéphane Guyon
 */
export const uuid = '60504'

export const refs = {
  'fr-fr': ['1AL20-1'],
  'fr-ch': ['1mF3-2'],
}

const ce = new ComputeEngine()

/**
 * Vérifie que la réponse est égale au polynôme attendu et qu'elle conserve
 * la structure a(x-α)²+β demandée par l'énoncé.
 */
export function compareFormeCanonique(saisie: string, answer: string) {
  const egalite = fonctionComparaison(saisie, answer)
  if (!egalite.isOk) return egalite

  const expression = ce.parse(saisie, { form: 'raw' })
  const puissances: Expression[] = []
  const collecterPuissances = (terme: Expression) => {
    if (!isFunction(terme)) return
    if (terme.operator === 'Power') puissances.push(terme)
    terme.ops.forEach(collecterPuissances)
  }
  collecterPuissances(expression)

  const carre = puissances[0]
  if (
    puissances.length !== 1 ||
    !isFunction(carre, 'Power') ||
    !carre.ops[1]?.is(2)
  ) {
    return {
      isOk: false,
      feedback: 'La réponse doit être écrite sous la forme $a(x-\\alpha)^2+\\beta$.',
    }
  }

  let base = carre.ops[0]
  if (base === undefined) {
    return {
      isOk: false,
      feedback: 'La réponse doit être écrite sous la forme $a(x-\\alpha)^2+\\beta$.',
    }
  }
  while (isFunction(base, 'Delimiter')) base = base.ops[0]
  const coefficients = ce.parse(base.latex).polynomialCoefficients()
  if (
    !(
      (base.operator === 'Add' || base.operator === 'Subtract') &&
      coefficients?.length === 2 &&
      coefficients[0].is(1) &&
      !coefficients[1].is(0)
    )
  ) {
    return {
      isOk: false,
      feedback: 'La réponse doit être écrite sous la forme $a(x-\\alpha)^2+\\beta$.',
    }
  }

  return egalite
}

export default class Formacanonique extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 3
    this.besoinFormulaireCaseACocher = ['Le coefficient de $x^2$ est 1', false]
  }

  nouvelleVersion() {
    this.consigne =
      'Déterminer la forme canonique ' +
      (this.nbQuestions === 1 ? 'du polynôme' : 'de chacun des polynômes') +
      ` $P$, défini pour tout $x \\in \\mathbb{R}$ par${sp()}: `
    if (this.interactif) {
      // this.consigne += '<br> '
    }

    for (
      let i = 0, texte, texteCorr, a, b, c, alpha, beta, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      // k(x-x1)(x-x2)
      alpha = randint(-5, 5, [0])
      beta = randint(-5, 5, [0])
      a = this.sup ? 1 : randint(-4, 4, [0])
      b = -2 * a * alpha
      c = a * alpha * alpha + beta
      while (c === 0) {
        alpha = randint(-5, 5, [0])
        beta = randint(-5, 5, [0])
        a = this.sup ? 1 : randint(-4, 4, [0])
        b = -2 * a * alpha
        c = a * alpha * alpha + beta
      }

      texte = `$P(x)=${rienSi1(a)}x^2${ecritureAlgebriqueSauf1(b)}x${ecritureAlgebrique(c)}$`
      texteCorr =
        "On sait que si le polynôme, sous forme développée, s'écrit $P(x)=ax^2+bx+c$, "
      texteCorr +=
        'alors sa forme canonique est de la forme $P(x)=a(x-\\alpha)^2+\\beta$,'

      texteCorr += '<br>avec $\\alpha=\\dfrac{-b}{2a}$ et $\\beta=P(\\alpha).$'
      texteCorr += `<br>Avec l'énoncé${sp()}: $a=${a}$ et $b=${b}$, on en déduit que $\\alpha=${alpha}$.`
      texteCorr += `<br>On calcule alors $\\beta=P(${alpha})$, et on obtient au final que $\\beta=${beta}$.`
      texteCorr += `<br>d'où, $P(x)=${a}\\big(x-${ecritureParentheseSiNegatif(alpha)}\\big)^2+${ecritureParentheseSiNegatif(beta)}$`
      texteCorr += '<br>Au final, $P(x)='
      let texteCorrSolution = ''
      if (a === 1 || a === -1) {
        if (a === -1) {
          texteCorrSolution += '-'
        }
      } else {
        texteCorrSolution += `${a}`
      }
      texteCorrSolution += `(x ${ecritureAlgebrique(-alpha)})^2`
      if (beta !== 0) {
        texteCorrSolution += `${ecritureAlgebrique(beta)}`
      }
      texteCorr += `${miseEnEvidence(texteCorrSolution)}$`
      if (beta > 0) {
        if (alpha > 0) {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x-${alpha})^2+${beta}`],
              compare: compareFormeCanonique,
            },
          })
        } else {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x+${-alpha})^2+${beta}`],
              compare: compareFormeCanonique,
            },
          })
        }
      }
      if (beta < 0) {
        if (alpha > 0) {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x-${alpha})^2${beta}`],
              compare: compareFormeCanonique,
            },
          })
        } else {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x+${-alpha})^2${beta}`],
              compare: compareFormeCanonique,
            },
          })
        }
      }
      if (beta === 0) {
        if (alpha > 0) {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x-${alpha})^2`],
              compare: compareFormeCanonique,
            },
          })
        } else {
          handleAnswers(this, i, {
            reponse: {
              value: [`${a}(x+${-alpha})^2`],
              compare: compareFormeCanonique,
            },
          })
        }
      }

      texte += ajouteChampTexteMathLive(this, i, KeyboardType.lyceeClassique, {
        texteAvant: `$${sp()}=${sp()}$`,
      })
      if (this.questionJamaisPosee(i, a, b, c)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
