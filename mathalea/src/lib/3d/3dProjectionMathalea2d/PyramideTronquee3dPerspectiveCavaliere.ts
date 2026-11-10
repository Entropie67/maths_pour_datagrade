import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import {
  Point3d,
  Polygone3d,
  arete3d,
  homothetie3d,
  polygone3d,
} from './elementsEtTransformations3d'

/**
 * La pyramide tronquée
 *
 * @author Jean-claude Lhote
 * Crée une pyramide à partir d'une base Polygone3d d'un sommet et d'un coefficient compris entre 0 et 1
 * un coefficient de 0.5 coupera la pyramide à mi-hauteur (valeur par défaut).
 */

export class PyramideTronquee3d extends ObjetMathalea2D {
  constructor(base: Polygone3d, sommet: Point3d, coeff = 0.5, color = 'black') {
    super()
    this.color = colorToLatexOrHTML(color)
    base.color = color
    this.base = base
    this.coeff = coeff
    this.aretes = []
    this.sommet = sommet
    this.c2d = []
    const sommetsBase2 = []
    for (let i = 0, pointSection; i < this.base.listePoints.length; i++) {
      pointSection = homothetie3d(sommet, base.listePoints[i], coeff)
      pointSection.isVisible = true
      sommetsBase2.push(pointSection)
    }
    this.base2 = polygone3d(...sommetsBase2)
    this.c2d.push(...this.base.c2d)
    for (let i = 0; i < base.listePoints.length; i++) {
      this.aretes.push(
        arete3d(
          base.listePoints[i],
          this.base2.listePoints[i],
          color,
          base.listePoints[i].isVisible,
        ),
      )
      this.c2d.push(this.aretes[i].c2d)
    }
    this.c2d.push(...this.base2.c2d)
  }
}

export function pyramideTronquee3d(
  base: Polygone3d,
  sommet: Point3d,
  coeff = 0.5,
  color = 'black',
) {
  return new PyramideTronquee3d(base, sommet, coeff, color)
}
