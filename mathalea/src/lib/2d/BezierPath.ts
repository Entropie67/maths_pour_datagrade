import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { ObjetMathalea2D } from './ObjetMathalea2D'
/**
 * Une fonction pour convertir des abscisses en unité Mathalé en abscisses svg
 * @param x
 * @param coeff
 * @return {number}
 */
const xSVG = (x: number, coeff: number) => Number((x * coeff).toFixed(1))
/**
 * Une fonction pour convertir des ordonnées en unité Mathalé en ordonnées svg
 * @param y
 * @param coeff
 * @return {number}
 */
const ySVG = (y: number, coeff: number) => Number((-y * coeff).toFixed(1))
export class BezierPath extends ObjetMathalea2D {
  xStart: number
  yStart: number
  listeOfTriplets: [number, number][][]
  constructor({
    xStart = 0,
    yStart = 0,
    listeOfTriplets = [
      [
        [1, 1],
        [-1, -1],
        [1, 1],
      ],
    ] as [number, number][][],
    color = 'black',
    epaisseur = 2,
    opacite = 1,
  }) {
    super()
    this.color = colorToLatexOrHTML(color)
    this.opacite = opacite
    this.epaisseur = epaisseur
    this.xStart = xStart
    this.yStart = yStart
    this.listeOfTriplets = listeOfTriplets
    let xMin = 1000
    let xMax = -1000
    let yMin = 1000
    let yMax = -1000
    // Calcul des bordures
    let x0 = xStart
    let y0 = yStart
    for (const triplet of listeOfTriplets) {
      const x3 = x0 + triplet[2][0]
      const y3 = y0 + triplet[2][1]
      const pointsToConsider = [
        [x0, y0],
        [x0 + triplet[0][0], y0 + triplet[0][1]],
        [x3 + triplet[1][0], y3 + triplet[1][1]],
        [x3, y3],
      ]
      for (const point of pointsToConsider) {
        if (point[0] < xMin) xMin = point[0]
        if (point[0] > xMax) xMax = point[0]
        if (point[1] < yMin) yMin = point[1]
        if (point[1] > yMax) yMax = point[1]
      }
      x0 = x3
      y0 = y3
    }
    this.bordures = [xMin, yMin, xMax, yMax]
  }

  svg(coeff: number) {
    //
    let path = `<path fill="none" stroke="${this.color[0]}" stroke-width=${this.epaisseur} d="M${xSVG(this.xStart, coeff)},${ySVG(this.yStart, coeff)} c`
    for (const triplet of this.listeOfTriplets) {
      path += `${xSVG(triplet[0][0], coeff)},${ySVG(triplet[0][1], coeff)} ${xSVG(triplet[1][0], coeff)},${ySVG(triplet[1][1], coeff)} ${xSVG(triplet[2][0], coeff)},${ySVG(triplet[2][1], coeff)} `
    }
    path += '" />\n'
    return path
  }

  tikz() {
    let path = `\t\\draw[color = ${this.color[1]},line width = ${this.epaisseur}, opacity = ${this.opacite}](${this.xStart},${this.yStart})`
    // Pour tikz, les coordonnées du point initial et final doivent être en coordonnées absolues, seules les points de contrôles peuvent-être en relatif à leur noeud respectif
    let x0 = this.xStart
    let y0 = this.yStart
    for (const triplet of this.listeOfTriplets) {
      const x3 = x0 + triplet[2][0]
      const y3 = y0 + triplet[2][1]
      const dX2X3 = triplet[1][0] - triplet[2][0] // tikz prend comme origine le point final pour calculer les coordonnées relatives du point de contrôle 2 !
      const dY2Y3 = triplet[1][1] - triplet[2][1]
      path += ` .. controls +(${triplet[0][0].toFixed(2)},${triplet[0][1].toFixed(2)}) and +(${dX2X3.toFixed(2)},${dY2Y3.toFixed(2)})  .. (${x3.toFixed(2)},${y3.toFixed(2)})\n`
      x0 = x3 // Le nouveau point de départ est le point d'arrivée du tronçon précédent !
      y0 = y3
    }
    path += ';'
    return path
  }
}
