import Point from 'apigeom/src/elements/points/Point'
import type Figure from 'apigeom/src/Figure'
import type Polyline from 'apigeom/src/elements/lines/Polyline'

/**
 *
 * @param polyline Fonction pour interpoler la valeur de y xorrespondant à x sur une polyline dont les points sont ordonnés comme ceux d'une fonction
 * Ne fonctionne que pour des polylines du type d'une fonction spline par exemple.
 * @param x
 */
function interpolateCoords(polyline: Polyline, x: number) {
  const lesX: number[] = polyline.points.map((el: Point) => el.x)
  const lesY: number[] = polyline.points.map((el: Point) => el.y)
  let i = 0
  while (i < lesX.length - 1 && x > lesX[i + 1]) {
    i++
  }
  if (i === lesX.length - 1) {
    // On est arrivé au dernier segment de la courbe et x n'est pas dans cet intervalle, il n'est pas possible de détérminer y
    return NaN
  }
  const x0 = lesX[i]
  const x1 = lesX[i + 1]
  const y0 = lesY[i]
  const y1 = lesY[i + 1]
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}
class PointOnPolyLine extends Point {
  dx?: number
  polyline: Polyline
  size?: number
  abscissa: boolean
  ordinate: boolean
  constructor(
    figure: Figure,
    {
      polyline,
      x = 1,
      dx,
      abscissa = false,
      ordinate = false,
      ...options
    }: {
      polyline: Polyline
      x?: number
      abscissa?: boolean
      ordinate?: boolean
      dx?: number
      shape?: 'x' | 'o' | '' | '|'
      size?: number
      label?: string
      labelDx?: number
      labelDy?: number
      color?: string
      thickness?: number
      isChild?: boolean
      isFree?: boolean
      isVisible?: boolean
      id?: string
    },
  ) {
    super(figure, { x, y: interpolateCoords(polyline, x), ...options })
    // Mauvais type pour this.type, il devrait être 'PointOnSpline' et non 'PointOnGraph' Et PointOnSpline devrait être défini dans apiGeom.
    // PointOnSpline devraiy d'ailleurs s'appeler PointOnPolyline
    this.type = 'PointOnGraph'
    this.polyline = polyline
    this.dx = dx
    // @fixme c'est juste pour qu'eslint cesse de râler mais ces propriétés ne servent pas !
    this.abscissa = abscissa
    this.ordinate = ordinate
  }

  get x(): number {
    return this._x
  }

  set x(x) {
    if (this.dx !== undefined) {
      this._x = Math.round(x / this.dx) * this.dx
    } else {
      this._x = x
    }

    this._y = interpolateCoords(this.polyline, this._x)
    this.update()
  }

  get y(): number {
    return interpolateCoords(this.polyline, this._x)
  }

  moveTo(x: number): void {
    const lesX: number[] = this.polyline.points.map((el: Point) => el.x)
    if (x > lesX[0] && x < lesX[lesX.length - 1]) {
      this.x = x
    }
    // y est en lecture seule
  }

  toJSON(): object {
    return {
      type: this.type,
      x: this.x,
      dx: this.dx,
      id: this.id,
      polyline: this.polyline,
      isChild: this.isChild,
      label: this.label,
      shape: this.shape,
      size: this.size,
      color: this.color,
      isDashed: this.isDashed,
    }
  }
}

export default PointOnPolyLine
