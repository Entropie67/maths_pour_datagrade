import type { GrayImage } from './omrTypes'

/**
 * Rastérisation des copies scannées.
 *
 * pdf.js est chargé à la demande : c'est la plus grosse dépendance de la
 * lecture optique, et elle ne concerne qu'un professeur en train de corriger.
 * Le reste de MathALÉA ne doit pas la porter.
 *
 * La résolution de travail est de 150 points par pouce. C'est un compromis
 * mesuré : une case de 4 mm y fait 24 pixels de côté, largement de quoi
 * distinguer une case noircie d'une case vide, et une page A4 tient en
 * 2,2 mégapixels — assez léger pour enchaîner soixante feuilles sans saturer
 * la mémoire du navigateur.
 */

/** Résolution de rastérisation, en points par pouce. */
export const DPI_ANALYSE = 150

/** Un PDF ouvert, dont les pages se rendent une à une. */
export interface DocumentScanne {
  nombreDePages: number
  /** Rend la page (rang à partir de 1) en niveaux de gris */
  rendrePage: (rang: number) => Promise<GrayImage>
  /** Libère les ressources de pdf.js */
  fermer: () => Promise<void>
}

/** Convertit un `ImageData` RGBA en niveaux de gris, un octet par pixel. */
export function versNiveauxDeGris(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): GrayImage {
  const data = new Uint8Array(width * height)
  for (let i = 0; i < data.length; i++) {
    // pondération perceptuelle : un trait de stylo bleu doit ressortir aussi
    // sombre qu'un trait noir, ce qu'une moyenne arithmétique rend mal
    data[i] =
      (0.299 * rgba[i * 4] +
        0.587 * rgba[i * 4 + 1] +
        0.114 * rgba[i * 4 + 2]) |
      0
  }
  return { width, height, data }
}

/**
 * Ouvre un PDF de copies scannées.
 *
 * @param donnees octets du fichier déposé par le professeur
 * @param dpi résolution de rastérisation
 */
export async function ouvrirPdf(
  donnees: ArrayBuffer,
  dpi = DPI_ANALYSE,
): Promise<DocumentScanne> {
  const pdfjs = await import('pdfjs-dist')
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.mjs?url'))
    .default

  // On fabrique nous-mêmes le worker de pdf.js et on le lui passe, au lieu de
  // le laisser choisir. Livré à lui-même dans un contexte de worker, pdf.js
  // bascule en mode « faux worker » : il installe alors son propre
  // `self.onmessage` sur le fil courant, écrasant celui de l'appelant, et
  // diffuse son protocole interne vers la page. Le nôtre ne recevait plus rien
  // et l'analyse échouait sans message exploitable.
  const port = new Worker(workerUrl, { type: 'module' })
  // `create` plutôt que le constructeur : c'est la forme dont la signature
  // déclare correctement `port`, et elle réutilise le worker déjà associé à ce
  // port au lieu d'en créer un doublon
  const worker = pdfjs.PDFWorker.create({ port })

  // c'est la tâche de chargement qui possède ce worker : la fermer libère le
  // processus, là où `cleanup()` sur le document ne rend que la mémoire des
  // pages déjà rendues
  const tache = pdfjs.getDocument({ data: donnees, worker })
  const document = await tache.promise
  return {
    nombreDePages: document.numPages,
    rendrePage: async (rang: number) => {
      const page = await document.getPage(rang)
      const echelle = dpi / 72
      const viewport = page.getViewport({ scale: echelle })
      const width = Math.round(viewport.width)
      const height = Math.round(viewport.height)
      const canvas = new OffscreenCanvas(width, height)
      const contexte = canvas.getContext('2d')
      if (contexte == null) {
        throw new Error('contexte 2d indisponible pour la rastérisation')
      }
      // un PDF scanné n'a pas toujours de fond opaque : sans ce blanc, les
      // zones vierges resteraient transparentes et compteraient comme noires
      contexte.fillStyle = '#ffffff'
      contexte.fillRect(0, 0, width, height)
      await page.render({
        canvas: canvas as unknown as HTMLCanvasElement,
        canvasContext: contexte as unknown as CanvasRenderingContext2D,
        viewport,
      }).promise
      const donneesImage = contexte.getImageData(0, 0, width, height)
      page.cleanup()
      return versNiveauxDeGris(donneesImage.data, width, height)
    },
    fermer: async () => {
      await tache.destroy()
      worker.destroy()
      port.terminate()
    },
  }
}
