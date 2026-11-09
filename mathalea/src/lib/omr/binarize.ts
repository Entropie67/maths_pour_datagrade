import type { GrayImage } from './omrTypes'

/**
 * Binarisation et mesure rapide de noirceur sur une image en niveaux de gris.
 *
 * La lecture d'une copie demande de mesurer la proportion de pixels sombres
 * dans des centaines de rectangles. Une **image intégrale** (somme cumulée en
 * 2D) rend chaque mesure indépendante de la taille du rectangle : quatre accès
 * mémoire au lieu d'un parcours. Sur une page A4 à 150 dpi, c'est la différence
 * entre quelques millisecondes et plusieurs secondes.
 */

/**
 * Seuil de binarisation par la méthode d'Otsu : celui qui maximise la variance
 * entre les deux classes de l'histogramme.
 *
 * Sur une page scannée, l'histogramme est très déséquilibré (l'immense majorité
 * des pixels est du papier blanc). Otsu reste le bon choix pour un scan à plat,
 * dont l'éclairage est uniforme ; une photo au smartphone demanderait un
 * seuillage adaptatif par blocs.
 *
 * @param image image en niveaux de gris
 * @returns seuil dans 1..256 ; un pixel est sombre si sa valeur lui est
 *   strictement inférieure, convention partagée avec `buildDarkIntegral`
 */
export function otsuThreshold(image: GrayImage): number {
  const histogram = new Float64Array(256)
  for (const value of image.data) histogram[value]++
  const total = image.data.length

  let sommeTotale = 0
  for (let i = 0; i < 256; i++) sommeTotale += i * histogram[i]

  let sommeFond = 0
  let poidsFond = 0
  let varianceMax = -1
  let seuil = 128
  for (let i = 0; i < 256; i++) {
    poidsFond += histogram[i]
    if (poidsFond === 0) continue
    const poidsObjet = total - poidsFond
    if (poidsObjet === 0) break
    sommeFond += i * histogram[i]
    const moyenneFond = sommeFond / poidsFond
    const moyenneObjet = (sommeTotale - sommeFond) / poidsObjet
    const variance = poidsFond * poidsObjet * (moyenneFond - moyenneObjet) ** 2
    if (variance > varianceMax) {
      varianceMax = variance
      seuil = i
    }
  }
  // Otsu désigne la classe sombre par [0, seuil] ; on renvoie la frontière
  // au-dessus d'elle pour que le test `valeur < seuil` inclue bien ce mode
  return seuil + 1
}

/**
 * Image intégrale des pixels sombres : `integral[y * (w + 1) + x]` vaut le
 * nombre de pixels sombres dans le rectangle allant de l'origine à (x, y)
 * exclus. La bordure de zéros en première ligne et première colonne évite un
 * test de bord à chaque lecture.
 *
 * @param image image en niveaux de gris
 * @param seuil un pixel est sombre si sa valeur est strictement inférieure
 */
export function buildDarkIntegral(image: GrayImage, seuil: number): Int32Array {
  const { width, height, data } = image
  const stride = width + 1
  const integral = new Int32Array(stride * (height + 1))
  for (let y = 0; y < height; y++) {
    let sommeLigne = 0
    const ligneSrc = y * width
    const ligneDst = (y + 1) * stride
    const lignePrec = y * stride
    for (let x = 0; x < width; x++) {
      if (data[ligneSrc + x] < seuil) sommeLigne++
      integral[ligneDst + x + 1] = integral[lignePrec + x + 1] + sommeLigne
    }
  }
  return integral
}

/**
 * Nombre de pixels sombres dans le rectangle [x0, x1[ × [y0, y1[, en temps
 * constant. Les coordonnées sont rognées aux bords de l'image.
 */
export function darkCount(
  integral: Int32Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const stride = width + 1
  const xa = Math.max(0, Math.min(width, Math.round(x0)))
  const ya = Math.max(0, Math.min(height, Math.round(y0)))
  const xb = Math.max(0, Math.min(width, Math.round(x1)))
  const yb = Math.max(0, Math.min(height, Math.round(y1)))
  if (xb <= xa || yb <= ya) return 0
  return (
    integral[yb * stride + xb] -
    integral[ya * stride + xb] -
    integral[yb * stride + xa] +
    integral[ya * stride + xa]
  )
}

/**
 * Proportion de pixels sombres dans un rectangle, de 0 à 1.
 * Renvoie 0 pour un rectangle vide plutôt que `NaN`.
 */
export function darkRatio(
  integral: Int32Array,
  width: number,
  height: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): number {
  const xa = Math.max(0, Math.min(width, Math.round(x0)))
  const ya = Math.max(0, Math.min(height, Math.round(y0)))
  const xb = Math.max(0, Math.min(width, Math.round(x1)))
  const yb = Math.max(0, Math.min(height, Math.round(y1)))
  const aire = (xb - xa) * (yb - ya)
  if (aire <= 0) return 0
  return darkCount(integral, width, height, xa, ya, xb, yb) / aire
}
