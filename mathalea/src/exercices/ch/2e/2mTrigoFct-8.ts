import { Courbe } from '../../../lib/2d/Courbe'
import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { repere } from '../../../lib/2d/reperes'
import { bleuMathalea } from '../../../lib/colors'
import { addMultiMathfield } from '../../../lib/customElements/MultiMathfield'
import { all, isEqual, isReduced } from '../../../lib/interactif/checks'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { texPiFraction, type FractionData } from '../../../lib/mathFonctions/trigo'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer l'expression d'une fonction trigonométrique à partir de sa représentation graphique"
export const dateDePublication = '06/05/2026'
export const uuid = 'f9e42'
export const interactifReady = true
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mTrigoFct-8'],
}

type FormeTrigo = 'sin' | 'cos'
type ParametreVariable = 'periode' | 'amplitude' | 'dephasage' | 'axe'

const compareReduced = all([isEqual(), isReduced()])
const compareReducedFunction = all([
  isEqual({
    comparisonOptions: { fonction: true, variable: 'x', domaine: [-6, 6] },
  }),
])

function texFacteurAmplitude(coefficient: FractionEtendue): string {
  if (coefficient.isEqual(1)) return ''
  if (coefficient.isEqual(-1)) return '-'
  return coefficient.texFractionSaufUn
}

function texSignedRationalTerm(coefficient: FractionEtendue): string {
  const fraction = coefficient.simplifie()
  if (fraction.s === 0) return ''
  return fraction.texFractionSignee
}

function texArgument(
  pulsation: string,
  dephasageFraction: FractionEtendue,
): string {
  if (dephasageFraction.s === 0) return `${pulsation}x`
  const dephasageAbs = texPiFraction(dephasageFraction.valeurAbsolue())
  const signe = dephasageFraction.s < 0 ? '+' : '-'
  if (pulsation === '') return `x${signe}${dephasageAbs}`
  return `${pulsation}\\left(x${signe}${dephasageAbs}\\right)`
}

function texReducedArgument(
  pulsationFraction: FractionEtendue,
  dephasageFraction: FractionEtendue,
): string {
  const coefficientX = `${pulsationFraction.texFractionSaufUn}x`
  const constant = pulsationFraction
    .produitFraction(dephasageFraction)
    .oppose()
    .simplifie()

  if (constant.s === 0) return coefficientX
  return `${coefficientX}${constant.s > 0 ? '+' : ''}${texPiFraction(constant)}`
}

function texExpression({
  forme,
  coefficientAmplitude,
  argument,
  axe,
}: {
  forme: FormeTrigo
  coefficientAmplitude: FractionEtendue
  argument: string
  axe: FractionEtendue
}): string {
  return `${texFacteurAmplitude(coefficientAmplitude)}\\${forme}\\left(${argument}\\right)${texSignedRationalTerm(axe)}`
}

function selectedParametres(saisie: unknown): ParametreVariable[] {
  const parametres: ParametreVariable[] = [
    'periode',
    'amplitude',
    'dephasage',
    'axe',
  ]
  if (typeof saisie !== 'string') return ['periode', 'amplitude']
  const indices = saisie
    .split('-')
    .map((value) => Number.parseInt(value, 10))
    .filter((value) => Number.isInteger(value) && value >= 1 && value <= 5)
  if (indices.length === 0) return ['periode', 'amplitude']
  if (indices.includes(5)) return parametres
  return [...new Set(indices.map((index) => parametres[index - 1]))]
}

function isVariable(
  parametres: ParametreVariable[],
  parametre: ParametreVariable,
): boolean {
  return parametres.includes(parametre)
}

function xLabels() {
  return [
    { valeur: -3 * Math.PI, texte: '-3\\pi' },
    { valeur: (-5 * Math.PI) / 2, texte: '-\\dfrac{5\\pi}{2}' },
    { valeur: -2 * Math.PI, texte: '-2\\pi' },
    { valeur: (-3 * Math.PI) / 2, texte: '-\\dfrac{3\\pi}{2}' },
    { valeur: -Math.PI, texte: '-\\pi' },
    { valeur: -Math.PI / 2, texte: '-\\dfrac{\\pi}{2}' },
    { valeur: 0, texte: '0' },
    { valeur: Math.PI / 2, texte: '\\dfrac{\\pi}{2}' },
    { valeur: Math.PI, texte: '\\pi' },
    { valeur: (3 * Math.PI) / 2, texte: '\\dfrac{3\\pi}{2}' },
    { valeur: 2 * Math.PI, texte: '2\\pi' },
    { valeur: (5 * Math.PI) / 2, texte: '\\dfrac{5\\pi}{2}' },
    { valeur: 3 * Math.PI, texte: '3\\pi' },
  ]
}

