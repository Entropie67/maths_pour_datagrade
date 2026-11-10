/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/unit/5G11-10.test.ts ⚠️
 */

import Figure from 'apigeom'
import { rotationCoord } from 'apigeom/src/elements/calculus/Coords'
import type PointApigeom from 'apigeom/src/elements/points/Point'
import { cercleCentrePoint } from '../../lib/2d/cercle'
import { codageMilieu } from '../../lib/2d/CodageMilieu'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { demiDroite } from '../../lib/2d/DemiDroite'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { grille } from '../../lib/2d/Grille'
import { pointAbstrait, PointAbstrait } from '../../lib/2d/PointAbstrait'
import { labelPoint } from '../../lib/2d/textes'
import { TracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import { bleuMathalea } from '../../lib/colors'
import { elementVivant } from '../../lib/apigeom/elementVivant'
import figureApigeom from '../../lib/figureApigeom'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { shuffle } from '../../lib/outils/arrayOutils'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { contraindreValeur, egal, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  'Construire des symétriques de points par rapport à un point'
export const dateDePublication = '27/09/2024'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'

export const uuid = '67c96'
export const refs = {
  'fr-fr': ['5G3A-2'],
  'fr-2016': ['5G11-10'],
  'fr-ch': ['9R1ES4D-3', '9R2ES4D-3', '9R3ES4D-3'],
}

/**
 * Fonction pour positionner le label
 * @param pointA
 * @param pointB
 */
function positionneLabel(pointA: PointAbstrait, pointB: PointAbstrait) {
  if (pointA.x < pointB.x) return 'above left'
  else if (pointA.x > pointB.x) return 'below right'
  else {
    if (pointA.y > pointB.y) return 'above left'
    else return 'below right'
  }
}

/**
 * fonction pour verifier qu'on est dans le cadre
 * @param points
 */
function checkDistance(points: { x: number; y: number }[]) {
  for (const point of points) {
    if (point.y < -8 || point.y > 8) {
      return false
    }
  }
  return true
}

/**
 * Construction interactive de symétriques de points
 * @author Jean-claude Lhote
 */
class ConstrctionsSymetrieCentralePoints extends Exercice {
  antecedents2d!: object[][]
  antecedentsApiGeom!: PointApigeom[][]
  labels!: string[][]
  centres2d!: PointAbstrait[]
  centresApiGeom!: PointApigeom[]
  exoCustomResultat: boolean
  nbPoints!: number
  constructor() {
    super()
    this.exoCustomResultat = true
    this.reponseCourteDisponible = false // Construction : pas de réponse courte.
    this.nbQuestions = 1

    this.besoinFormulaireNumerique = [
      "Type d'aide",
      4,
      'Quadrillages\nDemi-droites en pointillés\nMarques de compas\nAucune',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de points à construire (5 maxi)',
      5,
    ]
    this.sup = 1
    this.sup2 = 3
  }

  nouvelleVersion() {
    const marks: string[] = ['//', '///', 'x', 'O', '|||']
    const colors: string[] = context.isHtml
      ? ['red', 'green', 'purple', bleuMathalea, 'gray']
      : ['gray', 'gray', 'gray', 'gray', 'gray']
    this.answers = {}

    this.figuresApiGeom = []
    this.nbPoints = contraindreValeur(1, 5, this.sup2, 3) // on veut entre 1 et 5 points à construire
    this.antecedents2d = []
    this.labels = []
    this.centres2d = []
    this.centresApiGeom = []
    this.antecedentsApiGeom = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 20;) {
      let enonce = ''
      // Ici on fait une figure Mathalea2d, pas apiGeom. On est en mode non interactif pour l'instant
      let antecedents2d: Array<PointAbstrait> = []
      const symetriques: PointAbstrait[] = []
      const objets: NestedObjetMathalea2dArray = []
      let objetsCorrection: NestedObjetMathalea2dArray = []

      objets.length = 0
      objetsCorrection.length = 0
      symetriques.length = 0
      antecedents2d.length = 0
      let nuage: { x: number; y: number }[] = []
      // On construit les points
      do {
        nuage = []
        for (let x = -8; x < 8; x += 1) {
          if (x !== 0) nuage.push({ y: (randint(2, 8) + 1) * (-1) ** x, x })
        }
        nuage = shuffle(nuage)
        nuage = nuage.slice(0, this.nbPoints)
      } while (!checkDistance(nuage))

      this.labels[i] = Array.from(
        choisitLettresDifferentes(nuage.length, 'Q', true),
      )
      const labelCentre = choisitLettresDifferentes(
        1,
        this.labels[i].join('') + 'Q',
        true,
      )[0]

      // Les antécédents sont des points nommés
      antecedents2d = shuffle(nuage).map((el, k) =>
        pointAbstrait(el.x, el.y, this.labels[i][k]),
      ) // on mélange et on ne prendra que les this.nbPoints premiers
      this.centres2d[i] = pointAbstrait(0, 0, labelCentre, 'above')

      const guideDroites = []
      for (let k = 0; k < this.nbPoints; k++) {
        const guide = demiDroite(antecedents2d[k], this.centres2d[i])
        guide.pointilles = 2
        guide.color = colorToLatexOrHTML(colors[k])
        guide.opacite = 0.8
        guideDroites.push(guide)
      }
      enonce =
        `${this.sup === 1 ? 'Placer' : 'Construire'} le${this.nbPoints > 1 ? 's' : ''} symétrique${this.nbPoints > 1 ? 's' : ''} $${this.nbPoints > 1 ? this.labels[i].slice(0, this.nbPoints - 1).join("',") + "'" : this.labels[i][0] + "' "}$` +
        (this.nbPoints > 1
          ? ` et $${this.labels[i][this.nbPoints - 1] + "'"}$`
          : '') +
        (this.nbPoints > 1 ? ' respectifs ' : '')
      enonce +=
        `${this.nbPoints > 1 ? ' des' : ' du'} point${this.nbPoints > 1 ? 's' : ''} $${this.nbPoints > 1 ? this.labels[i].slice(0, this.nbPoints - 1).join(',') : this.labels[i][0] + `$ par rapport au point $${labelCentre}`}$` +
        (this.nbPoints > 1
          ? ` et $${this.labels[i][this.nbPoints - 1]}$ par rapport au point $${labelCentre}$.<br>`
          : '.<br>')
      const guidesArc = []
      for (let k = 0; k < this.nbPoints; k++) {
        symetriques[k] = rotation(antecedents2d[k], this.centres2d[i], 180)
        /*  const angleOffset = choice([-12, -10, -8, 8, 10, 12])
          const ext1 = rotation(symetriques[k], middle[k], 3 * angleOffset)
          const ext2 = rotation(symetriques[k], middle[k], -angleOffset)
         */
        const guide = cercleCentrePoint(
          this.centres2d[i],
          antecedents2d[k],
          colors[k],
        )
        guide.pointilles = 2
        guide.opacite = 0.8
        guidesArc.push(guide)
      }
      if (this.sup === 1) {
        objets.push(grille(-8, -8, 8, 8, 'gray', 0.5, 1, 0))
      } else if (this.sup === 2) {
        enonce += `Les demi-droites tracées en pointillés passent par $${labelCentre}$.<br>`
        objets.push(...guideDroites)
      } else if (this.sup === 3) {
        enonce += `Les cercles tracés en pointillés sont centrés en $${labelCentre}$.<br>`
        objets.push(...guidesArc)
      }
      objets.push(
        new TracePoint(this.centres2d[i]),
        labelPoint(this.centres2d[i]),
      )
      objetsCorrection.push(
        new TracePoint(this.centres2d[i]),
        labelPoint(this.centres2d[i]),
      )
      for (let k = 0; k < this.nbPoints; k++) {
        objets.push(new TracePoint(antecedents2d[k]))
        const sym = rotation(
          antecedents2d[k],
          this.centres2d[i],
          180,
          antecedents2d[k].nom + "'",
        )
        sym.positionLabel = positionneLabel(sym, antecedents2d[k])
        antecedents2d[k].positionLabel = positionneLabel(antecedents2d[k], sym)
        const egalite = codageMilieu(antecedents2d[k], sym, colors[k], marks[k])
        const trace: TracePoint = new TracePoint(sym)
        trace.color = colorToLatexOrHTML('red')
        const labelSym = labelPoint(sym)
        const label = labelPoint(antecedents2d[k])
        objets.push(label)
        objetsCorrection.push(trace, labelSym, egalite)
      }
      objetsCorrection = [...objets, ...objetsCorrection, ...guideDroites]
      if (this.sup2 === 2) {
        guideDroites.forEach((guide) => {
          guide.epaisseur = 1
          guide.opacite = 0.8
        })
        objetsCorrection.push(...guideDroites)
      }
      if (this.sup2 === 3) {
        guidesArc.forEach((guide) => {
          guide.epaisseur = 1
          guide.opacite = 0.8
        })
        objetsCorrection.push(...guidesArc)
      }
      const options = {}
      if (this.sup === 1)
        Object.assign(options, { snapGrid: true, dx: 1, dy: 1 })
      if (this.questionJamaisPosee(i, labelCentre, this.labels.join())) {
        if (context.isHtml && this.interactif) {
          // On crée la figure avec apigeom pour l'interactif
          this.figuresApiGeom![i] = new Figure(
            Object.assign(options, {
              xMin: -10,
              yMin: -10,
              width: 600,
              height: 600,
            }),
          )
          this.figuresApiGeom![i].scale = 1
          this.figuresApiGeom![i].options.labelPointAfterCreation = true
          this.figuresApiGeom![i].setToolbar({
            nbCols: 10,
            tools: [
              'POINT',
              'POINT_ON',
              'POINT_INTERSECTION',
              'NAME_POINT',
              'CIRCLE_CENTER_POINT',
              'RAY',
              'HIDE',
              'UNDO',
              'REDO',
              'REMOVE',
            ],
            position: 'top',
          })
          this.centresApiGeom[i] = this.figuresApiGeom![i].create('Point', {
            x: 0,
            y: 0,
            isVisible: true,
            isSelectable: true,
            label: labelCentre,
          })
          this.antecedentsApiGeom[i] = []
          for (let k = 0; k < this.nbPoints; k++) {
            ;(this.antecedentsApiGeom[i][k] as PointApigeom) =
              this.figuresApiGeom![i].create('Point', {
                x: antecedents2d[k].x,
                y: antecedents2d[k].y,
                isFree: false,
                isSelectable: true,
                label: antecedents2d[k].nom,
              })
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
            for (let k = 0; k < this.nbPoints; k++) {
              this.figuresApiGeom![i].create('Ray', {
                point1: this.antecedentsApiGeom[i][k] as PointApigeom,
                point2: this.centresApiGeom[i] as PointApigeom,
                isDashed: true,
                color: 'gray',
              })
            }
          }
          if (this.sup === 3) {
            for (let k = 0; k < this.nbPoints; k++) {
              this.figuresApiGeom![i].create('CircleCenterPoint', {
                center: this.figuresApiGeom![i].create('Point', {
                  isVisible: false,
                  x: this.centresApiGeom[i].x,
                  y: this.centresApiGeom[i].y,
                }),
                point: this.antecedentsApiGeom[i][k],
                isDashed: true,
                color: 'gray',
              })
            }
          }
          const emplacementPourFigure = figureApigeom({
            exercice: this,
            i,
            figure: this.figuresApiGeom![i],
          })
          this.listeQuestions[i] = enonce + '<br><br>' + emplacementPourFigure
        } else {
          this.listeQuestions[i] =
            enonce +
            '<br><br>' +
            mathalea2d(
              Object.assign(
                { scale: 0.5, pixelsParCm: 20 },
                fixeBordures([...objets, ...objetsCorrection]),
              ),
              objets,
            )
        }
        this.listeCorrections[i] = mathalea2d(
          Object.assign(
            { scale: 0.5, pixelsParCm: 20 },
            fixeBordures(objetsCorrection),
          ),
          objetsCorrection,
        )
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
    const resultat = []
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    let feedback = ''
    // Points lus dans la figure : elle a pu être rechargée (Annuler, copie Capytale)
    const figure = this.figuresApiGeom![i]
    const centre = elementVivant(figure, this.centresApiGeom[i])
    const antecedents = this.antecedentsApiGeom[i].map((point) =>
      elementVivant(figure, point),
    )

    // on crée les bons symétriques :
    for (let k = 0; k < this.nbPoints; k++) {
      const { x, y } = rotationCoord(antecedents[k], centre, 180)
      const elts = Array.from(this.figuresApiGeom![i].elements.values())
      const points = elts.filter(
        (e) =>
          e.type !== 'pointer' &&
          (e.type === 'Point' ||
            e.type === 'PointOnLine' ||
            e.type === 'PointOnCircle' ||
            e.type === 'PointIntersectionLL' ||
            e.type === 'PointIntersectionLC' ||
            e.type === 'PointIntersectionCC'),
      ) as PointApigeom[]
      const matchPoint = points.find((p) => p.label === `${this.labels[i][k]}'`)
      const sym = points.find((p) => egal(x, p.x, 0.001) && egal(y, p.y, 0.001))
      if (matchPoint != null) {
        if (egal(x, matchPoint.x, 0.001) && egal(y, matchPoint.y, 0.001)) {
          matchPoint.color = 'green'
          matchPoint.thickness = 2
          matchPoint.colorLabel = 'green'
          resultat.push('OK')
        } else {
          matchPoint.color = 'red'
          matchPoint.thickness = 2
          matchPoint.colorLabel = 'green'
          feedback += `Il y a bien un point nommé $${antecedents[k].label}'$ mais ce n'est pas le symétrique de $${antecedents[k].label}$ !<br>`
          resultat.push('KO')
        }
      } else {
        if (sym != null) {
          sym.color = 'green'
          sym.thickness = 2
          sym.colorLabel = 'red'
          feedback += `Le symétrique de $${antecedents[k].label}$ est bien construit mais il n'est pas nommé $${antecedents[k].label}'$ !<br>`
        } else {
          feedback += `Il n'y a pas de point symétrique de $${antecedents[k].label}$ et il n'y a pas de point nommé $${antecedents[k].label}'$ !<br>`
        }
        resultat.push('KO')
      }
    }
    if (divFeedback) divFeedback.innerHTML = feedback
    this.figuresApiGeom![i].isDynamic = false
    this.figuresApiGeom![i].divButtons.style.display = 'none'
    this.figuresApiGeom![i].divUserMessage.style.display = 'none'
    return resultat
  }
}

export default ConstrctionsSymetrieCentralePoints
