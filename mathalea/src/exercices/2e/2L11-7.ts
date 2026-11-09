import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Développer et réduire des expressions du second degré'
export const dateDePublication = '27/08/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = '4b7ed'
export const refs = {
  'fr-fr': ['2L11-7'],
  'fr-ch': ['11LCFA3F-12', '11LSFA3F-12'],
}

type Coefficients = [number, number, number]

type BlocAlgebrique = {
  expression: string
  developpee: string
  coefficients: Coefficients
  nature: 'trinome' | 'DS' | 'DD' | 'IR'
}

function polynome(coefficients: Coefficients): Polynome {
  return new Polynome({ rand: false, coeffs: coefficients })
}

function additionne(
  premier: Coefficients,
  second: Coefficients,
  signe: 1 | -1,
): Coefficients {
  return [
    premier[0] + signe * second[0],
    premier[1] + signe * second[1],
    premier[2] + signe * second[2],
  ]
}

function doubleDistributivite(): BlocAlgebrique {
  const a = randint(-5, 5, 0)
  const b = randint(-8, 8, 0)
  const c = randint(-5, 5, 0)
  const d = randint(-8, 8, 0)
  const coefficients: Coefficients = [b * d, a * d + b * c, a * c]
  return {
    expression: `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})`,
    developpee: polynome(coefficients).toLatex(),
    coefficients,
    nature: 'DD',
  }
}

function distributiviteSimple(): BlocAlgebrique {
  const k = randint(1, 5)
  const a = randint(-5, 5, 0)
  const b = randint(-8, 8, 0)
  const coefficients: Coefficients = [0, k * b, k * a]
  return {
    expression: `${k === 1 ? '' : k === -1 ? '-' : k}x(${reduireAxPlusB(a, b)})`,
    developpee: polynome(coefficients).toLatex(),
    coefficients,
    nature: 'DS',
  }
}

function identiteRemarquable(): BlocAlgebrique {
  const type = randint(1, 3)
  const a = randint(1, 5)
  const b = randint(1, 8)
  let expression: string
  let coefficients: Coefficients

  if (type === 1) {
    expression = `(${reduireAxPlusB(a, b)})^2`
    coefficients = [b ** 2, 2 * a * b, a ** 2]
  } else if (type === 2) {
    expression = `(${reduireAxPlusB(a, -b)})^2`
    coefficients = [b ** 2, -2 * a * b, a ** 2]
  } else {
    expression = `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, -b)})`
    coefficients = [-(b ** 2), 0, a ** 2]
  }

  return {
    expression,
    developpee: polynome(coefficients).toLatex(),
    coefficients,
    nature: 'IR',
  }
}

function trinome(): BlocAlgebrique {
  const coefficients: Coefficients = [
    randint(-9, 9, 0),
    randint(-8, 8, 0),
    randint(-6, 6, 0),
  ]
  const expression = polynome(coefficients).toLatex()
  return {
    expression,
    developpee: expression,
    coefficients,
    nature: 'trinome',
  }
}

/**
 * Développer et réduire une somme ou une différence de deux expressions
 * faisant intervenir distributivité et identités remarquables.
 * @author Stéphane Guyon
 */
export default class DevelopperExpressionsSecondDegre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.spacing = 2
    this.spacingCorr = 2.5
    this.listeAvecNumerotation = false
    this.sup = '6'
    this.besoinFormulaireTexte = [
      "Types d'expressions",
      [
        'Nombres séparés par des tirets :',
        '1 : Trinôme et distributivité simple',
        '2 : Trinôme et double distributivité',
        '3 : Identité remarquable et distributivité simple',
        '4 : Identité remarquable et double distributivité',
        '5 : Deux identités remarquables',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.sup2 = 3
    this.besoinFormulaire2Numerique = [
      'Opération entre les deux expressions',
      3,
      '1 : Addition\n2 : Soustraction\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    this.consigne =
      this.nbQuestions > 1
        ? 'Développer et réduire les expressions suivantes.'
        : "Développer et réduire l'expression suivante."

    const types = combinaisonListes(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        min: 1,
        max: 5,
        melange: 6,
        defaut: 6,
        nbQuestions: this.nbQuestions,
      }).map(Number),
      this.nbQuestions,
    )
    const signes: Array<1 | -1> =
      this.sup2 === 1
        ? Array.from({ length: this.nbQuestions }, () => 1 as const)
        : this.sup2 === 2
          ? Array.from({ length: this.nbQuestions }, () => -1 as const)
          : combinaisonListes<1 | -1>([1, -1], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const signe = signes[i]
      let premier: BlocAlgebrique
      let second: BlocAlgebrique

      switch (type) {
        case 1:
          premier = trinome()
          second = distributiviteSimple()
          break
        case 2:
          premier = trinome()
          second = doubleDistributivite()
          break
        case 3:
          premier = identiteRemarquable()
          second = distributiviteSimple()
          break
        case 4:
          premier = doubleDistributivite()
          second = identiteRemarquable()
          break
        default:
          premier = identiteRemarquable()
          second = identiteRemarquable()
      }

      if (choice([true, false])) {
        const ancienPremier = premier
        premier = second
        second = ancienPremier
      }

      const secondEstNegatif = second.expression.startsWith('-')
      const secondExpressionAffichee = secondEstNegatif
        ? second.expression.slice(1)
        : second.expression
      const operateur =
        signe === 1
          ? secondEstNegatif
            ? '-'
            : '+'
          : secondEstNegatif
            ? '+'
            : '-'
      // Une soustraction porte sur tout le trinôme, y compris si son
      // coefficient dominant est négatif.
      const expression =
        signe === -1 && second.nature === 'trinome'
          ? `${premier.expression}-\\left(${second.expression}\\right)`
          : `${premier.expression}${operateur}${secondExpressionAffichee}`
      const coefficientsResultat = additionne(
        premier.coefficients,
        second.coefficients,
        signe,
      )
      if (coefficientsResultat[2] === 0) continue
      const resultat = polynome(coefficientsResultat).toLatex()
      const secondAvecSigne: Coefficients = [
        signe * second.coefficients[0],
        signe * second.coefficients[1],
        signe * second.coefficients[2],
      ]
      const developpementSecondAvecSigne = polynome(secondAvecSigne).toLatex()
      const raccord = secondAvecSigne[2] > 0 ? '+' : ''

      if (this.questionJamaisPosee(i, expression)) {
        const lettre = lettreDepuisChiffre(i + 1)
        const texte = this.interactif
          ? `$${lettre}=${expression}=$${ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierDeBaseAvecVariable,
            )}`
          : `$${lettre}=${expression}$`
        const signeMoinsDevantBloc = signe === -1 && second.nature !== 'DS'
        const etapesDeDeveloppement = signeMoinsDevantBloc
          ? `&=${premier.developpee}-\\left(${second.developpee}\\right)\\\\
          &=${premier.developpee}${raccord}${developpementSecondAvecSigne}\\\\`
          : `&=${premier.developpee}${raccord}${developpementSecondAvecSigne}\\\\`
        const correction = `$\\begin{aligned}
          ${lettre}&=${expression}\\\\
          ${etapesDeDeveloppement}
          &=${miseEnEvidence(resultat)}.
          \\end{aligned}$`

        this.listeQuestions.push(texte)
        this.listeCorrections.push(correction)
        handleAnswers(this, i, {
          reponse: {
            value: resultat,
            options: { developpementEgal: true },
          },
        })
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
