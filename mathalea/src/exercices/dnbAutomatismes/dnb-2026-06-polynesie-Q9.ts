import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'b6c33'
export const refs = {
  'fr-fr': ['3AutoG02', '6AutoG2'],
  'fr-ch': ['9R1ES2H-9', '9R2ES2H-9', '9R3ES2H-9', 'PRQES02B-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Reconnaître un quadrilatère grâce au codage'
export const dateDePublication = '12/08/2026'
const formes = ['carré', 'rectangle', 'losange', 'parallélogramme']
const A = pointAbstrait(0, 0, 'A')
const B = pointAbstrait(5, 0.5, 'B')
const C = pointAbstrait(4.8, 4.5, 'C')
const D = pointAbstrait(-0.2, 4, 'D')
const O = milieu(A, C)
const AO = segment(A, O)
const BO = segment(B, O)
const CO = segment(C, O)
const DO = segment(D, O)

const pol = polygoneAvecNom(A, B, C, D)
function carreCodeParDiagonales() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('//', 'black', AO, BO, CO, DO),
    pol,
    AO,
    BO,
    CO,
    DO,
    codageAngleDroit(A, O, B),
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function carreCodeParCotes() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('/', 'black', A, B, B, C, C, D, D, A),
    pol,
    codageAngleDroit(A, B, C),
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function rectangleCodeParDiagonales() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('//', 'black', AO, BO, CO, DO),
    pol,
    AO,
    BO,
    CO,
    DO,
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function rectangleCodeParCotes() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('/', 'black', A, B, C, D),
    codageSegments('//', 'black', B, C, D, A),
    pol,
    codageAngleDroit(A, B, C),
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function parallelogrammeCodeParDiagonale() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('//', 'black', BO, DO),
    codageSegments('/', 'black', AO, CO),
    pol,
    AO,
    BO,
    CO,
    DO,
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function parallelogrammeCodeParCotes() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('/', 'black', A, B, C, D),
    codageSegments('//', 'black', B, C, D, A),
    pol,
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function losangeCodeParDiagonale() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('//', 'black', BO, DO),
    codageSegments('/', 'black', AO, CO),
    pol,
    AO,
    BO,
    CO,
    DO,
    codageAngleDroit(A, O, B),
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
function losangeCodeParCotes() {
  const objets: NestedObjetMathalea2dArray = [
    codageSegments('/', 'black', A, B, B, C, C, D, D, A),
    pol,
  ]
  return mathalea2d(
    Object.assign({ mainlevee: true }, fixeBordures(objets)),
    objets,
  )
}
const figures = {
  carré: [carreCodeParDiagonales, carreCodeParCotes],
  parallélogramme: [
    parallelogrammeCodeParDiagonale,
    parallelogrammeCodeParCotes,
  ],
  losange: [losangeCodeParDiagonale, losangeCodeParCotes],
  rectangle: [rectangleCodeParDiagonales, rectangleCodeParCotes],
}

/**
 * DNB Polynésie juin 2026 - Question 9
 * Reconnaître un quadrilatère
 * @author Jean-Claude Lhote
 */
export default class AutoQ9PolynesieBrevet2026 extends ExerciceQcmA {
  private appliquerLesValeurs(
    forme?: 'carré' | 'parallélogramme' | 'losange' | 'rectangle',
    choix?: number,
  ): void {
    this.enonce = deuxColonnesResp(
      `Le quadrilatère ABCD ci-contre est tracé à main levée.<br>
À partir des codages donnés, en déduire sa nature parmi les quatre
réponses proposées. (on donnera la réponse la plus précise possible si plusieurs réponses sont correctes)`,
      figures[forme ?? 'carré'][choix ?? 0](),
      { largeur1: 70, widthmincol1: '400px', widthmincol2: '200px' },
    )

    this.reponses = [forme, ...formes.filter((f) => f !== forme)].map(
      (forme) => `Un ${forme}.`,
    )

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('parallélogramme', 0)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const forme: 'carré' | 'parallélogramme' | 'losange' | 'rectangle' = choice(
      formes,
    ) as 'carré' | 'parallélogramme' | 'losange' | 'rectangle'
    const choix = Math.round(Math.random())
    this.appliquerLesValeurs(forme, choix)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options = { radio: true, ordered: false }
  }
}
