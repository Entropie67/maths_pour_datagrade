import { context } from '../../modules/context'
import { droite, Droite, droiteParPointEtPerpendiculaire } from './droites'
import { ObjetMathalea2D } from './ObjetMathalea2D'
import { pointAbstrait, PointAbstrait } from './PointAbstrait'
import { segment } from './segmentsVecteurs'
import { rotation } from './transformations'
import { longueur } from './utilitairesGeometriques'
import { milieu, pointSurSegment } from './utilitairesPoint'

/**
 * P=tracePointSurDroite(A,d) //Ajoute un trait perpendiculaire à d supposée tracée marquant la posiion du point A
 * P=tracePointSurDroite(A,B) //Ajoute un trait perpendiculaire à la droite (AB) supposée tracée marquant la posiion du point A
 *
 * @author Rémi Angot et Jean-claude Lhote
 */

export class TracePointSurDroite extends ObjetMathalea2D {
  lieu: PointAbstrait
  taille: number
  x: number
  y: number
  direction: PointAbstrait
  stringColor: string

  constructor(A: PointAbstrait, O: PointAbstrait | Droite, color = 'black') {
    super()
    this.stringColor = color
    this.lieu = A
    this.taille = 0.2
    this.x = A.x
    this.y = A.y
    let M, d
    this.bordures = [A.x - 0.2, A.y - 0.2, A.x + 0.2, A.y + 0.2]

    if (O instanceof PointAbstrait) {
      if (longueur(this.lieu, O) < 0.001) {
        window.notify(
          'TracePointSurDroite : points trop rapprochés pour définir une droite',
          {
            A,
            O,
          },
        )
      }
      M = pointSurSegment(this.lieu, O, 1)
      this.direction = rotation(M, this.lieu, 90)
    } else {
      d = droiteParPointEtPerpendiculaire(this.lieu, O as Droite)
      this.direction = pointSurSegment(
        pointAbstrait(d.x1, d.y1),
        pointAbstrait(d.x2, d.y2),
        1,
      )
    }
  }

  svg(coeff: number) {
    const A1 = pointSurSegment(
      this.lieu,
      this.direction,
      (this.taille * 20) / coeff,
    )
    const A2 = pointSurSegment(
      this.lieu,
      this.direction,
      (-this.taille * 20) / coeff,
    )
    const s = segment(A1, A2, this.stringColor)
    s.epaisseur = this.epaisseur
    this.id = s.id
    return s.svg(coeff)
  }

  tikz() {
    const A1 = pointSurSegment(
      this.lieu,
      this.direction,
      this.taille / context.scale,
    )
    const A2 = pointSurSegment(
      this.lieu,
      this.direction,
      -this.taille / context.scale,
    )
    const s = segment(A1, A2, this.stringColor)
    s.epaisseur = this.epaisseur
    return s.tikz()
  }
}

export function tracePointSurDroite(
  A: PointAbstrait,
  O: PointAbstrait | Droite,
  color = 'black',
) {
  return new TracePointSurDroite(A, O, color)
}

export function traceMilieuSegment(A: PointAbstrait, B: PointAbstrait) {
  return new TracePointSurDroite(milieu(A, B), droite(A, B))
}
