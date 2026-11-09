import { PointAbstrait } from './PointAbstrait'
// import { segment } from './segmentsVecteurs'
import { Latex2d, latex2d, type LetterSizeType } from './textes'

/**
 * affiche du Latex 'sur' un segment orienté
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {number} [distance = 0.5] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @author Olivier Mimeau
 * @return {Latex2d}
 */

function directionLatex2d(A: PointAbstrait, B: PointAbstrait): number {
  // angle d'AB par rapport à l'horizontale, en degrés
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len2 = dx * dx + dy * dy
  if (len2 < 1e-16) return 0 // segment quasi nul → angle nul
  let directionAB = (Math.atan2(dy, dx) * 180) / Math.PI
  // ramener l'angle dans [-90°, 90°] pour un texte lisible
  directionAB =
    directionAB > 90
      ? directionAB - 180
      : directionAB < -90
        ? directionAB + 180
        : directionAB
  return directionAB
}

function placeLatex2d(
  A: PointAbstrait,
  B: PointAbstrait,
  distance: number = 0.5,
): { x: number; y: number } {
  // Milieu de [AB]
  const Mx = (A.x + B.x) / 2
  const My = (A.y + B.y) / 2
  // Vecteur AB
  const dx = B.x - A.x
  const dy = B.y - A.y
  const len = Math.hypot(dx, dy)
  // Vecteur normal unitaire (perpendiculaire, orientation +90°)
  const nx = len > 1e-12 ? -dy / len : 0
  const ny = len > 1e-12 ? dx / len : 1
  // Point décalé à distance le long de la normale
  return { x: Mx + nx * distance, y: My + ny * distance }
}

/**
 *
 * @param t Place du latex sur un segment orienté une belle alternative à texteSurSegment
 * @param A
 * @param B
 * @param options
 * @returns {Latex2d}
 */
export function placeLatexSurSegment(
  t: string,
  A: PointAbstrait,
  B: PointAbstrait,
  {
    distance = 0.5,
    color = 'black',
    backgroundColor = 'none',
    letterSize = 'normalsize',
    horizontal = false,
    opacity = 1.0,
  }: {
    distance?: number
    color?: string
    backgroundColor?: string
    letterSize?: LetterSizeType
    horizontal?: boolean
    opacity?: number
  } = {},
): Latex2d {
  const position = placeLatex2d(A, B, distance)
  const Q = latex2d(t, position.x, position.y, {
    orientation: horizontal ? 0 : directionLatex2d(A, B),
    color,
    backgroundColor,
    letterSize,
    opacity,
  })
  return Q
}
