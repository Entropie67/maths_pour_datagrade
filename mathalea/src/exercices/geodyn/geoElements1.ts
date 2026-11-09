import Figure from 'apigeom'
import checkElementExist from 'apigeom/src/check/checkElementExist'
import Point from 'apigeom/src/elements/points/Point'
import figureApigeom from '../../lib/figureApigeom'
import { shuffle } from '../../lib/outils/arrayOutils'
import ExerciceSimple from '../ExerciceSimple'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { sp } from '../../lib/outils/outilString'

export const titre = 'Tracer segment, droite et demi-droite (depuis notation)'
export const dateDePublication = '29/01/2024'
export const interactifReady = true

/**
 * @author Rémi Angot
 */

export const refs = {
  'fr-fr': ['elements1'],
  'fr-ch': [],
}
export const dateDeModifImportante = '30/10/2026'

export const uuid = '6fdab'

class Trait {
  type: 'Segment' | 'Ray' | 'Line'
  nameA: string
  nameB: string
  constructor(type: 'Segment' | 'Ray' | 'Line', nameA: string, nameB: string) {
    this.type = type
    this.nameA = nameA
    this.nameB = nameB
  }

  checkExist(figure: Figure) {
    return checkElementExist(
      { type: this.type, point1: this.nameA, point2: this.nameB },
      figure,
    )
  }

  create(figure: Figure): void {
    const point1 = [...figure.elements.values()].filter(
      (element) => element instanceof Point && element.label === this.nameA,
    )[0] as Point
    const point2 = [...figure.elements.values()].filter(
      (element) => element instanceof Point && element.label === this.nameB,
    )[0] as Point
    figure.create(this.type, { point1, point2 })
  }

  get point1() {
    return this.nameA
  }

  get point2() {
    return this.nameB
  }

  get descriptionConstruction() {
    if (this.type === 'Segment') {
      return `On trace le segment $[${this.nameA + this.nameB}]$.`
    }
    if (this.type === 'Ray') {
      return `On trace la demi-droite $[${this.nameA + this.nameB})$.`
    }
    return `On trace la droite $(${this.nameA + this.nameB})$.`
  }

  get description() {
    if (this.type === 'Segment') {
      return `le segment d'extrémités $${this.nameA}$ et $${this.nameB}$`
    }
    if (this.type === 'Ray') {
      return `la demi-droite d'origine $${this.nameA}$ passant par $${this.nameB}$`
    }
    return `la droite passant par les points $${this.nameA}$ et $${this.nameB}$`
  }

  get notation(): string {
    if (this.type === 'Segment') {
      return `$[${this.nameA + this.nameB}]$`
    }
    if (this.type === 'Ray') {
      return `$[${this.nameA + this.nameB})$`
    }
    return `$(${this.nameA + this.nameB})$`
  }

  get wrongFeedback() {
    if (this.type === 'Segment') {
      return `Le segment $[${this.nameA + this.nameB}]$ n'existe pas.`
    }
    if (this.type === 'Ray') {
      return `La demi-droite $[${this.nameA + this.nameB})$ n'existe pas.`
    }
    return `La droite $(${this.nameA + this.nameB})$ n'existe pas.`
  }
}

