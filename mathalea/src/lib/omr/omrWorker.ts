import { analyserScan, type ResultatAnalyse } from './analyseScan'
import { ouvrirPdf } from './pdfRaster'
import type { OmrEvaluation } from './omrTypes'

/**
 * Worker d'analyse des copies scannées.
 *
 * Analyser soixante pages demande plusieurs secondes de calcul continu :
 * rastérisation, décodage de QR-code, recherche des marqueurs. Laisser cela
 * sur le fil principal figerait l'interface, y compris la barre de progression
 * censée rassurer le professeur. Tout se passe donc ici, et seules les mesures
 * — quelques centaines de nombres par copie — repartent vers la page.
 *
 * Aucune image ne sort de ce worker, et rien n'en sort du navigateur.
 */

/** Message envoyé au worker. */
export interface OmrWorkerRequest {
  type: 'analyser'
  /** Octets du PDF déposé, transférés sans copie */
  pdf: ArrayBuffer
  evaluation: OmrEvaluation
}

/** Messages émis par le worker. */
export type OmrWorkerResponse =
  | { type: 'progression'; page: number; total: number }
  | { type: 'resultat'; resultat: ResultatAnalyse }
  | { type: 'erreur'; message: string }

function repondre(message: OmrWorkerResponse): void {
  ;(self as unknown as Worker).postMessage(message)
}

self.onmessage = async (evenement: MessageEvent<OmrWorkerRequest>) => {
  const requete = evenement.data
  if (requete?.type !== 'analyser') return
  try {
    const document = await ouvrirPdf(requete.pdf)
    try {
      const resultat = await analyserScan(document, requete.evaluation, {
        onProgress: ({ page, total }) =>
          repondre({ type: 'progression', page, total }),
      })
      repondre({ type: 'resultat', resultat })
    } finally {
      await document.fermer()
    }
  } catch (erreur) {
    // un worker qui ne rapporte que « Error » n'aide ni le professeur ni la
    // mise au point : on joint la pile, seule trace de ce qui a réellement
    // échoué de l'autre côté de la frontière du worker
    repondre({
      type: 'erreur',
      message:
        erreur instanceof Error
          ? `${erreur.message || erreur.name}${erreur.stack != null ? `\n${erreur.stack}` : ''}`
          : String(erreur),
    })
  }
}
