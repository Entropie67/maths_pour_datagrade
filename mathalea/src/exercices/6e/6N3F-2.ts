import Figure from 'apigeom'
import type { MathfieldElement } from 'mathlive'
import { createApigeomFigureHtml } from '../../lib/apigeom/apigeom-figure'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { generateCleaner } from '../../lib/interactif/cleaners'
import ce from '../../lib/interactif/comparisonFunctions'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Décomposer une fraction (partie entière + fraction inférieure à $1$) puis donner l'écriture décimale"
export const interactifReady = true
export const dateDeModifImportante = '29/03/2026'

/**
 * Décomposer une fraction (partie entière + fraction inférieure à 1) puis donner l'écriture décimale.
 * @author Rémi Angot
 */
export const uuid = 'ab44e'

export const refs = {
  'fr-fr': ['6N3F-2', '3AutoN06'],
  'fr-2016': ['6N20-2'],
  'fr-ch': ['9R1NO4F-8', '9R2NO4F-8', '9R3NO4F-8'],
}

export default class ExerciceFractionsDifferentesEcritures extends Exercice {
  reponsesAttendues: {
    entier: number
    numPartieDecimale: number
    den: number
    ecritureDecimale: string
  }[] = []

  constructor() {
    super()
    this.consigne =
      "Écrire sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$ puis donner l'écriture décimale."
    this.spacing = 2
    this.spacingCorr = 2
    this.sup = '2-4-4-5-5-5-8-8-10-10-10-10'
    this.sup2 = true

    this.besoinFormulaireTexte = [
      'Dénominateurs à choisir',
      'Nombres séparés par des tirets :\n2: demis\n4: quarts\n5: cinquièmes\n8: huitièmes\n10: dixièmes\n11: Mélange',
    ]
    this.exoCustomResultat = true // Permet de mettre chaque question sur 2 points
    this.besoinFormulaire2CaseACocher = ['Brouillon interactif']
    this.besoinFormulaire3CaseACocher = [
      'Avec la valeur décimale à la fin',
      true,
    ]
    this.sup3 = true
  }

