import { buildDarkIntegral, otsuThreshold } from './binarize'
import type { DocumentScanne } from './pdfRaster'
import { lireQrDeLaPage, pivoter180 } from './qr'
import {
  affinerChoixUnique,
  classifier,
  measureBox,
  seuilsCopie,
  type SeuilsCopie,
} from './readBoxes'
import { pageToImage } from './registration'
import { noterCopie, type OmrCopieResult } from './scoring'
import type { GrayImage, OmrBoxReading, OmrEvaluation } from './omrTypes'

/**
 * Chaîne d'analyse d'un lot de copies scannées.
 *
 * L'ordre des opérations est contraint par un point de conception : le seuil
 * qui sépare une case cochée d'une case vide se calcule **par copie**, à
 * partir du niveau de fond de toutes ses cases. Il faut donc avoir mesuré
 * toutes les pages d'une copie avant d'en classer la moindre case. La chaîne
 * fait par conséquent une seule passe de rastérisation, en ne conservant que
 * les mesures — quelques centaines de nombres par copie — puis classe et note
 * une fois le lot parcouru. Les images, elles, ne sont jamais gardées.
 */

/** Pourquoi une page n'a pas pu être exploitée. */
export type PageStatut =
  | 'ok'
  | 'qrIllisible'
  | 'copieInconnue'
  | 'pageInattendue'
  | 'recalageEchoue'
  | 'doublon'
  | 'ecartee'

/** Ce qui a été tiré d'une page du PDF scanné. */
export interface PageAnalysee {
  /** Rang de la page dans le PDF déposé, à partir de 1 */
  rang: number
  statut: PageStatut
  copieId?: string
  /** Rang de la page dans sa copie, à partir de 1 */
  page?: number
  /** Vrai si la feuille a été passée à l'envers dans le chargeur */
  retournee?: boolean
  /** Confiance du recalage : proportion de noir sous les marqueurs */
  /** Page associée sans recalage : toutes les cases restent à arbitrer. */
  lectureManuelle?: boolean
  mesures: { id: string; darkness: number }[]
}

/** Résultat complet de l'analyse d'un lot. */
export interface ResultatAnalyse {
  pages: PageAnalysee[]
  copies: OmrCopieResult[]
  /** Lectures automatiques conservées pour une révision réversible. */
  lectures?: Record<string, OmrBoxReading[]>
  revision?: import('./omrReview').OmrRevision
  /** Seuils retenus pour chaque copie, pour affichage et diagnostic */
  seuils: Record<string, SeuilsCopie>
  /** Copies attendues dont aucune page n'a été retrouvée */
  copiesAbsentes: string[]
}

/** Avancement, pour la barre de progression de l'interface. */
export interface Avancement {
  page: number
  total: number
}

export interface OptionsAnalyse {
  onProgress?: (avancement: Avancement) => void
  /** Interrompt l'analyse entre deux pages */
  signal?: AbortSignal
}

/**
 * Regroupe, par question à réponse unique, les identifiants de ses cases.
 * C'est la matière de `affinerChoixUnique`.
 */
function groupesChoixUnique(
  evaluation: OmrEvaluation,
  layoutId: string,
): string[][] {
  const qidsMono = new Set(
    evaluation.questions
      .filter((question) => question.type === 'qcmMono')
      .map((question) => question.qid),
  )
  const parQid = new Map<string, string[]>()
  for (const box of evaluation.layouts[layoutId] ?? []) {
    if (!qidsMono.has(box.qid)) continue
    const liste = parQid.get(box.qid) ?? []
    liste.push(box.id)
    parQid.set(box.qid, liste)
  }
  return [...parQid.values()]
}

/** Mesure toutes les cases d'une page déjà recalée. */
export function mesurerPage(
  image: GrayImage,
  evaluation: OmrEvaluation,
  copieId: string,
  page: number,
): { id: string; darkness: number }[] | null {
  const copie = evaluation.copies.find((c) => c.copieId === copieId)
  if (copie == null) return null
  const boxes = (evaluation.layouts[copie.layoutId] ?? []).filter(
    (box) => box.page === page,
  )
  if (boxes.length === 0) return []

  const seuil = otsuThreshold(image)
  const projection = pageToImage(image, seuil, evaluation.reperes)
  if (projection == null) return null
  const integral = buildDarkIntegral(image, seuil)
  return boxes.map((box) => ({
    id: box.id,
    darkness: measureBox(integral, image.width, image.height, projection, box),
  }))
}

/**
 * Analyse un PDF de copies scannées.
 *
 * @param document PDF ouvert par `ouvrirPdf`
 * @param evaluation fichier d'accompagnement produit à la génération
 */
