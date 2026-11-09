import { arc, rotationPoint } from './Arc'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { PointAbstrait } from './PointAbstrait'

/**
 * m = traceCompas(O, A, 20) trace un arc de cercle de centre O qui commence 10° avant A et finit 10° après.
 *@author Jean-claude Lhote
 */

export function traceCompas(
  O: PointAbstrait,
  A: PointAbstrait,
  angle = 20,
  color = 'gray',
  opacite = 1.1,
  epaisseur = 1,
  pointilles = 0,
) {
  const B = rotationPoint(A, O, -angle / 2)
  const a = arc(B, O, angle, false)
  a.epaisseur = epaisseur
  a.opacite = opacite
  a.color = colorToLatexOrHTML(color)
  a.pointilles = pointilles
  return a
}