  nouvelleVersion(): void {
    const listeDenominateurs = gestionnaireFormulaireTexte({
      saisie: this.sup as string,
      min: 2,
      max: 10,
      defaut: 11,
      melange: 11,
      nbQuestions: this.nbQuestions,
      exclus: [3, 6, 7, 9],
    }) as number[]
    this.consigne = this.sup3
      ? "Écrire sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$ puis donner l'écriture décimale."
      : "Écrire sous la forme de la somme d'un nombre entier et d'une fraction inférieure à $1$."

    if (this.sup2 && context.isHtml) {
      const figure = new Figure({
        xMin: -0.5,
        yMin: -2,
        width: 800,
        height: 120,
      })
      figure.options.automaticUserMessage = false
      figure.options.color = bleuMathalea
      figure.create('RectangleFractionDiagram', {
        denominator: 2,
        numberOfRectangles: 5,
      })
      this.introduction = createApigeomFigureHtml(figure, {
        numeroExercice: this.numeroExercice,
      })
    } else {
      this.introduction = ''
    }

    const fractions: [number, number, string][] = []
    const nbDenominateursDifferents: number = new Set(listeDenominateurs).size
    const aleaMax = Math.ceil(this.nbQuestions / nbDenominateursDifferents)
    const fractionsUsed: { [id: number]: number[] } = {}
    for (let i = 0; i < this.nbQuestions; i++) {
      const b: number = listeDenominateurs[i]
      if (!fractionsUsed[b])
        fractionsUsed[b] = shuffle(
          Array.from({ length: b - 1 }, (_, i) => i + 1),
        ) // tous les numérateurs possibles...
      const num: number = fractionsUsed[b].pop() ?? 1 // choisi un numérateur au hasard
      let partieDecimale: string = ((num * 1000) / b).toString() // avec les 8e on a 3 chiffres, avec les 4 2...
      partieDecimale = ',' + (partieDecimale.match(/[1-9]+/g)?.[0] ?? '')
      fractions.push([num, b, partieDecimale])
    }
    shuffle(fractions)
    for (
      let i = 0,
        cpt = 0,
        num: number,
        ecriDec: string,
        den: number,
        numPartieFrac: number,
        entier: number,
        texte: string,
        texteCorr: string;
      i < this.nbQuestions && cpt < 100;
      cpt++
    ) {
      numPartieFrac = fractions[i][0]
      den = fractions[i][1]
      entier = randint(1, aleaMax)
      num = entier * den + numPartieFrac
      ecriDec = entier.toString() + fractions[i][2]
      const frac = new FractionEtendue(num, den)
      const partieFrac = new FractionEtendue(numPartieFrac, den)

      texte =
        '$ ' +
        frac.texFraction +
        ' = \\phantom{00}\\ldots\\ldots\\ldots\\phantom{00} + ' +
        '\\dfrac{\\phantom{00}\\ldots\\ldots\\ldots\\phantom{00}}{\\phantom{00}\\ldots\\ldots\\ldots\\phantom{00}}' +
        (this.sup3 ? ' = \\phantom{00}\\ldots\\ldots\\ldots\\phantom{00}  $' : '$')
      texteCorr =
        '$ ' +
        frac.texFraction +
        ' = ' +
        miseEnEvidence(entier) +
        '+' +
        texFractionFromString(
          miseEnEvidence(partieFrac.num),
          miseEnEvidence(partieFrac.den),
        ) +
        ' = ' +
        miseEnEvidence(ecriDec) +
        ' $'
      this.reponsesAttendues[i] = {
        entier,
        numPartieDecimale: numPartieFrac,
        den,
        ecritureDecimale: ecriDec.replace(',', '.'),
      }

      if (this.interactif) {
        texte = this.sup3
          ? remplisLesBlancs(
              this,
              i,
              `${frac.texFraction} =~%{n} + \\dfrac{%{num}}{%{den}} =~%{ecritureDecimale}`,
              KeyboardType.clavierNumbers,
            )
          : remplisLesBlancs(
              this,
              i,
              `${frac.texFraction} =~%{n} + \\dfrac{%{num}}{%{den}}`,
              KeyboardType.clavierNumbers,
            )
      }
      if (this.questionJamaisPosee(i, num, den)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
    }
    listeQuestionsToContenu(this) // Espacement de 2 em entre chaque question.
  }

  correctionInteractive = (i?: number) => {
    if (i === undefined) return ''
    if (this.answers === undefined) this.answers = {}
    const result: ('OK' | 'KO')[] = []
    const mf = document.querySelector(
      `#champTexteEx${this.numeroExercice}Q${i}`,
    ) as MathfieldElement
    if (mf === null) return ''
    const { entier, numPartieDecimale, den, ecritureDecimale } =
      this.reponsesAttendues[i]
    this.answers[`Ex${this.numeroExercice}Q${i}`] = mf.getValue()
    const spanResultat = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const clean = generateCleaner(['virgules'])
    const nSaisi = Number(clean(mf.getPromptValue('n')))
    const test1 = nSaisi === entier
    const numSaisi = Number(clean(mf.getPromptValue('num')))
    const denSaisi = Number(clean(mf.getPromptValue('den')))
    const valeurDecimale = this.sup3
      ? clean(mf.getPromptValue('ecritureDecimale'))
      : null

    const test2 =
      denSaisi !== 0 &&
      Number.isInteger(denSaisi) &&
      Number.isInteger(numSaisi) &&
      new FractionEtendue(numPartieDecimale, den).isEqual(
        new FractionEtendue(numSaisi, denSaisi),
      )

    const test3 = this.sup3
      ? ce
          .parse(String(valeurDecimale))
          .isEqual(ce.parse(`${clean(ecritureDecimale)}`))
      : true
    let feedback: string
    if (test1 && test2 && test3) {
      spanResultat.innerHTML = '😎'
    } else {
      spanResultat.innerHTML = '☹️'
    }
    if (!test1) {
      mf.setPromptState('n', 'incorrect', true)
    } else {
      mf.setPromptState('n', 'correct', true)
    }
    if (!test2) {
      mf.setPromptState('num', 'incorrect', true)
      mf.setPromptState('den', 'incorrect', true)
    } else {
      mf.setPromptState('num', 'correct', true)
      mf.setPromptState('den', 'correct', true)
    }
    if (this.sup3) {
      if (!test3) {
        mf.setPromptState('ecritureDecimale', 'incorrect', true)
      } else {
        mf.setPromptState('ecritureDecimale', 'correct', true)
      }
    }
    if (test1 && test2) {
      feedback = 'Décomposition correcte, '
      result.push('OK')
    } else {
      feedback = 'Décomposition fausse, '
      result.push('KO')
    }
    if (this.sup3) {
      if (test3) {
        feedback += 'valeur décimale exacte.'
        result.push('OK')
      } else {
        feedback += 'valeur décimale fausse.'
        result.push('KO')
      }
    }
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    if (divFeedback) divFeedback.innerHTML = feedback
    return result
  }
}
