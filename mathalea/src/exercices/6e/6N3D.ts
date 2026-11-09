import Figure from 'apigeom'
import GraduatedLine from 'apigeom/src/elements/grid/GraduatedLine'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { lettreIndiceeDepuisChiffre } from '../../lib/outils/outilString'
import FractionEtendue from '../../modules/FractionEtendue'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const dateDePublication = '09/07/2025'
export const titre =
  'Lire une abscisse fractionnaire grâce à des graduations régulièrement espacées'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'

/** Lire une abscisse fractionnaire grâce à des graduations régulièrement espacées
 * @author Éric Elter
 */
export const uuid = 'cff03'

export const refs = {
  'fr-fr': ['6N3D'],
  'fr-2016': ['6N21-4'],
  'fr-ch': ['9R1NO4B-3', '9R2NO4B-3', '9R3NO4B-3', 'PRQNO04B-5'],
}

export default class DonnerSensDefinitionQuotient extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5
    this.exoCustomResultat = true

    this.besoinFormulaireNumerique = [
      "Nombre d'abscisses présentes (autres que l'origine)",
      20,
    ]
    this.sup = 1
    this.comment =
      "Un paramètre permet de choisir si on complique ou pas l'exercice, par l'augmentation du nombre d'abscisses présentes."
    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    this.figuresApiGeom = []

    const NbAbscissesAutreQueOrigine = contraindreValeur(1, 20, this.sup, 1)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.consigne = this.nbQuestions
        ? 'Sur cette droite, '
        : 'Sur chaque droite, '
      this.consigne += 'les graduations sont régulièrement espacées.'
      this.consigne += this.nbQuestions
        ? ' Déterminer par quel nombre le point y est repéré.'
        : ' Dans chaque cas, déterminer par quel nombre le point y est repéré.'
      let texte = ''
      let texteCorr = ''
      const den = randint(2, 7)
      const num = randint(2, den * 2 - 1, [den])

      const label = lettreIndiceeDepuisChiffre(i * 3 + 1)

      const reponse = new FractionEtendue(num, den).texFraction
      texte = this.interactif
        ? `Nombre par lequel le point $${label}$ est repéré sur cette droite graduée : `
        : ''
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      handleAnswers(this, i, { reponse: { value: reponse } })

      const xMax = NbAbscissesAutreQueOrigine * num
      const stepBis = arrondi(num / den, 4)

      const figureEnonce = apigeomGraduatedLineEE({
        xMin: 0,
        xMax,
        step: num,
        stepBis,
        points: [{ x: stepBis, label }],
      })
      figureEnonce.figure.create('Point', {
        label: miseEnEvidence('?', 'black'),
        x: stepBis,
        y: -1.25,
        shape: '',
        labelDxInPixels: 0,
      })
      figureEnonce.figure.create('Point', {
        label,
        x: stepBis,
        y: 0.15,
        shape: '',
        labelDxInPixels: 0,
      })

      figureEnonce.figure.options.labelAutomaticBeginsWith = label
      figureEnonce.figure.options.labelAutomaticForPoints = true
      figureEnonce.figure.options.pointDescriptionWithCoordinates = false
      figureEnonce.figure.options.labelIsVisible = false
      this.figuresApiGeom![i] = figureEnonce.figure

      if (this.correctionDetaillee) {
        texteCorr = `Entre l'origine (repérée par $0$) et le point repéré par $${miseEnEvidence(num, bleuMathalea)}$, il y a $${miseEnEvidence(den, bleuMathalea)}$ intervalles de taille identique.<br>`
        texteCorr += `Or, on sait que le quotient $${miseEnEvidence(reponse)}$ est le nombre qui, multiplié par $${miseEnEvidence(den, bleuMathalea)}$, donne $${miseEnEvidence(num, bleuMathalea)}$, soit $${miseEnEvidence(reponse)}\\times${miseEnEvidence(den, bleuMathalea)}=${miseEnEvidence(num, bleuMathalea)}$.<br>`
        texteCorr += `Le point $${label}$ est donc repéré par $${miseEnEvidence(reponse)}$.`

        if (NbAbscissesAutreQueOrigine > 1) {
          texteCorr += `<br>On peut aussi remarquer qu'entre l'origine et le point repéré par $${miseEnEvidence(2 * num, bleuMathalea)}$, il y a $${miseEnEvidence(2 * den, bleuMathalea)}$ intervalles de taille identique.<br>`
          texteCorr += `Le point $${label}$ est donc aussi repéré par $${miseEnEvidence(new FractionEtendue(2 * num, 2 * den).texFraction, bleuMathalea)}$.`
        }
      }

      const figureCorrection = apigeomGraduatedLineEE({
        xMin: 0,
        xMax,
        step: num,
        stepBis: num / den,
        points: [{ x: stepBis, label }],
        correction: [
          {
            x: stepBis,
            label: `$${miseEnEvidence(new FractionEtendue(num, den).texFraction)}$`,
          },
        ],
      })
      /*
      label: context.isHtml
          ? miseEnEvidence(new FractionEtendue(num, den).texFraction)
          : `$${miseEnEvidence(new FractionEtendue(num, den).texFraction)}$`,
          */
      figureCorrection.figure.create('Point', {
        label: context.isHtml
          ? miseEnEvidence(new FractionEtendue(num, den).texFraction)
          : `$${miseEnEvidence(new FractionEtendue(num, den).texFraction)}$`,
        x: stepBis,
        y: -1.4,
        shape: '',
        labelDxInPixels: 0,
      })
      figureCorrection.figure.create('Point', {
        label,
        x: stepBis,
        y: 0.15,
        shape: '',
        labelDxInPixels: 0,
      })

      if (context.isHtml) {
        texte += '<br>' + wrapperApigeomToMathalea(figureEnonce.figure)
        texteCorr += wrapperApigeomToMathalea(figureCorrection.figure)
      } else {
        texte += '\n\n' + figureEnonce.latex
        texteCorr += '\\;\n' + figureCorrection.latex
      }

      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonce: 'ici la (ou les) question(s) est(sont) posée(s)',
          enonceAvant: false, // EE : ce champ est facultatif et permet (si false) de supprimer l'énoncé ci-dessus avant la numérotation de chaque question.
          enonceAvantUneFois: false, // EE : ce champ est facultatif et permet (si true) d'afficher l'énoncé ci-dessus une seule fois avant la numérotation de la première question de l'exercice. Ne fonctionne correctement que si l'option melange est à false.
          propositions: [
            {
              type: 'AMCOpen', // on donne le type de la première question-réponse qcmMono, qcmMult, AMCNum, AMCOpen
              propositions: [
                {
                  texte: texteCorr,
                  statut: 3, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
                  enonce: texte,
                  sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      if (this.questionJamaisPosee(i, num, den)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}

function apigeomGraduatedLineEE({
  xMin,
  xMax,
  points,
  step = 1,
  stepBis = 0.25,
  correction,
}: {
  xMin: number
  xMax: number
  step?: number
  stepBis?: number
  snapGrid?: boolean
  points?: Array<{ x: number; label: string }>
  correction?: Array<{ x: number; label: string }>
}): { figure: Figure; latex: string } {
  const width = 750
  const height = 80
  const scale = xMax < 9 ? 1 : 8 / xMax // Permet que l'échelle soit la plus grande (sans dépasser) pour tout xMax >= 9.
  const figure = new Figure({
    xMin: xMin - 0.2 / scale,
    yMin: -1.5,
    width,
    height,
    dy: 10,
    dx: stepBis,
    xScale: 3 * scale,
    snapGrid: false,
  })
  const d = new GraduatedLine(figure, { min: xMin, max: xMax, step, stepBis })
  d.draw()
  let latex = `\n\\bigskip
  \\begin{tikzpicture}[x=2.5mm]
  \\draw[-{Latex[round]},thick] (0,0) -- (65,0);
  \\foreach \\x [count=\\i from 0] in {0,${(60 * stepBis) / xMax},...,60} \\draw[thick] ([yshift=-0.8mm]\\x,0) -- ([yshift=0.8mm]\\x,0);
  \\foreach \\x [count=\\i from 0] in {0,${(60 * step) / xMax},...,60} \\draw[ultra thick] ([yshift=-1.5mm]\\x,0) coordinate (a\\i) -- ([yshift=1.5mm]\\x,0);
  \\foreach \\x [count=\\i from 0] in {${xMin},${step},...,${xMax}} {
    \\node[below=2mm of a\\i,inner sep=0pt,font=\\small] {$\\num{\\x}$};
}`
  if (points !== undefined) {
    const xA = (60 * arrondi(points[0].x - xMin)) / xMax
    const labelA = points[0].label
    latex += `\n\\tkzText[above=2mm](${xA},0){${labelA}}`
    // latex += ` \n\\tkzDrawPoint[shape=cross out, size=5pt, thick](${xA},0)`
  }
  if (correction !== undefined) {
    const xA = (60 * arrondi(correction[0].x - xMin)) / xMax
    const labelA = correction[0].label
    latex += `\n\\tkzText[above=2mm](${xA},-1.5){${labelA}}`
  }
  latex += '\n\\end{tikzpicture}'
  return { figure, latex }
}
