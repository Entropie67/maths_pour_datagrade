import ExerciceSimple from '../ExerciceSimple'
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { randint } from '../../modules/outils'
import { mathaleaRenderDiv } from '../../lib/mathalea'
import { context } from '../../modules/context'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer un triangle à partir de longueurs des 3 côtés'
export const dateDePublication = '29/10/2023'
export const interactifReady = true

/**
 * Tracer un triangle à partir de longueurs des 3 côtés
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['triangle1'],
  'fr-ch': ['NR'],
}
export const uuid = 'e514f'

type Triangle = { label: string; a: number; b: number; c: number }

class ConstructionTriangle extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  triangle!: Triangle
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.reponse = ''
    this.exoCustomResultat = true
    this.formatChampTexte = 'none' // Pas de champ texte pour cet exercice simple de géométrie dynamique
  }

  nouvelleVersion(): void {
    this.figure = new Figure({
      xMin: -7,
      yMin: -7,
      width: 800,
      height: 500,
      border: true,
    })
    this.triangle = { label: 'ABC', a: 3, b: 4, c: 50 }
    this.triangle.label = creerNomDePolygone(3)
    while (!isTriangle(this.triangle)) {
      this.triangle.a = randint(3, 10)
      this.triangle.b = randint(3, 10, this.triangle.a)
      this.triangle.c = randint(3, 10, [this.triangle.a, this.triangle.b])
    }

    const [labelA, labelB, labelC] = this.triangle.label.split('') as [
      string,
      string,
      string,
    ]
    const [a, b, c] = [this.triangle.a, this.triangle.b, this.triangle.c]

    const enonce = `Tracer le triangle $${this.triangle.label}$ tel que $${labelA}${labelB}=${c}$ ; $${labelB}${labelC}=${a}$ et $${labelC}${labelA}=${b}$.`
    this.figure.setToolbar({
      tools: [
        'POINT',
        'POINT_ON',
        'POINT_INTERSECTION',
        'SEGMENT',
        'POLYGON',
        'CIRCLE_CENTER_POINT',
        'CIRCLE_RADIUS',
        'NAME_POINT',
        'DRAG',
        'HIDE',
        'REMOVE',
        'UNDO',
        'REDO',
        'SHAKE',
      ],
      position: 'top',
    })
    this.figure.options.labelAutomaticBeginsWith = labelA
    this.figure.options.labelAutomaticForPoints = true
    const emplacementPourFigure = figureApigeom({
      exercice: this,
      i: 0,
      figure: this.figure,
      defaultAction: 'POINT',
    })
    let texteCorr = `$${labelA}${labelB}=${c}$ donc $${labelB}$ est sur le cercle de centre $${labelA}$ et de rayon $${c}$.`
    texteCorr += `<br>$${labelB}${labelC}=${a}$ donc $${labelC}$ est sur le cercle de centre $${labelB}$ et de rayon $${a}$.`
    texteCorr += `<br>$${labelC}${labelA}=${b}$ donc $${labelC}$ est sur le cercle de centre $${labelA}$ et de rayon $${b}$.`
    const figureCorrection = createAnimationConstructionTriangle(this.triangle)
    const emplacementPourFigureCorrection = figureApigeom({
      animation: true,
      exercice: this,
      i: 0,
      idAddendum: 'Correction',
      figure: figureCorrection,
    })
    if (!context.isHtml) {
      texteCorr = figureCorrection.tikz()
    }
    this.question = this.interactif ? enonce + emplacementPourFigure : enonce
    this.correction = texteCorr + emplacementPourFigureCorrection
  }

  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figure.id] = figureAnswerJson(this.figure)
    const resultat = []
    // 1 point par distance correcte + 2 points si tout est correct (on ne vérifie pas que le triangle est tracé)
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    let feedback = ''
    const [labelA, labelB, labelC] = this.triangle.label.split('') as [
      string,
      string,
      string,
    ]
    const [a, b, c] = [this.triangle.a, this.triangle.b, this.triangle.c]
    let { message, isValid } = this.figure.checkDistance({
      label1: labelA,
      label2: labelB,
      distance: c,
    })
    if (message) feedback += `${message}<br>`
    resultat.push(isValid ? 'OK' : 'KO')
    ;({ message, isValid } = this.figure.checkDistance({
      label1: labelB,
      label2: labelC,
      distance: a,
    }))
    if (message) feedback += `${message}<br>`
    resultat.push(isValid ? 'OK' : 'KO')
    ;({ message, isValid } = this.figure.checkDistance({
      label1: labelC,
      label2: labelA,
      distance: b,
    }))
    if (message) feedback += `${message}<br>`
    resultat.push(isValid ? 'OK' : 'KO')
    if (resultat.every((r) => r === 'OK')) {
      resultat.push('OK')
    } else {
      resultat.push('KO')
    }
    const isPolygoneDrawn = this.figure.checkPolygonByLabels({
       labels: [labelA, labelB, labelC]
     }).isValid
    if (isPolygoneDrawn && resultat.every((r) => r === 'OK')) {
      resultat.push('OK')
      feedback += `Le triangle $${labelA + labelB + labelC}$ a bien été tracé.<br>`
    } else {
      resultat.push('KO')
      feedback += `Le triangle $${labelA + labelB + labelC}$ n'a pas été tracé.<br>`
    }
    if (resultat.every((r) => r === 'OK')) {
      feedback += '<br>Bravo !'
    }

    if (divFeedback) divFeedback.innerHTML = feedback
    // Comme c'est asynchrone, il faut forcer le rendu LaTeX
    mathaleaRenderDiv(divFeedback)
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    this.figure.buttons.get('SHAKE')?.click()
    return resultat
  }
}

function isTriangle(triangle: Triangle): boolean {
  const { a, b, c } = triangle
  return a + b > c && a + c > b && b + c > a
}

function createAnimationConstructionTriangle(triangle: Triangle): Figure {
  const { label, a, b, c } = triangle
  const [labelA, labelB, labelC] = label.split('') as [string, string, string]
  const figure = new Figure({
    xMin: 0,
    yMin: 0,
    width: 800,
    height: 500,
    border: true,
  })
  figure.setToolbar({
    position: 'top',
    tools: ['RESTART', 'PLAY_SKIP_BACK', 'PLAY', 'PLAY_SKIP_FORWARD', 'PAUSE'],
  })
  const description = figure.create('TextByPosition', {
    anchor: 'bottomLeft',
    backgroundColor: 'white',
    text: `$${labelA}${labelB}=${c}$ donc $${labelB}$ est sur le cercle de centre $${labelA}$ et de rayon ${c}`,
    x: 10,
    y: 15,
  })
  figure.saveState()
  const A = figure.create('Point', { label: labelA, x: 5, y: 7 })
  const cA1 = figure.create('Circle', { center: A, radius: c })
  const B = figure.create('PointOnCircle', {
    angleWithHorizontal: 0,
    circle: cA1,
    label: labelB,
  })
  description.text =
    'Il faut bien utiliser le bouton « Point sur » et pas « Point libre ».'
  figure.saveState()
  figure.create('Segment', { point1: A, point2: B })
  figure.saveState()
  description.text = `On peut cacher le cercle de centre $${labelA}$ et de rayon ${c}.`
  cA1.hide()
  figure.saveState()
  description.text = `$${labelA}${labelC}=${b}$ donc $${labelC}$ est sur le cercle de centre $${labelA}$ et de rayon ${b}.`
  const cA2 = figure.create('Circle', { center: A, radius: b })
  figure.saveState()
  description.text = `$${labelB}${labelC}=${a}$ donc $${labelC}$ est aussi sur le cercle de centre $${labelB}$ et de rayon ${a}.`
  const cB = figure.create('Circle', { center: B, radius: a })
  figure.saveState()
  description.text = `On place le point $${labelC}$ à une intersection des deux cercles.`
  figure.saveState()
  const C = figure.create('PointIntersectionCC', { circle1: cA2, circle2: cB })
  C.label = labelC
  description.text =
    "Il faut bien utiliser le bouton « Point à l'intersection » et pas « Point libre »."
  figure.saveState()
  figure.create('Polygon', { points: [A, B, C] })
  figure.saveState()
  description.text = 'On peut cacher les cercles.'
  cA2.hide()
  cB.hide()
  if (!context.isHtml) {
    description.text = ''
    A.shape = ''
    B.shape = ''
    C.shape = ''
  }
  figure.saveState()
  return figure
}

export default ConstructionTriangle
