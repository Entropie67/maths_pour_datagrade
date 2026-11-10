import type { ResultatAnalyse } from './analyseScan'
import type { OmrDocumentOptions } from './buildOmrDocument'
import type { OmrEvaluation } from './omrTypes'

export interface OmrReviewView {
  selection: string
  rang: number
  seulementAVerifier: boolean
  zoom: number
}

/** État complet, sérialisable dans IndexedDB et dans le fichier .mathalea. */
export interface OmrSavedState {
  version: 1
  titre: string
  listeCollee: string
  consigne: string
  grainePartagee: boolean
  graineDeBase: string
  documentOptions: OmrDocumentOptions
  gabarit: string
  indexApercu: number
  onglet: 'generer' | 'analyser' | 'bilan'
  displayMode: 'code' | 'split' | 'preview'
  showOverlay: boolean
  isSettingsOpen: boolean
  evaluation: OmrEvaluation | null
  resultat: ResultatAnalyse | null
  scan: { name: string; data: string } | null
  review: OmrReviewView
}

/** Ne jamais importer silencieusement une évaluation privée de son état. */
export function readOmrSavedState(value: unknown): OmrSavedState {
  if (!value || typeof value !== 'object')
    throw new Error('Évaluation sauvegardée invalide.')
  const s = value as OmrSavedState
  if (
    s.version !== 1 ||
    !['titre', 'listeCollee', 'consigne', 'graineDeBase', 'gabarit'].every(
      (key) => typeof (value as Record<string, unknown>)[key] === 'string',
    ) ||
    typeof s.grainePartagee !== 'boolean' ||
    typeof s.showOverlay !== 'boolean' ||
    typeof s.isSettingsOpen !== 'boolean' ||
    !s.documentOptions ||
    typeof s.documentOptions !== 'object' ||
    !Number.isInteger(s.indexApercu) ||
    s.indexApercu < 0 ||
    !['generer', 'analyser', 'bilan'].includes(s.onglet) ||
    !['code', 'split', 'preview'].includes(s.displayMode) ||
    !s.review ||
    typeof s.review.selection !== 'string' ||
    !Number.isInteger(s.review.rang) ||
    s.review.rang < 1 ||
    typeof s.review.seulementAVerifier !== 'boolean' ||
    !Number.isFinite(s.review.zoom) ||
    (s.scan !== null &&
      (!s.scan ||
        typeof s.scan.name !== 'string' ||
        typeof s.scan.data !== 'string' ||
        !/^[A-Za-z0-9+/]*={0,2}$/.test(s.scan.data) ||
        s.scan.data.length % 4 !== 0)) ||
    (s.evaluation !== null &&
      (!s.evaluation ||
        s.evaluation.version !== 1 ||
        !Array.isArray(s.evaluation.copies) ||
        !Array.isArray(s.evaluation.questions) ||
        !s.evaluation.layouts)) ||
    (s.resultat !== null &&
      (!s.evaluation ||
        !s.scan ||
        !s.resultat ||
        !Array.isArray(s.resultat.pages) ||
        !Array.isArray(s.resultat.copies) ||
        !Array.isArray(s.resultat.copiesAbsentes) ||
        !s.resultat.lectures))
  )
    throw new Error('Évaluation sauvegardée incomplète ou invalide.')
  return s
}

export async function saveScan(
  file: File | null,
): Promise<OmrSavedState['scan']> {
  if (!file) return null
  const bytes = new Uint8Array(await file.arrayBuffer())
  const chunks: string[] = []
  for (let i = 0; i < bytes.length; i += 32768) {
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 32768)))
  }
  return { name: file.name, data: btoa(chunks.join('')) }
}

export function restoreScan(scan: OmrSavedState['scan']): File | null {
  if (!scan) return null
  const bytes = Uint8Array.from(atob(scan.data), (c) => c.charCodeAt(0))
  return new File([bytes], scan.name, { type: 'application/pdf' })
}
