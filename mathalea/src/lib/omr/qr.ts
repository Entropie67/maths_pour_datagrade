import { OMR_QR_VERSION } from './omrTypstTemplate'
import type { GrayImage, Point } from './omrTypes'

/**
 * Décodage du QR-code identifiant une feuille scannée.
 *
 * Deux chemins : `BarcodeDetector`, natif et accéléré quand le navigateur le
 * propose, et `jsqr` en repli, chargé à la demande pour ne pas peser sur le
 * démarrage de MathALÉA. Le repli n'est pas une roue de secours théorique :
 * Firefox n'implémente pas `BarcodeDetector`.
 *
 * L'orientation de la feuille se déduit de **l'endroit où le QR-code se
 * trouve**, et non d'un échec de décodage. Un lecteur de QR-code lit aussi
 * bien un code à l'endroit qu'à l'envers — c'est même sa raison d'être — si
 * bien qu'attendre un échec ne détecterait jamais rien. Or les quatre
 * marqueurs de calage sont symétriques par demi-tour : sur une feuille
 * retournée non redressée, le recalage *réussit* et lit chaque case à la
 * place de sa symétrique. Une erreur parfaitement silencieuse, que seule la
 * position du QR permet d'écarter.
 */

/** Ce que porte le QR-code d'une feuille. */
export interface OmrQrPayload {
  sujetId: string
  copieId: string
  /** Rang physique de la feuille dans le PDF imprimé */
  page: number
}

/** Un QR-code trouvé dans une image : son contenu et où il se trouve. */
export interface QrTrouve {
  texte: string
  /** Centre du code, en pixels de l'image analysée */
  centre: Point
}

/**
 * Analyse le contenu textuel d'un QR-code.
 *
 * @returns `null` si le format n'est pas celui de MathALÉA — un QR étranger
 *   collé sur la copie ne doit pas être pris pour un identifiant de feuille
 */
export function parseQrPayload(texte: string): OmrQrPayload | null {
  const parties = texte.split('|')
  if (parties.length !== 4) return null
  const [version, sujetId, copieId, page] = parties
  if (version !== OMR_QR_VERSION) return null
  const numero = Number(page)
  if (!Number.isInteger(numero) || numero < 1) return null
  if (sujetId === '' || copieId === '') return null
  return { sujetId, copieId, page: numero }
}

/** Convertit une image en niveaux de gris vers le RGBA attendu des décodeurs. */
function versRgba(image: GrayImage): Uint8ClampedArray {
  const rgba = new Uint8ClampedArray(image.width * image.height * 4)
  for (let i = 0; i < image.data.length; i++) {
    const valeur = image.data[i]
    rgba[i * 4] = valeur
    rgba[i * 4 + 1] = valeur
    rgba[i * 4 + 2] = valeur
    rgba[i * 4 + 3] = 255
  }
  return rgba
}

/** Fait pivoter une image d'un demi-tour. */
export function pivoter180(image: GrayImage): GrayImage {
  const data = new Uint8Array(image.data.length)
  for (let i = 0; i < image.data.length; i++) {
    data[i] = image.data[image.data.length - 1 - i]
  }
  return { width: image.width, height: image.height, data }
}

/**
 * La feuille est-elle à l'envers ?
 *
 * Le QR-code est imprimé en haut de page. S'il est retrouvé dans la moitié
 * basse de l'image, c'est que la feuille a été enfournée à l'envers. Le seuil
 * est volontairement grossier — la moitié de la page — parce qu'il n'a pas à
 * être fin : les deux positions possibles sont aux antipodes.
 */
export function estRetournee(centre: Point, hauteur: number): boolean {
  return centre.y > hauteur / 2
}

type Decodeur = (image: GrayImage) => Promise<QrTrouve | null>

let decodeurCache: Decodeur | null = null

/** `BarcodeDetector` du navigateur, si disponible et fonctionnel. */
async function decodeurNatif(): Promise<Decodeur | null> {
  const global = globalThis as unknown as {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: ImageData) => Promise<
        {
          rawValue: string
          boundingBox: { x: number; y: number; width: number; height: number }
        }[]
      >
    }
  }
  if (global.BarcodeDetector == null) return null
  if (typeof ImageData === 'undefined') return null
  try {
    const detecteur = new global.BarcodeDetector({ formats: ['qr_code'] })
    return async (image) => {
      // on remplit un `ImageData` vide plutôt que de passer le tableau au
      // constructeur : la surcharge correspondante exige un `ArrayBuffer` non
      // partagé, garantie que le type d'un `Uint8ClampedArray` ne porte pas
      const donnees = new ImageData(image.width, image.height)
      donnees.data.set(versRgba(image))
      const trouves = await detecteur.detect(donnees)
      const premier = trouves[0]
      if (premier == null) return null
      return {
        texte: premier.rawValue,
        centre: {
          x: premier.boundingBox.x + premier.boundingBox.width / 2,
          y: premier.boundingBox.y + premier.boundingBox.height / 2,
        },
      }
    }
  } catch {
    // format non pris en charge par cette implémentation : on passe au repli
    return null
  }
}

/** Repli `jsqr`, chargé à la demande. */
async function decodeurJsQr(): Promise<Decodeur> {
  const { default: jsQR } = await import('jsqr')
  return async (image) => {
    const trouve = jsQR(versRgba(image), image.width, image.height)
    if (trouve == null) return null
    const coins = [
      trouve.location.topLeftCorner,
      trouve.location.topRightCorner,
      trouve.location.bottomRightCorner,
      trouve.location.bottomLeftCorner,
    ]
    return {
      texte: trouve.data,
      centre: {
        x: coins.reduce((s, c) => s + c.x, 0) / coins.length,
        y: coins.reduce((s, c) => s + c.y, 0) / coins.length,
      },
    }
  }
}

/** Choisit le décodeur une fois pour toutes, puis le réutilise. */
async function obtenirDecodeur(): Promise<Decodeur> {
  if (decodeurCache != null) return decodeurCache
  decodeurCache = (await decodeurNatif()) ?? (await decodeurJsQr())
  return decodeurCache
}

/** Réinitialise le choix du décodeur. Réservé aux tests. */
export function reinitialiserDecodeur(): void {
  decodeurCache = null
}

/**
 * Lit le QR-code d'une page scannée et détermine son orientation.
 *
 * @returns le contenu décodé, ou `null` si aucun QR-code MathALÉA n'est trouvé
 */
export async function lireQrDeLaPage(
  image: GrayImage,
): Promise<{ payload: OmrQrPayload; retournee: boolean } | null> {
  const decoder = await obtenirDecodeur()
  const trouve = await decoder(image)
  if (trouve != null) {
    const payload = parseQrPayload(trouve.texte)
    if (payload != null) {
      return { payload, retournee: estRetournee(trouve.centre, image.height) }
    }
  }

  // certaines implémentations peinent sur un code très incliné : une seconde
  // tentative sur l'image redressée coûte peu et rattrape ces cas
  const surRetournee = await decoder(pivoter180(image))
  if (surRetournee == null) return null
  const payload = parseQrPayload(surRetournee.texte)
  if (payload == null) return null
  return {
    payload,
    // le code a été lu sur l'image déjà pivotée : s'il y apparaît en haut,
    // c'est bien que l'original était à l'envers
    retournee: !estRetournee(surRetournee.centre, image.height),
  }
}
