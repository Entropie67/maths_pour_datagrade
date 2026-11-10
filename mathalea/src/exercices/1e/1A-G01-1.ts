import type Figure from 'apigeom/src/Figure'
import { apigeomGraduatedLine } from '../../lib/apigeom/apigeomGraduatedLine'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const interactifReady = true

export const amcReady = true

export const titre = "Placer un point d'abscisse donnée sur une droite graduée"
export const dateDePublication = '17/06/2026'

/**
 * Clone QCM de 5R11-2 pour les automatismes de 2de.
 * @author Stéphane Guyon
 * @version 1.0.0
 * @since 17/06/2026
 */
export const dateDeModifImportante = '30/10/2026'

export const uuid = '6d577'

export const refs = {
  'fr-fr': ['1A-G01-1', '2A-G1-1'],
  'fr-ch': ['9R1QCMNO-4', '9R2QCMNO-4', '9R3QCMNO-4'],
}

type GraduationData = {
  x: number
  abs0: number
  xMin: number
  xMax: number
  scale: number
  precision: number
}

export default class Auto2AG10 extends ExerciceQcmA {
  private donneeCourante?: GraduationData
  private donneesOuvertes: GraduationData[] = []
  private enonceOuvert = ''
  private correctionOuverte = ''
  private droiteCorrigee = ''
  goodAnswers: { label: string; x: number }[][] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.options.vertical = true
    this.besoinFormulaireNumerique = false
    this.besoinFormulaireCaseACocher = ['Version QCM', false]
    this.sup = false
  }

  /** Version sans QCM : l'élève place le point A sur la droite graduée (apiGeom). */
  nouvelleVersion() {
    if (this.sup) {
      super.nouvelleVersion()
      for (let i = 0; i < this.listeQuestions.length; i++) {
        const index = this.autoCorrection[i]?.propositions?.findIndex(
          (proposition) => proposition.statut,
        )
        if (index != null && index >= 0) {
          this.listeReponsesCourtes[i] = String.fromCharCode(65 + index)
        }
      }
      return
    }
    this.consigne = ''
    this.figuresApiGeom = []
    this.donneesOuvertes = []
    this.goodAnswers = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 30; cpt++) {
      this.versionAleatoire()
      if (!this.questionJamaisPosee(i, this.enonceOuvert)) continue
      const data = this.donneeCourante as GraduationData
      this.donneesOuvertes[i] = data
      this.goodAnswers[i] = [{ label: 'A', x: data.x }]

      const { figure, latex } = apigeomGraduatedLine({
        xMin: data.xMin,
        xMax: data.xMax,
        scale: data.scale,
      })
      figure.options.labelAutomaticBeginsWith = 'A'
      figure.options.labelAutomaticForPoints = true
      figure.options.pointDescriptionWithCoordinates = false
      figure.options.distanceWithoutNewPoint = 0.00001
      this.figuresApiGeom[i] = figure

      this.listeQuestions[i] =
        this.enonceOuvert +
        (context.isHtml
          ? '<br>' +
            figureApigeom({ exercice: this, i, figure, defaultAction: 'POINT' })
          : '\n\n' + latex)
      this.listeCorrections[i] = this.correctionOuverte
      this.listeReponsesCourtes[i] = this.droiteCorrigee
      i++
    }
  }

  correctionInteractive = (i: number): 'OK' | 'KO' => {
    const figure = this.figuresApiGeom?.[i] as Figure | undefined
    const reponse = this.goodAnswers[i]?.[0]
    if (figure == null || reponse == null) return 'KO'
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    // Sauvegarde de la réponse pour Capytale
    if (this.answers == null) this.answers = {}
    this.answers[figure.id] = figureAnswerJson(figure)

    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const { isValid, message, points } = figure.checkCoords({
      checkOnlyAbscissa: true,
      label: reponse.label,
      x: reponse.x,
      y: 0,
      precision: this.donneesOuvertes[i].precision + 1,
    })
    const point = points[0]
    if (point !== undefined) {
      const couleur = isValid ? 'green' : 'red'
      point.color = couleur
      point.colorLabel = couleur
      point.thickness = 3
    }
    if (divFeedback != null) {
      if (isValid) {
        divFeedback.innerHTML = '😎'
      } else {
        const p = document.createElement('p')
        p.innerText = `☹️ ${message}`
        divFeedback.appendChild(p)
      }
    }
    return isValid ? 'OK' : 'KO'
  }

  private buildGraduationData(): GraduationData {
    const precision = 3
    const abs0 = randint(-10, -2) / 100
    const step = 100
    const stepBis = 10
    const x = arrondi(
      abs0 + randint(0, 6) / step + randint(1, 9) / step / stepBis,
      precision,
    )

    return {
      x,
      abs0,
      xMin: abs0 - 1 / stepBis ** 4,
      xMax: abs0 + 7 / step + 1 / stepBis ** 3,
      scale: step,
      precision,
    }
  }

  private buildLineBoundsFromPoint(x: number) {
    const stepBis = 10
    const abs0 = Math.floor(x * 100) / 100
    return {
      xMin: abs0 - 1 / stepBis ** 4,
      xMax: abs0 + 7 / 100 + 1 / stepBis ** 3,
    }
  }

  private buildDistractors({ x, precision }: GraduationData) {
    const candidates = [
      arrondi(x * 10, precision),
      arrondi(x / 10, precision),
      arrondi(-x, precision),
      arrondi(-x * 10, precision),
      arrondi(-x / 10, precision),
    ]

    const distractors: number[] = []
    for (const candidate of candidates) {
      if (candidate !== x && !distractors.includes(candidate)) {
        distractors.push(candidate)
      }
      if (distractors.length === 3) break
    }

    let power = 2
    while (distractors.length < 3) {
      for (const direction of [1, -1]) {
        const candidate = arrondi(direction * x * 10 ** power, precision)
        if (candidate !== x && !distractors.includes(candidate)) {
          distractors.push(candidate)
        }
        if (distractors.length === 3) break
      }
      power++
    }

    return distractors
  }

  private buildLineWithPoint(
    { scale, xMin: correctXMin, xMax: correctXMax }: GraduationData,
    x: number,
  ): string {
    const { xMin, xMax } =
      x >= correctXMin && x <= correctXMax
        ? { xMin: correctXMin, xMax: correctXMax }
        : this.buildLineBoundsFromPoint(x)
    const { figure, latex } = apigeomGraduatedLine({
      xMin,
      xMax,
      scale,
    })

    figure.create('Point', {
      label: 'A',
      x,
      color: orangeMathalea,
      colorLabel: orangeMathalea,
      shape: 'x',
      labelDxInPixels: 0,
    })

    if (context.isHtml) return wrapperApigeomToMathalea(figure)

    const xA = arrondi((x - xMin) * scale * 10)
    return latex.replace(
      '\\end{tikzpicture}',
      `\\tkzText[above=2mm](${xA},0){A}
      \\tkzDrawPoint[shape=cross out, size=5pt, thick](${xA},0)
\\end{tikzpicture}`,
    )
  }

  versionAleatoire = () => {
    const data = this.buildGraduationData()
    const distractors = this.buildDistractors(data)
    this.donneeCourante = data

    this.enonce = `On considère le point $A$ d'abscisse $${texNombre(data.x, data.precision)}$.<br>
Sur quelle droite graduée le point $A$ est-il correctement placé ?`
    const laBonneDroite = this.buildLineWithPoint(data, data.x)
    this.droiteCorrigee = laBonneDroite
    this.enonceOuvert = `Placer le point $A$ d'abscisse $${texNombre(data.x, data.precision)}$ sur la droite graduée.`
    this.correctionOuverte = `Le point $A$ a pour abscisse $${miseEnEvidence(texNombre(data.x, data.precision))}$ : on le place sur la droite graduée.${laBonneDroite}`

    this.correction = `Voici les abscisses respectives des différents points $A$ sur les droites graduées proposées :<br>`
    this.corrections = [
      `$${miseEnEvidence(`A(${texNombre(data.x, data.precision)})`)}$${laBonneDroite}`,
      ...distractors.map(
        (distractor) =>
          `$A(${texNombre(distractor, data.precision)})$${this.buildLineWithPoint(data, distractor)}`,
      ),
    ]
    this.reponses = [
      laBonneDroite,
      ...distractors.map((distractor) =>
        this.buildLineWithPoint(data, distractor),
      ),
    ]
  }
}
