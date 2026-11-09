import ExerciceSimple from '../ExerciceSimple'
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer un parallélogramme (sans tracer de parallèles)'
export const dateDePublication = '9/11/2023'
export const interactifReady = true

/**
 * Tracer un parallélogramme
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['parallelogramme2'],
  'fr-ch': [],
}
export const uuid = '784a7'

class ConstructionParallelogramme extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  constructor() {
    super()
    // La réponse attendue est une construction géométrique.
    this.reponseCourteDisponible = false
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
    let texteCorr =
      'Un parallélogramme est un quadrilatère qui a ses côtés opposés deux à deux.'
    texteCorr +=
      '<br>Dans cette animation, on va utiliser le «\u00a0cercle centre-rayon\u00a0» pour reporter les longueurs.'
    const figureCorrection = createAnimationConstructionParallelogramme()
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
    const { isValid, message } = this.figure.checkSameDistance({
      label1: 'AB',
      label2: 'CD',
    })
    resultat.push(isValid ? 'OK' : 'KO')
    if (message !== '') {
      feedback += message + '<br>'
    }
    const { isValid: isValid2, message: message2 } =
      this.figure.checkSameDistance({ label1: 'BC', label2: 'AD' })
    resultat.push(isValid2 ? 'OK' : 'KO')
    if (message2 !== '') {
      feedback += message2 + '<br>'
    }
    if (isValid && isValid2) {
      resultat.push('OK', 'OK', 'OK')
      feedback +=
        "Le quadrilatère $ABCD$ a ses côtés opposés deux à deux de même longueur donc s'il est non croisé, c'est bien un parallélogramme."
      feedback += '<br>Bravo !'
    } else {
      resultat.push('KO', 'KO', 'KO')
    }
    if (divFeedback) divFeedback.innerHTML = feedback
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    return resultat
  }
}

export default ConstructionParallelogramme

function createAnimationConstructionParallelogramme(): Figure {
  const figure = new Figure({
    xMin: 0,
    yMin: 0,
    width: 800,
    height: 500,
    border: true,
  })
  figure.setToolbar({
    tools: ['RESTART', 'PLAY_SKIP_BACK', 'PLAY', 'PLAY_SKIP_FORWARD', 'PAUSE'],
    position: 'top',
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
  figure.create('Segment', { point1: A, point2: B })
  figure.create('Segment', { point1: B, point2: C })
  figure.saveState()
  description.text =
    'Il faut placer le point $D$ tel que $AB = CD$ et $BC = AD$.'
  description.text +=
    '<br>Donc $D$ est sur le cercle de centre $C$ et de rayon $AB$ et sur le cercle de centre $A$ et de rayon $BC$.'
  const lAB = figure.create('Distance', { point1: A, point2: B })
  const c1 = figure.create('CircleCenterDynamicRadius', {
    center: C,
    radius: lAB,
  })
  const lBC = figure.create('Distance', { point1: B, point2: C })
  const c2 = figure.create('CircleCenterDynamicRadius', {
    center: A,
    radius: lBC,
  })
  figure.saveState()
  description.text = "On place le point $D$ à l'intersection des deux cercles."
  const D = figure.create('PointIntersectionCC', {
    circle1: c1,
    circle2: c2,
    label: 'D',
    n: 2,
  })
  figure.saveState()
  description.text = 'On peut cacher les cercles et tracer le parallélogramme.'
  c1.hide()
  c2.hide()
  figure.create('Polygon', { points: [A, B, C, D] })
  figure.saveState()
  return figure
}
