import Figure from 'apigeom'
import type Point from 'apigeom/src/elements/points/Point'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import figureApigeom from '../../lib/figureApigeom'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { rangeMinMax } from '../../lib/outils/nombres'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'

export const titre =
  "Construire un point à partir d'une égalité vectorielle sur une grille"
export const interactifReady = true
export const dateDePublication = '17/08/2024'

/** Construire un point à partir d'une égalité vectorielle sur une grille
 * @author Éric Elter
 */
export const uuid = '6cf42'

export const refs = {
  'fr-fr': ['2G23-2', 'BP1GEO09'],
  'fr-ch': ['3G91-3'],
}

export default class SommeDeVecteurs extends Exercice {
  longueur?: number
  largeur?: number
  pointExtremite: Point[] = []
  nomExtremite: string[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 1
    this.besoinFormulaireTexte = [
      'Situations différentes ',
      "1 : 2 vecteurs depuis l'origine\n2 : 1 seul vecteur depuis l'origine\n3 : Aucun vecteur depuis l'origine\n4 : Mélange",
    ]
  }

  nouvelleVersion() {
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    this.longueur = 10
    this.largeur = 10
    this.figuresApiGeom = []
    this.figuresApiGeomCorr = []
    this.pointExtremite = []
    this.nomExtremite = []
    let choixU
    let choixV
    const xSomme = []
    const ySomme = []
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const choix =
        listeDeQuestions[i] === 4 ? randint(1, 3) : listeDeQuestions[i]
      switch (choix) {
        case 1:
          choixU = 'origine'
          choixV = 'origine'
          break
        case 2:
          if (choice([false, true])) {
            choixU = 'origine'
            choixV = 'pas0rigine'
          } else {
            choixV = 'origine'
            choixU = 'pas0rigine'
          }
          break
        case 3:
        default:
          choixU = 'pas0rigine'
          choixV = 'pas0rigine'
          break
      }
      this.figuresApiGeom[i] = new Figure({
        xMin: -this.longueur - 0.25, // On enlève 0.25 unités
        yMin: -this.largeur - 0.25,
        // `width`/`height` sont exprimées à l'échelle 1 (30 px par unité) ;
        // `scale` réduit ensuite le SVG à 65 %.
        width: this.longueur * 2 * 30 + 20, // On ajoute 20 pixels
        height: this.largeur * 2 * 30 + 20,
        border: false,
        scale: 0.65,
      })

      // Préparation de la correction animée
      this.figuresApiGeomCorr[i] = new Figure({
        xMin: -this.longueur - 0.25, // On enlève 0.25 unités
        yMin: -this.largeur - 0.25,
        // `width`/`height` sont exprimées à l'échelle 1 (30 px par unité) ;
        // `scale` réduit ensuite le SVG à 65 %.
        width: this.longueur * 2 * 30 + 20, // On ajoute 20 pixels
        height: this.largeur * 2 * 30 + 20,
        border: false,
        scale: 0.65,
      })

      this.figuresApiGeom[i].grid = this.figuresApiGeom[i].create('Grid', {
        strokeWidthGrid: 1,
        yMin: -this.largeur + 0.1,
        yMax: this.largeur - 0.1,
        xMax: this.longueur - 0.1,
        xMin: -this.longueur + 0.1,
        axeX: true,
        axeY: true,
        repereOij: true,
      })

      this.figuresApiGeomCorr[i].grid = this.figuresApiGeomCorr[i].create(
        'Grid',
        {
          strokeWidthGrid: 1,
          yMin: -this.largeur + 0.1,
          yMax: this.largeur - 0.1,
          xMax: this.longueur - 0.1,
          xMin: -this.longueur + 0.1,
          axeX: true,
          axeY: true,
          repereOij: true,
        },
      )

      this.figuresApiGeom[i].snapGrid = true
      this.figuresApiGeom[i].setToolbar({
        tools: [
          'DRAG',
          'REMOVE',
          'VECTOR',
          'POINT',
          'SET_OPTIONS',
          'NAME_POINT',
          'ZOOM_IN',
          'ZOOM_OUT',
          'GRID',
        ],
        // position: 'top'
      })
      this.figuresApiGeom[i].options.thickness = 3
      this.figuresApiGeom[i].options.color = bleuMathalea
      this.figuresApiGeom[i].buttons.get('POINT')?.click()

      /*
      On construit au hasard :
      1. le point origine
      2. le vecteur somme (vecteur solution)
      3. le vecteur1, le vecteur 2 et le pointIntermédiaire (= extrémité vecteur1 = origine vecteur2)
      On s'arrange pour que les vecteurs soient sur la grille et qu'ils soient assez séparés pour être distinguables
      */

      let xOrigin: number
      let yOrigin: number
      xSomme[i] = randint(0, 14) * choice([-1, 1])
      // il faut que le vecteur somme ait une longueur supérieure au moins à 5 unités par exemple
      const val = 25 - xSomme[i] * xSomme[i]
      ySomme[i] =
        val <= 0
          ? randint(0, 14) * choice([-1, 1])
          : randint(Math.ceil(Math.sqrt(val)), 14) * choice([-1, 1])
      const longueurVecteurSomme = Math.sqrt(
        xSomme[i] * xSomme[i] + ySomme[i] * ySomme[i],
      )

      if (xSomme[i] <= -10) xOrigin = randint(5, 8)
      else if (xSomme[i] <= -6) xOrigin = randint(1, 8)
      else if (xSomme[i] <= -2) xOrigin = randint(-3, 8)
      else if (xSomme[i] >= 10) xOrigin = randint(-8, -5)
      else if (xSomme[i] >= 6) xOrigin = randint(-8, -1)
      else if (xSomme[i] >= 2) xOrigin = randint(-8, 3)
      else xOrigin = randint(-6, 6)
      if (ySomme[i] <= -10) yOrigin = randint(5, 8)
      else if (ySomme[i] <= -6) yOrigin = randint(1, 8)
      else if (ySomme[i] <= -2) yOrigin = randint(-3, 8)
      else if (ySomme[i] >= 10) yOrigin = randint(-8, -5)
      else if (ySomme[i] >= 6) yOrigin = randint(-8, -1)
      else if (ySomme[i] >= 2) yOrigin = randint(-8, 3)
      else yOrigin = randint(-6, 6)

      const numeroOrigine = randint(1, 26, [15]) // 15 : Pour éviter le point O
      const nomOrigine = lettreDepuisChiffre(numeroOrigine)
      const numeroExtremite = randint(1, 26, [15, numeroOrigine])
      this.nomExtremite[i] = lettreDepuisChiffre(numeroExtremite)
      let pointOrigine = this.figuresApiGeom[i].create('Point', {
        x: xOrigin,
        y: yOrigin,
        label: nomOrigine,
        color: 'black',
        thickness: 3,
        isSelectable: false,
      })
      const pointOrigineCorrection = this.figuresApiGeomCorr[i].create(
        'Point',
        {
          x: xOrigin,
          y: yOrigin,
          label: nomOrigine,
          color: 'black',
          thickness: 3,
          isSelectable: false,
        },
      )
      this.pointExtremite[i] = this.figuresApiGeom[i].create('Point', {
        x: xOrigin + xSomme[i],
        y: yOrigin + ySomme[i],
        isVisible: false,
        // Sinon ce point caché bloque la création d'un point à la bonne position
        isSelectable: false,
      })

      let distanceOrigineProjOrthogonal
      let distancePointIntermediaireProjOrthogonal
      let distanceVecteurSommeProfOrthogonal
      let xPointIntermediaire, xPointSecondIntermediaire
      let yPointIntermediaire, yPointSecondIntermediaire
      let indice = 0
      const vecteur2: { x: number; y: number } = { x: 0, y: 0 }
      const limitxgauche = pointOrigine.x + 9
      const limitxdroite = 9 - pointOrigine.x
      const limitygauche = pointOrigine.y + 9
      const limitydroite = 9 - pointOrigine.y
      do {
        // console.info('longueurVecteurSomme:', longueurVecteurSomme)
        // console.info('limitxgauche:', limitxgauche)
        // console.info('limitxdroite:', limitxdroite)
        // console.info('limitygauche:', limitygauche)
        // console.info('limitydroite:', limitydroite)
        if (this.pointExtremite[i].x >= pointOrigine.x) {
          xPointIntermediaire = randint(
            pointOrigine.x,
            pointOrigine.x + limitxdroite,
          )
          xPointSecondIntermediaire =
            this.pointExtremite[i].x + pointOrigine.x - xPointIntermediaire
          // console.info('xPointIntermediaire:', xPointIntermediaire)
          // console.info('xPointSecondIntermediaire:', xPointSecondIntermediaire)
        } else {
          xPointIntermediaire = randint(
            pointOrigine.x - limitxgauche,
            pointOrigine.x,
          )
          xPointSecondIntermediaire =
            this.pointExtremite[i].x + pointOrigine.x - xPointIntermediaire
          // console.info('xPointIntermediaire:', xPointIntermediaire)
          // console.info('xPointSecondIntermediaire:', xPointSecondIntermediaire)
        }
        while (xPointSecondIntermediaire > 9) {
          xPointSecondIntermediaire--
          xPointIntermediaire++
          // console.info('while xPointIntermediaire:', xPointIntermediaire)
          // console.info('while xPointSecondIntermediaire:', xPointSecondIntermediaire)
        }
        while (xPointSecondIntermediaire < -9) {
          xPointSecondIntermediaire++
          xPointIntermediaire--
        }
        if (this.pointExtremite[i].y >= pointOrigine.y) {
          yPointIntermediaire = randint(
            pointOrigine.y,
            pointOrigine.y + limitydroite,
          )
          yPointSecondIntermediaire =
            this.pointExtremite[i].y + pointOrigine.y - yPointIntermediaire
          // console.info('yPointIntermediaire:', yPointIntermediaire)
          // console.info('yPointSecondIntermediaire:', yPointSecondIntermediaire)
        } else {
          yPointIntermediaire = randint(
            pointOrigine.y - limitygauche,
            pointOrigine.y,
          )
          yPointSecondIntermediaire =
            this.pointExtremite[i].y + pointOrigine.y - yPointIntermediaire
          // console.info('yPointIntermediaire:', yPointIntermediaire)
          // console.info('yPointSecondIntermediaire:', yPointSecondIntermediaire)
        }
        while (yPointSecondIntermediaire > 9) {
          yPointSecondIntermediaire--
          yPointIntermediaire++
          // console.info('whileyPointIntermediaire:', yPointIntermediaire)
        }
        while (yPointSecondIntermediaire < -9) {
          yPointSecondIntermediaire++
          yPointIntermediaire--
          // console.info('whileyPointIntermediaire:', yPointIntermediaire)
          // console.info('whileyPointSecondIntermediaire:', yPointSecondIntermediaire)
        }
        distanceOrigineProjOrthogonal = Math.abs(
          ((xPointIntermediaire - pointOrigine.x) * xSomme[i] +
            (yPointIntermediaire - pointOrigine.y) * ySomme[i]) /
            Math.sqrt(xSomme[i] * xSomme[i] + ySomme[i] * ySomme[i]),
        )
        distancePointIntermediaireProjOrthogonal = Math.sqrt(
          (xPointIntermediaire - pointOrigine.x) *
            (xPointIntermediaire - pointOrigine.x) +
            (yPointIntermediaire - pointOrigine.y) *
              (yPointIntermediaire - pointOrigine.y),
        )
        distanceVecteurSommeProfOrthogonal = Math.sqrt(
          distancePointIntermediaireProjOrthogonal *
            distancePointIntermediaireProjOrthogonal -
            distanceOrigineProjOrthogonal * distanceOrigineProjOrthogonal,
        )
        // console.info('distanceVecteurSommeProfOrthogonal:', distanceVecteurSommeProfOrthogonal)
        vecteur2.x = this.pointExtremite[i].x - xPointIntermediaire
        vecteur2.y = this.pointExtremite[i].y - yPointIntermediaire
        // console.info('aire:', distanceVecteurSommeProfOrthogonal * longueurVecteurSomme / 2)
        // console.info('indice:', indice)
        indice++
      } while (
        indice < 50 &&
        !(
          distanceVecteurSommeProfOrthogonal > 1 &&
          (distanceVecteurSommeProfOrthogonal * longueurVecteurSomme) / 2 > 4 &&
          pointOrigine.x + vecteur2.x <= 9 &&
          pointOrigine.x + vecteur2.x >= -9 &&
          pointOrigine.y + vecteur2.y <= 9 &&
          pointOrigine.y + vecteur2.y >= -9
        )
      )
      /* Explications des conditions du while
      distanceVecteurSommeProfOrthogonal > 1 : Pour que le projeté orthogonal de point1 sur le vecteur somme soit assez loin du vecteur (pour éviter des vecteurs presque colinéaires)
      distanceVecteurSommeProfOrthogonal * longueurVecteurSomme / 2 > 4 : Pour que le triangle formé par vecteur1, vecteur2 et vecteurSomme ait une aire suffisamment grande (pour éviter des vecteurs presque colinéaires)
      Autres conditions : pour que le PointIntermediaire soit sur la grille
      */
      if (indice >= 50) {
        window.notify('On a un problème houston!', {
          exercice: JSON.stringify(this),
        })
      }
      const vecteur1 = {
        x: xPointIntermediaire - pointOrigine.x,
        y: yPointIntermediaire - pointOrigine.y,
      }

      let pointOrigineChoix2X = 0
      let pointOrigineChoix2Y = 0
      if (choixU === 'origine') {
        this.figuresApiGeom[i].create('Vector', {
          origin: pointOrigine,
          x: vecteur1.x,
          y: vecteur1.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{u}',
          isSelectable: false,
        })
        this.figuresApiGeomCorr[i].create('Vector', {
          origin: pointOrigine,
          x: vecteur1.x,
          y: vecteur1.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{u}',
          isSelectable: false,
        })
      } else {
        pointOrigineChoix2X = choice(
          rangeMinMax(
            Math.max(-9, -9 - vecteur1.x),
            Math.min(9, 9 - vecteur1.x),
            xOrigin,
          ),
        )
        pointOrigineChoix2Y = choice(
          rangeMinMax(
            Math.max(-9, -9 - vecteur1.y),
            Math.min(9, 9 - vecteur1.y),
            yOrigin,
          ),
        )
        const pointOrigineChoix2 = this.figuresApiGeom[i].create('Point', {
          x: pointOrigineChoix2X,
          y: pointOrigineChoix2Y,
          isVisible: false,
        })
        const pointOrigineChoix2Cor = this.figuresApiGeomCorr[i].create(
          'Point',
          {
            x: pointOrigineChoix2X,
            y: pointOrigineChoix2Y,
            isVisible: false,
          },
        )
        this.figuresApiGeom[i].create('Vector', {
          origin: pointOrigineChoix2,
          x: vecteur1.x,
          y: vecteur1.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{u}',
          isSelectable: false,
        })
        this.figuresApiGeomCorr[i].create('Vector', {
          origin: pointOrigineChoix2Cor,
          x: vecteur1.x,
          y: vecteur1.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{u}',
          isSelectable: false,
        })
      }

      let pointOrigineChoix3X = 0
      let pointOrigineChoix3Y = 0
      if (choixV === 'origine') {
        this.figuresApiGeom[i].create('Vector', {
          origin: pointOrigine,
          x: vecteur2.x,
          y: vecteur2.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{v}',
          isSelectable: false,
        })
        this.figuresApiGeomCorr[i].create('Vector', {
          origin: pointOrigine,
          x: vecteur2.x,
          y: vecteur2.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{v}',
          isSelectable: false,
        })
      } else {
        pointOrigineChoix3X = choice(
          rangeMinMax(
            Math.max(-9, -9 - vecteur2.x),
            Math.min(9, 9 - vecteur2.x),
            xOrigin,
          ),
        )
        pointOrigineChoix3Y = choice(
          rangeMinMax(
            Math.max(-9, -9 - vecteur2.y),
            Math.min(9, 9 - vecteur2.y),
            yOrigin,
          ),
        )
        const pointOrigineChoix3 = this.figuresApiGeom[i].create('Point', {
          x: pointOrigineChoix3X,
          y: pointOrigineChoix3Y,
          isVisible: false,
        })
        const pointOrigineChoix3Cor = this.figuresApiGeomCorr[i].create(
          'Point',
          {
            x: pointOrigineChoix3X,
            y: pointOrigineChoix3Y,
            isVisible: false,
          },
        )
        this.figuresApiGeom[i].create('Vector', {
          origin: pointOrigineChoix3,
          x: vecteur2.x,
          y: vecteur2.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{v}',
          isSelectable: false,
        })
        this.figuresApiGeomCorr[i].create('Vector', {
          origin: pointOrigineChoix3Cor,
          x: vecteur2.x,
          y: vecteur2.y,
          color: bleuMathalea,
          thickness: 3,
          label: '\\vec{v}',
          isSelectable: false,
        })
      }

      pointOrigine = this.figuresApiGeom[i].create('Point', {
        x: xOrigin,
        y: yOrigin,
        label: nomOrigine,
        color: 'black',
        thickness: 3,
        isSelectable: false,
      })
      this.figuresApiGeomCorr[i].create('Point', {
        x: xOrigin,
        y: yOrigin,
        label: nomOrigine,
        color: 'black',
        thickness: 3,
        isSelectable: false,
      })
      texte = `Construire le point $${this.nomExtremite[i]}$ tel que $\\overrightarrow{${nomOrigine}${this.nomExtremite[i]}} = \\vec{u} + \\vec{v}$.<br>`
      if (context.isHtml) {
        texte += figureApigeom({
          exercice: this,
          figure: this.figuresApiGeom[i],
          i,
        })
      } else {
        this.figuresApiGeom[i].options.latexHeight = 20
        this.figuresApiGeom[i].options.latexWidth = 20
        texte += this.figuresApiGeom[i].tikz()
      }

      this.figuresApiGeomCorr[i].options.animationStepInterval = 250
      this.figuresApiGeomCorr[i].grid!.color = 'gray'
      this.figuresApiGeomCorr[i].options.latexHeight = 20
      this.figuresApiGeomCorr[i].options.latexWidth = 20

      this.figuresApiGeomCorr[i].setToolbar({
        position: 'top',
        tools: [
          'RESTART',
          'PLAY_SKIP_BACK',
          'PLAY',
          'PLAY_SKIP_FORWARD',
          'PAUSE',
        ],
      })
      this.figuresApiGeomCorr[i].stackUndo = []
      this.figuresApiGeomCorr[i].stackRedo = []
      this.figuresApiGeomCorr[i].saveState()
      const pointAnimation = []
      const vecteurAnimation = []
      if (choixV === 'origine' && choixU === 'origine') {
        for (let ee = 0; ee < 11; ee++) {
          pointAnimation[ee] = this.figuresApiGeomCorr[i].create('Point', {
            x: xOrigin + ((xPointIntermediaire - xOrigin) * ee) / 10,
            y: yOrigin + ((yPointIntermediaire - yOrigin) * ee) / 10,
            isVisible: false,
          })
          vecteurAnimation[ee] = this.figuresApiGeomCorr[i].create('Vector', {
            origin: pointAnimation[ee],
            x: vecteur2.x,
            y: vecteur2.y,
            color: 'green',
            thickness: 3,
            label: '\\vec{v}',
          })
          this.figuresApiGeomCorr[i].saveState()
          if (ee !== 10) {
            vecteurAnimation[ee].hide()
            vecteurAnimation[ee].label = ''
          }
        }
      } else if (choixV === 'origine' && choixU !== 'origine') {
        for (let ee = 0; ee < 11; ee++) {
          pointAnimation[ee] = this.figuresApiGeomCorr[i].create('Point', {
            x:
              pointOrigineChoix2X +
              ((xOrigin + vecteur2.x - pointOrigineChoix2X) * ee) / 10,
            y:
              pointOrigineChoix2Y +
              ((yOrigin + vecteur2.y - pointOrigineChoix2Y) * ee) / 10,
            isVisible: false,
          })
          vecteurAnimation[ee] = this.figuresApiGeomCorr[i].create('Vector', {
            origin: pointAnimation[ee],
            x: vecteur1.x,
            y: vecteur1.y,
            color: 'green',
            thickness: 3,
            label: '\\vec{u}',
          })
          this.figuresApiGeomCorr[i].saveState()
          if (ee !== 10) {
            vecteurAnimation[ee].hide()
            vecteurAnimation[ee].label = ''
          }
        }
      } else if (choixV !== 'origine' && choixU === 'origine') {
        for (let ee = 0; ee < 11; ee++) {
          pointAnimation[ee] = this.figuresApiGeomCorr[i].create('Point', {
            x:
              pointOrigineChoix3X +
              ((xPointIntermediaire - pointOrigineChoix3X) * ee) / 10,
            y:
              pointOrigineChoix3Y +
              ((yPointIntermediaire - pointOrigineChoix3Y) * ee) / 10,
            isVisible: false,
          })
          vecteurAnimation[ee] = this.figuresApiGeomCorr[i].create('Vector', {
            origin: pointAnimation[ee],
            x: vecteur2.x,
            y: vecteur2.y,
            color: 'green',
            thickness: 3,
            label: '\\vec{v}',
          })
          this.figuresApiGeomCorr[i].saveState()
          if (ee !== 10) {
            vecteurAnimation[ee].hide()
            vecteurAnimation[ee].label = ''
          }
        }
      } else {
        // (choixV !== 'origine' && choixU !== 'origine')
        for (let ee = 0; ee < 11; ee++) {
          pointAnimation[ee] = this.figuresApiGeomCorr[i].create('Point', {
            x:
              pointOrigineChoix2X + ((xOrigin - pointOrigineChoix2X) * ee) / 10,
            y:
              pointOrigineChoix2Y + ((yOrigin - pointOrigineChoix2Y) * ee) / 10,
            isVisible: false,
          })
          vecteurAnimation[ee] = this.figuresApiGeomCorr[i].create('Vector', {
            origin: pointAnimation[ee],
            x: vecteur1.x,
            y: vecteur1.y,
            color: 'green',
            thickness: 3,
            label: '\\vec{u}',
          })
          this.figuresApiGeomCorr[i].saveState()
          if (ee !== 10) {
            vecteurAnimation[ee].hide()
            vecteurAnimation[ee].label = ''
          }
        }
        for (let ee = 0; ee < 11; ee++) {
          pointAnimation[ee] = this.figuresApiGeomCorr[i].create('Point', {
            x:
              pointOrigineChoix3X +
              ((xPointIntermediaire - pointOrigineChoix3X) * ee) / 10,
            y:
              pointOrigineChoix3Y +
              ((yPointIntermediaire - pointOrigineChoix3Y) * ee) / 10,
            isVisible: false,
          })
          vecteurAnimation[ee] = this.figuresApiGeomCorr[i].create('Vector', {
            origin: pointAnimation[ee],
            x: vecteur2.x,
            y: vecteur2.y,
            color: 'green',
            thickness: 3,
            label: '\\vec{v}',
          })
          this.figuresApiGeomCorr[i].saveState()
          if (ee !== 10) {
            vecteurAnimation[ee].hide()
            vecteurAnimation[ee].label = ''
          }
        }
      }
      this.figuresApiGeomCorr[i].create('Vector', {
        origin: pointOrigineCorrection,
        x: xSomme[i],
        y: ySomme[i],
        color: orangeMathalea,
        thickness: 3,
      })
      this.figuresApiGeomCorr[i].create('Point', {
        x: this.pointExtremite[i].x,
        y: this.pointExtremite[i].y,
        colorLabel: orangeMathalea,
        color: orangeMathalea,
        label: this.nomExtremite[i],
      })

      this.figuresApiGeomCorr[i].saveState()

      if (context.isHtml) {
        texteCorr =
          figureApigeom({
            animation: true,
            exercice: this,
            i,
            idAddendum: 'Correction',
            figure: this.figuresApiGeomCorr[i],
          }) + '<br>'
      } else {
        texteCorr = this.figuresApiGeomCorr[i].tikz() + '<br>'
      }
      texteCorr += `Le point $${this.nomExtremite[i]}$ tel que $\\overrightarrow{${nomOrigine}${this.nomExtremite[i]}} = \\vec{u} + \\vec{v}$ a pour coordonnées ${texteEnCouleurEtGras(`$(${this.pointExtremite[i].x}\\,;\\,${this.pointExtremite[i].y})$`)}.<br>`

      if (this.questionJamaisPosee(i, xSomme[i], ySomme[i], xOrigin, yOrigin)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  correctionInteractive = (i: number) => {
    if (
      i === undefined ||
      this.figuresApiGeom === undefined ||
      this.figuresApiGeom[i] === undefined
    )
      return ['KO']
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom[i].id] = figureAnswerJson(
      this.figuresApiGeom[i],
    )
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    const divCheck = document.querySelector(
      `#resultatCheckEx${this.numeroExercice}Q${i}`,
    )

    this.figuresApiGeom[i].isDynamic = false
    this.figuresApiGeom[i].divButtons.style.display = 'none'
    this.figuresApiGeom[i].divUserMessage.style.display = 'none'
    const nbPoints = [...this.figuresApiGeom[i].elements.values()].filter(
      (e) =>
        e.type === 'Point' && 'isVisible' in e && e.isVisible && !e.isChild,
    ).length
    const onePointWasAdded = nbPoints >= 3

    if (!onePointWasAdded) {
      if (divFeedback) {
        divFeedback.innerHTML = "Aucun point n'a été créé."
      }
      return 'KO'
    }

    const resultatCheck = this.figuresApiGeom[i].checkCoords({
      label: this.nomExtremite[i],
      x: this.pointExtremite[i].x,
      y: this.pointExtremite[i].y,
    })
    divFeedback.innerHTML = resultatCheck.message
    if (divCheck) divCheck.innerHTML = resultatCheck.isValid ? '😎' : '☹️'
    return resultatCheck.isValid ? 'OK' : 'KO'
  }
}
