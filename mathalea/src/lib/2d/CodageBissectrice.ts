import { codageAngle } from './angles'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { rotation } from './transformations'
import { angleOriente } from './utilitairesGeometriques'
import { pointSurSegment } from './utilitairesPoint'

/**
 * Code la bissectrice d'un angle
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {string} [color = 'black'] Couleur de la bissectrice : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [mark = 'x'] Symbole posé sur les arcs
 * @property {string} color Couleur de la bissectrice. À associer obligatoirement à colorToLatexOrHTML().
 * @property {string} mark Symbole posé sur les arcs
 * @property {PointAbstrait} centre Sommet de l'angle
 * @property {PointAbstrait} depart Point sur un côté de l'angle (équivalent au point A)
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CodageBissectrice extends ObjetMathalea2D {
  mark: string
  centre: PointAbstrait
  depart: PointAbstrait
  constructor(
    A: PointAbstrait,
    O: PointAbstrait,
    B: PointAbstrait,
    color = 'black',
    mark = 'X',
  ) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.mark = mark
    this.centre = O
    this.depart = pointSurSegment(O, A, 1.5)
    const demiangle = angleOriente(A, O, B) / 2
    const lieu = rotation(this.depart, O, demiangle)
    const a1 = codageAngle(
      pointSurSegment(this.centre, this.depart),
      O,
      demiangle,
      1,
      this.mark,
      color,
      1,
      1,
    )
    const a2 = codageAngle(
      pointSurSegment(this.centre, lieu),
      O,
      demiangle,
      1,
      this.mark,
      color,
      1,
      1,
    )
    this.objets = [a1, a2]
    const bordures = fixeBordures([a1, a2])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }
}
/**
 * Code la bissectrice d'un angle
 * @param {PointAbstrait} A Point sur un côté de l'angle
 * @param {PointAbstrait} O Sommet de l'angle
 * @param {PointAbstrait} B Point sur l'autre côté de l'angle
 * @param {string} [color = 'black'] Couleur de la bissectrice : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {string} [mark='x'] Symbole posé sur les arcs
 * @example codagebissectrice(M,N,P) // Code, en noir, la bissectrice de l'angle MNP avec les marques 'x'
 * @example codagebissectrice(M,N,P,'red','oo') // Code, en rouge, la bissectrice de l'angle MNP avec les marques 'oo'
 * @author Jean-claude Lhote
 * @return {CodageBissectrice}
 */
// JSDOC Validee par EE Juin 2022

export function codageBissectrice(
  A: PointAbstrait,
  O: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  mark = 'X',
) {
  return new CodageBissectrice(A, O, B, color, mark)
}
