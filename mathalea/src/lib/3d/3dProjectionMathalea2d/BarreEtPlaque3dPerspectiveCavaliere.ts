import { colorToLatexOrHTML } from '../../2d/colorToLatexOrHtml'
import { ObjetMathalea2D } from '../../2d/ObjetMathalea2D'
import { polygone } from '../../2d/polygones'
import {
  point3d,
  translation3d,
  vecteur3d,
} from './elementsEtTransformations3d'

/**
 * @author Jean-claude Lhote
 * Créer une barre de l cubes de c de côté à partir du point (x,y,z)
 * La barre est positionnée suivant l'axe x
 */

export class Barre3d extends ObjetMathalea2D {
  constructor(
    x: number,
    y: number,
    z: number,
    c: number,
    l: number,
    color = 'black',
  ) {
    super()
    let faceAv, faceTop
    this.c2d = []
    const vx = vecteur3d(c, 0, 0)
    const vy = vecteur3d(0, c, 0)
    const vz = vecteur3d(0, 0, c)
    let A = point3d(x, y, z)
    let B = A
    let C = A
    let D = A
    let E = A
    let F = A
    let G = A
    let H = A
    for (let i = 0; i < l; i++) {
      B = translation3d(A, vx)
      C = translation3d(B, vz)
      D = translation3d(A, vz)
      E = translation3d(A, vy)
      F = translation3d(E, vx)
      G = translation3d(F, vz)
      H = translation3d(D, vy)
      faceAv = polygone([A.c2d, B.c2d, C.c2d, D.c2d], color)
      faceTop = polygone([D.c2d, C.c2d, G.c2d, H.c2d], color)
      faceAv.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
      faceTop.couleurDeRemplissage = colorToLatexOrHTML('white')
      this.c2d.push(faceAv, faceTop)
      A = translation3d(A, vx)
    }
    const faceD = polygone([B.c2d, F.c2d, G.c2d, C.c2d], color)
    faceD.couleurDeRemplissage = colorToLatexOrHTML('darkgray')
    this.c2d.push(faceD)
  }
}

export function barre3d(
  x: number,
  y: number,
  z: number,
  c: number,
  l: number,
  color = 'black',
) {
  return new Barre3d(x, y, z, c, l, color)
}
/**
 * @author Jean-claude Lhote
 * Crée une plaque de cubes de côtés c de dimensions l suivant x et p suivant y
 */
export class Plaque3d extends ObjetMathalea2D {
  constructor(
    x: number,
    y: number,
    z: number,
    c: number,
    l: number,
    p: number,
    color = 'black',
  ) {
    super()
    let A, B, C, D, F, G, H, faceAv, faceTop, faceD
    this.c2d = []
    const vx = vecteur3d(c, 0, 0)
    const vy = vecteur3d(0, c, 0)
    const vz = vecteur3d(0, 0, c)

    for (let i = 0; i < l; i++) {
      for (let j = 0; j < p; j++) {
        A = point3d(x + i * c, y + j * c, z)
        B = translation3d(A, vx)
        C = translation3d(B, vz)
        D = translation3d(A, vz)
        F = translation3d(B, vy)
        G = translation3d(F, vz)
        H = translation3d(D, vy)
        if (j === 0) {
          faceAv = polygone([A.c2d, B.c2d, C.c2d, D.c2d], color)
          faceAv.couleurDeRemplissage = colorToLatexOrHTML('lightgray')
          this.c2d.push(faceAv)
        }
        if (i === l - 1) {
          faceD = polygone([B.c2d, F.c2d, G.c2d, C.c2d], color)
          faceD.couleurDeRemplissage = colorToLatexOrHTML('darkgray')
          this.c2d.push(faceD)
        }
        faceTop = polygone([D.c2d, C.c2d, G.c2d, H.c2d], color)
        faceTop.couleurDeRemplissage = colorToLatexOrHTML('white')
        this.c2d.push(faceTop)
      }
    }
  }
}

export function plaque3d(
  x: number,
  y: number,
  z: number,
  c: number,
  l: number,
  p: number,
  color = 'black',
) {
  return new Plaque3d(x, y, z, c, l, p, color)
}
