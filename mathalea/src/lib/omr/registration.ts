import { buildDarkIntegral, darkCount } from './binarize'
import type { GrayImage, Point } from './omrTypes'

/**
 * Recalage d'une page scannée sur le document théorique.
 *
 * Une feuille passée dans un scanner n'est jamais exactement à sa place :
 * elle est décalée de quelques millimètres, légèrement tournée, et la
 * numérisation peut introduire une petite déformation trapézoïdale. Plutôt
 * que d'espérer que les cases tombent au bon endroit, on imprime quatre
 * marqueurs noirs aux coins, on les retrouve dans l'image, et on en déduit
 * l'**homographie** qui envoie la page théorique sur l'image réelle. C'est la
 * méthode d'Auto Multiple Choice, et elle ne demande aucune bibliothèque de
 * vision : quatre correspondances suffisent à résoudre un système 8 × 8.
 */

/** Homographie : matrice 3 × 3 stockée en ligne, `h[8]` valant toujours 1. */
export type Homography = Float64Array

/** Réglages de la détection des marqueurs, en fraction de page. */
export interface MarkerOptions {
  /** Côté d'un marqueur (5 mm sur 210 mm de large ≈ 0,0238) */
  tailleRelative: number
  /** Rayon de la fenêtre de recherche autour de la position attendue */
  rechercheRelative: number
}

const OPTIONS_PAR_DEFAUT: MarkerOptions = {
  tailleRelative: 5 / 210,
  rechercheRelative: 0.06,
}

/**
 * Composante connexe de pixels sombres, décrite par sa boîte englobante,
 * son aire et son centroïde.
 */
interface Composante {
  aire: number
  sommeX: number
  sommeY: number
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

/**
 * Cherche le marqueur de calage dans une fenêtre rectangulaire de l'image.
 *
 * Parcourt les composantes connexes sombres (remplissage par diffusion avec
 * pile explicite — la récursion déborderait sur une tache de plusieurs
 * milliers de pixels) et retient celle qui ressemble le plus à un carré plein
 * de l'aire attendue. Les critères écartent le texte (trop petit, trop peu
 * dense) et les bords de page noircis par le scanner (aire démesurée).
 *
 * @returns le centroïde en pixels, ou `null` si aucun candidat crédible
 */
function chercherMarqueur(
  image: GrayImage,
  seuil: number,
  fenetre: { x0: number; y0: number; x1: number; y1: number },
  aireAttendue: number,
): Point | null {
  const { width, data } = image
  const x0 = Math.max(0, Math.floor(fenetre.x0))
  const y0 = Math.max(0, Math.floor(fenetre.y0))
  const x1 = Math.min(image.width, Math.ceil(fenetre.x1))
  const y1 = Math.min(image.height, Math.ceil(fenetre.y1))
  const largeurFenetre = x1 - x0
  const hauteurFenetre = y1 - y0
  if (largeurFenetre <= 0 || hauteurFenetre <= 0) return null

  const vus = new Uint8Array(largeurFenetre * hauteurFenetre)
  const pile: number[] = []
  let meilleur: Composante | null = null
  let meilleurEcart = Infinity

  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const indexLocal = (y - y0) * largeurFenetre + (x - x0)
      if (vus[indexLocal] === 1) continue
      if (data[y * width + x] >= seuil) {
        vus[indexLocal] = 1
        continue
      }
      // remplissage par diffusion en 4-connexité
      const composante: Composante = {
        aire: 0,
        sommeX: 0,
        sommeY: 0,
        xMin: x,
        xMax: x,
        yMin: y,
        yMax: y,
      }
      vus[indexLocal] = 1
      pile.push(x, y)
      while (pile.length > 0) {
        const py = pile.pop() as number
        const px = pile.pop() as number
        composante.aire++
        composante.sommeX += px
        composante.sommeY += py
        if (px < composante.xMin) composante.xMin = px
        if (px > composante.xMax) composante.xMax = px
        if (py < composante.yMin) composante.yMin = py
        if (py > composante.yMax) composante.yMax = py
        const voisins = [
          [px - 1, py],
          [px + 1, py],
          [px, py - 1],
          [px, py + 1],
        ]
        for (const [vx, vy] of voisins) {
          if (vx < x0 || vx >= x1 || vy < y0 || vy >= y1) continue
          const vIndex = (vy - y0) * largeurFenetre + (vx - x0)
          if (vus[vIndex] === 1) continue
          vus[vIndex] = 1
          if (data[vy * width + vx] < seuil) pile.push(vx, vy)
        }
      }

      // un marqueur est un carré plein : aire proche de l'attendu, presque
      // aussi haut que large, et remplissant sa boîte englobante
      const largeur = composante.xMax - composante.xMin + 1
      const hauteur = composante.yMax - composante.yMin + 1
      const rapport = largeur / hauteur
      const remplissage = composante.aire / (largeur * hauteur)
      if (composante.aire < aireAttendue * 0.25) continue
      if (composante.aire > aireAttendue * 4) continue
      if (rapport < 0.6 || rapport > 1.7) continue
      if (remplissage < 0.7) continue
      const ecart = Math.abs(composante.aire - aireAttendue)
      if (ecart < meilleurEcart) {
        meilleurEcart = ecart
        meilleur = composante
      }
    }
  }

  if (meilleur == null) return null
  return {
    x: meilleur.sommeX / meilleur.aire,
    y: meilleur.sommeY / meilleur.aire,
  }
}

