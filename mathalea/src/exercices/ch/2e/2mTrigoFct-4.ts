import { bleuMathalea } from '../../../lib/colors'
import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { all, isEqual, isReduced } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
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

export const titre = "Déterminer des paramètres d'une fonction trigonométrique"
export const dateDePublication = '06/05/2026'
export const uuid = 'f9e41'
export const interactifReady = true
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-4'],
}

type TrigFunctionName = 'sin' | 'cos' | 'tan'
type ChampId = 'periode' | 'frequence' | 'amplitude' | 'dephasage' | 'axe'

interface QuestionData {
  periode: string
  frequence: string
  amplitude: string
  dephasage: string
  axe: string
}

const compareReduced = all([isEqual(), isReduced()])

function texPositivePiCoefficient(coefficient: FractionEtendue): string {
  const fraction = coefficient.simplifie()
  if (fraction.denIrred === 1) {
    if (fraction.numIrred === 1) return '\\pi'
    return `${fraction.numIrred}\\pi`
  }
  return `\\dfrac{${fraction.numIrred === 1 ? '' : fraction.numIrred}\\pi}{${fraction.denIrred}}`
}

function texInversePiCoefficient(coefficient: FractionEtendue): string {
  const fraction = coefficient.simplifie()
  if (fraction.denIrred === 1) {
    return fraction.numIrred === 1
      ? '\\dfrac{1}{\\pi}'
      : `\\dfrac{${fraction.numIrred}}{\\pi}`
  }
  return `\\dfrac{${fraction.numIrred}}{${fraction.denIrred}\\pi}`
}

function texSignedRationalTerm(coefficient: FractionEtendue): string {
  const fraction = coefficient.simplifie()
  if (fraction.s === 0) return ''
  return fraction.texFractionSignee
}

function randomFraction(values: FractionData[]): FractionData {
  return choice(values)
}

function selectedChamps(saisie: unknown): ChampId[] {
  const champs: ChampId[] = [
    'periode',
    'frequence',
    'amplitude',
    'dephasage',
    'axe',
  ]
  if (typeof saisie !== 'string') return champs
  const indices = saisie
    .split('-')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 5)
  if (indices.length === 0) return champs
  return [...new Set(indices.map((index) => champs[index - 1]))]
}

function champsForFunction(
  champs: ChampId[],
  fonction: TrigFunctionName,
): ChampId[] {
  if (fonction !== 'tan') return champs
  const champsSansAmplitude = champs.filter((champ) => champ !== 'amplitude')
  return champsSansAmplitude.length > 0 ? champsSansAmplitude : ['periode']
}

function champTemplate(champ: ChampId): string {
  if (champ === 'periode') return 'Période $T=$ %{periode}'
  if (champ === 'frequence') return 'Fréquence $\\nu=$ %{frequence}'
  if (champ === 'amplitude') return 'Amplitude $A=$ %{amplitude}'
  if (champ === 'dephasage') return 'Déphasage $h=$ %{dephasage}'
  return "Axe d'oscillation $y=$ %{axe}"
}

function texArgumentAvecDephasage(
  coefficient: string,
  dephasageFraction: FractionEtendue,
): string {
  if (dephasageFraction.s === 0) return `${coefficient}\\left(x\\right)`
  const dephasageAbs = texPiCoefficientFraction(
    dephasageFraction.valeurAbsolue(),
  )
  const signe = dephasageFraction.s < 0 ? '+' : '-'
  return `${coefficient}\\left(x${signe}${dephasageAbs}\\right)`
}

/**
 * Déterminer la période et la fréquence d'une fonction trigonométrique.
 * @author Nathan Scheinmann
 */
