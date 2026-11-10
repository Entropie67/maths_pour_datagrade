import { Arc, arc } from '../../lib/2d/Arc'
import { Cercle, cercle } from '../../lib/2d/cercle'
import { codageSegment, codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { barycentre, Polygone, polygone } from '../../lib/2d/polygones'
import {
  Segment,
  segment,
  segmentAvecExtremites,
} from '../../lib/2d/segmentsVecteurs'
import { rotation } from '../../lib/2d/transformations'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListesSansChangerOrdre,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { reduireAxPlusByPlusC, rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
export const titre =
  "Produire une forme littérale à partir d'une figure géométrique"
export const interactifReady = true

/**
 * * Traduire la dépendance des grandeurs et produire une formule.
 * @author François-Rémi Zawadzki
 * à partir d'un exercice proposé par Vincent Dujardin.
 */

export const uuid = 'b3643'

export const refs = {
  'fr-fr': ['5N5A-5'],
  'fr-2016': ['5L10-6'],
  'fr-ch': ['9R2FA3C-4', '9R3FA3C-4', '10LCFA4C-5', '10LSFA4C-5', '11CTFA3C-5', '11LCFA3C-5', '11LSFA3C-5', 'PRQAL01B-5'],
}

type CompteursFigure = [number, number]
type FigureTracee = {
  draw: (x: number) => number
  n: CompteursFigure
  ncr: CompteursFigure
  ncd: CompteursFigure
}

export default class perimetreVersFormule extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Nombre de figures', // text
      [
        'Nombres séparés par des tirets :',
        'de 1 à 5 : Nombre de figures',
        '6 : Mélange',
      ].join('\n'),
    ]
    this.besoinFormulaire2Texte = [
      "Nombre d'inconnues", // text
      [
        'Nombres séparés par des tirets :',
        '0 : Aucune inconnue',
        '1 : Une variable',
        '2 : Deux variables',
        '3 : Mélange',
      ].join('\n'),
    ]

    this.besoinFormulaire3Texte = [
      'Difficulté',
      [
        'Nombres séparés par des tirets :',
        '1 : Uniquement des segments',
        '2 : Avec au moins un cercle',
        '3 : Avec au moins un arc de cercle',
        '4 : Mélange',
      ].join('\n'),
    ]

    this.sup = 3
    this.sup2 = 2
    this.sup3 = 1
    this.nbQuestions = 1

    this.spacing = context.isHtml ? 3 : 2
    this.spacingCorr = context.isHtml ? 2.5 : 1
  }

  nouvelleVersion() {
    // const nombreFigures = this.sup
    const nombreFiguresDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 5,
      melange: 6,
      defaut: 3,
      shuffle: false,
      nbQuestions: this.nbQuestions,
    })
    const listeNombreFigures = combinaisonListesSansChangerOrdre(
      nombreFiguresDisponibles,
      this.nbQuestions,
    )

    const nombreInconnuesDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 0,
      max: 2,
      melange: 3,
      defaut: 1,
      shuffle: false,
      nbQuestions: this.nbQuestions,
    })
    const listeNombreInconnues = combinaisonListesSansChangerOrdre(
      nombreInconnuesDisponibles,
      this.nbQuestions,
    )

    const difficulteDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup3,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 1,
      shuffle: false,
      nbQuestions: this.nbQuestions,
    })
    const listeDifficulte = combinaisonListesSansChangerOrdre(
      difficulteDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const nombreFigures: number = +listeNombreFigures[i]
      const nombreInconnues: number = +listeNombreInconnues[i]
      const difficulte: number = +listeDifficulte[i]

      const espaceEntreFigures = 1

      // choix aléatoire des lettres de l'exo
      const listeLettres = 'abcdfghmnqsuvwxyz' // 5L10-6 : Éric Elter supprime le e pour éviter la confusion avec exponentielle dans la comparaison
      const idLettre0 = randint(0, listeLettres.length - 1)
      const idLettre1 = randint(0, listeLettres.length - 1, [idLettre0])
      const coteLettre = [listeLettres[idLettre0], listeLettres[idLettre1]]

      // paramétrage du nombre d'inconnues
      let inconnueId = [false, false]

      if (nombreInconnues === 1) {
        inconnueId = choice([
          [true, false],
          [false, true],
        ])
      } else if (nombreInconnues === 2) {
        inconnueId = [true, true]
      }

      const coteValueConnu0 = choice([2, 3, 4, 5, 6, 7, 8])
      const coteValueConnu1 = choice([2, 3, 4, 5, 6, 7, 8], [coteValueConnu0])

      let coteValueConnu: number[]
      if (coteValueConnu0 < coteValueConnu1) {
        coteValueConnu = [coteValueConnu0, coteValueConnu1]
      } else {
        coteValueConnu = [coteValueConnu1, coteValueConnu0]
      }

      const coteValueDraw = [1.8, 3] // utile uniquement pour le tracé de la légende

      const codageString = ['|', '||']

      const appels2D: NestedObjetMathalea2dArray = []

      // pour tracer les figures, on crée d'abord les fonctions utiles

      const drawLegend = function () {
        const a1 = pointAbstrait(0, 3)
        const a2 = pointAbstrait(coteValueDraw[0], 3)
        const b1 = pointAbstrait(0, 1)
        const b2 = pointAbstrait(coteValueDraw[1], 1)

        appels2D.push(segmentAvecExtremites(a1, a2))
        if (inconnueId[0]) {
          appels2D.push(
            placeLatexSurSegment(coteLettre[0], a1, a2, { distance: 0.8 }),
          )
        } else {
          appels2D.push(
            placeLatexSurSegment(
              coteLettre[0] + '=' + coteValueConnu[0],
              a1,
              a2,
              { distance: 0.8 },
            ),
          )
        }
        appels2D.push(codageSegment(a1, a2, codageString[0], 'black', 0.8))
        appels2D.push(segmentAvecExtremites(b1, b2))
        if (inconnueId[1]) {
          appels2D.push(
            placeLatexSurSegment(coteLettre[1], b1, b2, { distance: 0.8 }),
          )
        } else {
          appels2D.push(
            placeLatexSurSegment(
              coteLettre[1] + '=' + coteValueConnu[1],
              b1,
              b2,
              { distance: 0.8 },
            ),
          )
        }
        appels2D.push(codageSegment(b1, b2, codageString[1], 'black', 0.8))
      }

      const getMaxAbscisseFromPolygone = function (pol: Polygone): number {
        const listePointsX = pol.listePoints.map(function (
          p: PointAbstrait,
        ): number {
          return p.x
        })
        const r = Math.max.apply(null, listePointsX)
        return r
      }

      const drawRectangle = function (
        x: number,
        params: { id0: number; id1: number },
      ): number {
        const y = 1
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const l1 = coteValueDraw[params.id1]
        const cs0 = codageString[params.id0]
        const cs1 = codageString[params.id1]

        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x + l0, A.y)
        const C = pointAbstrait(B.x, B.y + l1)
        const D = pointAbstrait(A.x, C.y)
        const pol = polygone(A, B, C, D)
        const rotpol = rotation(pol, barycentre(pol), theta)
        appels2D.push(rotpol)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotpol.listePoints[0],
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
          ),
        )
        appels2D.push(
          codageSegments(
            cs1,
            'black',
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
            rotpol.listePoints[0],
          ),
        )

        return getMaxAbscisseFromPolygone(rotpol)
      }

      const drawTriangle = function (
        x: number,
        params: { id0: number; id1: number },
      ): number {
        const y = 2 / coteValueDraw[params.id1]
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const l1 = coteValueDraw[params.id1]
        const cs0 = codageString[params.id0]
        const cs1 = codageString[params.id1]

        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x + l0, A.y)
        const C = pointAbstrait(
          A.x + l0 / 2,
          // A.y + 2.9,
          A.y + Math.sqrt(l1 ** 2 - (l0 / 2) ** 2),
        )

        const pol = polygone(A, B, C)
        const rotpol = rotation(pol, barycentre(pol), theta)

        appels2D.push(rotpol)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotpol.listePoints[0],
            rotpol.listePoints[1],
          ),
        )
        appels2D.push(
          codageSegments(
            cs1,
            'black',
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[2],
            rotpol.listePoints[0],
          ),
        )

        return getMaxAbscisseFromPolygone(rotpol)
      }

      const drawHexagone = function (
        x: number,
        params: { id0: number; id1: number },
      ): number {
        const y = 3.5
        const theta = Math.random() * 40 - 20
        const l0 = coteValueDraw[params.id0]
        const l1 = coteValueDraw[params.id1]
        const cs0 = codageString[params.id0]
        const cs1 = codageString[params.id1]

        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x + l1, A.y)
        const E = pointAbstrait(A.x, A.y - l0)
        const D = pointAbstrait(E.x + l1, E.y)
        let C: PointAbstrait
        if (params.id0 === 0 && params.id1 === 1) {
          C = pointAbstrait(
            B.x - Math.cos(Math.PI * (1 / 2 - 1 / 3)) * l0,
            B.y - Math.sin(Math.PI * (1 / 2 - 1 / 3)) * l0,
          )
        } else {
          C = pointAbstrait(
            B.x + Math.cos(Math.PI * (1 / 2 - 1 / 3)) * l0,
            B.y - Math.sin(Math.PI * (1 / 2 - 1 / 3)) * l0,
          )
        }

        const pol = polygone(A, B, C, D, E)
        const rotpol = rotation(pol, barycentre(pol), theta)

        appels2D.push(rotpol)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
            rotpol.listePoints[4],
            rotpol.listePoints[0],
          ),
        )
        appels2D.push(
          codageSegments(
            cs1,
            'black',
            rotpol.listePoints[0],
            rotpol.listePoints[1],
            rotpol.listePoints[3],
            rotpol.listePoints[4],
          ),
        )

        return getMaxAbscisseFromPolygone(rotpol)
      }

      const drawTrapeze = function (
        x: number,
        params: { id0: number; id1: number },
      ): number {
        const y = 1
        const theta = Math.random() * 40 - 20
        const l0 = coteValueDraw[params.id0]
        const l1 = coteValueDraw[params.id1]
        const cs0 = codageString[params.id0]
        const cs1 = codageString[params.id1]

        const A = pointAbstrait(x, y)
        const D = pointAbstrait(A.x, A.y + l1)
        const B = pointAbstrait(
          A.x + Math.sqrt(l0 ** 2 - ((l1 - l0) / 2) ** 2),
          A.y + (l1 - l0) / 2,
        )
        const C = pointAbstrait(B.x, B.y + l0)

        const pol = polygone(A, B, C, D)
        const rotpol = rotation(pol, barycentre(pol), theta)
        appels2D.push(rotpol)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotpol.listePoints[0],
            rotpol.listePoints[1],
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
          ),
        )
        appels2D.push(
          codageSegments(
            cs1,
            'black',
            rotpol.listePoints[3],
            rotpol.listePoints[0],
          ),
        )

        return getMaxAbscisseFromPolygone(rotpol)
      }

      const drawCercle = function (
        x: number,
        params: { id0: number; rayon: boolean },
      ): number {
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const cs0 = codageString[params.id0]

        const y = 3
        const A = pointAbstrait(x, y)

        let B: PointAbstrait
        let O: PointAbstrait
        let c: Cercle
        let seg: Segment

        if (params.rayon) {
          B = pointAbstrait(A.x + 2 * l0, A.y)
          O = pointAbstrait(A.x + l0, A.y)
          c = cercle(O, l0)
          seg = segment(O, B)
        } else {
          B = pointAbstrait(A.x + l0, A.y)
          O = pointAbstrait(A.x + l0 / 2, A.y)
          c = cercle(O, l0 / 2)
          seg = segment(A, B)
        }

        // const rotpol = pol
        const rotseg = rotation(seg, O, theta, '', '', bleuMathalea)

        appels2D.push(c)
        appels2D.push(rotseg)

        appels2D.push(
          codageSegments(cs0, 'black', rotseg.extremite1, rotseg.extremite2),
        )
        return B.x
        // return getMaxAbscisseFromPolygone(rotpol)
      }

      const drawQuartCercle = function (
        x: number,
        params: { id0: number },
      ): number {
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const cs0 = codageString[params.id0]

        const y = 3
        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x, A.y + l0)
        const C = pointAbstrait(A.x + l0, A.y)

        const segAB = segment(A, B)
        const segAC = segment(A, C)

        const rotsegAB = rotation(segAB, A, theta)
        const rotsegAC = rotation(segAC, A, theta)

        const rotarcBC = arc(rotsegAB.extremite2, rotsegAB.extremite1, -90)

        appels2D.push(rotsegAB, rotsegAC, rotarcBC)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotsegAB.extremite1,
            rotsegAB.extremite2,
          ),
        )
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotsegAC.extremite1,
            rotsegAC.extremite2,
          ),
        )
        return getMaxAbscisseFromPolygone(
          polygone(
            rotsegAB.extremite1,
            rotsegAB.extremite2,
            rotsegAC.extremite2,
          ),
        )
      }

      const drawDemiCercle = function (
        x: number,
        params: { id0: number },
      ): number {
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const cs0 = codageString[params.id0]

        const y = 3
        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x + l0, A.y)
        const O = pointAbstrait(A.x + l0 / 2, A.y)

        const segAB = segment(A, B)

        const sens = choice([1, -1])
        const rotsegAB = rotation(segAB, O, theta)

        const rotarcAB = arc(rotsegAB.extremite2, O, sens * 180)

        appels2D.push(rotsegAB, rotarcAB)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotsegAB.extremite1,
            rotsegAB.extremite2,
          ),
        )
        return B.x
      }

      const drawRectangleDemiCercle = function (
        x: number,
        params: { id0: number; id1: number; idDemiCercle: number },
      ): number {
        const y = 1
        const theta = Math.random() * 40 - 20

        const l0 = coteValueDraw[params.id0]
        const l1 = coteValueDraw[params.id1]
        const cs0 = codageString[params.id0]
        const cs1 = codageString[params.id1]

        const A = pointAbstrait(x, y)
        const B = pointAbstrait(A.x + l0, A.y)
        const C = pointAbstrait(B.x, B.y + l1)
        const D = pointAbstrait(A.x, C.y)

        const E =
          params.idDemiCercle === 0
            ? pointAbstrait(D.x + l0 / 2, D.y + l0 / 2)
            : pointAbstrait(B.x + l1 / 2, B.y + l1 / 2)

        const pol = polygone(A, B, C, D)
        const rotpol = rotation(pol, barycentre(pol), theta)

        const rotE = rotation(E, barycentre(pol), theta)

        const rotA = rotpol.listePoints[0]
        const rotB = rotpol.listePoints[1]
        const rotC = rotpol.listePoints[2]
        const rotD = rotpol.listePoints[3]

        const segAB = segment(rotA, rotB)
        let segBC: Segment
        let segCD: Segment
        let a: Arc
        if (params.idDemiCercle === 0) {
          segBC = segment(rotB, rotC)
          segCD = segment(rotC, rotD, bleuMathalea)
          a = arc(rotC, milieu(rotC, rotD), 180)
        } else {
          segBC = segment(rotB, rotC, bleuMathalea)
          segCD = segment(rotC, rotD)
          a = arc(rotB, milieu(rotB, rotC), 180)
        }
        const segDA = segment(rotD, rotA)

        appels2D.push(segAB, segBC, segCD, segDA, a)
        appels2D.push(
          codageSegments(
            cs0,
            'black',
            rotpol.listePoints[0],
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
          ),
        )
        appels2D.push(
          codageSegments(
            cs1,
            'black',
            rotpol.listePoints[1],
            rotpol.listePoints[2],
            rotpol.listePoints[3],
            rotpol.listePoints[0],
          ),
        )

        return getMaxAbscisseFromPolygone(
          polygone(rotA, rotB, rotC, rotD, rotE),
        )
      }

      // On trace la figure en commençant par la légende
      drawLegend()

      // on trace nombreFigures figures
      let x = 4
      const nombreCotes: CompteursFigure = [0, 0]
      const nombreCerclesRayon: CompteursFigure = [0, 0]
      const nombreCerclesDiametre: CompteursFigure = [0, 0]
      let listeFigures: string[] = []
      const dictDraw: Record<string, FigureTracee> = {
        rectangle01: {
          draw: (x) => drawRectangle(x, { id0: 0, id1: 1 }),
          n: [2, 2],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        rectangle10: {
          draw: (x) => drawRectangle(x, { id0: 1, id1: 0 }),
          n: [2, 2],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        carre0: {
          draw: (x) => drawRectangle(x, { id0: 0, id1: 0 }),
          n: [4, 0],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        carre1: {
          draw: (x) => drawRectangle(x, { id0: 1, id1: 1 }),
          n: [0, 4],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        triangle00: {
          draw: (x) => drawTriangle(x, { id0: 0, id1: 0 }),
          n: [3, 0],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        triangle11: {
          draw: (x) => drawTriangle(x, { id0: 1, id1: 1 }),
          n: [0, 3],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        triangle01: {
          draw: (x) => drawTriangle(x, { id0: 0, id1: 1 }),
          n: [1, 2],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        triangle10: {
          draw: (x) => drawTriangle(x, { id0: 1, id1: 0 }),
          n: [2, 1],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        hexagone01: {
          draw: (x) => drawHexagone(x, { id0: 0, id1: 1 }),
          n: [3, 2],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        hexagone10: {
          draw: (x) => drawHexagone(x, { id0: 1, id1: 0 }),
          n: [2, 3],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        trapeze01: {
          draw: (x) => drawTrapeze(x, { id0: 0, id1: 1 }),
          n: [3, 1],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        trapeze10: {
          draw: (x) => drawTrapeze(x, { id0: 1, id1: 0 }),
          n: [1, 3],
          ncr: [0, 0],
          ncd: [0, 0],
        },
        cercle0r: {
          draw: (x) => drawCercle(x, { id0: 0, rayon: true }),
          n: [0, 0],
          ncr: [1, 0],
          ncd: [0, 0],
        },
        cercle1r: {
          draw: (x) => drawCercle(x, { id0: 1, rayon: true }),
          n: [0, 0],
          ncr: [0, 1],
          ncd: [0, 0],
        },
        cercle0d: {
          draw: (x) => drawCercle(x, { id0: 0, rayon: false }),
          n: [0, 0],
          ncr: [0, 0],
          ncd: [1, 0],
        },
        cercle1d: {
          draw: (x) => drawCercle(x, { id0: 1, rayon: false }),
          n: [0, 0],
          ncr: [0, 0],
          ncd: [0, 1],
        },
        quartCercle0: {
          draw: (x) => drawQuartCercle(x, { id0: 0 }),
          n: [2, 0],
          ncr: [0.25, 0],
          ncd: [0, 0],
        },
        quartCercle1: {
          draw: (x) => drawQuartCercle(x, { id0: 1 }),
          n: [0, 2],
          ncr: [0, 0.25],
          ncd: [0, 0],
        },
        demiCercle0: {
          draw: (x) => drawDemiCercle(x, { id0: 0 }),
          n: [1, 0],
          ncr: [0, 0],
          ncd: [0.5, 0],
        },
        demiCercle1: {
          draw: (x) => drawDemiCercle(x, { id0: 1 }),
          n: [0, 1],
          ncr: [0, 0],
          ncd: [0, 0.5],
        },
        rectangleDemiCercle000: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 0, id1: 0, idDemiCercle: 1 }),
          n: [3, 0],
          ncr: [0, 0],
          ncd: [0.5, 0],
        },
        rectangleDemiCercle111: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 1, id1: 1, idDemiCercle: 0 }),
          n: [0, 3],
          ncr: [0, 0],
          ncd: [0, 0.5],
        },
        rectangleDemiCercle010: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 0, id1: 1, idDemiCercle: 0 }),
          n: [1, 2],
          ncr: [0, 0],
          ncd: [0.5, 0],
        },
        rectangleDemiCercle100: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 1, id1: 0, idDemiCercle: 0 }),
          n: [1, 2],
          ncr: [0, 0],
          ncd: [0.5, 0],
        },
        rectangleDemiCercle011: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 0, id1: 1, idDemiCercle: 1 }),
          n: [2, 1],
          ncr: [0, 0],
          ncd: [0, 0.5],
        },
        rectangleDemiCercle101: {
          draw: (x) =>
            drawRectangleDemiCercle(x, { id0: 1, id1: 0, idDemiCercle: 1 }),
          n: [2, 1],
          ncr: [0, 0],
          ncd: [0, 0.5],
        },
      }
      const figuresParDifficultes = [
        [
          'rectangle01',
          'rectangle10',
          'carre0',
          'carre1',
          'triangle00',
          'triangle11',
          'triangle01',
          'hexagone01',
          'hexagone10',
          'trapeze01',
          'trapeze10',
        ],
        ['cercle0r', 'cercle1r', 'cercle0d', 'cercle1d'],
        [
          'quartCercle0',
          'quartCercle0', // on double certaines figures pour le tirage au sort
          'quartCercle1',
          'quartCercle1',
          'demiCercle0',
          'demiCercle0',
          'demiCercle1',
          'demiCercle1',
          'rectangleDemiCercle000',
          'rectangleDemiCercle111',
          'rectangleDemiCercle010',
          'rectangleDemiCercle100',
          'rectangleDemiCercle011',
          'rectangleDemiCercle101',
        ],
      ]

      let allFigures: string[] = []
      for (let d = 0; d < difficulte; d++) {
        allFigures = allFigures.concat(figuresParDifficultes[d])
      }

      listeFigures = [choice(figuresParDifficultes[difficulte - 1])] // la premiere figure est du niveau de la difficulte paramétrée
      for (let iFigure = 1; iFigure < nombreFigures; iFigure++) {
        listeFigures.push(choice(allFigures, listeFigures))
      }

      listeFigures = shuffle(listeFigures)

      for (let iFigure = 0; iFigure < nombreFigures; iFigure++) {
        const selectDraw = listeFigures[iFigure]
        const dictDrawValue = dictDraw[selectDraw]
        x = dictDrawValue.draw(x + espaceEntreFigures)
        nombreCotes[0] += dictDrawValue.n[0]
        nombreCotes[1] += dictDrawValue.n[1]
        nombreCerclesRayon[0] += dictDrawValue.ncr[0]
        nombreCerclesRayon[1] += dictDrawValue.ncr[1]
        nombreCerclesDiametre[0] += dictDrawValue.ncd[0]
        nombreCerclesDiametre[1] += dictDrawValue.ncd[1]
      }

      // on trace pour de bon
      const figure = mathalea2d(
        Object.assign(
          {
            pixelsParCm: 20,
            scale: 0.5,
          },
          fixeBordures(appels2D),
        ),
        appels2D,
      )

      // CORRECTION
      // La section suivante permet de créer les formes d'équation développées, factorisées, substituées et calculées.
      // Elle serviront dans l'affichage de la correction.
      let premiereOperation = true

      const factorisation = [
        [nombreCotes[0], nombreCerclesRayon[0] * 2 + nombreCerclesDiametre[0]],
        [nombreCotes[1], nombreCerclesRayon[1] * 2 + nombreCerclesDiametre[1]],
      ] // [[rationnel cote 0, pi cote 0], [rationnel cote 1, pi cote 1]]

      const addPlus = function () {
        if (premiereOperation) {
          premiereOperation = false
          return ''
        } else {
          return '+'
        }
      }

      let formeDevelopee = ``
      let formeFactorisee = ``
      let formeSubstituee = ``
      let formeCalculee = ``

      let plus = ''

      premiereOperation = true
      for (let j = 0; j < 2; j++) {
        if (factorisation[j][0] > 0 && factorisation[j][1] > 0) {
          plus = addPlus()

          formeDevelopee += plus
          formeDevelopee += rienSi1(factorisation[j][0])
          formeDevelopee += coteLettre[j]
          formeDevelopee += '+'
          formeDevelopee += rienSi1(factorisation[j][1])
          formeDevelopee += ` ${coteLettre[j]} \\pi `

          let facteur = ''
          facteur += `(${texNombre(factorisation[j][0])} + `
          facteur += rienSi1(factorisation[j][1])
          facteur += ` \\pi )`

          formeFactorisee += plus + facteur + coteLettre[j]

          if (inconnueId[j]) {
            formeCalculee += formeCalculee !== '' ? '+' : ''
            formeCalculee += facteur + coteLettre[j]

            formeSubstituee += plus + facteur + coteLettre[j]
          } else {
            formeSubstituee +=
              plus + facteur + '\\times' + texNombre(coteValueConnu[j])
          }
        } else if (factorisation[j][0] > 0) {
          plus = addPlus()

          const facteur = rienSi1(factorisation[j][0])

          formeDevelopee += plus + facteur + coteLettre[j]
          formeFactorisee += plus + facteur + coteLettre[j]

          if (inconnueId[j]) {
            formeCalculee += formeCalculee !== '' ? '+' : ''
            formeCalculee += facteur + coteLettre[j]

            formeSubstituee += plus + facteur + coteLettre[j]
          } else {
            formeSubstituee += plus

            formeSubstituee += facteur !== '' ? facteur + '\\times' : ''
            formeSubstituee += texNombre(coteValueConnu[j])
          }
        } else if (factorisation[j][1] > 0) {
          plus = addPlus()

          const facteur = rienSi1(factorisation[j][1]) + ' \\pi '

          formeDevelopee += plus + facteur + coteLettre[j]
          formeFactorisee += plus + facteur + coteLettre[j]

          if (inconnueId[j]) {
            formeCalculee += formeCalculee !== '' ? '+' : ''
            formeCalculee += facteur + coteLettre[j]

            formeSubstituee += plus + facteur + coteLettre[j]
          } else {
            formeSubstituee +=
              plus + facteur + '\\times' + texNombre(coteValueConnu[j])
          }
        }
      }

      const resultatConnu = [0, 0]
      for (let j = 0; j < 2; j++) {
        if (inconnueId[j] === false) {
          resultatConnu[0] += factorisation[j][0] * coteValueConnu[j]
          resultatConnu[1] += factorisation[j][1] * coteValueConnu[j]
        }
      }

      if (resultatConnu[0] > 0) {
        formeCalculee += formeCalculee !== '' ? '+' : ''
        formeCalculee += texNombre(resultatConnu[0])
      }
      if (resultatConnu[1] > 0) {
        formeCalculee += formeCalculee !== '' ? '+' : ''
        formeCalculee += rienSi1(resultatConnu[1]) + ' \\pi '
      }

      // TEXTE ENONCE

      let enonce = `
On considère l'ensemble de figures ci-dessous :<br>
${figure}

Quelle formule permet de calculer `
      if (nombreFigures === 1) {
        enonce += ` le périmètre de la figure `
      } else {
        enonce += ` la somme des périmètres des $${texNombre(nombreFigures)}$ figures `
      }
      enonce += `en fonction de `

      enonce += inconnueId[0]
        ? `$${coteLettre[0]}$`
        : `$${coteLettre[0]} = ${texNombre(coteValueConnu[0])}$`

      enonce += ` et de `

      enonce += inconnueId[1]
        ? `$${coteLettre[1]}$ ?`
        : `$${coteLettre[1]} = ${texNombre(coteValueConnu[1])}$ ?`

      // TEXTE CORRECTION

      // La mise en évidence est réservée à la dernière ligne : celle que le champ attend
      const avecSubstitution = inconnueId[0] === false || inconnueId[1] === false
      const enEvidenceSiFinal = (forme: string) =>
        avecSubstitution ? forme : miseEnEvidence(forme)
      let texteEquation = `$\\begin{aligned}P&=`
      let formeAvantSubstitution = ``
      if (formeFactorisee === formeDevelopee) {
        texteEquation += enEvidenceSiFinal(formeDevelopee)
        formeAvantSubstitution = formeDevelopee
      } else {
        texteEquation += formeDevelopee
        texteEquation += `\\\\`
        texteEquation += `&=`
        texteEquation += enEvidenceSiFinal(formeFactorisee)
        formeAvantSubstitution = formeFactorisee
      }
      texteEquation += '\\end{aligned}$'

      let texteSubstitution = ''
      if (inconnueId[0] === false || inconnueId[1] === false) {
        texteSubstitution += `<br>${texteEnCouleurEtGras('Substitution des variables connues', 'black')}<br>Or nous savons que `
        for (let j = 0; j < 2; j++) {
          if (inconnueId[j] === false) {
            if (j === 1 && inconnueId[0] === false) {
              texteSubstitution += ' et '
            }
            texteSubstitution += `$${coteLettre[j]}=${texNombre(coteValueConnu[j])}$`
          }
        }
        texteSubstitution += '.'
        texteSubstitution += ' Nous pouvons donc le'
        texteSubstitution +=
          inconnueId[0] === false && inconnueId[1] === false ? 's' : ''
        texteSubstitution += ' substituer dans la formule précédente : <br>'
        texteSubstitution += `$\\begin{aligned}P&=${formeAvantSubstitution}\\\\`
        texteSubstitution += `&=${formeSubstituee}\\\\`
        texteSubstitution += `&=` + miseEnEvidence(formeCalculee)
        texteSubstitution += `\\end{aligned}$`
      }

      let correction = `
Pour calculer le périmètre d'une figure, on additionne les longueurs de tous les côtés.<br>`

      if (nombreCotes[0] + nombreCotes[1] > 0) {
        correction +=
          texteEnCouleurEtGras(`Calcul des longueurs des segments`, 'black') +
          `<br>`

        correction += `On compte $${texNombre(nombreCotes[0])}$ segment`
        correction += nombreCotes[0] > 1 ? 's' : ''

        correction += ` de longueur $${coteLettre[0]}$ et $${texNombre(nombreCotes[1])}$ segment`
        correction += nombreCotes[1] > 1 ? 's' : ''

        correction += ` de longueur $${coteLettre[1]}$ soit une longueur totale pour les segments de $${reduireAxPlusByPlusC(nombreCotes[0], nombreCotes[1], 0, coteLettre[0], coteLettre[1])}$.<br>`
      }

      if (
        nombreCerclesRayon[0] +
          nombreCerclesRayon[1] +
          nombreCerclesDiametre[0] +
          nombreCerclesDiametre[1] >
        0
      ) {
        correction += texteEnCouleurEtGras(
          `Calcul des longueurs des arcs de cercles`,
          'black',
        )
        correction += `<br>Pour rappel, le périmètre d'un cercle est égal à $2 \\times \\text{rayon} \\times \\pi = \\text{diamètre} \\times \\pi$.<br>`
      }
      for (let j = 0; j < 2; j++) {
        if (nombreCerclesRayon[j] > 0) {
          correction += `On compte $${texNombre(nombreCerclesRayon[j])}$ cercle`
          correction += nombreCerclesRayon[j] > 1 ? 's' : ''
          correction += ` de rayon $${coteLettre[j]}$ soit une longueur de $2 ${coteLettre[j]} \\pi`
          correction +=
            nombreCerclesRayon[j] === 1
              ? ''
              : `\\times ${texNombre(nombreCerclesRayon[j])}=${texNombre(2 * nombreCerclesRayon[j])} ${coteLettre[j]} \\pi`
          correction += `$.<br>`
        }
      }
      for (let j = 0; j < 2; j++) {
        if (nombreCerclesDiametre[j] > 0) {
          correction += `On compte $${texNombre(nombreCerclesDiametre[j])}$ cercle`
          correction += nombreCerclesDiametre[j] > 1 ? 's' : ''
          correction += ` de diametre $${coteLettre[j]}$ soit un périmètre total de $${coteLettre[j]} \\pi`
          correction +=
            nombreCerclesDiametre[j] === 1
              ? ''
              : `\\times ${texNombre(nombreCerclesDiametre[j])}`
          correction += `$.<br>`
        }
      }

      correction += texteEnCouleurEtGras('Bilan', 'black') + '<br>'
      correction +=
        nombreFigures > 1
          ? `Ainsi, la somme des périmètres des figures est égale à : <br>`
          : 'Ainsi, le périmètre de la figure est égal à :<br>'
      correction += texteEquation + texteSubstitution

      // FIN

      if (
        this.questionJamaisPosee(
          i,
          listeFigures.join(','),
          coteLettre[0],
          coteLettre[1],
          coteValueConnu[0],
          coteValueConnu[1],
        )
      ) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] =
          enonce +
          ajouteQuestionMathlive({
            exercice: this, // ça, c'est pour que la fonction récupère un pointeur sur ton exo
            question: i, // ça, c'est pour qu'il numérote correctement l'input
            typeInteractivite: 'mathlive', // ça, c'est l'input le plus souvent utilisé
            classe: 'clavierMinuscules',
            reponseParams: { formatInteractif: 'mathalea-mathfield' },
            objetReponse: {
              // ça c'est ce qui définit la réponse attendue et la façon dont elle doit être vérifiée
              reponse: {
                value: formeCalculee,
                options: { calculFormel: true },
              },
            },
          })
        this.listeCorrections[i] = correction
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
