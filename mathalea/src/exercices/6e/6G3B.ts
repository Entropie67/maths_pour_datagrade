import Figure from 'apigeom'
import Element2D from 'apigeom/src/elements/Element2D'
import Segment from 'apigeom/src/elements/lines/Segment'
import type Point from 'apigeom/src/elements/points/Point'
import { figureAnswerJson } from '../../lib/apigeom/figureAnswer'
import figureApigeom from '../../lib/figureApigeom'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  contraindreValeur,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Construire des médiatrices'

export const dateDePublication = '18/03/2025'
export const dateDeModifImportante = '08/11/2026'
export const interactifReady = true

export const uuid = '0dbe7'
export const refs = {
  'fr-fr': ['6G3B'],
  'fr-2016': ['6G25-0'],
  'fr-ch': ['9R1ES2D-1', '9R2ES2D-1', '9R3ES2D-1'],
}
/**
 * Construire des médiatrices
 * @author Éric Elter
 */

interface Couleur {
  couleurFrancais: string
  couleurHTML: string
}

interface Mediatrice {
  pointSeg1: Point
  pointSeg2: Point
  /** Noms des extrémités du segment : les objets Point de la figure élève sont
   * recréés quand la figure est rechargée (annulation, copie Capytale), leurs
   * noms ne doivent donc pas être lus sur pointSeg1 et pointSeg2. */
  nomSeg1: string
  nomSeg2: string
  pointMed1: Point
  pointMed2: Point
  codage: string
  couleurMed: Couleur
}
interface EnsembleDesQuestions {
  mediatrice: Mediatrice[]
}

/** Points présents dans la figure, retrouvés comme le fait checkPerpendicularBisector() */
function pointsDeLaFigure(figure: Figure): Point[] {
  return [...figure.elements.values()].filter(
    (e) => e.type !== 'pointer' && e.type.includes('Point'),
  ) as Point[]
}

