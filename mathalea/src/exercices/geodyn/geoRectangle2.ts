import Figure from 'apigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Tracer un rectangle de dimensions données'
export const dateDePublication = '4/11/2023'
export const interactifReady = true

/**
 * Tracer un rectangle
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['rectangle2'],
  'fr-ch': ['9R1ES2I-11', '9R2ES2I-11', '9R3ES2I-11', 'PRQES04B-15'],
}
export const uuid = '1d6ca'

class ConstructionRectangleDimensions extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  L!: number
  l!: number
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
      xMin: -7,
      yMin: -7,
      width: 800,
      height: 500,
      border: true,
    })
    this.figure.options.labelAutomaticBeginsWith = 'A'
    this.figure.options.labelAutomaticForPoints = true
    this.L = randint(4, 10)
    this.l = randint(2, this.L - 1)
    const enonce = `Tracer un rectangle $ABCD$ tel que $AB=${this.L}$ et $BC=${this.l}$.`
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
    texteCorr +=
      '<br>Pour faire un segment de longueur donnée, il faut obligatoirement un tracer un cercle de centre un point et de rayon la longueur du segment.'
    const figureCorrection = createAnimationConstructionRectangle(
      this.L,
      this.l,
    )
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
    const { isValid: isValid4, message: message4 } = this.figure.checkDistance({
      label1: 'A',
      label2: 'B',
      distance: this.L,
    })
    resultat.push(isValid4 ? 'OK' : 'KO')
    if (message4 !== '') {
      feedback += message4 + '<br>'
    }
    const { isValid: isValid5, message: message5 } = this.figure.checkDistance({
      label1: 'B',
      label2: 'C',
      distance: this.l,
    })
    resultat.push(isValid5 ? 'OK' : 'KO')
    if (message5 !== '') {
      feedback += message5 + '<br>'
    }
    if (isValid && isValid2 && isValid3 && isValid4) {
      feedback += 'Bravo !'
    }
    if (divFeedback) divFeedback.innerHTML = feedback
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    this.figure.buttons.get('SHAKE')?.click()
    return resultat
  }
}

export default ConstructionRectangleDimensions

function createAnimationConstructionRectangle(L: number, l: number): Figure {
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
    text: `$AB=${L}$ donc le point $B$ est sur le cercle de centre $A$ et de rayon ${L}.`,
    x: 10,
    y: 15,
  })
  const A = figure.create('Point', { x: 3, y: 3, label: 'A' })
  const cAL = figure.create('Circle', { center: A, radius: L })
  const B = figure.create('PointOnCircle', {
    circle: cAL,
    angleWithHorizontal: 0.1,
    label: 'B',
  })
  const sAB = figure.create('Segment', { point1: A, point2: B })
  figure.saveState()
  description.text = 'On peut cacher le cercle'
  cAL.hide()
  figure.saveState()
  description.text =
    'On trace la droite perpendiculaire à $(AB)$ passant par $B$.'
  const dBC = figure.create('LinePerpendicular', { line: sAB, point: B })
  figure.saveState()
  description.text = `$BC=${l}$ donc le point $C$ est à une intersection de cette droite et du cercle de centre $B$ et de rayon ${l}.`
  const cBl = figure.create('Circle', { center: B, radius: l })
  const C = figure.create('PointIntersectionLC', {
    line: dBC,
    circle: cBl,
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
