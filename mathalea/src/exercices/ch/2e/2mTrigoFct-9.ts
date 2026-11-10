import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { all, isEqual, isReduced } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import {
    texSignedPiTerm,
    type FractionData,
} from '../../../lib/mathFonctions/trigo'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer le minimum et le maximum d'une fonction trigonométrique"
export const dateDePublication = '18/05/2026'
export const uuid = 'f9e43'
export const interactifReady = true
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-9'],
}

type TrigFunctionName = 'sin' | 'cos'
type ChampId = 'minimum' | 'maximum'

const compareReducedAllowingReducibleFractions = all([
  isEqual(),
  isReduced({ allowReducibleFractions: true }),
])

function randomFraction(values: FractionData[]): FractionData {
  return choice(values)
}

function texSignedRationalTerm(coefficient: FractionEtendue): string {
  const fraction = coefficient.simplifie()
  if (fraction.s === 0) return ''
  return fraction.texFractionSignee
}

function champTemplate(champ: ChampId): string {
  if (champ === 'minimum') return 'Minimum $m=$ %{minimum}'
  return 'Maximum $M=$ %{maximum}'
}

/**
 * Déterminer le minimum et le maximum d'une fonction trigonométrique.
 * @author Nathan Scheinmann
 */
export default class MinMaxFonctionTrigonometrique extends Exercice {
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
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
  }

  nouvelleVersion() {
    const fonctions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['sin', 'cos'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }) as TrigFunctionName[]
    const amplitudes: FractionData[] = [
      { num: 1, den: 2 },
      { num: -1, den: 2 },
      { num: 3, den: 2 },
      { num: -3, den: 2 },
      { num: 5, den: 2 },
      { num: -5, den: 2 },
      { num: 1, den: 3 },
      { num: -1, den: 3 },
      { num: 2, den: 3 },
      { num: -2, den: 3 },
      { num: 4, den: 3 },
      { num: -4, den: 3 },
      { num: 5, den: 3 },
      { num: -5, den: 3 },
      { num: 1, den: 4 },
      { num: -1, den: 4 },
      { num: 3, den: 4 },
      { num: -3, den: 4 },
      { num: 5, den: 4 },
      { num: -5, den: 4 },
      { num: 7, den: 4 },
      { num: -7, den: 4 },
      { num: 2, den: 5 },
      { num: -2, den: 5 },
      { num: 3, den: 5 },
      { num: -3, den: 5 },
      { num: 4, den: 5 },
      { num: -4, den: 5 },
      { num: 6, den: 5 },
      { num: -6, den: 5 },
      { num: 5, den: 6 },
      { num: -5, den: 6 },
      { num: 7, den: 6 },
      { num: -7, den: 6 },
      { num: 11, den: 6 },
      { num: -11, den: 6 },
      { num: 2, den: 1 },
      { num: -2, den: 1 },
      { num: 3, den: 1 },
      { num: -3, den: 1 },
      { num: 4, den: 1 },
      { num: -4, den: 1 },
      { num: 5, den: 1 },
      { num: -5, den: 1 },
    ]
    const coefficientsX: FractionData[] = [
      { num: 1, den: 2 },
      { num: 2, den: 3 },
      { num: 3, den: 2 },
      { num: 3, den: 4 },
      { num: 4, den: 5 },
      { num: 5, den: 4 },
      { num: 5, den: 6 },
      { num: 6, den: 5 },
      { num: -1, den: 2 },
      { num: -2, den: 3 },
      { num: -3, den: 2 },
      { num: -3, den: 4 },
      { num: -4, den: 5 },
      { num: -5, den: 4 },
      { num: -5, den: 6 },
      { num: -6, den: 5 },
      { num: 2, den: 1 },
      { num: -2, den: 1 },
      { num: 3, den: 1 },
      { num: -3, den: 1 },
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
      { num: 2, den: 3 },
      { num: -2, den: 3 },
      { num: 3, den: 4 },
      { num: -3, den: 4 },
      { num: 4, den: 5 },
      { num: -4, den: 5 },
      { num: 5, den: 6 },
      { num: -5, den: 6 },
    ]
    const axes: FractionData[] = [
      { num: -5, den: 1 },
      { num: -4, den: 1 },
      { num: -3, den: 1 },
      { num: -2, den: 1 },
      { num: -1, den: 1 },
      { num: 0, den: 1 },
      { num: 1, den: 1 },
      { num: 2, den: 1 },
      { num: 3, den: 1 },
      { num: 4, den: 1 },
      { num: 5, den: 1 },
      { num: -5, den: 2 },
      { num: -3, den: 2 },
      { num: -1, den: 2 },
      { num: 1, den: 2 },
      { num: 3, den: 2 },
      { num: 5, den: 2 },
      { num: -4, den: 3 },
      { num: -2, den: 3 },
      { num: -1, den: 3 },
      { num: 1, den: 3 },
      { num: 2, den: 3 },
      { num: 4, den: 3 },
      { num: -7, den: 4 },
      { num: -5, den: 4 },
      { num: -3, den: 4 },
      { num: -1, den: 4 },
      { num: 1, den: 4 },
      { num: 3, den: 4 },
      { num: 5, den: 4 },
      { num: 7, den: 4 },
      { num: -6, den: 5 },
      { num: -4, den: 5 },
      { num: -3, den: 5 },
      { num: -2, den: 5 },
      { num: -1, den: 5 },
      { num: 1, den: 5 },
      { num: 2, den: 5 },
      { num: 3, den: 5 },
      { num: 4, den: 5 },
      { num: 6, den: 5 },
      { num: -11, den: 6 },
      { num: -7, den: 6 },
      { num: -5, den: 6 },
      { num: -1, den: 6 },
      { num: 1, den: 6 },
      { num: 5, den: 6 },
      { num: 7, den: 6 },
      { num: 11, den: 6 },
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const fonction = fonctions[i]
      const amplitudeData = randomFraction(amplitudes)
      const coefficientAmplitude = new FractionEtendue(
        amplitudeData.num,
        amplitudeData.den,
      )
      const coefficientXData = randomFraction(coefficientsX)
      const translationData = randomFraction(translations)
      const axeData = randomFraction(axes)
      const axe = new FractionEtendue(axeData.num, axeData.den)
      const amplitude = coefficientAmplitude.valeurAbsolue().simplifie()
      const minimum = axe.differenceFraction(amplitude).simplifie()
      const maximum = axe.sommeFraction(amplitude).simplifie()
      const coefficientXFraction = new FractionEtendue(
        coefficientXData.num,
        coefficientXData.den,
      )
      const coefficientX = `${coefficientXFraction.texFractionSaufUn}x`
      const translation = texSignedPiTerm(translationData)
      const axeTerme = texSignedRationalTerm(axe)
      const expression = `${coefficientAmplitude.texFractionSaufUn}\\${fonction}\\left(${coefficientX}${translation}\\right)${axeTerme}`

      let texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${expression}$.<br>`
      texte += 'Déterminer la valeur minimale et la valeur maximale de $f$.'

      const dataOptions: Record<
        string,
        {
          keyboard: (typeof KeyboardType)[keyof typeof KeyboardType]
          minWidth?: number
          ldots?: boolean
        }
      > = {
        minimum: {
          keyboard: KeyboardType.lycee,
          minWidth: 80,
          ldots: true,
        },
        maximum: {
          keyboard: KeyboardType.lycee,
          minWidth: 80,
          ldots: true,
        },
      }
      texte +=
        '<br><br>' +
        addMultiMathfield(this, i, {
          dataTemplate: (['minimum', 'maximum'] as ChampId[])
            .map(champTemplate)
            .join(' '),
          dataOptions,
        })

      handleAnswers(
        this,
        i,
        Object.fromEntries(
          (['minimum', 'maximum'] as ChampId[]).map((champ) => [
            champ,
            {
              value:
                champ === 'minimum' ? minimum.texFraction : maximum.texFraction,
              compare: compareReducedAllowingReducibleFractions,
            },
          ]),
        ),
        { formatInteractif: 'multi-mathfield' },
      )

      const texteCorr =
        `Pour tout réel $x$, on a $-1\\leqslant \\${fonction}\\left(${coefficientX}${translation}\\right)\\leqslant 1$. ` +
        `Donc le terme $${coefficientAmplitude.texFractionSaufUn}\\${fonction}\\left(${coefficientX}${translation}\\right)$ varie entre ` +
        `$-${amplitude.texFraction}$ et $${amplitude.texFraction}$, car son amplitude vaut ` +
        `$\\left|${coefficientAmplitude.texFraction}\\right|=${amplitude.texFraction}$.<br>` +
        `En ajoutant $${axe.texFraction}$, on obtient :` +
        `\\[${axe.texFraction}-${amplitude.texFraction}\\leqslant f(x)\\leqslant ${axe.texFraction}+${amplitude.texFraction}.\\]` +
        `Ainsi, la valeur minimale de $f$ est $${miseEnEvidence(minimum.texFraction)}$ et sa valeur maximale est $${miseEnEvidence(maximum.texFraction)}$.`

      if (
        this.questionJamaisPosee(
          i,
          fonction,
          amplitudeData.num,
          amplitudeData.den,
          coefficientXData.num,
          coefficientXData.den,
          translationData.num,
          translationData.den,
          axeData.num,
          axeData.den,
        )
      ) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
