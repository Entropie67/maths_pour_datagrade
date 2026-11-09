import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { cone as cone2d, sphere2d } from '../../lib/2d/projections3d'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { homothetie } from '../../lib/2d/transformations'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { cone3d } from '../../lib/3d/3dProjectionMathalea2d/Cone3dPerspectiveCavaliere'
import { cylindre3d } from '../../lib/3d/3dProjectionMathalea2d/Cylindre3dPerspectiveCavaliere'
import { prisme3d } from '../../lib/3d/3dProjectionMathalea2d/Prisme3dPerspectiveCavaliere'
import { pyramide3d } from '../../lib/3d/3dProjectionMathalea2d/Pyramide3dPerspectiveCavaliere'
import {
  Point3d,
  arc3d,
  arete3d,
  droite3d,
  point3d,
  polygone3d,
  rotation3d,
  vecteur3d,
} from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexte } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Reconnaitre des solides'
export const dateDePublication = '24/09/2022'
export const dateDeModifImportante = '31/08/2026'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * @author Mickael Guironnet (Adapté par Éric Elter pour que les nouvelles fonctions 3d soient bien utilisées)
 */

export const refs = {
  'fr-fr': ['6G8autoA', '3AutoG07', '6AutoE1'],
  'fr-2016': ['6G44-1'],
  'fr-ch': ['10CTES1A-1', '10LCES1A-1', '10LSES1A-1', '9R1ES3A-5', '9R2ES3A-5', '9R3ES3A-5', '11CTES2A-1', '11LCES2A-1', '11LSES2A-1', 'PRQES06C-1', 'PRQES07A-5', 'PRQES07C-1'],
}
export const uuid = '051aa'
export default class ReconnaitreDesSolides extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.nbCols = 4

    this.sup = '8' // Type de question
    this.sup2 = false // qcm
    this.besoinFormulaireTexte = [
      'Type de solides',
      [
        'Nombres séparés par des tirets  :',
        '1 : Prisme',
        '2 : Pyramide',
        '3 : Cône',
        '4 : Cylindre',
        '5 : Pavé',
        '6 : Cube',
        '7 : Boule',
        '8 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2CaseACocher = ['QCM']
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    const maxTentativesParQuestion = 50
    const solides = [
      'prisme',
      'pyramide',
      'cône',
      'cylindre',
      'pavé droit',
      'cube',
      'boule',
    ]

    this.consigne =
      this.nbQuestions === 1 || context.vue === 'diap'
        ? 'Donner le nom de ce solide.'
        : 'Donner le nom de chacun des solides.'

    const typeDeQuestion = gestionnaireFormulaireTexte({
      max: 7,
      defaut: 8,
      nbQuestions: this.nbQuestions * maxTentativesParQuestion,
      melange: 8,
      saisie: this.sup,
    }).map((e) => Number(e))

    for (let j = 0, k = 0; j < this.nbQuestions && k < 50; k++) {
      const choix = typeDeQuestion[k]
      context.anglePerspective = 30
      const objets: NestedObjetMathalea2dArray = []
      let reponseQcm
      let info = ''
      let axe =
        choix === 1
          ? randint(1, 2)
          : choix > 1 && choix <= 5
            ? randint(1, 3)
            : 0

      // nombre de sommets de la base.
      const n = choix < 3 ? randint(3, 8) : choix === 5 || choix === 6 ? 4 : 0

      let prisme, pyra, cone, cylindre, pave, boule
      let texteCorrection = ''
      let reponse = '' as string | string[]
      const solide = solides[choix - 1]
      switch (solide) {
        case 'prisme': // Prisme  ?
        case 'pyramide': // Pyramides  ?
          {
            const points3XY = []
            const points3XZ = []
            const points3YZ = []
            const rayon = 2
            const alpha = (Math.PI * 2) / n
            for (let i = 0; i < n; i++) {
              points3XY.push(
                point3d(
                  rayon * Math.cos(alpha * i),
                  rayon * Math.sin(alpha * i),
                  0,
                ),
              )
              points3XZ.push(
                point3d(
                  rayon * Math.cos(alpha * i),
                  5,
                  rayon * Math.sin(alpha * i),
                  true,
                ),
              )
              points3YZ.push(
                point3d(
                  -1,
                  rayon * Math.cos(alpha * i),
                  rayon * Math.sin(alpha * i),
                ),
              )
            }
            let base, k3, p3
            if (axe === 2) {
              // base sur le plan YZ
              if (n === 4) {
                const points3DRota = []
                for (let i = 0; i < points3YZ.length; i++) {
                  points3DRota.push(
                    rotation3d(
                      points3YZ[i],
                      droite3d(point3d(0, 0, 0), vecteur3d(1, 0, 0)),
                      0 + (i === 0 ? 30 : i === 1 ? -30 : 0),
                      'red',
                    ),
                  )
                }
                points3YZ.length = 0
                points3YZ.push(...points3DRota)
              }
              base = polygone3d(...points3YZ)
              k3 = vecteur3d(3, 0, 0)
              p3 = point3d(3, 0, 0)
            } else {
              // base sur le plan XY
              if (n === 4) {
                const points3DRota = []
                for (let i = 0; i < points3XY.length; i++) {
                  points3DRota.push(
                    rotation3d(
                      points3XY[i],
                      droite3d(point3d(0, 0, 0), vecteur3d(0, 0, 1)),
                      0 + (i === 0 ? 30 : i === 1 ? -30 : 0),
                      'red',
                    ),
                  )
                }
                points3XY.length = 0
                points3XY.push(...points3DRota)
              }
              base = polygone3d(...points3XY)
              k3 = vecteur3d(0, 0, 3)
              p3 = point3d(0, 0, 3)
            }

            if (solide === 'prisme') {
              prisme = prisme3d(base, k3)
              objets.push(...prisme.c2d)
              texteCorrection = this.correctionDetaillee
                ? 'Deux faces opposées de ce solide sont des polygones superposables et les autres faces sont des rectangles donc ce solide est un '
                : 'Ce solide est un '
              texteCorrection += texteEnCouleurEtGras('prisme droit')
              texteCorrection += this.correctionDetaillee
                ? ` avec une base ayant $${prisme.base1.listePoints.length}$ sommets.`
                : `.`
              info = 'Les faces à $4$ côtés de ce solide sont des rectangles.'
            } else {
              pyra = pyramide3d(base, p3)
              const objs = pyra.c2d
              objets.push(...(objs as NestedObjetMathalea2dArray))
              texteCorrection = this.correctionDetaillee
                ? 'Ce solide a pour base un polygone et possède un sommet extérieur à ce polygone donc ce solide est une '
                : 'Ce solide est une '
              texteCorrection += texteEnCouleurEtGras('pyramide')
              texteCorrection += this.correctionDetaillee
                ? ` avec une base ayant $${pyra.base.listePoints.length}$ sommets` // et selon l'axe=$${axe}$`
                : ``
              if (
                pyra.base.listePoints.length === 3 &&
                this.correctionDetaillee
              ) {
                texteCorrection += ` (plus précisément, c'est un tétraèdre)`
              }
              texteCorrection += '.'
            }
          }
          reponse =
            solide === 'prisme' ? ['prisme', 'prisme droit'] : 'pyramide'

          break
        case 'cône': {
          // cone  ?
          if (axe === 3) {
            cone = cone3d(
              point3d(0, 0, 0),
              point3d(0, -7, 0),
              vecteur3d(
                Math.cos((30 * Math.PI) / 180.0),
                0,
                Math.sin((30 * Math.PI) / 180.0),
              ),
              'black',
              true,
              'black',
              'white',
            )
            /* for (let kk = 15; kk < 25; kk++) {
              cone.c2d[kk].isVisible = (kk % 2)
            } */
            objets.push(...(cone.c2d as NestedObjetMathalea2dArray))
          } else if (axe === 2) {
            cone = cone3d(
              point3d(0, 0, 0),
              point3d(3, 0, 0),
              vecteur3d(
                0,
                Math.cos((60 * Math.PI) / 180.0),
                Math.sin((60 * Math.PI) / 180.0),
              ),
              'black',
              true,
              'black',
              'white',
            )
            /* for (let kk = 3; kk < 3 + 17; kk++) {
              cone.c2d[kk].isVisible = (kk % 2)
            } */
            objets.push(...(cone.c2d as NestedObjetMathalea2dArray))
          } else {
            cone = cone2d({
              centre: pointAbstrait(0, 0),
              rx: randint(15, 30) / 10,
              hauteur: choice([3, 4, 5]),
            })
            const t = tracePoint(cone.centre)
            const g = homothetie(
              segment(cone.centre, cone.sommet),
              milieu(cone.centre, cone.sommet),
              1.5,
            ) as Segment
            g.pointilles = 2
            objets.push(cone, g, t)
          }
          reponse = ['cône', 'cone', 'cône de révolution', 'cone de révolution']
          texteCorrection = this.correctionDetaillee
            ? 'Ce solide a pour base un disque et possède un sommet extérieur à ce disque donc ce solide est un '
            : 'Ce solide est un '
          texteCorrection += texteEnCouleurEtGras('cône')
          texteCorrection += this.correctionDetaillee ? ' de révolution.' : '.'
          break
        }
        case 'cylindre': // cylindre
          if (axe === 3) {
            cylindre = cylindre3d(
              point3d(0, 0, 2),
              point3d(0, -3, 2),
              vecteur3d(1, 0, 0),
              vecteur3d(1, 0, 0),
            )
            const c1 = arc3d(
              point3d(0, 3, 1),
              vecteur3d(0, -1, 0),
              vecteur3d(1, 0, 0),
              'caché',
              'black',
              110,
              280,
            )
            const c2 = arc3d(
              point3d(0, 3, 1),
              vecteur3d(0, -1, 0),
              vecteur3d(1, 0, 0),
              'visible',
              'black',
              280,
              360 + 110,
            )
            const c3 = arc3d(
              point3d(0, -0.5, 1),
              vecteur3d(0, -1, 0),
              vecteur3d(1, 0, 0),
              'caché',
              'black',
              110,
              280,
            )
            const c4 = arc3d(
              point3d(0, -0.5, 1),
              vecteur3d(0, -1, 0),
              vecteur3d(1, 0, 0),
              'visible',
              'black',
              280,
              360 + 110,
            )
            // generatrice
            const g = []
            for (let i = 0; i < c1.listePoints.length; i += 2) {
              const s = segment(c3.listePoints[i], c1.listePoints[i])
              s.pointilles = 2
              s.opacite = 0.3
              g.push(s)
            }
            for (let i = 0; i < c2.listePoints.length; i += 2) {
              const s = segment(c4.listePoints[i], c2.listePoints[i])
              s.opacite = 0.6
              g.push(s)
            }
            c3.pointilles = 0
            c3.opacite = 1
            cylindre.c2d = []
            cylindre.c2d.push(
              c1,
              c2,
              c3,
              c4,
              ...g,
              arete3d(point3d(0, 4, 1), point3d(0, -4, 1), 'red', false).c2d,
            )
          } else if (axe === 2) {
            // base sur le plan YZ
            cylindre = cylindre3d(
              point3d(0, 0, 0),
              point3d(3, 0, 0),
              vecteur3d(0, 1, 0),
              vecteur3d(0, 1, 0),
            )
            /* c1 = demicercle3d(point3d(0, 0, 0), point3d(0, -1, 0), vecteur3d(1, 0, 0), 'caché', 'red', 0)
                        c2 = demicercle3d(point3d(0, 0, 0), point3d(0, -1, 0), vecteur3d(1, 0, 0), 'visible', bleuMathalea, 0) */
            const c1 = arc3d(
              point3d(0, 0, 1),
              vecteur3d(1, 0, 0),
              vecteur3d(0, 1, 0),
              'visible',
              'black',
              90,
              270,
            )
            const c2 = arc3d(
              point3d(0, 0, 1),
              vecteur3d(1, 0, 0),
              vecteur3d(0, 1, 0),
              'caché',
              'black',
              270,
              360 + 90,
            )
            const c3 = arc3d(
              point3d(3, 0, 1),
              vecteur3d(1, 0, 0),
              vecteur3d(0, 1, 0),
              'visible',
              'black',
              90,
              270,
            )
            const c4 = arc3d(
              point3d(3, 0, 1),
              vecteur3d(1, 0, 0),
              vecteur3d(0, 1, 0),
              'caché',
              'black',
              270,
              360 + 90,
            )
            // generatrice
            const g = []
            for (let i = 0; i < c1.listePoints.length; i += 2) {
              const s = segment(c3.listePoints[i], c1.listePoints[i])
              s.opacite = 0.6
              g.push(s)
            }
            for (let i = 0; i < c2.listePoints.length; i += 2) {
              const s = segment(c4.listePoints[i], c2.listePoints[i])
              s.pointilles = 2
              s.opacite = 0.3
              g.push(s)
            }
            c4.pointilles = 0
            c4.opacite = 1
            cylindre.c2d = []
            cylindre.c2d.push(
              c1,
              c2,
              c3,
              c4,
              ...g,
              arete3d(point3d(-1, 0, 1), point3d(4, 0, 1), 'red', false).c2d,
            )
          } else {
            cylindre = cylindre3d(
              point3d(0, 0, 0),
              point3d(0, 0, 3),
              vecteur3d(2, 0, 0),
              vecteur3d(2, 0, 0),
            )
          }
          objets.push(...cylindre.c2d)
          reponse = ['cylindre', 'cylindre de révolution']
          texteCorrection = this.correctionDetaillee
            ? 'Ce solide a pour bases, deux disques superposables, parallèles et dont la hauteur est perpendiculaire à ces deux disques donc ce solide est un '
            : 'Ce solide est un '
          texteCorrection += texteEnCouleurEtGras('cylindre')
          texteCorrection += this.correctionDetaillee ? ' de révolution.' : '.'
          break
        case 'pavé droit': // pavé droit
        case 'cube': {
          // cube
          if (solide === 'cube') {
            axe = 2 // cube quel que soit l'axe
          }
          const points3XY: Point3d[] = []
          const points3XZ: Point3d[] = []
          const points3YZ: Point3d[] = []
          const rayon = 2
          const alpha = (Math.PI * 2) / n
          for (let i = 0; i < n; i++) {
            points3XY.push(
              point3d(
                rayon * Math.cos(alpha * i),
                rayon * Math.sin(alpha * i),
                0,
                !(i > 0 && i <= n / 2 - 0.1),
              ),
            )
            points3XZ.push(
              point3d(
                rayon * Math.cos(alpha * i),
                5,
                rayon * Math.sin(alpha * i),
                true,
              ),
            )
            points3YZ.push(
              point3d(
                -1,
                rayon * Math.cos(alpha * i),
                rayon * Math.sin(alpha * i),
                !(
                  i === 0 ||
                  (n > 6 && i === n - 1) ||
                  (n > 6 && i === 1) ||
                  (n === 6 && i === 5)
                ),
              ),
            )
          }
          if (axe === 3) {
            // base sur le plan YZ
            const points3DRota = []
            for (let i = 0; i < points3XY.length; i++) {
              points3DRota.push(
                rotation3d(
                  points3XZ[i],
                  droite3d(point3d(0, 0, 0), vecteur3d(0, 1, 0)),
                  -45,
                  'red',
                ),
              )
            }
            points3XZ.length = 0
            points3XZ.push(...points3DRota)

            const base = polygone3d(...points3XZ)
            const k2 = vecteur3d(0, -6, 0)
            pave = prisme3d(base, k2)
          } else if (axe === 2) {
            // base sur le plan YZ
            const points3DRota = []
            for (let i = 0; i < points3YZ.length; i++) {
              points3DRota.push(
                rotation3d(
                  points3YZ[i],
                  droite3d(point3d(0, 0, 0), vecteur3d(1, 0, 0)),
                  -45,
                  'red',
                ),
              )
            }
            points3YZ.length = 0
            points3YZ.push(...points3DRota)

            const base = polygone3d(...points3YZ)
            if (solide === 'cube') {
              const k1 = vecteur3d(3, 0, 0)
              pave = prisme3d(base, k1)
            } else {
              pave = prisme3d(base, vecteur3d(5, 0, 0))
            }
          } else {
            // base sur le plan XY
            const points3DRota = []
            for (let i = 0; i < points3XY.length; i++) {
              points3DRota.push(
                rotation3d(
                  points3XY[i],
                  droite3d(point3d(0, 0, 0), vecteur3d(0, 0, 1)),
                  0,
                  'red',
                ),
              )
            }
            points3XY.length = 0
            points3XY.push(...points3DRota)
            const base = polygone3d(...points3XY)
            const k3 = vecteur3d(0, 0, 3)
            pave = prisme3d(base, k3)
          }
          objets.push(...pave.c2d)
          if (solide === 'cube') {
            reponse = ['cube', 'pavé droit']
            info = 'Toutes les faces de ce solide sont identiques.'
          } else {
            reponse = solide
            info =
              'Toutes les faces de ce solide ne contiennent que des angles droits.'
          }
          reponseQcm = solide
          if (this.correctionDetaillee) {
            texteCorrection = `Chaque face de ce solide est un `
            texteCorrection += solide === 'cube' ? `carré` : `rectangle`
            texteCorrection += ` donc ce solide est un ${texteEnCouleurEtGras(solide)}.`
          } else
            texteCorrection = `Ce solide est un ${texteEnCouleurEtGras(solide)}.`

          break
        }
        case 'boule': // sphère remplacé par boule dans programmes 2026
          boule = sphere2d({
            centre: pointAbstrait(0, 0),
            rx: 2,
            color: 'black',
          })
          info = 'Ce solide est plein.'
          objets.push(boule)
          reponse = solide
          texteCorrection += `Ce solide plein est une ${texteEnCouleurEtGras(solide)}.`
          if (this.correctionDetaillee)
            texteCorrection +=
              " Si ce solide avait été vide, c'eût été une sphère."

          break
      }
      if (this.questionJamaisPosee(j, choix, n, axe)) {
        reponseQcm = solide
        if (this.sup2) reponse = solide // on remplace les éventuelles réponses multiples par l'unique réponse du QCM

        this.question =
          info +
          '<br>' +
          mathalea2d(
            Object.assign({}, fixeBordures(objets), {
              scale: 0.5,
              center: !context.isHtml,
            }),
            ...objets.flat(),
          )

        this.autoCorrection[j] = {}
        this.autoCorrection[j].options = {}
        this.autoCorrection[j].enonce = `${this.question}\n`
        this.autoCorrection[j].propositions = [
          {
            texte: 'Prisme',
            statut: reponseQcm === 'prisme',
          },
          {
            texte: 'Pyramide',
            statut: reponseQcm === 'pyramide',
          },
          {
            texte: 'Cône',
            statut: reponseQcm === 'cône',
          },
          {
            texte: 'Cylindre',
            statut: reponseQcm === 'cylindre',
          },
          {
            texte: 'Pavé',
            statut: reponseQcm === 'pavé droit',
          },
          {
            texte: 'Cube',
            statut: reponseQcm === 'cube',
          },
          {
            texte: 'Boule',
            statut: reponseQcm === 'boule',
          },
        ]
        if (this.sup2) {
          this.question += propositionsQcm(this, j).texte
        } else {
          handleAnswers(this, j, {
            reponse: {
              value: Array.isArray(reponse)
                ? reponse.map((answer) => answer.toLowerCase())
                : reponse.toLowerCase(),
              options: { texteSansCasse: true },
            },
          })
          this.question += '<br>' + ajouteChampTexte(this, j)
        }
        this.listeQuestions[j] = this.question
        this.listeCorrections[j] = texteCorrection
        j++
      }
    }
    listeQuestionsToContenu(this)
  }
}
