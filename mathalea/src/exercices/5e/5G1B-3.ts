import Figure from 'apigeom'
import type TextByPosition from 'apigeom/src/elements/text/TextByPosition'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Placer des points dans un repère'
export const dateDePublication = '27/10/2023'
export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * Placer des points dans un repère
 * @author Rémi Angot
 */
export const uuid = '4dadb'

export const refs = {
  'fr-fr': ['5G1B-3', '3AutoG01-1'],
  'fr-2016': ['5R12-1', '3AutoG01-1'],
  'fr-ch': ['9R1ES5A-3', '9R2ES5A-3', '9R3ES5A-3', 'PRQPF02A-2'],
}

// Type simplifié pour la sauvegarde de la réponse
type Coords = { label: string; x: number; y: number }

class ReperagePointDuPlan extends ExerciceSimple {
  points: Coords[] = []
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.exoCustomResultat = true // Pour qu'une unique question puisse rapporter plusieurs points
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatChampTexte = 'none' // Pour un exercice de type simple qui n'utilise pas le champ de réponse
    this.reponse = ''
  }

  nouvelleVersion(): void {
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    const figure = new Figure({
      snapGrid: true,
      xMin: -6.3,
      yMin: -6.3,
      width: 378,
      height: 378,
    })

    // De -6.3 à 6.3 donc width = 12.6 * 30 = 378
    figure.create('Grid', { xMin: -6, yMin: -6, xMax: 6, yMax: 6 })
    figure.options.labelAutomaticForPoints = true
    figure.options.labelAutomaticBeginsWith = 'A' // Les points sont nommés par ordre alphabétique
    if ('Point' in figure.options.limitNumberOfElement)
      figure.options.limitNumberOfElement.Point = 4 // On limite le nombre de points à 4
    figure.options.pointDescriptionWithCoordinates = false
    this.figuresApiGeom[0] = figure

    let x1 = randint(-6, -1)
    let x2 = randint(1, 6, x1)
    let x3 = randint(-6, 6, [0, x1, x2])
    let x4 = 0
    let y1 = randint(-6, -1)
    let y2 = randint(1, 6, y1)
    let y3 = randint(-6, 6, [0, y1, y2])
    let y4 = 0
    // On mélange en évitant le couple (0,0)
    while (
      [
        [x1, y1],
        [x2, y2],
        [x3, y3],
        [x4, y4],
      ].some((e) => e[0] === 0 && e[1] === 0)
    ) {
      ;[x1, x2, x3, x4] = shuffle([x1, x2, x3, x4])
      ;[y1, y2, y3, y4] = shuffle([y1, y2, y3, y4])
    }
    this.points = [
      { label: 'A', x: x1, y: y1 },
      { label: 'B', x: x2, y: y2 },
      { label: 'C', x: x3, y: y3 },
      { label: 'D', x: x4, y: y4 },
    ]
    const figureCorr = new Figure({
      snapGrid: true,
      xMin: -7,
      yMin: -7,
      width: 420,
      height: 420,
      isDynamic: false,
    })
    this.figuresApiGeomCorr[0] = figureCorr
    figureCorr.setToolbar({ tools: ['REMOVE'], position: 'top' })
    figureCorr.create('Grid', { xMin: -6, yMin: -6, xMax: 6, yMax: 6 })
    for (const coord of this.points) {
      figureCorr.create('Point', {
        x: coord.x,
        y: coord.y,
        color: 'green',
        thickness: 3,
        label: coord.label,
      })
    }
    let enonce = 'Placer les points suivants : '
    enonce += `$A(${x1}\\;;\\;${y1})$ ; $B(${x2}\\;;\\;${y2})$ ; $C(${x3}\\;;\\;${y3})$ et $D(${x4}\\;;\\;${y4})$.`
    // figure.divButtons = figure.addButtons('POINT DRAG REMOVE')
    figure.setToolbar({
      tools: ['POINT', 'DRAG', 'REMOVE'],
      position: 'top',
    })
    if (context.isHtml) {
      if (this.interactif) {
        this.question =
          enonce +
          '<br>' +
          figureApigeom({
            exercice: this,
            i: 0,
            figure: this.figuresApiGeom[0],
            isDynamic: true,
            defaultAction: 'POINT',
          })
      } else {
        this.question =
          enonce +
          '<br>' +
          figureApigeom({
            exercice: this,
            i: 0,
            figure: this.figuresApiGeom[0],
            isDynamic: false,
          })
      }
      this.correction = figureApigeom({
        exercice: this,
        i: 0,
        figure: this.figuresApiGeomCorr[0],
        isDynamic: false,
        idAddendum: 'correction',
      })
    } else {
      this.question =
        enonce +
        `\n\n\\bigskip\n{\\Reperage[Plan,AffichageGrad,Unitex=0.75,Unitey=0.75]{%
        -5/0/A,0/-5/B,5/0/C,0/5/D%
        }}`
      this.correction = `{\\Reperage[Plan,AffichageGrad,Unitesx=0.75,Unitey=0.75,Traces={%
        drawoptions(withcolor red);
        pointe(A,B,C,D);
        label.urt(btex A etex,A);
        label.urt(btex B etex,B);
        label.urt(btex C etex,C);
        label.urt(btex D etex,D);
      }]{%
        -5/0/ ,0/-5/ ,5/0/ ,0/5/ ,${x1}/${y1}/A,${x2}/${y2}/B,${x3}/${y3}/C,${x4}/${y4}/D%
        }}`
    }
    if (context.isAmc) {
      this.autoCorrectionAMC[0] = {
        enonce: this.question,
        propositions: [
          {
            texte: '',
            statut: 1, // OBLIGATOIRE (ici c'est le nombre de lignes du cadre pour la réponse de l'élève sur AMC)
            sanscadre: true, // EE : ce champ est facultatif et permet (si true) de cacher le cadre et les lignes acceptant la réponse de l'élève
          },
        ],
      }
      this.questionsAMC[0] = amcConvert(this.autoCorrectionAMC[0])
    }
  }

  correctionInteractive = (i: number) => {
    if (this.figuresApiGeom === undefined) return ['KO']
    const figure = this.figuresApiGeom[i]
    if (figure == null) return ['KO']
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[figure.id] = figureAnswerJson(figure)
    const resultat = [] // Tableau de 'OK' ou de'KO' pour le calcul du score
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    )
    for (const coord of this.points) {
      const { points, isValid, message } = figure.checkCoords({
        label: coord.label,
        x: coord.x,
        y: coord.y,
      })
      // Point par point, je vérifie que le label et les coordonnées correspondent
      if (isValid) {
        resultat.push('OK')
      } else {
        if (divFeedback != null) {
          divFeedback.innerHTML += message + '<br>'
        }
        if (points[0] !== undefined) {
          const point = points[0]
          point.color = 'red'
          point.thickness = 3
          const textLabel = point.elementTextLabel as TextByPosition
          // Là aussi je rajoute as TextByPosition car je suis sûr que ce point a un label
          textLabel.color = 'red'
        }
        const pointCorr = figure.create('Point', {
          x: coord.x,
          y: coord.y,
          color: 'green',
          thickness: 3,
          label: coord.label,
        })
        const pointCorrLabel = pointCorr.elementTextLabel as TextByPosition
        pointCorrLabel.color = 'green'
        resultat.push('KO')
      }
    }
    figure.isDynamic = false
    figure.divButtons.style.display = 'none'
    figure.divUserMessage.style.display = 'none'
    return resultat
  }
}

export default ReperagePointDuPlan