/**
 * Retrouve les quatre marqueurs de calage dans une page scannée.
 *
 * @param image page en niveaux de gris
 * @param seuil seuil de binarisation (voir `otsuThreshold`)
 * @param reperes centres attendus, en fraction de page
 * @returns les quatre centres en pixels, dans le même ordre, ou `null`
 */
export function findMarkers(
  image: GrayImage,
  seuil: number,
  reperes: readonly Point[],
  options: MarkerOptions = OPTIONS_PAR_DEFAUT,
): Point[] | null {
  const { width, height } = image
  const cote = options.tailleRelative * width
  const aireAttendue = cote * cote
  const rayonX = options.rechercheRelative * width
  const rayonY = options.rechercheRelative * height

  const trouves: Point[] = []
  for (const repere of reperes) {
    const cx = repere.x * width
    const cy = repere.y * height
    const point = chercherMarqueur(
      image,
      seuil,
      { x0: cx - rayonX, y0: cy - rayonY, x1: cx + rayonX, y1: cy + rayonY },
      aireAttendue,
    )
    if (point == null) return null
    trouves.push(point)
  }
  return trouves
}

/**
 * Résout l'homographie envoyant `source` sur `destination` (4 points chacun).
 *
 * Chaque correspondance donne deux équations linéaires en les huit inconnues
 * de la matrice (la neuvième est fixée à 1) ; on résout le système 8 × 8 par
 * élimination de Gauss avec pivot partiel.
 *
 * @returns la matrice, ou `null` si les points sont dégénérés (alignés)
 */
export function solveHomography(
  source: readonly Point[],
  destination: readonly Point[],
): Homography | null {
  if (source.length !== 4 || destination.length !== 4) return null
  const a: number[][] = []
  for (let i = 0; i < 4; i++) {
    const { x, y } = source[i]
    const { x: u, y: v } = destination[i]
    a.push([x, y, 1, 0, 0, 0, -x * u, -y * u, u])
    a.push([0, 0, 0, x, y, 1, -x * v, -y * v, v])
  }

  for (let colonne = 0; colonne < 8; colonne++) {
    let pivot = colonne
    for (let ligne = colonne + 1; ligne < 8; ligne++) {
      if (Math.abs(a[ligne][colonne]) > Math.abs(a[pivot][colonne])) {
        pivot = ligne
      }
    }
    if (Math.abs(a[pivot][colonne]) < 1e-12) return null
    ;[a[colonne], a[pivot]] = [a[pivot], a[colonne]]
    const diagonale = a[colonne][colonne]
    for (let k = colonne; k < 9; k++) a[colonne][k] /= diagonale
    for (let ligne = 0; ligne < 8; ligne++) {
      if (ligne === colonne) continue
      const facteur = a[ligne][colonne]
      if (facteur === 0) continue
      for (let k = colonne; k < 9; k++) a[ligne][k] -= facteur * a[colonne][k]
    }
  }

  const h = new Float64Array(9)
  for (let i = 0; i < 8; i++) h[i] = a[i][8]
  h[8] = 1
  return h
}

/** Applique une homographie à un point. */
export function applyHomography(h: Homography, point: Point): Point {
  const { x, y } = point
  const w = h[6] * x + h[7] * y + h[8]
  return {
    x: (h[0] * x + h[1] * y + h[2]) / w,
    y: (h[3] * x + h[4] * y + h[5]) / w,
  }
}

/**
 * Homographie envoyant les coordonnées normalisées de la page (0 à 1) sur les
 * pixels de la page scannée, à partir des marqueurs retrouvés.
 *
 * @returns `null` si les marqueurs sont introuvables ou dégénérés
 */
export function pageToImage(
  image: GrayImage,
  seuil: number,
  reperes: readonly Point[],
): Homography | null {
  const trouves = findMarkers(image, seuil, reperes)
  if (trouves == null) return null
  return solveHomography(reperes, trouves)
}

/**
 * Diagnostic : proportion de pixels sombres sous chaque marqueur retrouvé.
 * Sert d'indicateur de confiance affiché au professeur — un marqueur à peine
 * noir signale une page mal numérisée avant même de lire les cases.
 */
export function markerConfidence(
  image: GrayImage,
  seuil: number,
  centres: readonly Point[],
  tailleRelative = OPTIONS_PAR_DEFAUT.tailleRelative,
): number[] {
  const integral = buildDarkIntegral(image, seuil)
  const demiCote = (tailleRelative * image.width) / 2
  return centres.map((centre) => {
    const aire = (2 * demiCote) ** 2
    if (aire <= 0) return 0
    const sombres = darkCount(
      integral,
      image.width,
      image.height,
      centre.x - demiCote,
      centre.y - demiCote,
      centre.x + demiCote,
      centre.y + demiCote,
    )
    return sombres / aire
  })
}
