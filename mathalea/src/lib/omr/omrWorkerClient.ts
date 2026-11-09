import type { ResultatAnalyse } from './analyseScan'
import type { OmrWorkerRequest, OmrWorkerResponse } from './omrWorker'
import type { OmrEvaluation } from './omrTypes'

/**
 * Pilotage du worker d'analyse depuis l'interface.
 *
 * Le worker est créé pour une analyse puis détruit : cela libère d'un coup le
 * PDF rasterisé et la copie de pdf.js, plutôt que de les laisser occuper la
 * mémoire du navigateur entre deux corrections.
 */

export interface OptionsAnalyseFichier {
  onProgress?: (page: number, total: number) => void
}

/**
 * Analyse un PDF de copies scannées.
 *
 * @param fichier PDF déposé par le professeur
 * @param evaluation fichier d'accompagnement produit à la génération
 */
export async function analyserFichier(
  fichier: File | Blob,
  evaluation: OmrEvaluation,
  options: OptionsAnalyseFichier = {},
): Promise<ResultatAnalyse> {
  const octets = await fichier.arrayBuffer()
  // `evaluation` arrive souvent enveloppé dans un proxy réactif Svelte
  // (`$state`), que `postMessage` refuse de cloner (« The object can not be
  // cloned. » sur Safari). Le fichier d'accompagnement n'est que des données
  // JSON : un aller-retour `JSON` rend un objet nu, transférable tel quel.
  const evaluationNue = JSON.parse(JSON.stringify(evaluation)) as OmrEvaluation
  const worker = new Worker(new URL('./omrWorker.ts', import.meta.url), {
    type: 'module',
  })
  try {
    return await new Promise<ResultatAnalyse>((resoudre, rejeter) => {
      worker.onmessage = (evenement: MessageEvent<OmrWorkerResponse>) => {
        const message = evenement.data
        if (message.type === 'progression') {
          options.onProgress?.(message.page, message.total)
        } else if (message.type === 'resultat') {
          resoudre(message.resultat)
        } else {
          rejeter(new Error(message.message))
        }
      }
      worker.onerror = (evenement) => {
        rejeter(new Error(evenement.message || 'échec du worker d’analyse'))
      }
      const requete: OmrWorkerRequest = {
        type: 'analyser',
        pdf: octets,
        evaluation: evaluationNue,
      }
      worker.postMessage(requete, [octets])
    })
  } finally {
    worker.terminate()
  }
}
