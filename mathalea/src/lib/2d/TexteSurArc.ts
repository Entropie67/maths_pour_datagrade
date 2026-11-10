import { context } from '../../modules/context'
import { radToDeg } from '../mathFonctions/radToDeg'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { droite } from './droites'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'
import { rotation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**
 * texteSurArc(texte, A, B, angle) // Écrit un texte au milieu de l'arc AB, au-dessus si A est le point le plus à gauche sinon au dessous
 *
 * @author Rémi Angot et Frédéric Piou
 */

export class TexteSurArc extends ObjetMathalea2D {
  extremite1: PointAbstrait
  extremite2: PointAbstrait
  distance: number
  texte: string
  angle: number
  centre: PointAbstrait
  milieu: PointAbstrait
  normale: number
  stringColor: string
  horizontalite: number
  constructor(
    texte: string,
    A: PointAbstrait,
    B: PointAbstrait,
    angle: number,
    color = 'black',
    d = 0.5,
    horizontalite = false,
  ) {
    if (angle === undefined) angle = NaN
    super()
    this.color = colorToLatexOrHTML(color)
    this.horizontalite =
      (horizontalite ?? A.x < B.x)
        ? radToDeg(Math.atan2(B.y - A.y, B.x - A.x))
        : radToDeg(Math.atan2(A.y - B.y, A.x - B.x))
    this.horizontalite =
      this.horizontalite > 90
        ? this.horizontalite - 180
        : this.horizontalite < -90
          ? this.horizontalite + 180
          : this.horizontalite
    this.stringColor = color
    this.extremite1 = A
    this.extremite2 = B
    this.distance = texte[0] === '$' ? -3 * d : -d
    this.texte = texte
    angle = isNaN(angle)
      ? radToDeg(Math.asin((2 * this.distance) / longueur(A, B))) * 2
      : angle
    this.angle = angle
    let anglerot
    if (angle < 0) anglerot = (angle + 180) / 2
    else anglerot = (angle - 180) / 2
    // Médiatrice via droite(I, J), avec I milieu de [AB] et J sur la perpendiculaire en I
    const I = milieu(A, B)
    const vx = B.x - A.x
    const vy = B.y - A.y
    const J = pointAbstrait(I.x - vy, I.y + vx)
    const d1 = droite(I, J)
    const e = droite(A, B)
    const f = rotation(e, B, anglerot)
    const determinant = d1.a * f.b - f.a * d1.b
    const Omegax = (d1.b * f.c - f.b * d1.c) / determinant
    const Omegay = (f.a * d1.c - d1.a * f.c) / determinant
    this.centre = pointAbstrait(Omegax, Omegay)
    const s = segment(this.extremite1, this.extremite2)
    this.normale = -s.angleAvecHorizontale
    this.milieu = rotation(A, this.centre, angle / 2)
    const pos = pointSurSegment(this.milieu, this.centre, this.distance)
    const space = 0.2 * texte.length
    this.bordures = [pos.x - space, pos.y - space, pos.x + space, pos.y + space]
  }

  svg(coeff: number) {
    const N = pointSurSegment(
      this.milieu,
      this.centre,
      (this.distance * 20) / coeff,
    )
    return texteParPoint(
      this.texte,
      N,
      this.horizontalite,
      this.stringColor,
    ).svg(coeff)
  }

  tikz() {
    const N = pointSurSegment(
      this.milieu,
      this.centre,
      this.distance / context.scale,
    )

    return texteParPoint(
      this.texte,
      N,
      this.horizontalite,
      this.stringColor,
    ).tikz()
  }
}
/**
 * Écrit un texte au "milieu" de l'arc AB au-dessus si A est le point le plus à gauche sinon en dessous
 * @param {string} texte Texte à afficher (éviter les $$ pour les affichages diaporama)
 * @param {PointAbstrait} A Extrémité de l'arc
 * @param {PointAbstrait} B Extrémité de l'arc
 * @param {number} angle Angle au centre
 * @param {string} [color='black'] Code couleur HTML accepté
 * @param {number} [d=0.5] Distance à la droite.
 * @param {number} [horizontalite = 0]
 * @return {object} LatexParCoordonnees si le premier caractère est '$', TexteParPoint sinon
 * @author Rémi Angot et Frédéric Piou
 */

export function texteSurArc(
  texte: string,
  A: PointAbstrait,
  B: PointAbstrait,
  angle: number,
  color = 'black',
  d = 0.5,
  horizontalite = false,
) {
  return new TexteSurArc(texte, A, B, angle, color, d, horizontalite)
}
