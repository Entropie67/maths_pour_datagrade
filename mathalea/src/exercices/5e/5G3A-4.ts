import Figure from 'apigeom'
import checkCircle from 'apigeom/src/check/checkCircleRadius'
import checkCoords from 'apigeom/src/check/checkCoords'
import checkLine from 'apigeom/src/check/checkLine'
import checkPolygon from 'apigeom/src/check/checkPolygon'
import checkRay from 'apigeom/src/check/checkRay'
import checkSegment from 'apigeom/src/check/checkSegment'
import { rotationCoord } from 'apigeom/src/elements/calculus/Coords'
import type PointApigeom from 'apigeom/src/elements/points/Point'
import { wrapperApigeomToMathalea } from '../../lib/apigeom/apigeomZoom'
import { bleuMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre =
  'Construire des symétriques de figures par rapport à un point'
export const dateDePublication = '28/09/2024'
export const interactifReady = true

export const uuid = 'd37ea'
export const refs = {
  'fr-fr': ['5G3A-4'],
  'fr-2016': ['5G11-20'],
  'fr-ch': ['9R1ES4D-5', '9R2ES4D-5', '9R3ES4D-5'],
}

/**
 * fonction pour verifier qu'on est dans le cadre
 * @param points
 */
function checkDistance(points: { x: number; y: number }[]) {
  const [x0, y0] = [points[0].x, points[0].y]
  const [x1, y1] = [points[1].x, points[1].y]
  const [x2, y2] = [points[2].x, points[2].y]
  if (
    x0 ** 2 + y0 ** 2 < 16 ||
    x0 ** 2 + y0 ** 2 > 25 ||
    (x1 - x0) ** 2 + (y1 - y0) ** 2 > 40 ||
    (x1 - x0) ** 2 + (y1 - y0) ** 2 < 16 ||
    0.5 * Math.abs(x0 * (y1 - y2) + x1 * (y2 - y0) + x2 * (y0 - y1)) < 8
  )
    return false // ça c'est pour éviter les centres de cercle trop excentrés et les rayons de cercle trop importants
  for (const point of points) {
    if (point.y < -8 || point.y > 8) {
      return false
    }
  }
  return true
}

/** Vérifier la position de l'origine par rapport au cercle ou au triangle. */
function checkCenterPosition(
  points: { x: number; y: number }[],
  figureType: string,
  position: number,
) {
  // Le réglage par défaut conserve exactement les tirages déjà publiés.
  if (![1, 2, 3].includes(position)) return true
  const [a, b, c] = points
  if (figureType === 'cercle') {
    const distanceSquared = a.x ** 2 + a.y ** 2
    const radiusSquared = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
    return position === 1
      ? distanceSquared > radiusSquared
      : position === 2
        ? distanceSquared === radiusSquared
        : distanceSquared < radiusSquared
  }
  if (figureType === 'triangle') {
    const sides = [
      a.x * b.y - a.y * b.x,
      b.x * c.y - b.y * c.x,
      c.x * a.y - c.y * a.x,
    ]
    const outside =
      sides.some((side) => side < 0) && sides.some((side) => side > 0)
    return position === 1
      ? outside
      : position === 2
        ? !outside && sides.includes(0)
        : !outside && !sides.includes(0)
  }
  return true
}

/**
 * Construction interactive de symétriques de points
 * @author Jean-claude Lhote
 */
class ConstructionsSymetrieCentraleFigures extends Exercice {
  antecedentsApiGeom!: PointApigeom[][]
  labels!: string[][]
  labelsCentres!: string[]
  centresApiGeom!: PointApigeom[]
  typesDeQuestions!: (
    'segment' | 'droite' | 'demidroite' | 'cercle' | 'triangle'
  )[]

  nbPoints!: number[]
  formulations!: (string | number)[]
  exoCustomResultat: boolean
  retireEcouteursBarre: (() => void)[] = []
  // declare : typage seul (champ hérité de Exercice), sans réémettre le champ.
  // Sans cette redéclaration, le champ de base étant optionnel, il serait
  // typé possiblement undefined (accès this.figuresApiGeom![i] en erreur).
  constructor() {
    super()
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.exoCustomResultat = true
    this.nbQuestions = 6
    this.spacing = context.isHtml ? 1 : 0.1
    this.spacingCorr = context.isHtml ? 1 : 0.1
    this.besoinFormulaireNumerique = [
      "Type d'aide",
      4,
      'Quadrillages\nDemi-droites en pointillés\nMarques de compas\nAucune',
    ]
    this.besoinFormulaire2Texte = [
      'Type de figures',
      '1 : Segment\n2 : Droite\n3 : Demi-droite\n4 : Cercle\n5 : Triangle\n6 : Mélange',
    ]
    this.besoinFormulaire3Texte = [
      'Formulation des questions',
      "1 : Construire l'image de ... par la symétrie de centre ...\n2 : Construire le symétrique de ... par rapport au point ...",
    ]
    this.besoinFormulaire4Numerique = [
      'Position du centre de symétrie (cercles et triangles)',
      4,
      "1 : À l'extérieur\n2 : Sur le contour\n3 : À l'intérieur\n4 : Aléatoire",
    ]
    this.sup = 1
    this.sup2 = '6'
    this.sup3 = '1'
    this.sup4 = 4
  }

  /**
   * Barre d'outils à gauche sur grand écran, au-dessus sur smartphone
   * (même seuil que apigeom). Elle suit le changement de taille de la fenêtre.
   */
  placeBarreOutils(figure: Figure) {
    // matchMedia est absent de certains environnements (tests, export).
    const grandEcran =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(min-width: 768px)')
        : undefined
    const applique = () =>
      figure.setToolbar({
        tools: [
          'DRAG',
          'POINT',
          'NAME_POINT',
          'POINT_ON',
          'POINT_INTERSECTION',
          'CIRCLE_CENTER_POINT',
          'RAY',
          'LINE',
          'SEGMENT',
          'POLYGON',
          'UNDO',
          'REDO',
          'REMOVE',
          'HIDE',
          'ZOOM_IN',
          'ZOOM_OUT',
        ],
        position: grandEcran?.matches === false ? 'top' : 'left',
        // Palette de couleurs, traits pointillés et épaisseur.
        showStyles: true,
      })
    applique()
    if (typeof grandEcran?.addEventListener !== 'function') return
    grandEcran.addEventListener('change', applique)
    this.retireEcouteursBarre.push(() =>
      grandEcran.removeEventListener('change', applique),
    )
  }

  nouvelleVersion() {
    for (const retire of this.retireEcouteursBarre) retire()
    this.retireEcouteursBarre = []
    const marks: string[] = ['//', 'o', '||']
    const colors: string[] = context.isHtml
      ? ['red', 'green', 'purple', bleuMathalea, 'gray']
      : ['gray', 'gray', 'gray', 'gray', 'gray']
    this.answers = {}

    this.figuresApiGeom = []
    this.antecedentsApiGeom = []
    this.labels = []
    this.labelsCentres = []
    this.centresApiGeom = []
    this.typesDeQuestions = []
    this.nbPoints = []
    this.typesDeQuestions = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 6,
      listeOfCase: ['segment', 'droite', 'demidroite', 'cercle', 'triangle'],
    }) as typeof this.typesDeQuestions
    this.formulations = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      // Conserver les tirages des figures, même si les deux formulations sont choisies.
      shuffle: false,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 20;) {
      let nuage: { x: number; y: number }[] = []
      // On construit les points
      do {
        nuage = []
        for (let x = -8; x < 8; x += 1) {
          if (x !== 0) nuage.push({ y: (randint(2, 8) + 1) * (-1) ** x, x })
        }
        nuage = shuffle(nuage)
      } while (
        !checkDistance(nuage) ||
        !checkCenterPosition(nuage, this.typesDeQuestions[i], Number(this.sup4))
      )
      nuage = nuage.slice(0, 3)
      this.labels[i] = Array.from(
        choisitLettresDifferentes(nuage.length, 'Q', true),
      )
      const labelCentre = choisitLettresDifferentes(
        1,
        this.labels[i].join('') + 'Q',
        true,
      )[0]
      this.labelsCentres[i] = labelCentre
      let enonce =
        this.formulations[i] === 1
          ? "Construire l'image "
          : 'Construire le symétrique '
      // Les antécédents sont des points nommés

      const options = {}
      if (this.sup === 1)
        Object.assign(options, { snapGrid: true, dx: 1, dy: 1 })

      // En Typst, le rayon minimal de 4 unités doit dépasser 2 cm sur papier
      // (4 × 30 × 0,7 pixels à 96 dpi), pour faciliter le tracé au compas.
      // Agrandir l'affichage conserve les coordonnées et tous les tirages.
      const scale =
        context.isTypst && this.typesDeQuestions[i] === 'cercle' ? 0.7 : 0.5

      this.figuresApiGeom![i] = new Figure(
        Object.assign(options, {
          xMin: -10,
          yMin: -10,
          // `width`/`height` sont exprimées à l'échelle 1 : `scale` les réduit
          // ensuite, pour une fenêtre de 20×20 unités ([-10;10]²).
          width: 600,
          height: 600,
          scale,
        }),
      )
      this.figuresApiGeom![i].options.latexHeight = 20
      this.figuresApiGeom![i].options.labelDxInPixels = 20
      this.figuresApiGeom![i].options.labelDyInPixels = 20
      this.placeBarreOutils(this.figuresApiGeom![i])
      this.centresApiGeom[i] = this.figuresApiGeom![i].create('Point', {
        x: 0,
        y: 0,
        isVisible: true,
        isSelectable: true,
        label: labelCentre,
      })
      this.antecedentsApiGeom[i] = nuage.map((el, k) =>
        this.figuresApiGeom![i].create('Point', {
          x: el.x,
          y: el.y,
          isVisible: true,
          isSelectable: true,
          label: this.labels[i][k],
        }),
      )

      switch (this.typesDeQuestions[i]) {
        case 'segment':
          this.nbPoints[i] = 2
          enonce += `du segment $[${this.labels[i][0]}${this.labels[i][1]}]$`
          this.figuresApiGeom![i].create('Segment', {
            point1: this.antecedentsApiGeom[i][0],
            point2: this.antecedentsApiGeom[i][1],
            isVisible: true,
          })

          break
        case 'droite':
          this.nbPoints[i] = 2
          enonce += `de la droite $(${this.labels[i][0]}${this.labels[i][1]})$`

          this.figuresApiGeom![i].create('Line', {
            point1: this.antecedentsApiGeom[i][0],
            point2: this.antecedentsApiGeom[i][1],
            isVisible: true,
          })

          break
        case 'demidroite':
          this.nbPoints[i] = 2
          enonce += `de la demi-droite $[${this.labels[i][0]}${this.labels[i][1]})$`
          this.figuresApiGeom![i].create('Ray', {
            point1: this.antecedentsApiGeom[i][0],
            point2: this.antecedentsApiGeom[i][1],
            isVisible: true,
          })

          break
        case 'cercle':
          this.nbPoints[i] = 2
          enonce += `du cercle de centre $${this.labels[i][0]}$ passant par $${this.labels[i][1]}$`
          this.figuresApiGeom![i].create('CircleCenterPoint', {
            center: this.antecedentsApiGeom[i][0],
            point: this.antecedentsApiGeom[i][1],
            isVisible: true,
          })

          break
        case 'triangle':
          this.nbPoints[i] = 3
          enonce += `du triangle $${this.labels[i][0]}${this.labels[i][1]}${this.labels[i][2]}$`
          this.figuresApiGeom![i].create('Polygon', {
            points: [
              this.antecedentsApiGeom[i][0],
              this.antecedentsApiGeom[i][1],
              this.antecedentsApiGeom[i][2],
            ],
            isVisible: true,
          })

          break
        default:
          throw new Error('Type de question inconnu')
      }
      enonce +=
        this.formulations[i] === 1
          ? ` par la symétrie de centre $${labelCentre}$.`
          : ` par rapport au point $${labelCentre}$.`
      // On rend visible les points nécessaires à la figure.
      this.antecedentsApiGeom[i][0].isVisible = true
      this.antecedentsApiGeom[i][1].isVisible = true
      if (this.typesDeQuestions[i] !== 'triangle') {
        // Il n'y a que le triangle qui a 3 points.
        this.antecedentsApiGeom[i][2].isVisible = false
      }
      if (this.sup === 1) {
        this.figuresApiGeom![i].create('Grid', {
          xMin: -10,
          yMin: -10,
          xMax: 10,
          yMax: 10,
          stepX: 1,
          stepY: 1,
          color: 'gray',
          axeX: false,
          axeY: false,
          labelX: false,
          labelY: false,
        })
      }
      if (this.sup === 2) {
        for (let k = 0; k < this.nbPoints[i]; k++) {
          this.figuresApiGeom![i].create('Ray', {
            point1: this.antecedentsApiGeom[i][k] as PointApigeom,
            point2: this.centresApiGeom[i] as PointApigeom,
            isDashed: true,
            color: 'gray',
          })
        }
      }
      if (this.sup === 3) {
        for (let k = 0; k < this.nbPoints[i]; k++) {
          this.figuresApiGeom![i].create('CircleCenterPoint', {
            center: this.figuresApiGeom![i].create('Point', {
              isVisible: false,
              x: this.centresApiGeom[i].x,
              y: this.centresApiGeom[i].y,
            }),
            point: this.antecedentsApiGeom[i][k] as PointApigeom,
            isDashed: true,
            color: 'gray',
          })
        }
      }
      // Le premier état de l'historique doit contenir les données de l'énoncé :
      // sinon « Annuler » après une première construction efface la figure.
      this.figuresApiGeom![i].stackUndo = []
      this.figuresApiGeom![i].saveState()
      if (context.isHtml) {
        if (this.interactif) {
          this.listeQuestions[i] =
            enonce +
            '<br>' +
            figureApigeom({
              exercice: this,
              figure: this.figuresApiGeom![i],
              i,
              isDynamic: true,
              defaultAction: 'NAME_POINT',
            })
        } else {
          this.listeQuestions[i] =
            enonce + '<br>' + wrapperApigeomToMathalea(this.figuresApiGeom![i])
        }
      } else {
        this.listeQuestions[i] =
          enonce + '<br><br>' + this.figuresApiGeom![i].tikz()
      }
      // On crée la figure pour la correction
      const correctionFig = new Figure(
        Object.assign(options, {
          xMin: -10,
          yMin: -10,
          // Même cadrage que la figure de l'énoncé (cf. plus haut).
          width: 600,
          height: 600,
          scale,
          isDynamic: false,
        }),
      )
      correctionFig.setToolbar({ tools: ['UNDO'], position: 'top' })
      correctionFig.options.latexHeight = 20
      const sym: PointApigeom[] = []
      const centreCorrection = correctionFig.create('Point', {
        x: 0,
        y: 0,
        isVisible: true,
        isSelectable: false,
        label: this.centresApiGeom[i].label,
      })
      const copyAntecedents = this.antecedentsApiGeom[i].map((el, k) =>
        correctionFig.create('Point', {
          x: el.x,
          y: el.y,
          isVisible: true,
          isSelectable: false,
          label: this.labels[i][k],
        }),
      )
      if (this.typesDeQuestions[i] !== 'triangle') {
        copyAntecedents[2].isVisible = false
      }
      for (
        let k = 0;
        k < (this.typesDeQuestions[i] === 'triangle' ? 3 : 2);
        k++
      ) {
        sym[k] = copyAntecedents[k].rotate(centreCorrection, 180, {
          label: this.antecedentsApiGeom[i][k].label + "'",
        }) as PointApigeom
        correctionFig.create('Segment', {
          point1: copyAntecedents[k],
          point2: sym[k],
          isDashed: true,
          color: 'gray',
        })
        correctionFig.create('MarkBetweenPoints', {
          point1: sym[k],
          point2: centreCorrection,
          text: marks[k],
          fontSize: '10px',
          color: colors[k],
        })
        correctionFig.create('MarkBetweenPoints', {
          point2: copyAntecedents[k],
          point1: centreCorrection,
          text: marks[k],
          fontSize: '10px',
          color: colors[k],
        })
      }
      if (this.sup === 1) {
        correctionFig.create('Grid', {
          xMin: -10,
          yMin: -10,
          xMax: 10,
          yMax: 10,
          stepX: 1,
          stepY: 1,
          color: 'gray',
          axeX: false,
          axeY: false,
          labelX: false,
          labelY: false,
        })
      }
      if (this.sup === 2) {
        for (let k = 0; k < this.nbPoints[i]; k++) {
          correctionFig.create('Ray', {
            point1: this.antecedentsApiGeom[i][k] as PointApigeom,
            point2: this.centresApiGeom[i] as PointApigeom,
            isDashed: true,
            color: 'gray',
          })
        }
      }
      if (this.sup === 3) {
        for (let k = 0; k < this.nbPoints[i]; k++) {
          correctionFig.create('CircleCenterPoint', {
            center: this.figuresApiGeom![i].create('Point', {
              isVisible: false,
              x: this.centresApiGeom[i].x,
              y: this.centresApiGeom[i].y,
            }),
            point: this.antecedentsApiGeom[i][k] as PointApigeom,
            isDashed: true,
            color: 'gray',
          })
        }
      }
      switch (this.typesDeQuestions[i]) {
        case 'segment':
          correctionFig.create('Segment', {
            point1: sym[0],
            point2: sym[1],
            color: 'orange',
            isVisible: true,
          })
          correctionFig.create('Segment', {
            point1: copyAntecedents[0],
            point2: copyAntecedents[1],
            color: 'black',
            isVisible: true,
          })
          break
        case 'droite':
          correctionFig.create('Line', {
            point1: sym[0],
            point2: sym[1],
            color: 'orange',
            isVisible: true,
          })
          correctionFig.create('Line', {
            point1: copyAntecedents[0],
            point2: copyAntecedents[1],
            color: 'black',
            isVisible: true,
          })

          break
        case 'demidroite':
          correctionFig.create('Ray', {
            point1: sym[0],
            point2: sym[1],
            color: 'orange',
            isVisible: true,
          })
          correctionFig.create('Ray', {
            point1: copyAntecedents[0],
            point2: copyAntecedents[1],
            color: 'black',
            isVisible: true,
          })

          break
        case 'cercle':
          correctionFig.create('CircleCenterPoint', {
            center: sym[0],
            point: sym[1],
            color: 'orange',
            isVisible: true,
          })
          correctionFig.create('CircleCenterPoint', {
            center: copyAntecedents[0],
            point: copyAntecedents[1],
            color: 'black',
            isVisible: true,
          })

          break
        case 'triangle':
          correctionFig.create('Polygon', {
            points: [sym[0], sym[1], sym[2]],
            color: 'orange',
            isVisible: true,
          })
          correctionFig.create('Polygon', {
            points: [
              copyAntecedents[0],
              copyAntecedents[1],
              copyAntecedents[2],
            ],
            color: 'black',
            isVisible: true,
          })
          break
        default:
          throw new Error('Type de question inconnu')
      }
      if (
        this.questionJamaisPosee(
          i,
          this.typesDeQuestions[i],
          this.labels.join(''),
          labelCentre,
        )
      ) {
        this.listeCorrections[i] = context.isHtml
          ? wrapperApigeomToMathalea(correctionFig)
          : correctionFig.tikz()
        i++
      }
      cpt++
    }
  }

  correctionInteractive = (i: number) => {
    if (this.answers === undefined) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom![i].id] = figureAnswerJson(
      this.figuresApiGeom![i],
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const typefigure = this.typesDeQuestions[i]
    // Les étiquettes sont lues dans les données du tirage et non dans les points
    // créés à l'origine : annuler/rétablir recharge la figure et ces points
    // sont alors détruits (leur étiquette devient vide).
    const [label1, label2, label3] = this.labels[i]
    const [antecedent1, antecedent2, antecedent3] = [
      this.figuresApiGeom![i].getPointByLabel(label1),
      this.figuresApiGeom![i].getPointByLabel(label2),
      this.figuresApiGeom![i].getPointByLabel(label3),
    ]
    const centreLabel = this.labelsCentres[i]
    const centre = this.figuresApiGeom![i].getPointByLabel(centreLabel)
    if (
      antecedent1 == null ||
      antecedent2 == null ||
      antecedent3 == null ||
      centre == null
    ) {
      throw new Error('Antecedents not found')
    }
    const cords1 = rotationCoord(antecedent1, centre, 180)
    const cords2 = rotationCoord(antecedent2, centre, 180)
    const cords3 = rotationCoord(antecedent3, centre, 180)
    let resultat: boolean
    let resultat2: boolean
    let resultat3: boolean
    let resultat4: boolean
    const results = ['KO', 'KO']
    const feedbacks: string[] = []
    // Le feedback reprend le vocabulaire de la question (image ou symétrique).
    const messagePointIncorrect = (label: string) =>
      this.formulations[i] === 1
        ? `L'image du point $${label}$ n'est pas correcte.`
        : `Le symétrique du point $${label}$ n'est pas correct.`
    switch (typefigure) {
      case 'segment':
        resultat = checkSegment({
          figure: this.figuresApiGeom![i],
          point1: cords1,
          point2: cords2,
        }).isValid
        if (resultat) {
          results[0] = 'OK'
        }
        resultat2 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords1.x,
          y: cords1.y,
          // label: this.antecedents[i][0].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat3 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords2.x,
          y: cords2.y,
          // label: this.antecedents[i][1].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        if (!resultat2) {
          feedbacks.push(messagePointIncorrect(label1))
        }
        if (!resultat3) {
          feedbacks.push(messagePointIncorrect(label2))
        }
        if (resultat2 && resultat3) results[1] = 'OK'
        break

      case 'droite':
        resultat = checkLine({
          figure: this.figuresApiGeom![i],
          point1: cords1,
          point2: cords2,
        }).isValid
        if (resultat) results[0] = 'OK'
        resultat2 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords1.x,
          y: cords1.y,
          // label: this.antecedents[i][0].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat3 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords2.x,
          y: cords2.y,
          // label: this.antecedents[i][1].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        if (!resultat2) {
          feedbacks.push(messagePointIncorrect(label1))
        }
        if (!resultat3) {
          feedbacks.push(messagePointIncorrect(label2))
        }
        if (resultat2 && resultat3) results[1] = 'OK'
        break

      case 'demidroite':
        resultat = checkRay({
          figure: this.figuresApiGeom![i],
          point1: cords1,
          point2: cords2,
        }).isValid
        if (resultat) results[0] = 'OK'
        resultat2 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords1.x,
          y: cords1.y,
          // label: this.antecedents[i][0].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat3 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords2.x,
          y: cords2.y,
          // label: this.antecedents[i][1].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        if (resultat2 && resultat3) results[1] = 'OK'
        if (!resultat2) {
          feedbacks.push(messagePointIncorrect(label1))
        }
        if (!resultat3) {
          feedbacks.push(messagePointIncorrect(label2))
        }
        break

      case 'cercle':
        resultat = checkCircle({
          figure: this.figuresApiGeom![i],
          center: cords1,
          // labelCenter: this.antecedents[i][0].label + "'",
          radius: Math.sqrt(
            (cords2.x - cords1.x) ** 2 + (cords2.y - cords1.y) ** 2,
          ),
        }).isValid
        if (resultat) results[0] = 'OK'
        resultat2 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords1.x,
          y: cords1.y,
          // label: this.antecedents[i][0].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat3 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords2.x,
          y: cords2.y,
          // label: this.antecedents[i][1].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        if (resultat2 && resultat3) results[1] = 'OK'
        if (!resultat2) {
          feedbacks.push(messagePointIncorrect(label1))
        }
        if (!resultat3) {
          feedbacks.push(messagePointIncorrect(label2))
        }

        break

      case 'triangle':
        // Le triangle peut être tracé avec l'outil Polygone ou avec trois segments.
        resultat =
          checkPolygon({
            figure: this.figuresApiGeom![i],
            points: [cords1, cords2, cords3],
          }).isValid ||
          [cords1, cords2, cords3].every(
            (point, k, points) =>
              checkSegment({
                figure: this.figuresApiGeom![i],
                point1: point,
                point2: points[(k + 1) % points.length],
              }).isValid,
          )
        if (resultat) results[0] = 'OK'
        resultat2 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords1.x,
          y: cords1.y,
          // label: this.antecedents[i][0].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat3 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords2.x,
          y: cords2.y,
          // label: this.antecedents[i][1].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        resultat4 = checkCoords({
          figure: this.figuresApiGeom![i],
          x: cords3.x,
          y: cords3.y,
          // label: this.antecedents[i][2].label + "'",
          checkOnlyAbscissa: false,
        }).isValid
        if (!resultat2) {
          feedbacks.push(messagePointIncorrect(label1))
        }
        if (!resultat3) {
          feedbacks.push(messagePointIncorrect(label2))
        }
        if (!resultat4) {
          feedbacks.push(messagePointIncorrect(label3))
        }
        if (resultat2 && resultat3 && resultat4) results[1] = 'OK'
        break

      default:
        throw new Error('Type de question inconnu')
    }
    if (results[0] === 'OK' && results[1] === 'OK') {
      if (divFeedback) {
        divFeedback.innerHTML = 'Bravo !<br/>2/2'
      }
      this.figuresApiGeom![i].isDynamic = false
      this.figuresApiGeom![i].divButtons.style.display = 'none'
      this.figuresApiGeom![i].divUserMessage.style.display = 'none'
      return results
    } else {
      if (divFeedback && results.includes('OK') && this.nbQuestions > 1) {
        feedbacks.push('1/2')
      }
      if (divFeedback && !results.includes('OK') && this.nbQuestions > 1) {
        feedbacks.push('0/2')
      }
      if (feedbacks.length) {
        divFeedback.innerHTML = feedbacks.join('<br/>')
      }
      this.figuresApiGeom![i].isDynamic = false
      this.figuresApiGeom![i].divButtons.style.display = 'none'
      this.figuresApiGeom![i].divUserMessage.style.display = 'none'
      return results
    }
  }
}
export default ConstructionsSymetrieCentraleFigures
