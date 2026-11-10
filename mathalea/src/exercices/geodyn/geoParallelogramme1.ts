import ExerciceSimple from '../ExerciceSimple'
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer un parallélogramme'
export const dateDePublication = '9/11/2023'
export const interactifReady = true

/**
 * Tracer un rectangle
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['parallelogramme1'],
  'fr-ch': [],
}
export const uuid = '4d4a8'

class ConstructionParallelogramme extends ExerciceSimple {
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
    const A = this.figure.create('Point', { x: 8, y: 11, label: 'A' })
    const B = this.figure.create('Point', { x: 18, y: 12, label: 'B' })
    const C = this.figure.create('Point', { x: 20, y: 9, label: 'C' })
    this.figure.create('Segment', { point1: A, point2: B })
    this.figure.create('Segment', { point1: B, point2: C })

    const enonce = 'Placer le point $D$ tel que $ABCD$ soit un parallélogramme.'
    this.figure.setToolbar({
      tools: [
        'POINT',
        'POINT_ON',
        'POINT_INTERSECTION',
        'SEGMENT',
        'LINE_PERPENDICULAR',
        'LINE_PARALLEL',
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
    const texteCorr =
      'Un parallélogramme est un quadrilatère non croisé qui a ses côtés opposés parallèles deux à deux.'
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
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const { isValid, message } = this.figure.checkParallel({
      label1: 'AB',
      label2: 'CD',
    })
    resultat.push(isValid ? 'OK' : 'KO')
    if (message !== '') {
      feedback += message + '<br>'
    }
    const { isValid: isValid2, message: message2 } = this.figure.checkParallel({
      label1: 'BC',
      label2: 'AD',
    })
    resultat.push(isValid2 ? 'OK' : 'KO')
    if (message2 !== '') {
      feedback += message2 + '<br>'
    }
    if (isValid && isValid2) {
      resultat.push('OK', 'OK', 'OK')
      feedback +=
        "Le quadrilatère $ABCD$ a ses côtés opposés parallèles deux à deux donc, s'il est non croisé, c'est bien un parallélogramme."
      feedback += '<br>Bravo !'
    } else {
      resultat.push('KO', 'KO', 'KO')
    }
    divFeedback.innerHTML = feedback
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    this.figure.buttons.get('SHAKE')?.click()
    return resultat
  }
}

export default ConstructionParallelogramme

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
    text: "Si un quarilatère non croisé a ses côtés opposés deux à deux de même longueur alors c'est un parallélogramme.",
    x: 10,
    y: 15,
  })
  const A = figure.create('Point', { x: 8, y: 11, label: 'A' })
  const B = figure.create('Point', { x: 18, y: 12, label: 'B' })
  const C = figure.create('Point', { x: 20, y: 9, label: 'C' })
  const sAB = figure.create('Segment', { point1: A, point2: B })
  const sBC = figure.create('Segment', { point1: B, point2: C })
  figure.saveState()
  description.text = 'On trace la droite parallèle à $(AB)$ passant par C.'
  const dCD = figure.create('LineParallel', { point: C, line: sAB })
  figure.saveState()
  description.text = 'On trace la droite parallèle à $(BC)$ passant par A.'
  const dAD = figure.create('LineParallel', { point: A, line: sBC })
  figure.saveState()
  description.text =
    "On place le point $D$ à l'intersection des deux droites en utilisant bien le bouton « Point intersection » et pas le bouton « Point libre »."
  const D = figure.create('PointIntersectionLL', {
    line1: dCD,
    line2: dAD,
    label: 'D',
  })
  figure.saveState()
  description.text = 'On peut cacher les droites et tracer le parallélogramme.'
  dCD.hide()
  dAD.hide()
  figure.create('Polygon', { points: [A, B, C, D] })
  figure.saveState()
  return figure
}
