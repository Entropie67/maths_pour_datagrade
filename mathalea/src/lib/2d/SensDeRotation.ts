import { arc } from './Arc'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { fixeBordures } from './fixeBordures'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import type { PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { rotation, similitude } from './transformations'

/**
 * @author Jean-claude Lhote
 * A1 Le point de départ de la flèche
 * centre Le centre de la rotation
 * sens Le sens (+1 ou -1) de la rotation. +1=sens trig
 */

export class SensDeRotation extends ObjetMathalea2D {
  constructor(
    A1: PointAbstrait,
    centre: PointAbstrait,
    sens: 1 | -1,
    color = 'black',
  ) {
    super()
    this.objets = []
    const arc1 = arc(A1, centre, 20 * sens)
    arc1.color = colorToLatexOrHTML(color)
    const A2 = rotation(A1, centre, 20 * sens)
    const F1 = similitude(A2, centre, -5 * sens, 0.95)
    const F2 = similitude(A2, centre, -5 * sens, 1.05)
    const s1 = segment(A2, F1, color)
    const s2 = segment(A2, F2, color)
    this.objets.push(arc1, s1, s2)
    const bordures = fixeBordures(this.objets, {
      rxmin: 0,
      rxmax: 0,
      rymin: 0,
      rymax: 0,
    })
    this.bordures = [bordures.xmin, bordures.ymin, bordures.xmax, bordures.ymax]
  }

  svg(coeff: number) {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += '\n\t' + objet.svg(coeff)
    }
    return code
  }

  tikz() {
    let code = ''
    if (this.objets == null) return code
    for (const objet of this.objets) {
      code += `\t${objet.tikz()}`
    }
    return code
  }
}

export function sensDeRotation(
  A: PointAbstrait,
  O: PointAbstrait,
  sens: 1 | -1,
  color = 'black',
) {
  return new SensDeRotation(A, O, sens, color)
}