class ConstructionSegmentRayLine extends ExerciceSimple {
  // On déclare des propriétés supplémentaires pour cet exercice afin de pouvoir les réutiliser dans la correction
  figure!: Figure
  nameA!: string
  nameB!: string
  nameC!: string
  traits!: Trait[]
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.reponse = ''
    this.formatChampTexte = 'none' // Pas de champ texte pour cet exercice simple de géométrie dynamique
    this.exoCustomResultat = true
    this.reponseCourteDisponible = false // La réponse est une construction.
  }

  nouvelleVersion(): void {
    this.figure = new Figure({
      xMin: 0,
      yMin: 0,
      width: 800,
      height: 500,
      border: true,
    })
    this.traits = []

    const indiceFirstLetter = 65 + Math.floor(Math.random() * 22)
    this.nameA = String.fromCharCode(indiceFirstLetter)
    this.nameB = String.fromCharCode(indiceFirstLetter + 1)
    this.nameC = String.fromCharCode(indiceFirstLetter + 2)
    this.figure.options.labelAutomaticBeginsWith = this.nameA
    this.figure.options.labelAutomaticForPoints = true

    const types = shuffle(['Segment', 'Line', 'Ray']) as (
      'Segment' | 'Line' | 'Ray'
    )[]
    this.traits.push(new Trait(types[0], this.nameA, this.nameB))
    this.traits.push(new Trait(types[1], this.nameB, this.nameC))
    this.traits.push(new Trait(types[2], this.nameC, this.nameA))
    let enonce = ''
    if (this.sup) {
      enonce = `Tracer ${this.traits[0].description},<br>${this.traits[1].description},<br>et ${this.traits[2].description}.`
    } else {
      enonce = `Tracer ${this.traits[0].notation}, ${this.traits[1].notation} et ${this.traits[2].notation}.`
    }
    this.figure.setToolbar({
      tools: [
        'POINT',
        'NAME_POINT',
        'SEGMENT',
        'LINE',
        'RAY',
        'DRAG',
        'REMOVE',
        'UNDO',
        'REDO',
      ],
      position: 'top',
      nbCols: 9,
    })
    const emplacementPourFigure = figureApigeom({
      exercice: this,
      i: 0,
      figure: this.figure,
      defaultAction: 'POINT',
    })
    const figureCorrection = createAnimation(this.traits)
    const emplacementPourFigureCorrection = figureApigeom({
      animation: true,
      exercice: this,
      i: 0,
      idAddendum: 'Correction',
      figure: figureCorrection,
    })
    this.question = enonce + emplacementPourFigure
    this.correction = emplacementPourFigureCorrection
  }

  correctionInteractive = (i: number) => {
    const resultat: ('OK' | 'KO')[] = []
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figure.id] = figureAnswerJson(this.figure)
    let feedback = ''
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    const resultatCheck = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )
    const points = [...this.figure.elements.values()].filter(
      (element) => element instanceof Point && element.type !== 'pointer',
    )
    const pointsA = points.filter(
      (point) => point instanceof Point && point.label === this.nameA,
    )
    const pointsB = points.filter(
      (point) => point instanceof Point && point.label === this.nameB,
    )
    const pointsC = points.filter(
      (point) => point instanceof Point && point.label === this.nameC,
    )
    if (pointsA.length > 1 || pointsB.length > 1 || pointsC.length > 1) {
      feedback = 'Il ne doit pas y avoir plusieurs points avec le même nom'
      resultat.push('KO', 'KO', 'KO')
    } else {
      for (const trait of this.traits) {
        const { isValid, result } = trait.checkExist(this.figure)
        if (isValid) {
          resultat.push('OK')
          result[0].color = 'green'
        } else {
          resultat.push('KO')
          feedback += trait.wrongFeedback + '<br><br>'
        }
      }
    }

    if (divFeedback) {
      divFeedback.innerHTML = feedback || `Bravo${sp()}!`
    }
    if (resultatCheck) {
      resultatCheck.innerHTML = resultat.every((r) => r === 'OK') ? '😎' : '☹️'
    }
    this.figure.setToolbar({ position: 'top', tools: ['DRAG', 'DESCRIPTION'] })
    return resultat
  }
}

export default ConstructionSegmentRayLine

function createAnimation(traits: Trait[]): Figure {
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
    text: '',
    x: 10,
    y: 15,
  })
  figure.create('Point', { x: 3, y: 3, label: traits[0].point1 })
  figure.create('Point', { x: 12, y: 4, label: traits[0].point2 })
  figure.create('Point', { x: 8, y: 10, label: traits[1].point2 })
  for (const trait of traits) {
    description.text = trait.descriptionConstruction
    trait.create(figure)
    figure.saveState()
  }
  return figure
}
