import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import type { PointAbstrait } from './PointAbstrait'
import { Segment } from './segmentsVecteurs'
import { pointSurSegment } from './utilitairesPoint'

/**  Trace la demi-droite d'origine A passant par B
 * @param {PointAbstrait} A Origine de la droite
 * @param {PointAbstrait} B Point de la demi-droite, autre que l'origine
 * @param {string} [color = 'black'] Couleur de la demi-droite : du type 'red', bleuMathalea ou du type '#a12345'
 * @param {boolean} [extremites = false] Trace (ou pas) l'origine de la demi-droite
 * @property {string} color Couleur de la demi-droite. À associer obligatoirement à colorToLatexOrHTML().
 * @property {number} opacite
 * @property {number} pointilles (0 pour pas de pointillés)
 * @author Rémi Angot
 * @class
 */
// JSDOC Validee par EE Aout 2022

export class DemiDroite extends Segment {
  constructor(
    A: PointAbstrait,
    B: PointAbstrait,
    color = 'black',
    extremites = false,
  ) {
    super(A, B)
    this.opacite = 1
    this.pointilles = 0
    this.epaisseur = 1
    const B1 = pointSurSegment(B, A, -10)
    this.x2 = B1.x
    this.y2 = B1.y
    this.color = colorToLatexOrHTML(color)
    if (extremites) this.styleExtremites = '|-'
  }
}
/**  Trace la demi-droite d'origine A passant par B
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {string} [color='black'] Facultatif, 'black' par défaut
 * @param {boolean} [extremites = false] Trace (ou pas) l'origine de la demi-droite
 * @example demiDroite(M, N) // Trace la demi-droite d'origine M passant par N et de couleur noire
 * @example demiDroite(M, N, bleuMathalea, true) // Trace la demi-droite d'origine M passant par N et de couleur bleue, en traçant le trait signifiant l'origine de la demi-droite
 * @author Rémi Angot
 * @return {DemiDroite}
 */
// JSDOC Validee par EE Aout 2022

export function demiDroite(
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  extremites = false,
) {
  return new DemiDroite(A, B, color, extremites)
}
