import { applyHomography, type Homography } from './registration'
import type { GrayImage, Point } from './omrTypes'

/**
 * Fabrique de pages synthétiques pour les tests du moteur OMR.
 *
 * Permet de simuler une numérisation — décalage, rotation, légère perspective —
 * sans imprimante ni scanner, en dessinant directement dans l'espace image les
 * formes définies en coordonnées de page.
 */

/** Crée une page blanche. */
export function pageBlanche(width: number, height: number): GrayImage {
  const data = new Uint8Array(width * height)
  data.fill(255)
  return { width, height, data }
}

/** Vrai si le point est à l'intérieur du quadrilatère (sommets ordonnés). */
function dansQuadrilatere(quad: Point[], px: number, py: number): boolean {
  let signe = 0
  for (let i = 0; i < 4; i++) {
    const a = quad[i]
    const b = quad[(i + 1) % 4]
    const produit = (b.x - a.x) * (py - a.y) - (b.y - a.y) * (px - a.x)
    if (produit === 0) continue
    const courant = produit > 0 ? 1 : -1
    if (signe === 0) signe = courant
    else if (signe !== courant) return false
  }
  return true
}

/**
 * Dessine un rectangle plein défini en coordonnées de page (fraction 0 à 1),
 * projeté dans l'image par l'homographie.
 *
 * @param valeur niveau de gris à écrire (0 = noir)
 */
export function remplirRect(
  image: GrayImage,
  h: Homography,
  rect: { x: number; y: number; w: number; h: number },
  valeur = 0,
): void {
  const quad = [
    applyHomography(h, { x: rect.x, y: rect.y }),
    applyHomography(h, { x: rect.x + rect.w, y: rect.y }),
    applyHomography(h, { x: rect.x + rect.w, y: rect.y + rect.h }),
    applyHomography(h, { x: rect.x, y: rect.y + rect.h }),
  ]
  const xMin = Math.max(0, Math.floor(Math.min(...quad.map((p) => p.x))))
  const xMax = Math.min(
    image.width - 1,
    Math.ceil(Math.max(...quad.map((p) => p.x))),
  )
  const yMin = Math.max(0, Math.floor(Math.min(...quad.map((p) => p.y))))
  const yMax = Math.min(
    image.height - 1,
    Math.ceil(Math.max(...quad.map((p) => p.y))),
  )
  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      if (dansQuadrilatere(quad, x + 0.5, y + 0.5)) {
        image.data[y * image.width + x] = valeur
      }
    }
  }
}

/** Dessine le contour d'un rectangle de page, d'une épaisseur donnée. */
export function contourRect(
  image: GrayImage,
  h: Homography,
  rect: { x: number; y: number; w: number; h: number },
  epaisseur: number,
  valeur = 0,
): void {
  remplirRect(image, h, { ...rect, h: epaisseur }, valeur)
  remplirRect(
    image,
    h,
    { ...rect, y: rect.y + rect.h - epaisseur, h: epaisseur },
    valeur,
  )
  remplirRect(image, h, { ...rect, w: epaisseur }, valeur)
  remplirRect(
    image,
    h,
    { ...rect, x: rect.x + rect.w - epaisseur, w: epaisseur },
    valeur,
  )
}

/**
 * Homographie simulant une numérisation : mise à l'échelle page → pixels,
 * translation, rotation, et une déformation projective optionnelle.
 *
 * @param width largeur de l'image en pixels
 * @param height hauteur de l'image en pixels
 * @param options décalage en pixels, angle en degrés, perspective sans unité
 */
export function homographieDeScan(
  width: number,
  height: number,
  options: {
    decalageX?: number
    decalageY?: number
    angleDegres?: number
    perspective?: number
  } = {},
): Homography {
  const {
    decalageX = 0,
    decalageY = 0,
    angleDegres = 0,
    perspective = 0,
  } = options
  const angle = (angleDegres * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const h = new Float64Array(9)
  // rotation autour du centre de l'image, puis mise à l'échelle et translation
  h[0] = cos * width
  h[1] = -sin * height
  h[2] = decalageX + (width * (1 - cos) + height * sin) / 2
  h[3] = sin * width
  h[4] = cos * height
  h[5] = decalageY + (height * (1 - cos) - width * sin) / 2
  h[6] = perspective / width
  h[7] = perspective / height
  h[8] = 1
  return h
}
