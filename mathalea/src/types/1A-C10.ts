import type { CrochetD, CrochetG } from '../lib/2d/intervalles'
import type { PointAbstrait } from '../lib/2d/PointAbstrait'
import type { Segment } from '../lib/2d/segmentsVecteurs'
import type { Latex2d } from '../lib/2d/textes'

interface InequalityGraphicElements {
  o: Latex2d
  Ax: PointAbstrait
  sAAx: Segment
  segmentsSolution: Segment[]
  crochets: (CrochetD | CrochetG)[]
  textes: Latex2d[]
}

export interface SquareInequalityGraphicElements extends InequalityGraphicElements {
  A: PointAbstrait
  B: PointAbstrait
  Bx: PointAbstrait
  sBBx: Segment
  valGraphique: number
}

export interface ReciprocalInequalityGraphicElements extends InequalityGraphicElements {
  O: PointAbstrait
  yDroite: number
}

export interface SquareRootInequalityGraphicElements extends InequalityGraphicElements {
  A: PointAbstrait
  O: PointAbstrait
  carreValGraphique: number
}
