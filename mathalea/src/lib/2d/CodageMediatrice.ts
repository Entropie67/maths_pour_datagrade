import { codageAngleDroit } from './CodageAngleDroit'
import { codageSegments } from './CodageSegment'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { rotation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu } from './utilitairesPoint'

/**
 * Code la médiatrice d'un segment
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [mark='x'] Symbole posé sur les deux parties du segment
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} svgml Sortie, à main levée, au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} tikzml Sortie, à main levée, au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du codage. À associer obligatoirement à colorToLatexOrHTML().
 * @author  Rémi Angot
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CodageMediatrice extends ObjetMathalea2D {
  constructor(A: PointAbstrait, B: PointAbstrait, color = 'black', mark = 'x') {
    super()
    if (longueur(A, B) < 0.1)
      window.notify(
        'CodageMediatrice : Points trop rapprochés pour créer ce codage',
        { A, B },
      )
    this.color = colorToLatexOrHTML(color)
    const O = milieu(A, B)
    const M = rotation(A, O, 90)
    const c = codageAngleDroit(M, O, B, color)
    const v = codageSegments(mark, color, A, O, O, B)
    const bordures = fixeBordures([A, B, O, c])
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
    this.svg = function (coeff) {
      const code = `<g id="${this.id}">${c.svg(coeff) + '\n' + v.svg(coeff)}</g>`
      return code
    }
    this.tikz = function () {
      return c.tikz() + '\n' + v.tikz()
    }
    this.svgml = function (coeff: number, amp: number) {
      return c.svgml(coeff, amp) + '\n' + v.svg(coeff)
    }
    this.tikzml = function (amp: number) {
      return c.tikzml(amp) + '\n' + v.tikz()
    }
  }
}
/**
 * Code la médiatrice d'un segment
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [mark='x'] Symbole posé sur les deux parties du segment
 * @example codageMediatrice(M,N) // Code, en noir, la médiatrice du segment[MN] avec les marques 'x'
 * @example codageMediatrice(M,N,'red','oo') // Code, en rouge, la médiatrice du segment[MN] avec les marques 'oo'
 * @author  Rémi Angot
 * @return {CodageMediatrice}
 */
// JSDOC Validee par EE Juin 2022

export function codageMediatrice(
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  mark = 'x',
) {
  return new CodageMediatrice(A, B, color, mark)
}
