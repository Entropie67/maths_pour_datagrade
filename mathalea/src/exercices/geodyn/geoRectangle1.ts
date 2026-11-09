import ExerciceSimple from '../ExerciceSimple'
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer un rectangle'
export const dateDePublication = '4/11/2023'
export const interactifReady = true

/**
 * Tracer un rectangle
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['rectangle1'],
  'fr-ch': [],
}
export const uuid = '95526'

class ConstructionRectangle extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.reponse = ''
    this.formatChampTexte = 'none' // Pas de champ texte pour cet exercice simple de géométrie dynamique
    this.exoCustomResultat = true
  }

  nouvelleVersion(): void {
    this.figure = new Figure({
      xMin: 0,
      yMin: 0,
      width: 800,
      height: 500,
      border: true,
    })
    this.figure.options.labelAutomaticBeginsWith = 'A'
    this.figure.options.labelAutomaticForPoints = true

    const enonce = 'Tracer un rectangle $ABCD$.'
    this.figure.setToolbar({
      tools: [
        'POINT',
        'POINT_ON',
        'POINT_INTERSECTION',
        'SEGMENT',
        'LINE_PERPENDICULAR',
        'LINE_PARALLEL',
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
    const emplacementPourFigure = figureApigeom({
      exercice: this,
      i: 0,
      figure: this.figure,
    })
    let texteCorr = 'Un rectangle est un quadrilatère qui a 4 angles droits.'
    texteCorr += '<br>On peut tracer un rectangle de différentes façons.'
    texteCorr +=
      "<br>Dans cette animation, on va tracer un quadrilatère avec 3 angles droits mais on n'aurait pu aussi ne faire qu'un angle droit et tracer des côtés opposés parallèles."
    const figureCorrection = createAnimationConstructionRectangle()
    const emplacementPourFigureCorrection = figureApigeom({
      animation: true,
      exercice: this,
      i: 0,
      idAddendum: 'Correction',
      figure: figureCorrection,
    })
    this.question = enonce + emplacementPourFigure
    this.correction = texteCorr + emplacementPourFigureCorrection
  }

  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figure.id] = figureAnswerJson(this.figure)
    const resultat = []
    let feedback = ''
    // 1 point par angle droit + 1 point si tout est correct (on ne vérifie pas que le triangle est tracé)
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const { isValid, message } = this.figure.checkAngle({
      angle: 90,
      label1: 'A',
      label2: 'B',
      label3: 'C',
    })
    resultat.push(isValid ? 'OK' : 'KO')
    if (message !== '') {
      feedback += message + '<br>'
    }
    const { isValid: isValid2, message: message2 } = this.figure.checkAngle({
      angle: 90,
      label1: 'B',
      label2: 'C',
      label3: 'D',
    })
    resultat.push(isValid2 ? 'OK' : 'KO')
    if (message2 !== '') {
      feedback += message2 + '<br>'
    }
    const { isValid: isValid3, message: message3 } = this.figure.checkAngle({
      angle: 90,
      label1: 'C',
      label2: 'D',
      label3: 'A',
    })
    resultat.push(isValid3 ? 'OK' : 'KO')
    if (message3 !== '') {
      feedback += message3 + '<br>'
    }
    const { isValid: isValid4, message: message4 } = this.figure.checkAngle({
      angle: 90,
      label1: 'D',
      label2: 'A',
      label3: 'B',
    })
    resultat.push(isValid4 ? 'OK' : 'KO')
    if (message4 !== '') {
      feedback += message4 + '<br>'
    }
    if (isValid && isValid2 && isValid3 && isValid4) {
      resultat.push('OK')
      feedback += 'Bravo !'
    } else {
      resultat.push('KO')
    }
    if (divFeedback) divFeedback.innerHTML = feedback
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    this.figure.buttons.get('SHAKE')?.click()
    return resultat
  }
}

export default ConstructionRectangle

function createAnimationConstructionRectangle(): Figure {
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
    text: 'On peut commencer par tracer le côté $[AB]$.',
    x: 10,
    y: 15,
  })
  const A = figure.create('Point', { x: 3, y: 3, label: 'A' })
  const B = figure.create('Point', { x: 12, y: 4, label: 'B' })
  const sAB = figure.create('Segment', { point1: A, point2: B })
  figure.saveState()
  description.text =
    'On trace la droite perpendiculaire à $(AB)$ passant par $B$.'
  const dBC = figure.create('LinePerpendicular', { line: sAB, point: B })
  figure.saveState()
  description.text =
    'On place un point $C$ sur cette droite en utilisant le bouton « Point sur » et non « Point libre ».'
  const C = figure.create('PointOnLine', {
    line: dBC,
    k: -0.5,
    shape: 'x',
    label: 'C',
  })
  figure.saveState()
  description.text =
    'On trace la droite perpendiculaire à $(BC)$ passant par $C$.'
  const dCD = figure.create('LinePerpendicular', { line: dBC, point: C })
  figure.saveState()
  description.text =
    'On trace la perpendiculaire à la droite $(AB)$ passant par $A$.'
  const dAD = figure.create('LinePerpendicular', { line: sAB, point: A })
  figure.saveState()
  description.text =
    "On place un point $D$ à l'intersection de ces deux dernières droites en utilisant le bouton « Point à l'intersection » et non « Point libre »."
  const D = figure.create('PointIntersectionLL', {
    line1: dAD,
    line2: dCD,
    label: 'D',
  })
  figure.saveState()
  description.text = 'On peut cacher le segment et les droites.'
  sAB.hide()
  dBC.hide()
  dCD.hide()
  dAD.hide()
  figure.saveState()
  description.text =
    "On peut tracer le quadrilatère $ABCD$. Comme il a 3 angles droits, c'est obligatoirement un rectangle."
  figure.create('Polygon', { points: [A, B, C, D] })
  figure.saveState()
  return figure
}