export async function analyserScan(
  document: DocumentScanne,
  evaluation: OmrEvaluation,
  options: OptionsAnalyse = {},
): Promise<ResultatAnalyse> {
  const pages: PageAnalysee[] = []

  for (let rang = 1; rang <= document.nombreDePages; rang++) {
    if (options.signal?.aborted === true) break
    options.onProgress?.({ page: rang, total: document.nombreDePages })

    let image = await document.rendrePage(rang)
    const qr = await lireQrDeLaPage(image)
    if (qr == null) {
      pages.push({ rang, statut: 'qrIllisible', mesures: [] })
      continue
    }
    // la feuille est physiquement à l'envers : on redresse l'image plutôt que
    // de demander au professeur de rescanner le lot
    if (qr.retournee) image = pivoter180(image)

    const copie = evaluation.copies.find(
      (c) => c.copieId === qr.payload.copieId,
    )
    if (copie == null) {
      pages.push({
        rang,
        statut: 'copieInconnue',
        copieId: qr.payload.copieId,
        retournee: qr.retournee,
        mesures: [],
      })
      continue
    }
    // le QR porte le rang physique dans le PDF d'origine ; son rang dans la
    // copie est sa place dans la liste des feuilles de cette copie
    const rangDansLaCopie = copie.pages.indexOf(qr.payload.page) + 1
    if (rangDansLaCopie === 0) {
      pages.push({
        rang,
        statut: 'pageInattendue',
        copieId: copie.copieId,
        retournee: qr.retournee,
        mesures: [],
      })
      continue
    }

    const mesures = mesurerPage(
      image,
      evaluation,
      copie.copieId,
      rangDansLaCopie,
    )
    if (mesures == null) {
      pages.push({
        rang,
        statut: 'recalageEchoue',
        copieId: copie.copieId,
        page: rangDansLaCopie,
        retournee: qr.retournee,
        mesures: [],
      })
      continue
    }
    const doublon = pages.some(
      (p) =>
        p.statut === 'ok' &&
        p.copieId === copie.copieId &&
        p.page === rangDansLaCopie,
    )
    pages.push({
      rang,
      statut: doublon ? 'doublon' : 'ok',
      copieId: copie.copieId,
      page: rangDansLaCopie,
      retournee: qr.retournee,
      mesures,
    })
  }

  return noterPages(evaluation, pages)
}

/** Recalcule les seuils et les notes après une association de page. */
export function noterPages(
  evaluation: OmrEvaluation,
  pages: PageAnalysee[],
): ResultatAnalyse {
  // seuils, classement et notation, une fois toutes les pages mesurées
  const mesuresParCopie = new Map<string, { id: string; darkness: number }[]>()
  const pagesLuesParCopie = new Map<string, number[]>()
  for (const page of pages) {
    if (page.statut !== 'ok' || page.copieId == null) continue
    const liste = mesuresParCopie.get(page.copieId) ?? []
    liste.push(...page.mesures)
    mesuresParCopie.set(page.copieId, liste)
    const lues = pagesLuesParCopie.get(page.copieId) ?? []
    if (page.page != null && !lues.includes(page.page)) lues.push(page.page)
    pagesLuesParCopie.set(page.copieId, lues)
  }

  const seuils: Record<string, SeuilsCopie> = {}
  const copies: OmrCopieResult[] = []
  const lecturesParCopie: Record<string, OmrBoxReading[]> = {}
  for (const copie of evaluation.copies) {
    const mesures = mesuresParCopie.get(copie.copieId)
    if (mesures == null) continue
    const manuelles = new Set(
      pages
        .filter(
          (p) =>
            p.statut === 'ok' &&
            p.copieId === copie.copieId &&
            p.lectureManuelle,
        )
        .flatMap((p) => p.mesures.map((m) => m.id)),
    )
    const seuilsDeLaCopie = seuilsCopie(
      mesures.filter((m) => !manuelles.has(m.id)).map((m) => m.darkness),
    )
    seuils[copie.copieId] = seuilsDeLaCopie
    const lectures: OmrBoxReading[] = mesures.map((mesure) => ({
      id: mesure.id,
      darkness: mesure.darkness,
      status: classifier(mesure.darkness, seuilsDeLaCopie),
    }))
    const lecturesAffinees = affinerChoixUnique(
      lectures,
      groupesChoixUnique(evaluation, copie.layoutId),
      seuilsDeLaCopie,
    )
    for (const lecture of lecturesAffinees) {
      if (manuelles.has(lecture.id)) lecture.status = 'ambigue'
    }
    lecturesParCopie[copie.copieId] = lecturesAffinees
    copies.push(
      noterCopie(
        evaluation,
        copie.copieId,
        lecturesAffinees,
        pagesLuesParCopie.get(copie.copieId) ?? [],
      ),
    )
  }

  return {
    pages,
    copies,
    lectures: lecturesParCopie,
    seuils,
    copiesAbsentes: evaluation.copies
      .filter((copie) => !mesuresParCopie.has(copie.copieId))
      .map((copie) => copie.copieId),
  }
}
