import { context } from '../../modules/context'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { placeLatexSurSegment } from './placeLatexSurSegment'
import type { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { texteParPoint } from './textes'
import { rotation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**
 * texteSurSegment('mon texte',A,B) // Écrit un texte au milieu de [AB] au-dessus si A est le point le plus à gauche sinon en dessous, ou alors horizontalement
 *
 * @author Rémi Angot
 */

export class TexteSurSegment extends ObjetMathalea2D {
  stringColor: string
  extremite1: PointAbstrait
  extremite2: PointAbstrait
  distance: number
  texte: string
  scale: number
  mathOn: boolean
  angle: number
  O: PointAbstrait
  M: PointAbstrait

  constructor(
    texte: string,
    A: PointAbstrait,
    B: PointAbstrait,
    color = 'black',
    d = 0.5,
    horizontal = false,
  ) {
    super()
    if (typeof texte === 'number') texte = String(texte)
    if (longueur(A, B) < 0.1)
      window.notify(
        'TexteSurSegment : Points trop proches pour cette fonction',
        { A, B },
      )
    this.color = colorToLatexOrHTML(color)
    this.stringColor = color
    this.extremite1 = A
    this.extremite2 = B
    this.texte = String(texte)
    this.scale = 1
    this.mathOn = true
    this.distance = horizontal ? d - 0.1 + this.texte.length / 10 : d
    this.O = milieu(this.extremite1, this.extremite2)
    this.M = rotation(this.extremite1, this.O, -90)
    const s = segment(this.extremite1, this.extremite2)
    const pos = pointSurSegment(this.O, this.M, this.distance)
    const space = 0.2 * (this.texte.length ?? 2)
    this.bordures = [pos.x - space, pos.y - space, pos.x + space, pos.y + space]
    if (horizontal) {
      this.angle = 0
    } else if (this.extremite2.x > this.extremite1.x) {
      this.angle = -s.angleAvecHorizontale
      this.angle = -s.angleAvecHorizontale
    } else {
      this.angle = 180 - s.angleAvecHorizontale
      this.angle = 180 - s.angleAvecHorizontale
    }
  }

  svg(coeff: number) {
    const N = pointSurSegment(this.O, this.M, (this.distance * 20) / coeff)
    return texteParPoint(
      this.texte,
      N,
      this.angle,
      this.stringColor,
      this.scale,
      'milieu',
      this.mathOn,
    ).svg(coeff)
  }

  tikz() {
    const N = pointSurSegment(this.O, this.M, this.distance / context.scale)
    return texteParPoint(
      this.texte,
      N,
      this.angle,
      this.stringColor,
      this.scale,
      'milieu',
      this.mathOn,
    ).tikz()
  }
}
/**
 * Écrit un texte au milieu de [AB] au-dessus si A est le point le plus à gauche sinon au dessous ou bien horizontal
 * @param {string} texte
 * @param {PointAbstrait} A
 * @param {PointAbstrait} B
 * @param {string} [color='black'] Code couleur HTML accepté
 * @param {number} [distance=0.5] Distance à la droite.
 * @param {boolean} [horizontal=false] Si true, alors le texte est horizontal, sinon le texte est parallèle au segment
 * @return {object} LatexParCoordonnees si le premier caractère est '$', TexteParPoint sinon
 * @author Rémi Angot
 */

export function texteSurSegment(
  texte = '',
  A: PointAbstrait,
  B: PointAbstrait,
  color = 'black',
  distance = 0.5,
  horizontal = false,
) {
  if (texte[0] === '$') {
    return placeLatexSurSegment(texte.replaceAll('$', ''), A, B, {
      color,
      distance,
      horizontal,
    })
  }
  return new TexteSurSegment(texte, A, B, color, distance, horizontal)
}
