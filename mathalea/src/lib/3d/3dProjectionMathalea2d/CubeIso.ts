import { mathalea2d } from '../../../modules/mathalea2d'
import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { fixeBordures } from '../../2d/fixeBordures'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { pointAbstrait } from '../../2d/PointAbstrait'
import { polygone } from '../../2d/polygones'

/**
 * @author Erwan Duplessy
 * @author Jean-claude Lhote
 * Attention !
 * Cette Classe définit un objet cube dans une représentation en perspective axonométrique paramétrée par alpha et beta
 * et non pas context.anglePerspective (contrairement à l'objet cube3d ci-dessus ou l'objet pave3d ci-dessous)
 * Il ne s'agit pas à proprement parler d'un objet 3d, c'est un objet 2d avec sa méthode svg() et sa méthode tikz()
 * Utilisée par exemple dans 6G43
 */

export class Cube extends ObjetMathalea2D {
  constructor(
    x: number,
    y: number,
    z: number,
    alpha: number,
    beta: number,
    colorD: string,
    colorT: string,
    colorG: string,
  ) {
    super()
    this.x = x
    this.y = y
    this.z = z
    this.alpha = alpha
    this.beta = beta
    this.colorD = colorToLatexOrHTML(colorD)
    this.colorG = colorToLatexOrHTML(colorG)
    this.colorT = colorToLatexOrHTML(colorT)

    this.lstPoints = []
    this.lstPolygone = []

    function proj(
      x: number,
      y: number,
      z: number,
      alpha: number,
      beta: number,
    ) {
      const cosa = Math.cos((alpha * Math.PI) / 180)
      const sina = Math.sin((alpha * Math.PI) / 180)
      const cosb = Math.cos((beta * Math.PI) / 180)
      const sinb = Math.sin((beta * Math.PI) / 180)
      return pointAbstrait(
        cosa * x - sina * y,
        -sina * sinb * x - cosa * sinb * y + cosb * z,
      )
    }

    this.lstPoints.push(proj(this.x, this.y, this.z, this.alpha, this.beta)) // point 0 en bas
    this.lstPoints.push(proj(this.x + 1, this.y, this.z, this.alpha, this.beta)) // point 1
    this.lstPoints.push(
      proj(this.x + 1, this.y, this.z + 1, this.alpha, this.beta),
    ) // point 2
    this.lstPoints.push(proj(this.x, this.y, this.z + 1, this.alpha, this.beta)) // point 3
    this.lstPoints.push(
      proj(this.x + 1, this.y + 1, this.z + 1, this.alpha, this.beta),
    ) // point 4
    this.lstPoints.push(
      proj(this.x, this.y + 1, this.z + 1, this.alpha, this.beta),
    ) // point 5
    this.lstPoints.push(proj(this.x, this.y + 1, this.z, this.alpha, this.beta)) // point 6
    let p
    p = polygone(
      [
        this.lstPoints[0],
        this.lstPoints[1],
        this.lstPoints[2],
        this.lstPoints[3],
      ],
      'black',
    )
    p.opaciteDeRemplissage = 1
    p.couleurDeRemplissage = this.colorD
    this.lstPolygone.push(p)
    p = polygone(
      [
        this.lstPoints[2],
        this.lstPoints[4],
        this.lstPoints[5],
        this.lstPoints[3],
      ],
      'black',
    )
    p.couleurDeRemplissage = this.colorG
    p.opaciteDeRemplissage = 1
    this.lstPolygone.push(p)
    p = polygone(
      [
        this.lstPoints[3],
        this.lstPoints[5],
        this.lstPoints[6],
        this.lstPoints[0],
      ],
      'black',
    )
    p.couleurDeRemplissage = this.colorT
    p.opaciteDeRemplissage = 1
    this.lstPolygone.push(p)
    this.c2d = this.lstPolygone
  }
}

export function cube(
  x = 0,
  y = 0,
  z = 0,
  alpha = 45,
  beta = -35,
  { colorD = 'green', colorT = 'white', colorG = 'gray' } = {},
) {
  return new Cube(x, y, z, alpha, beta, colorD, colorG, colorT)
}

/**
 * Crée les projections isométriques de cubes.
 * @param L - Liste des cubes à projeter
 * @param largeur - Largeur de la projection
 * @param longueur - Longueur de la projection
 * @param hauteur - Hauteur de la projection
 * @returns Les objets 2D et les paramètres de la projection
 */
export function createCubesProjections(
  L: number[][],
  largeur: number,
  longueur: number,
  hauteur: number,
) {
  // Projection 1
  const { objets: objetsEnonce, params: paramsEnonce } = projectionCubesIso2d(
    L,
    10,
    -40,
    false,
  )
  // Projection 2
  const { objets: objetsEnonce2, params: paramsEnonce2 } = projectionCubesIso2d(
    L,
    35,
    -20,
    false,
  )
  // Correction (projection 2, cubes déplacés)
  const { objets: objetsCorrection, params: paramsCorrection } =
    projectionCubesIso2d(L, 35, -20, true)

  const figure =
    mathalea2d(paramsEnonce, objetsEnonce) +
    mathalea2d(paramsEnonce2, objetsEnonce2)
  const figureCorrection = mathalea2d(paramsCorrection, objetsCorrection)
  return { figure, figureCorrection }
}

/**
 * Génère les objets 2D et les paramètres pour une projection isométrique de cubes.
 */
export function projectionCubesIso2d(
  L: number[][],
  alpha: number,
  beta: number,
  eclate: boolean,
  colors: { colorD?: string; colorT?: string; colorG?: string } = {
    colorD: 'green',
    colorT: 'white',
    colorG: 'gray',
  },
) {
  const objets = []
  for (let i = 0; i < L.length; i++) {
    objets.push(
      ...cube(L[i][0] * (eclate ? 3 : 1), L[i][1], L[i][2], alpha, beta, {
        colorD: colors.colorD ?? 'green',
        colorT: colors.colorT ?? 'white',
        colorG: colors.colorG ?? 'gray',
      }).c2d,
    )
  }
  const params = Object.assign(
    {
      pixelsParCm: 20,
      scale: 0.6,
      mainlevee: false,
      display: 'inline-block' as const,
    },
    fixeBordures(objets),
  )
  return { objets, params }
}