function xThicks() {
  return Array.from({ length: 13 }, (_, index) => ((index - 6) * Math.PI) / 2)
}

/**
 * Déterminer l'expression d'une fonction trigonométrique à partir de sa représentation graphique.
 * @author Nathan Scheinmann
 */
export default class ExpressionDepuisGraphiqueTrigonometrique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      'Forme demandée',
      [
        'Nombres séparés par des tirets :',
        '1 : Avec sinus',
        '2 : Avec cosinus',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      'Paramètres variables',
      [
        'Nombres séparés par des tirets :',
        '1 : Période',
        '2 : Amplitude',
        '3 : Déphasage',
        "4 : Axe d'oscillation",
        '5 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
    this.sup2 = '1-2'
  }

  nouvelleVersion() {
    const formes = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: ['sin', 'cos'],
      nbQuestions: this.nbQuestions,
      shuffle: true,
    }) as FormeTrigo[]
    const parametresVariables = selectedParametres(this.sup2)
    const pulsations: FractionData[] = [
      { num: 2, den: 3 },
      { num: 1, den: 1 },
      { num: 2, den: 1 },
      { num: 4, den: 1 },
    ]
    const dephasages = [new FractionEtendue(-1, 2), new FractionEtendue(1, 2)]

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      const forme = formes[i]
      const pulsationData = isVariable(parametresVariables, 'periode')
        ? choice(pulsations)
        : { num: 1, den: 1 }
      const pulsationFraction = new FractionEtendue(
        pulsationData.num,
        pulsationData.den,
      )
      const pulsation = pulsationFraction.texFractionSaufUn
      const coefficientAmplitude = isVariable(parametresVariables, 'amplitude')
        ? new FractionEtendue(choice([2, 3]), 1)
        : new FractionEtendue(1, 1)
      const amplitude = coefficientAmplitude.valeurAbsolue()
      const dephasage = isVariable(parametresVariables, 'dephasage')
        ? choice(dephasages)
        : new FractionEtendue(0, 1)
      const axe = isVariable(parametresVariables, 'axe')
        ? new FractionEtendue(randint(-3, 3, 0), 1)
        : new FractionEtendue(0, 1)
      const expression = texExpression({
        forme,
        coefficientAmplitude,
        argument: texArgument(pulsation, dephasage),
        axe,
      })
      const reducedExpression = texExpression({
        forme,
        coefficientAmplitude,
        argument: texReducedArgument(pulsationFraction, dephasage),
        axe,
      })
      const b = pulsationFraction.valeurDecimale
      const a = coefficientAmplitude.valeurDecimale
      const h = dephasage.valeurDecimale * Math.PI
      const d = axe.valeurDecimale
      const f =
        forme === 'sin'
          ? (x: number) => a * Math.sin(b * (x - h)) + d
          : (x: number) => a * Math.cos(b * (x - h)) + d
      const yMin = Math.floor(d - amplitude.valeurDecimale - 1)
      const yMax = Math.ceil(d + amplitude.valeurDecimale + 1)
      const periode = new FractionEtendue(
        2 * pulsationData.den,
        pulsationData.num,
      ).simplifie()
      const periodeTex = texPiFraction(periode)
      const dephasageTex = texPiFraction(dephasage)

      const r = repere({
        xMin: -3 * Math.PI,
        xMax: 3 * Math.PI,
        yMin,
        yMax,
        xThickListe: xThicks(),
        xLabelListe: xLabels(),
        yThickDistance: 1,
        yLabelDistance: 1,
        grilleXDistance: Math.PI / 2,
        grilleYDistance: 1,
        grilleSecondaire: true,
        grilleSecondaireXDistance: Math.PI / 4,
        grilleSecondaireYDistance: 0.5,
        xLabelEcart: 0.8,
        yLabelEcart: 0.5,
      })
      const courbe = new Courbe(f, {
        repere: r,
        step: 0.03,
        xMin: -3 * Math.PI,
        xMax: 3 * Math.PI,
        yMin,
        yMax,
      })
      courbe.color = colorToLatexOrHTML(bleuMathalea)
      courbe.epaisseur = 2

      const formeTex =
        forme === 'sin'
          ? 'a\\sin\\!\\left(b(x-h)\\right)+d'
          : 'a\\cos\\!\\left(b(x-h)\\right)+d'
      let texte =
        `La courbe ci-dessous représente une fonction trigonométrique $f$.<br>` +
        `Écrire l'expression de $f$ sous la forme $f(x)=${formeTex}$.<br><br>`
      texte += mathalea2d(
        {
          xmin: -3 * Math.PI - 0.6,
          xmax: 3 * Math.PI + 0.6,
          ymin: yMin - 0.4,
          ymax: yMax + 0.4,
          scale: 0.58,
        },
        r,
        courbe,
      )
      texte +=
        ' ' +
        addMultiMathfield(this, i, {
          dataTemplate: [
            "Axe d'oscillation $y=$ %{champ1}",
            'Amplitude $A=$ %{champ2}',
            'Période $T=$ %{champ3}',
            'Déphasage $h=$ %{champ4}',
            '$f(x)=$ %{champ5}',
          ].join(' '),
          dataOptions: {
            champ1: {
              keyboard: KeyboardType.lycee,
              minWidth: 90,
              ldots: true,
            },
            champ2: {
              keyboard: KeyboardType.lycee,
              minWidth: 90,
              ldots: true,
            },
            champ3: {
              keyboard: KeyboardType.grecTrigo,
              minWidth: 120,
              ldots: true,
            },
            champ4: {
              keyboard: KeyboardType.grecTrigo,
              minWidth: 120,
              ldots: true,
            },
            champ5: {
              keyboard: KeyboardType.grecTrigo,
              minWidth: 220,
              ldots: true,
            },
          },
        })

      const maximum = axe.sommeFraction(amplitude).simplifie()
      const minimum = axe.differenceFraction(amplitude).simplifie()
      const sommeExtremaTex = `${maximum.texFraction}${texSignedRationalTerm(minimum)}`
      const differenceExtremaTex = `${maximum.texFraction}${texSignedRationalTerm(minimum.oppose())}`
      const lectureDephasage =
        forme === 'sin'
          ? `Pour une forme en sinus avec $a>0$, le déphasage $h$ est l'abscisse du passage par l'axe d'oscillation où la courbe est montante. On lit donc $h=${miseEnEvidence(dephasageTex)}$.<br>`
          : `Pour une forme en cosinus avec $a>0$, le déphasage $h$ est l'abscisse d'un maximum. On lit donc $h=${miseEnEvidence(dephasageTex)}$.<br>`
      const texteCorr =
        `On lit $y_{\\min}=${minimum.texFraction}$ et $y_{\\max}=${maximum.texFraction}$. L'axe d'oscillation est la droite horizontale située à mi-hauteur entre ces deux valeurs : $y=\\dfrac{y_{\\max}+y_{\\min}}{2}=\\dfrac{${sommeExtremaTex}}{2}=${miseEnEvidence(axe.texFraction)}$, donc $d=${axe.texFraction}$.<br>` +
        `L'amplitude est la distance verticale entre l'axe d'oscillation et un extremum, ou encore $A=\\dfrac{y_{\\max}-y_{\\min}}{2}=\\dfrac{${differenceExtremaTex}}{2}=${miseEnEvidence(amplitude.texFraction)}$, donc $a=${coefficientAmplitude.texFraction}$.<br>` +
        `Pour lire la période, on mesure l'écart horizontal entre deux points homologues consécutifs de la courbe, par exemple deux maximums. On obtient $T=${miseEnEvidence(periodeTex)}$, donc $b=\\dfrac{2\\pi}{T}=${pulsationFraction.texFraction}$.<br>` +
        lectureDephasage +
        `On obtient ainsi :\\[f(x)=${miseEnEvidence(expression)}${expression === reducedExpression ? '' : `=${reducedExpression}`}.\\]`

      handleAnswers(
        this,
        i,
        {
          champ1: {
            value: axe.texFraction,
            compare: compareReduced,
          },
          champ2: {
            value: amplitude.texFraction,
            compare: compareReduced,
          },
          champ3: {
            value: periodeTex,
            compare: compareReduced,
          },
          champ4: {
            value: dephasageTex,
            compare: compareReduced,
          },
          champ5: {
            value: expression,
            compare: compareReducedFunction,
          },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      if (
        this.questionJamaisPosee(
          i,
          forme,
          pulsationData.num,
          pulsationData.den,
          coefficientAmplitude.numIrred,
          dephasage.numIrred,
          dephasage.denIrred,
          axe.numIrred,
          axe.denIrred,
          parametresVariables.join('-'),
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
