import ExerciceSimple from '../ExerciceSimple'
import Figure from 'apigeom'
import figureApigeom from '../../lib/figureApigeom'
import { randint } from '../../modules/outils'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre = 'Tracer un carré de dimension donnée'
export const dateDePublication = '10/11/2023'
export const interactifReady = true

/**
 * Tracer un carré
 * @author Rémi Angot

 */

export const refs = {
  'fr-fr': ['carre2'],
  'fr-ch': [],
}
export const uuid = '01607'

class ConstructionCarre2 extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  cote!: number
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
    this.cote = randint(3, 10)

    const enonce = `Tracer un carré $ABCD$ de côté ${this.cote}.`
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
    let texteCorr =
      'Un carré est un quadrilatère qui a 4 angles droits et quatre côtés de même longueur.'
    texteCorr += '<br>On peut tracer un carré de différentes façons.'
    texteCorr +=
      "<br>Dans cette animation, on va tracer un quadrilatère avec 3 angles droits et deux côtés consécutifs de même longueur mais on n'aurait pu aussi ne faire qu'un angle droit et tracer des côtés opposés parallèles."
    const figureCorrection = createAnimationConstructionCarre(this.cote)
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
      distance: this.cote,
      label1: 'A',
      label2: 'B',
    })
    resultat.push(isValid4 ? 'OK' : 'KO')
    if (message4 !== '') {
      feedback += message4 + '<br>'
    }
    const { isValid: isValid5, message: message5 } = this.figure.checkDistance({
      distance: this.cote,
      label1: 'B',
      label2: 'C',
    })
    resultat.push(isValid5 ? 'OK' : 'KO')
    if (message5 !== '') {
      feedback += message5 + '<br>'
    }
    if (isValid && isValid2 && isValid3 && isValid4 && isValid5) {
      feedback +=
        "Le quadrilatère $ABCD$ a 3 angles droits et deux côtés consécutifs de même longueur donc c'est un carré."
      feedback += '<br>Bravo !'
    }
    if (divFeedback) divFeedback.innerHTML = feedback
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    this.figure.buttons.get('SHAKE')?.click()
    return resultat
  }
}

export default ConstructionCarre2

function createAnimationConstructionCarre(c: number): Figure {
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
  description.text += `<br>$AB=${c}$ donc le point $B$ est sur le cercle de centre $A$ et de rayon ${c}.`
  const A = figure.create('Point', { x: 3, y: 3, label: 'A' })
  const cA = figure.create('Circle', { center: A, radius: c })
  const B = figure.create('PointOnCircle', {
    circle: cA,
    angleWithHorizontal: 0.1,
    label: 'B',
  })
  const sAB = figure.create('Segment', { point1: A, point2: B })
  figure.saveState()
  description.text =
    'On trace la droite perpendiculaire à $(AB)$ passant par $A$.'
  const dAD = figure.create('LinePerpendicular', { line: sAB, point: A })
  figure.saveState()
  description.text = `$AD=${c}$ donc le point $D$ est à l'intersection du cercle et de cette perpendiculaire.`
  const D = figure.create('PointIntersectionLC', {
    line: dAD,
    circle: cA,
    label: 'D',
  })
  figure.saveState()
  const dBC = figure.create('LinePerpendicular', { line: sAB, point: B })
  description.text =
    'On peut tracer la perpendiculaire à $(AB)$ passant par le point $B$.'
  figure.saveState()
  description.text =
    'On peut tracer la perpendiculaire à $(AD)$ passant par $D$ (ou la pralèlle à $(AB)$ passant par $D$).'
  const dCD = figure.create('LinePerpendicular', { line: dAD, point: D })
  figure.saveState()
  const C = figure.create('PointIntersectionLL', {
    line1: dBC,
    line2: dCD,
    label: 'C',
  })
  description.text =
    "On place le point $C$ à l'intersection de ces deux dernières droites."
  figure.saveState()
  description.text = 'On peut cacher le segment, le cercle et les droites.'
  sAB.hide()
  dBC.hide()
  dCD.hide()
  dAD.hide()
  cA.hide()
  figure.saveState()
  description.text =
    "On peut tracer le quadrilatère $ABCD$. Comme il a 3 angles droits, et deux côtés consécutifs de même longueur, c'est obligatoirement un carré."
  figure.create('Polygon', { points: [A, B, C, D] })
  figure.saveState()
  return figure
}
