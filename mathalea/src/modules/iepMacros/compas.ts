import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import type { IAlea2iep, OptionsCompas } from '../Alea2iep.types'

/**
 * Reporte au compas la longueur AB depuis un centre C dans une direction donnée.
 */
export const reporterAuCompas2pointsCentreDirection = function (
  this: IAlea2iep,
  A: PointAbstrait,
  B: PointAbstrait,
  centre: PointAbstrait,
  angle: number,
  options: OptionsCompas = {},
) {
  const delta = options.delta ?? 10
  const pointVise = pointAdistance(centre, longueur(A, B), angle)
  this.compasEcarter2Points(A, B, options)
  this.compasRotationTranslation(angle - delta, centre, options)
  this.compasTracerArcCentrePoint(centre, pointVise, options)
  this.compasMasquer(options)
}
