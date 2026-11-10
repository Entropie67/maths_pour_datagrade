import { codageSegments } from './CodageSegment'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { droite } from './droites'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { tracePointSurDroite } from './TracePointSurDroite'
import { longueur } from './utilitairesGeometriques'
import { milieu } from './utilitairesPoint'

/**
 * Code le milieu d'un segment
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [color='black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [mark='x'] Symbole posé sur les deux parties du segment
 * @param {boolean} [mil=true] Trace ou nom le point du milieu.
 * @property {string} svg Sortie au format vectoriel (SVG) que l’on peut afficher dans un navigateur
 * @property {string} tikz Sortie au format TikZ que l’on peut utiliser dans un fichier LaTeX
 * @property {string} color Couleur du codage. À associer obligatoirement à colorToLatexOrHTML().
 * @author Jean-claude Lhote
 * @class
 */
// JSDOC Validee par EE Juin 2022

export class CodageMilieu extends ObjetMathalea2D {
  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    color = 'black',
    mark = '×',
    mil = true,
  ) {
    super()
    if (longueur(A, B) < 0.1)
      window.notify(
        'CodageMilieu : Points trop rapprochés pour créer ce codage',
        { A, B },
      )
    this.color = colorToLatexOrHTML(color)
    const O = milieu(A, B)
    const d = droite(A, B)
    const M = tracePointSurDroite(O, d, color) // On utilise color, car tracePointSurDroite aura son propore colorToLatexOrHTML
    const v = codageSegments(mark, color, A, O, O, B) // idem pour codaSegments
    let code = ''
    // Pour les bordures, on prends celles de [AB], vu qu'on code le milieu de [AB]
    this.bordures = [
      Math.min(A.bordures[0], B.bordures[0]),
      Math.min(A.bordures[1], B.bordures[1]),
      Math.max(A.bordures[2], B.bordures[2]),
      Math.max(A.bordures[3], B.bordures[3]),
    ]
    this.svg = function (coeff) {
      if (mil) code = M.svg(coeff) + '\n' + v.svg(coeff)
      else code = v.svg(coeff)
      code = `<g id="${this.id}">${code}</g>`
      return code
    }
    this.tikz = function () {
      if (mil) return M.tikz() + '\n' + v.tikz()
      else return v.tikz()
    }
  }
}
/**
 * Code le milieu d'un segment
 * @param {PointAbstrait} A Première extrémité du segment
 * @param {PointAbstrait} B Seconde extrémité du segment
 * @param {string} [color = 'black'] Couleur du codage : du type 'red', bleuMathalea ou du type '#a12345'.
 * @param {string} [mark = 'x'] Symbole posé de part et d'autre du milieu du segment
 * @param {boolean} [mil = true] Trace ou nom le point du milieu.
 * @example codageMilieu(M,N) // Code, en noir, le milieu du segment[MN] avec les marques 'x', en plaçant le milieu
 * @example codageMilieu(M,N,'red','oo',false) // Code, en rouge, le milieu du segment[MN] avec les marques 'oo', sans placer le milieu.
 * @author Jean-claude Lhote
 * @return {CodageMilieu}
 */
// JSDOC Validee par EE Juin 2022
export function codageMilieu(
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  mark = '×',
  mil = true,
) {
  return new CodageMilieu(A, B, color, mark, mil)
}