export default class nomExercice extends Exercice {
  figuresApiGeom: Figure[] = []
  figuresApiGeomCorr: Figure[] = []
  lesPoints: Point[][] = []
  lesPointsCorr: Point[][] = []
  mediatrices: Mediatrice[][] = []
  nbMediatrices: number = 1
  ensembleDesQuestions: EnsembleDesQuestions[] = []

  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Nombre de points supplémentaires (en plus des 2 minimum)',
      3,
    ]
    this.besoinFormulaire2Numerique = ['Nombre de médiatrices (3 maximum)', 3]
    this.besoinFormulaire3Texte = [
      'Type de construction',
      '1 : Avec une perpendiculaire\n2 : Avec des cercles\n0 : Mélange',
    ]
    this.sup = 1
    this.sup2 = 1
    this.sup3 = 1
    this.exoCustomResultat = true
    this.reponseCourteDisponible = false // La réponse est une construction.
    this.comment =
      'Dans cet exercice, vous pouvez choisir le nombre de points visibles, le nombre de médiatrices à construire (plafonné à 4) ainsi si la construction doit se faire avec une perpendiculaire ou avec des cercles.'
  }

  nouvelleVersion() {
    this.figuresApiGeom.forEach((fig) => {
      if (
        fig instanceof Figure &&
        'destroy' in fig &&
        typeof fig.destroy === 'function'
      ) {
        fig.destroy()
      }
    })
    const sup3 = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      defaut: 1,
      melange: 0,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 2,
    }).map(Number)
    this.figuresApiGeom = []
    this.figuresApiGeomCorr.forEach((fig) => {
      if (
        fig instanceof Figure &&
        'destroy' in fig &&
        typeof fig.destroy === 'function'
      ) {
        fig.destroy()
      }
    })
    this.figuresApiGeomCorr = []
    this.lesPoints = []
    this.lesPointsCorr = []
    this.ensembleDesQuestions = []
    this.mediatrices = []
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      this.mediatrices[i] = []
      this.lesPoints[i] = []
      this.lesPointsCorr[i] = []
      const nbPoints = contraindreValeur(1, 3, this.sup, 1) + 2
      const nomDesPoints = choisitLettresDifferentes(nbPoints, 'OQW')
      let texte = ''
      let texteCorr = ''
      const coordonnees: number[][] = []

      this.figuresApiGeom[i] = new Figure({
        xMin: -5.5,
        yMin: -5.5,
        width: 330,
        height: 330,
        border: true,
      })
      this.figuresApiGeomCorr[i] = new Figure({
        xMin: -5.5,
        yMin: -5.5,
        width: 330,
        height: 330,
        border: true,
      })

      // On choisit des points qui ne seront pas confondus.
      let isDuplicate = true // Pour ne pas créer deux points l'un sur l'autre
      let newElement: number[] = []
      for (let ee = 0; ee < nbPoints; ee++) {
        do {
          newElement = [randint(-4, 4), randint(-4, 4)]
          // Vérifie si le nouvel élément est déjà dans le tableau
          isDuplicate = coordonnees.some(
            (el) => el[0] === newElement[0] && el[1] === newElement[1],
          )
        } while (isDuplicate)
        coordonnees[ee] = newElement
        this.lesPoints[i][ee] = this.figuresApiGeom[i].create('Point', {
          x: newElement[0],
          y: newElement[1],
          shape: 'x',
          label: nomDesPoints[ee],
          labelDxInPixels: 10,
          labelDyInPixels: 20,
        })
        this.lesPoints[i][ee].isDeletable = false
        this.lesPointsCorr[i][ee] = this.figuresApiGeomCorr[i].create('Point', {
          x: newElement[0],
          y: newElement[1],
          shape: 'x',
          label: nomDesPoints[ee],
          labelDxInPixels: 10,
          labelDyInPixels: 20,
        })
      }

      // Génération de toutes les médiatrices possibles avec tous ces points
      for (let ee = 0; ee < nbPoints; ee++) {
        for (let j = ee + 1; j < nbPoints; j++) {
          this.mediatrices[i].push({
            pointSeg1: this.lesPoints[i][ee],
            pointSeg2: this.lesPoints[i][j],
            nomSeg1: nomDesPoints[ee],
            nomSeg2: nomDesPoints[j],
            pointMed1: this.lesPoints[i][ee], // Cette valeur sera changée ensuite. C'est juste pour ne pas avoir d'erreur de typage
            pointMed2: this.lesPoints[i][j], // Cette valeur sera changée ensuite. C'est juste pour ne pas avoir d'erreur de typage
            codage: '', // Cette valeur sera changée ensuite. C'est juste pour ne pas avoir d'erreur de typage
            couleurMed: { couleurFrancais: '', couleurHTML: '' }, // Cette valeur sera changée ensuite. C'est juste pour ne pas avoir d'erreur de typage
          })
        }
      }
      this.mediatrices[i] = shuffle(this.mediatrices[i])
      const nbMediatricesPossibles = this.mediatrices[i].length
      this.nbMediatrices = contraindreValeur(
        1,
        Math.min(nbMediatricesPossibles, 4),
        this.sup2,
        1,
      )
      this.mediatrices[i] = this.mediatrices[i].slice(0, this.nbMediatrices)

      // On construit l'énoncé et les médiatrices en fonction du nombre de médiatrices demandés par l'utilisateur.
      const choixCouleur = combinaisonListes([
        ['rouge', 'red'],
        ['bleu', 'blue'], // Ne pas mettre bleuMathalea
        ['orange', 'orange'], // Ne pas mettre orangeMathalea
        ['vert', 'green'],
      ])
      const codage = combinaisonListes(['||', 'O', '|', '|||'])

      for (let ee = 0; ee < this.nbMediatrices; ee++) {
        this.mediatrices[i][ee].couleurMed = {
          couleurFrancais: choixCouleur[ee][0],
          couleurHTML: choixCouleur[ee][1],
        }
        texte +=
          (this.nbMediatrices === 1 ? '' : numAlpha(ee)) +
          `Tracer, en ${this.mediatrices[i][ee].couleurMed.couleurFrancais}, `
        texte += `la médiatrice du segment $[${this.mediatrices[i][ee].pointSeg1.label}${this.mediatrices[i][ee].pointSeg2.label}]$.<br>`
        texteCorr += this.nbMediatrices === 1 ? '' : numAlpha(ee)

        // La correction est construite sur les points de sa propre figure, que
        // shakeCorrection() aligne ensuite sur ceux de la figure élève.
        const extremite1Corr =
          this.lesPointsCorr[i][
            this.lesPoints[i].indexOf(this.mediatrices[i][ee].pointSeg1)
          ]
        const extremite2Corr =
          this.lesPointsCorr[i][
            this.lesPoints[i].indexOf(this.mediatrices[i][ee].pointSeg2)
          ]
        switch (sup3[i]) {
          case 2: {
            // Construction au compas
            texteCorr += `La médiatrice du segment $[${this.mediatrices[i][ee].pointSeg1.label}${this.mediatrices[i][ee].pointSeg2.label}]$ est la droite contenant tous les points à égale distance de $${this.mediatrices[i][ee].pointSeg1.label}$ et de $${this.mediatrices[i][ee].pointSeg2.label}$.<br>`

            // Le segment reliant les deux points
            this.figuresApiGeomCorr[i].create('Segment', {
              point1: extremite1Corr,
              point2: extremite2Corr,
            })

            // Le rayon du cercle à tracer
            const rayonCercle = this.figuresApiGeomCorr[i].create('Distance', {
              point1: extremite1Corr,
              point2: extremite2Corr,
            })

            // Les deux cercles
            const c1 = this.figuresApiGeomCorr[i].create('Circle', {
              center: extremite1Corr,
              radius: 0.75 * rayonCercle.value,
              isDashed: true,
            })
            const c2 = this.figuresApiGeomCorr[i].create('Circle', {
              center: extremite2Corr,
              radius: 0.75 * rayonCercle.value,
              isDashed: true,
            })

            // Les 2 points d'intersection des cercles
            const intersection2Cercles = this.figuresApiGeomCorr[i].create(
              'PointsIntersectionCC',
              {
                circle1: c1,
                circle2: c2,
              },
            )
            const { point1, point2 } = intersection2Cercles
            if (point1 == null || point2 == null) {
              window.notify(
                "Les cercles devraient avoir deux points d'intersection.",
                { intersection2Cercles },
              )
              continue
            }

            this.mediatrices[i][ee].pointMed1 = point1
            this.mediatrices[i][ee].pointMed2 = point2

            // Les 4 segements égaux
            this.figuresApiGeomCorr[i].create('Segment', {
              point1: extremite1Corr,
              point2: this.mediatrices[i][ee].pointMed1,
              isDashed: true,
            })
            this.figuresApiGeomCorr[i].create('Segment', {
              point1: extremite2Corr,
              point2: this.mediatrices[i][ee].pointMed1,
              isDashed: true,
            })
            this.figuresApiGeomCorr[i].create('Segment', {
              point1: extremite1Corr,
              point2: this.mediatrices[i][ee].pointMed2,
              isDashed: true,
            })
            this.figuresApiGeomCorr[i].create('Segment', {
              point1: extremite2Corr,
              point2: this.mediatrices[i][ee].pointMed2,
              isDashed: true,
            })

            // Les 4 marques des segments égaux
            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: this.mediatrices[i][ee].pointMed1,
              point2: extremite1Corr,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })
            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: this.mediatrices[i][ee].pointMed2,
              point2: extremite1Corr,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })
            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: this.mediatrices[i][ee].pointMed1,
              point2: extremite2Corr,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })
            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: this.mediatrices[i][ee].pointMed2,
              point2: extremite2Corr,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })

            // La médiatrice
            this.figuresApiGeomCorr[i].create('Line', {
              point1: this.mediatrices[i][ee].pointMed1,
              point2: this.mediatrices[i][ee].pointMed2,
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
              thickness: 2,
            })
            if (this.interactif) {
              this.figuresApiGeom[i].setToolbar({
                tools: [
                  'POINT',
                  'POINT_ON',
                  'POINT_INTERSECTION',
                  'SEGMENT',
                  'LINE',
                  'CIRCLE_CENTER_POINT',
                  'CIRCLE_RADIUS',
                  'DRAG',
                  'SHAKE',
                  'REMOVE',
                  'SET_OPTIONS',
                ],
              })
              this.figuresApiGeom[
                i
              ].options.changeColorChangeActionToSetOptions = true
            }
            break
          }
          default: {
            // Construction à l'équerre
            texteCorr += `La médiatrice du segment $[${this.mediatrices[i][ee].pointSeg1.label}${this.mediatrices[i][ee].pointSeg2.label}]$ est la droite perpendiculaire à $[${this.mediatrices[i][ee].pointSeg1.label}${this.mediatrices[i][ee].pointSeg2.label}]$ passant par son milieu.<br>`

            const segmentConstruit = this.figuresApiGeomCorr[i].create(
              'Segment',
              {
                point1: extremite1Corr,
                point2: extremite2Corr,
              },
            )

            const milieuDuSegment = this.figuresApiGeomCorr[i].create(
              'Middle',
              {
                point1: extremite1Corr,
                point2: extremite2Corr,
                color: this.mediatrices[i][ee].couleurMed.couleurHTML,
              },
            )

            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: milieuDuSegment,
              point2: extremite2Corr,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })
            this.figuresApiGeomCorr[i].create('MarkBetweenPoints', {
              point1: extremite1Corr,
              point2: milieuDuSegment,
              text: codage[ee],
              color: this.mediatrices[i][ee].couleurMed.couleurHTML,
            })

            const perpendiculaire = this.figuresApiGeomCorr[i].create(
              'LinePerpendicular',
              {
                point: milieuDuSegment,
                line: segmentConstruit,
                color: this.mediatrices[i][ee].couleurMed.couleurHTML,
                thickness: 2,
              },
            )

            const pointSurMediatrice = this.figuresApiGeomCorr[i].create(
              'PointOnLine',
              {
                line: perpendiculaire,
                isVisible: false,
              },
            )

            this.mediatrices[i][ee].pointMed1 = milieuDuSegment
            this.mediatrices[i][ee].pointMed2 = pointSurMediatrice

            this.figuresApiGeomCorr[i].create('MarkRightAngle', {
              point: milieuDuSegment,
              directionPoint: pointSurMediatrice,
            })

            if (this.interactif) {
              if (this.sup3 === 1)
                this.figuresApiGeom[i].setToolbar({
                  tools: [
                    'POINT',
                    'MIDDLE',
                    'POINT_ON',
                    'POINT_INTERSECTION',
                    'SEGMENT',
                    'LINE',
                    'LINE_PERPENDICULAR',
                    'DRAG',
                    'SHAKE',
                    'REMOVE',
                    'SET_OPTIONS',
                  ],
                })
              else
                this.figuresApiGeom[i].setToolbar({
                  tools: [
                    'POINT',
                    'MIDDLE',
                    'POINT_ON',
                    'POINT_INTERSECTION',
                    'SEGMENT',
                    'LINE',
                    'LINE_PERPENDICULAR',
                    'CIRCLE_CENTER_POINT',
                    'CIRCLE_RADIUS',
                    'DRAG',
                    'SHAKE',
                    'REMOVE',
                    'SET_OPTIONS',
                  ],
                })
              this.figuresApiGeom[
                i
              ].options.changeColorChangeActionToSetOptions = true
            }
            break
          }
        }
      }

      if (!context.isHtml) {
        texte += this.figuresApiGeom[i].tikz()
        texteCorr += this.figuresApiGeomCorr[i].tikz()
      } else {
        texte += figureApigeom({
          exercice: this,
          i,
          figure: this.figuresApiGeom[i],
          idAddendum: '6G25' + i,
          defaultAction: 'DRAG',
        })
        texteCorr += figureApigeom({
          exercice: this,
          i,
          figure: this.figuresApiGeomCorr[i],
          idAddendum: '6G25Cor' + i,
        })
        this.figuresApiGeomCorr[i].isDynamic = false
        this.figuresApiGeomCorr[i].divButtons.style.display = 'none'
        this.figuresApiGeomCorr[i].divUserMessage.style.display = 'none'
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        this.ensembleDesQuestions[i] = { mediatrice: this.mediatrices[i] }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }

  async shakeCorrection(i: number) {
    if (this.figuresApiGeom[i].elements.size === 0) return
    try {
      await this.figuresApiGeom[i].shake()
    } catch (e) {
      // La figure peut être détruite pendant l'animation (ex : nouvelleVersion() appelée avant la fin du shake)
      return
    }
    // Les points de la figure élève sont cherchés par leur nom : ceux de
    // this.lesPoints ne sont plus dans la figure si elle a été rechargée.
    const pointsEleve = pointsDeLaFigure(this.figuresApiGeom[i])
    for (const pointCorr of this.lesPointsCorr[i]) {
      const pointEleve = pointsEleve.find((p) => p.label === pointCorr.label)
      if (pointEleve == null) continue
      pointCorr.x = pointEleve.x
      pointCorr.y = pointEleve.y
    }
  }

  /**
   * Explique pourquoi la droite tracée n'est pas la médiatrice : elle n'est pas
   * perpendiculaire au segment, ne passe pas par son milieu, ou les deux.
   * Les coordonnées sont lues dans la figure de l'élève au moment de la
   * vérification, comme le fait checkPerpendicularBisector().
   */
  feedbackMediatriceIncorrecte(
    figure: Figure,
    droite: unknown,
    mediatrice: Mediatrice,
  ): string {
    const nomSegment = `$[${mediatrice.nomSeg1}${mediatrice.nomSeg2}]$`
    const couleur = mediatrice.couleurMed.couleurFrancais
    const messageParDefaut = `La droite en ${couleur} n'est pas la médiatrice de ${nomSegment}.`
    const points = pointsDeLaFigure(figure)
    const A = points.find((p) => p.label === mediatrice.nomSeg1)
    const B = points.find((p) => p.label === mediatrice.nomSeg2)
    if (A == null || B == null || !(droite instanceof Segment)) {
      return messageParDefaut
    }
    const P1 = droite.point1
    const P2 = droite.point2
    const ux = P2.x - P1.x
    const uy = P2.y - P1.y
    const vx = B.x - A.x
    const vy = B.y - A.y
    const normeU = Math.hypot(ux, uy)
    const normeV = Math.hypot(vx, vy)
    if (!(normeU > 0) || !(normeV > 0)) return messageParDefaut
    const tolerance = 0.001
    // Cosinus de l'angle entre la droite et le segment : nul s'ils sont perpendiculaires
    const estPerpendiculaire =
      Math.abs(ux * vx + uy * vy) / (normeU * normeV) < tolerance
    // Distance du milieu du segment à la droite
    const xMilieu = (A.x + B.x) / 2
    const yMilieu = (A.y + B.y) / 2
    const passeParLeMilieu =
      Math.abs(ux * (yMilieu - P1.y) - uy * (xMilieu - P1.x)) / normeU <
      tolerance
    if (estPerpendiculaire && !passeParLeMilieu) {
      return `La droite en ${couleur} est bien perpendiculaire à ${nomSegment} mais ne passe pas par son milieu.`
    }
    if (!estPerpendiculaire && passeParLeMilieu) {
      return `La droite en ${couleur} passe bien par le milieu de ${nomSegment} mais n'est pas perpendiculaire à ${nomSegment}.`
    }
    if (!estPerpendiculaire && !passeParLeMilieu) {
      return `La droite en ${couleur} n'est pas perpendiculaire à ${nomSegment} et ne passe pas par son milieu.`
    }
    return messageParDefaut
  }

  correctionInteractive = (i: number) => {
    if (this.answers == null) this.answers = {}
    // Sauvegarde de la réponse pour Capytale
    this.answers[this.figuresApiGeom[i].id] = figureAnswerJson(
      this.figuresApiGeom[i],
    )
    const resultat: ('OK' | 'KO')[] = []
    const divFeedback = document.querySelector(
      `#feedbackEx${this.numeroExercice}Q${i}`,
    ) as HTMLDivElement
    let feedback = ''
    this.shakeCorrection(i)
    for (let ee = 0; ee < this.nbMediatrices; ee++) {
      let feedbackUneQuestion = ''
      const elementsCouleur = [
        ...this.figuresApiGeom[i].elements.values(),
      ].filter(
        (e) =>
          e instanceof Element2D &&
          e.color ===
            this.ensembleDesQuestions[i].mediatrice[ee].couleurMed.couleurHTML,
      )
      const elementsLigneCouleur = [
        ...this.figuresApiGeom[i].elements.values(),
      ].filter(
        (e) =>
          e instanceof Element2D &&
          e.color ===
            this.ensembleDesQuestions[i].mediatrice[ee].couleurMed
              .couleurHTML &&
          e.type.includes('Line'),
      )
      if (elementsCouleur.length === 0) {
        resultat[ee] = 'KO'
        feedbackUneQuestion =
          "Aucun élément n'est en " +
          this.ensembleDesQuestions[i].mediatrice[ee].couleurMed
            .couleurFrancais +
          '.'
      } else if (elementsCouleur.length > 1) {
        resultat[ee] = 'KO'
        feedbackUneQuestion =
          "Il y a trop d'éléments en " +
          this.ensembleDesQuestions[i].mediatrice[ee].couleurMed
            .couleurFrancais +
          '.'
      } else if (elementsLigneCouleur.length !== 1) {
        resultat[ee] = 'KO'
        feedbackUneQuestion =
          "L'élément en " +
          this.ensembleDesQuestions[i].mediatrice[ee].couleurMed
            .couleurFrancais +
          " n'est pas une droite."
      } else {
        const verif = this.figuresApiGeom[i].checkPerpendicularBisector({
          label1: this.ensembleDesQuestions[i].mediatrice[ee].nomSeg1,
          label2: this.ensembleDesQuestions[i].mediatrice[ee].nomSeg2,
          color:
            this.ensembleDesQuestions[i].mediatrice[ee].couleurMed.couleurHTML,
        })
        resultat[ee] = verif.isValid ? 'OK' : 'KO'
        if (!verif.isValid)
          feedbackUneQuestion = this.feedbackMediatriceIncorrecte(
            this.figuresApiGeom[i],
            elementsLigneCouleur[0],
            this.ensembleDesQuestions[i].mediatrice[ee],
          )
      }
      feedbackUneQuestion =
        (feedbackUneQuestion === '' ? '😎 ' : '☹️ ') + feedbackUneQuestion
      if (ee !== this.nbMediatrices - 1) feedbackUneQuestion += '<br>'
      feedback +=
        (this.nbMediatrices === 1 ? '' : numAlpha(ee)) + feedbackUneQuestion
    }

    if (divFeedback) divFeedback.innerHTML = feedback
    this.figuresApiGeom[i].isDynamic = false
    this.figuresApiGeom[i].divButtons.style.display = 'none'
    this.figuresApiGeom[i].divUserMessage.style.display = 'none'
    return resultat
  }
}
