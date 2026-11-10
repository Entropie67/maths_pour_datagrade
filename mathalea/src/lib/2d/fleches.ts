import { BezierPath } from './BezierPath'
import { colorToLatexOrHTML } from './colorToLatexOrHtml'
import { pointAbstrait } from './PointAbstrait'
import { barycentre, Polygone, polygone } from './polygones'
import { Segment, segment } from './segmentsVecteurs'
import { homothetie, rotation, translation } from './transformations'
import { vecteur } from './Vecteur'
/**
 * @author Jean-claude Lhote
 */
export class FlecheBuilder {
  pointe: Polygone | BezierPath
  ligne: Segment | BezierPath
  constructor({
    stylePointe = 'straight',
    color = 'black',
    epaisseur = 0.1,
    styleLigne = 'straight',
    scalePointe = 1,
    coords = [
      [0, 0],
      [1, 0],
    ],
    anglePointe = 0,
  }: {
    stylePointe?: 'straight' | 'curved'
    color?: string
    epaisseur?: number
    styleLigne?: 'straight' | 'curved'
    coords?: [number, number][]
    anglePointe?: number
    scalePointe?: number
  }) {
    const xPointe =
      styleLigne === 'curved'
        ? coords[0][0] + coords[coords.length - 1][0]
        : coords[coords.length - 1][0]
    const yPointe =
      styleLigne === 'curved'
        ? coords[0][1] + coords[coords.length - 1][1]
        : coords[coords.length - 1][1]
    this.pointe = pointeDeFleche(
      xPointe,
      yPointe,
      scalePointe,
      anglePointe,
      stylePointe,
      { color, epaisseur },
    )
    if (styleLigne === 'curved') {
      if (coords.length % 3 !== 1) {
        throw new Error(
          'Pour une ligne courbe, le nombre de points doit être de la forme 3n+1',
        )
      }
      const listeOfTriplets: [number, number][][] = []
      for (let i = 1; i < coords.length - 1; i += 3) {
        listeOfTriplets.push([coords[i], coords[i + 1], coords[i + 2]])
      }
      this.ligne = new BezierPath({
        xStart: coords[0][0],
        yStart: coords[0][1],
        listeOfTriplets,
        color,
        epaisseur,
      })
    } else {
      this.ligne = segment(
        coords[0][0],
        coords[0][1],
        coords[coords.length - 1][0],
        coords[coords.length - 1][1],
      )
    }
  }

  make() {
    return [this.ligne, this.pointe]
  }
}

export function pointeDeFleche(
  x: number,
  y: number,
  scale = 1,
  angle = 0,
  style: 'straight' | 'curved' = 'straight',
  options: { color: string; epaisseur: number },
) {
  const O = pointAbstrait(0, 0)
  let straightFleche = polygone(
    pointAbstrait(0, 0),
    pointAbstrait(0.1, 0.24),
    pointAbstrait(-0.1, 0.24),
  )
  if (angle !== 0) {
    straightFleche = translation(
      rotation(
        homothetie(straightFleche, barycentre(straightFleche), scale),
        barycentre(straightFleche),
        angle,
      ),
      vecteur(x, y),
    )
    straightFleche.color = colorToLatexOrHTML(options.color)
    straightFleche.epaisseur = options.epaisseur
    straightFleche.couleurDeRemplissage = colorToLatexOrHTML(options.color)
    straightFleche.opaciteDeRemplissage = 1
  }

  const listeOfTriplets: [number, number][][] = [
    [
      [0.02, 0.1],
      [0.02, 0.1],
      [0.1, 0.24],
    ],
    [
      [0, 0.2],
      [0, 0.2],
      [-0.1, 0.24],
    ],
    [
      [-0.02, 0.1],
      [-0.02, 0.1],
      [0, 0],
    ],
  ]
  if (angle !== 0) {
    for (let i = 0; i < listeOfTriplets.length; i++) {
      for (let j = 0; j < listeOfTriplets[i].length; j++) {
        const point = pointAbstrait(
          listeOfTriplets[i][j][0] * scale,
          listeOfTriplets[i][j][1] * scale,
        )
        const rotatedPoint = rotation(point, O, angle)
        listeOfTriplets[i][j] = [rotatedPoint.x, rotatedPoint.y]
      }
    }
  }
  const curvedFleche = new BezierPath({
    xStart: x,
    yStart: y,
    listeOfTriplets,
    color: options.color,
    epaisseur: options.epaisseur,
  })
  return style === 'straight' ? straightFleche : curvedFleche
}
