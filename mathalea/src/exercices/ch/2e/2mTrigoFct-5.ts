import { bleuMathalea } from '../../../lib/colors'
import { all, sameIntegerProgressionSet } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import {
    texPiCoefficientFraction,
    texSignedPiTerm,
    type FractionData,
} from '../../../lib/mathFonctions/trigo'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer l'ensemble des zéros d'une fonction trigonométrique"
export const dateDePublication = '06/05/2026'
export const uuid = '8f72a'
export const interactifReady = true

export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-5'],
}

type TrigFunctionName = 'sin' | 'cos' | 'tan'

function texKPiCoefficient(period: FractionEtendue): string {
  const fraction = period.simplifie()
  const periodTex =
    fraction.n === 1 && fraction.d === 1
      ? 'k\\pi'
      : fraction.d === 1
        ? `${fraction.s < 0 ? '-' : ''}${fraction.n}k\\pi`
        : `${fraction.s < 0 ? '-' : ''}\\dfrac{${fraction.n === 1 ? '' : fraction.n}k\\pi}{${fraction.d}}`

  return periodTex
}

function texProgression(
  offset: FractionEtendue,
  period: FractionEtendue,
): string {
  if (offset.s === 0) return texKPiCoefficient(period)
  const periodTex = texKPiCoefficient(period)
  return `${texPiCoefficientFraction(offset)}${periodTex.startsWith('-') ? '' : '+'}${periodTex}`
}

function randomFraction(values: FractionData[]): FractionData {
  return choice(values)
}

/**
 * Déterminer l'ensemble des zéros d'une fonction trigonométrique.
 * @author Nathan Scheinmann
 */
export default class ZerosFonctionTrigonometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Fonctions trigonométriques',
      [
        'Nombres séparés par des tirets :',
        '1 : sinus',
        '2 : cosinus',
        '3 : tangente',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const fonctions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['sin', 'cos', 'tan'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }) as TrigFunctionName[]
    const coefficientsX: FractionData[] = [
      { num: 1, den: 2 },
      { num: 2, den: 3 },
      { num: 3, den: 2 },
      { num: -1, den: 2 },
      { num: -2, den: 3 },
      { num: -3, den: 2 },
      { num: 2, den: 1 },
      { num: -2, den: 1 },
    ]
    const translations: FractionData[] = [
      { num: 0, den: 1 },
      { num: 1, den: 6 },
      { num: -1, den: 6 },
      { num: 1, den: 4 },
      { num: -1, den: 4 },
      { num: 1, den: 3 },
      { num: -1, den: 3 },
      { num: 1, den: 2 },
      { num: -1, den: 2 },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const fonction = fonctions[i]
      const a = new FractionEtendue(randint(-5, 5, 0), randint(1, 4))
      const m = randomFraction(coefficientsX)
      const b = randomFraction(translations)
      const coefficientXFraction = new FractionEtendue(m.num, m.den)
      const translationFraction = new FractionEtendue(b.num, b.den)
      const secondMembreFraction =
        fonction === 'cos'
          ? new FractionEtendue(1, 2)
          : new FractionEtendue(0, 1)
      const secondMembreIsoleFraction = secondMembreFraction.sommeFraction(
        translationFraction.oppose(),
      )
      const offsetFraction =
        secondMembreIsoleFraction.diviseFraction(coefficientXFraction)
      const signedPeriodFraction = coefficientXFraction.inverse().simplifie()
      const answer = texProgression(offsetFraction, signedPeriodFraction)
      const coefficientX = `${coefficientXFraction.texFractionSaufUn}x`
      const translation = texSignedPiTerm(b)
      const expression = `${a.texFractionSaufUn}\\${fonction}\\left(${coefficientX}${translation}\\right)`
      const coefficientMultiplicateurColore = miseEnCouleur(
        a.texFraction,
        bleuMathalea,
      )
      const expressionCoefficientColore = `${a.texFractionSaufUn === '' ? '' : miseEnCouleur(a.texFractionSaufUn, bleuMathalea)}\\${fonction}\\left(${coefficientX}${translation}\\right)`

      let texte = `On considère la fonction $f$ définie par $f(x)=${expression}$.<br>`
      texte +=
        "Déterminer l'ensemble $S$ des zéros de $f$ sous la forme $S=\\left\\{\\ldots\\mid k\\in\\mathbb{Z}\\right\\}$."

      if (this.interactif) {
        texte += '<br>'
        texte += ajouteChampTexteMathLive(
          this,
          i,
          KeyboardType.lyceeClassique,
          {
            texteAvant: '$S=\\left\\{\\right.$',
            texteApres: '$\\left.\\mid k\\in\\mathbb{Z}\\right\\}$',
          },
        )
      }

      const secondMembre =
        fonction === 'cos' ? '\\dfrac{\\pi}{2}+k\\pi' : 'k\\pi'
      const secondMembreIsole = texProgression(
        secondMembreIsoleFraction,
        new FractionEtendue(1, 1),
      )
      const inverseCoefficientX = coefficientXFraction.inverse().simplifie()
      const lignesResolution = [
        `${coefficientX}${translation}&=${secondMembre}`,
      ]

      if (translation !== '')
        lignesResolution.push(`${coefficientX}&=${secondMembreIsole}`)

      lignesResolution.push(
        `x&=\\left(${secondMembreIsole}\\right)\\times ${inverseCoefficientX.texFSP}`,
        `x&=${miseEnEvidence(answer)}`,
      )

      const resolution = `\\begin{aligned}
${lignesResolution.join('\\\\[0.35em]\n')}
\\end{aligned}`

      let texteCorr = ``
      if (fonction === 'tan') {
        texteCorr += `On a que $\\tan(x)=0$ si et seulement si $x= k\\pi$ avec $k\\in\\mathbb{Z}$.<br>`
      } else if (fonction === 'cos') {
        texteCorr += `On a que $\\cos(x)=0$ si et seulement si $x= \\dfrac{\\pi}{2}+k\\pi$ avec $k\\in\\mathbb{Z}$.<br>`
      } else {
        texteCorr += `On a que $\\sin(x)=0$ si et seulement si $x= k\\pi$ avec $k\\in\\mathbb{Z}$.<br>`
      }
      texteCorr += `
      On réécrit d'abord l'expression en mettant en évidence le coefficient multiplicateur :
\\[f(x)=${expressionCoefficientColore}.\\]
Le coefficient $${coefficientMultiplicateurColore}$ est non nul, donc il ne change pas les zéros de $f$.<br>
On résout donc l'équation. On simplifie le second membre avant de multiplier par l'inverse du coefficient de $x$ :
\\[${resolution}\\]
Ainsi, $S=\\left\\{${miseEnEvidence(answer)}\\mid k\\in\\mathbb{Z}\\right\\}$.<br>
Plusieurs écritures peuvent décrire le même ensemble de solutions.`

      handleAnswers(this, i, {
        reponse: {
          value: answer,
          compare: all([
            sameIntegerProgressionSet({
              variable: 'k',
              allowMultipleExpressions: true,
            }),
          ]),
        },
      })

      if (this.questionJamaisPosee(i, fonction, m.num, m.den, b.num, b.den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