export default class PeriodeFrequenceFonctionTrigonometrique extends Exercice {
  private champsDemandes: ChampId[] = ['periode', 'frequence']

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
    this.besoinFormulaire2Texte = [
      'Paramètres demandés',
      [
        'Nombres séparés par des tirets :',
        '1 : Période',
        '2 : Fréquence',
        '3 : Amplitude',
        '4 : Déphasage',
        "5 : Axe d'oscillation",
      ].join('\n'),
    ]
    this.sup = '4'
    this.sup2 = '1-2-3-4-5'
  }

  nouvelleVersion() {
    this.champsDemandes = selectedChamps(this.sup2)
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
    ]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const fonction = fonctions[i]
      const champsQuestion = champsForFunction(this.champsDemandes, fonction)
      const a = new FractionEtendue(
        randint(-5, 5, 0),
        randint(1, 4),
      ).simplifie()
      const m = randomFraction(coefficientsX)
      const b = randomFraction(translations)
      const axeFraction = new FractionEtendue(
        randint(-4, 4),
        randint(1, 2),
      ).simplifie()
      const coefficientXFraction = new FractionEtendue(m.num, m.den)
      const translationFraction = new FractionEtendue(b.num, b.den)
      const coefficient = coefficientXFraction.texFSD
      const coefficientX = `${coefficientXFraction.texFractionSaufUn}x`
      const facteurCompressionColore = miseEnCouleur(
        coefficientXFraction.valeurAbsolue().texFraction,
        bleuMathalea,
      )
      const translation = texSignedPiTerm(b)
      const axeTerme = texSignedRationalTerm(axeFraction)
      const expression = `${a.texFractionSaufUn}\\${fonction}\\left(${coefficientX}${translation}\\right)${axeTerme}`
      const expressionAmplitudeColoree = `${miseEnCouleur(a.texFractionSaufUn === '' ? '1' : a.texFractionSaufUn, bleuMathalea)}\\${fonction}\\left(${coefficientX}${translation}\\right)${axeTerme}`
      const expressionAxeColore = `${a.texFractionSaufUn}\\${fonction}\\left(${coefficientX}${translation}\\right)${miseEnCouleur(axeTerme === '' ? '+0' : axeTerme, bleuMathalea)}`
      const basePeriodCoefficient = fonction === 'tan' ? 1 : 2
      const periodeFraction = new FractionEtendue(
        basePeriodCoefficient * m.den,
        Math.abs(m.num),
      ).simplifie()
      const frequenceFraction = new FractionEtendue(
        Math.abs(m.num),
        basePeriodCoefficient * m.den,
      ).simplifie()
      const periode = texPositivePiCoefficient(periodeFraction)
      const frequence = texInversePiCoefficient(frequenceFraction)
      const amplitude = a.valeurAbsolue().texFraction
      const dephasageFraction = translationFraction
        .oppose()
        .diviseFraction(coefficientXFraction)
      const dephasage = texPiCoefficientFraction(dephasageFraction)
      const axe = axeFraction.texFraction
      const periodeReference = fonction === 'tan' ? '\\pi' : '2\\pi'

      let texte = `On considère la fonction $f$ définie par $f(x)=${expression}$.<br>`
      texte += 'Déterminer les paramètres demandés.'

      const dataOptions: Record<
        string,
        {
          keyboard: (typeof KeyboardType)[keyof typeof KeyboardType]
          minWidth?: number
          ldots?: boolean
        }
      > = {
        periode: {
          keyboard: KeyboardType.grecTrigo,
          minWidth: 100,
          ldots: true,
        },
        frequence: {
          keyboard: KeyboardType.grecTrigo,
          minWidth: 100,
          ldots: true,
        },
        amplitude: {
          keyboard: KeyboardType.lycee,
          minWidth: 80,
          ldots: true,
        },
        dephasage: {
          keyboard: KeyboardType.grecTrigo,
          minWidth: 100,
          ldots: true,
        },
        axe: {
          keyboard: KeyboardType.lycee,
          minWidth: 80,
          ldots: true,
        },
      }
      texte +=
        '<br><br>' +
        addMultiMathfield(this, i, {
          dataTemplate: champsQuestion.map(champTemplate).join(' '),
          dataOptions,
        })

      const reponses: QuestionData = {
        periode,
        frequence,
        amplitude,
        dephasage,
        axe,
      }
      handleAnswers(
        this,
        i,
        Object.fromEntries(
          champsQuestion.map((champ) => [
            champ,
            {
              value: reponses[champ],
              compare: compareReduced,
            },
          ]),
        ),
        { formatInteractif: 'multi-mathfield' },
      )

      const correction: string[] = []
      if (
        champsQuestion.includes('periode') ||
        champsQuestion.includes('frequence')
      ) {
        correction.push(
          `Pour la fonction $\\${fonction}$, la période de référence est $${periodeReference}$. ` +
            `La nouvelle période est la période de référence divisée par le facteur de compression, c'est-à-dire la valeur absolue du nombre qui multiplie $x$. ` +
            `La translation dans l'argument, le coefficient multiplicateur placé devant la fonction et l'axe d'oscillation ne changent pas cette période. ` +
            `Ici, le facteur de compression est $${facteurCompressionColore}$ :` +
            `\\[T=\\dfrac{${periodeReference}}{\\left|${coefficientXFraction.texFractionSaufUn}\\right|}=${miseEnEvidence(periode)}.\\]`,
        )
      }
      if (champsQuestion.includes('frequence')) {
        correction.push(
          `La fréquence est l'inverse de la période :` +
            `\\[\\nu=\\dfrac{1}{T}=${miseEnEvidence(frequence)}.\\]`,
        )
      }
      if (champsQuestion.includes('amplitude')) {
        correction.push(
          `On met en évidence le coefficient multiplicateur placé devant la fonction trigonométrique :` +
            `\\[f(x)=${expressionAmplitudeColoree}.\\]` +
            `L'amplitude est sa valeur absolue : $A=\\left|${a.texFraction}\\right|=${miseEnEvidence(amplitude)}$.`,
        )
      }
      if (champsQuestion.includes('dephasage')) {
        correction.push(
          `On écrit l'argument sous la forme $${coefficient}\\left(x-h\\right)$ :` +
            `\\[${coefficientX}${translation}=${texArgumentAvecDephasage(coefficient, dephasageFraction)}.\\]` +
            `Le déphasage est donc $h=${miseEnEvidence(dephasage)}$.`,
        )
      }
      if (champsQuestion.includes('axe')) {
        correction.push(
          `L'axe d'oscillation est donné par le terme ajouté à la fonction trigonométrique :` +
            `\\[f(x)=${expressionAxeColore}.\\]` +
            `On obtient donc l'axe $y=${miseEnEvidence(axe)}$.`,
        )
      }
      const texteCorr = correction.join('<br>')

      if (
        this.questionJamaisPosee(
          i,
          fonction,
          m.num,
          m.den,
          b.num,
          b.den,
          axeFraction.numIrred,
          axeFraction.denIrred,
          champsQuestion.join('-'),
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
