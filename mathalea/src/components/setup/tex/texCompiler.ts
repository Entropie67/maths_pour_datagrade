/**
 * Compilation LaTeX → PDF pour la vue « LaTeX ».
 *
 * Contrairement à la vue Typst, qui compile dans le navigateur (WASM), la
 * compilation LaTeX passe par un service distant : elle dure plusieurs
 * secondes et peut échouer côté réseau. Le service attendu est le même que
 * celui de la vue PDF (`components/setup/latex/PdfResult.svelte`), mais la
 * fonction est ici indépendante de `lib/Latex` et de `LatexFileInfos` : elle
 * ne reçoit qu'un source et des fichiers auxiliaires, ce qui permet de
 * compiler un code modifié à la main dans l'éditeur.
 */

/** Service de compilation (mêmes réglages que la vue PDF) */
const COMPILER_URL = 'https://latexcompiler.duckdns.org/generate'

/** Au-delà, on considère que le service ne répondra pas */
export const COMPILE_TIMEOUT_MS = 90 * 1000

/** Fichier auxiliaire à déposer à côté du `.tex` (image d'annale…) */
export interface TexAuxiliaryFile {
  /** Nom du fichier tel que référencé par `\includegraphics` */
  name: string
  content: Blob
}

export interface TexCompileResult {
  /** PDF produit, `null` si la compilation a échoué */
  pdf: Blob | null
  /** Journal renvoyé par le compilateur (vide si tout s'est bien passé) */
  log: string
  /** Message court à afficher, `null` si la compilation a réussi */
  error: string | null
  /**
   * Vrai si `error` vient d'un échec réseau (service injoignable), et non
   * d'un délai dépassé ou d'une erreur de compilation LaTeX. Permet à
   * l'appelant de basculer automatiquement sur l'autre moteur sans avoir à
   * analyser le texte du message.
   */
  unreachable: boolean
}

/** Vrai si l'erreur vient d'une annulation (nouvelle compilation, démontage) */
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Récupère les fichiers auxiliaires nécessaires à la compilation.
 *
 * Les URLs sont ramenées sur l'origine courante quand c'est possible : en
 * développement, `https://coopmaths.fr/alea/static/…` n'est pas joignable en
 * CORS alors que le même chemin l'est en local.
 */
export async function fetchAuxiliaryFiles(
  urls: string[],
  signal?: AbortSignal,
): Promise<TexAuxiliaryFile[]> {
  const files: TexAuxiliaryFile[] = []
  for (const url of urls) {
    const sameOrigin = url.replace(
      'https://coopmaths.fr',
      window.location.origin,
    )
    try {
      const response = await fetch(sameOrigin, { signal })
      if (!response.ok) continue
      files.push({
        name: sameOrigin.split('/').slice(-1)[0],
        content: await response.blob(),
      })
    } catch (error) {
      if (isAbortError(error)) throw error
      // une image manquante ne doit pas empêcher de compiler le reste :
      // LaTeX signalera lui-même le fichier absent dans son journal
      console.warn(`Image non récupérée pour la compilation : ${url}`, error)
    }
  }
  return files
}

/**
 * Compile un source LaTeX et renvoie le PDF produit.
 *
 * N'émet jamais d'exception hors annulation : un échec de compilation est un
 * résultat normal (le code est éditable à la main), rendu par `error` et
 * `log`.
 */
export async function compileTexToPdf(
  source: string,
  files: TexAuxiliaryFile[] = [],
  signal?: AbortSignal,
): Promise<TexCompileResult> {
  const formData = new FormData()
  formData.append('name', 'document.tex')
  formData.append('originalname', 'document.tex')
  formData.append('file', new Blob([source]), 'document.tex')

  for (const file of files) {
    formData.append('name', file.name)
    formData.append('originalname', file.name)
    formData.append('file', file.content, file.name)
  }

  // le signal d'annulation de l'appelant (nouvelle compilation) et le
  // délai maximal se combinent : le premier qui se déclenche l'emporte
  const timeout = AbortSignal.timeout(COMPILE_TIMEOUT_MS)
  const combined =
    signal != null ? AbortSignal.any([signal, timeout]) : timeout

  let response: Response
  try {
    response = await fetch(COMPILER_URL, {
      method: 'POST',
      body: formData,
      signal: combined,
    })
  } catch (error) {
    // annulation demandée par l'appelant : on la propage pour que la vue
    // ignore le résultat, alors qu'un dépassement de délai est une erreur
    if (signal?.aborted === true) throw error
    if (isAbortError(error)) {
      return {
        pdf: null,
        log: '',
        error: `La compilation a dépassé ${COMPILE_TIMEOUT_MS / 1000} secondes.`,
        unreachable: false,
      }
    }
    return {
      pdf: null,
      log: '',
      error: `Le service de compilation est injoignable (${
        error instanceof Error ? error.message : String(error)
      }).`,
      unreachable: true,
    }
  }

  if (!response.ok) {
    const log = await response.text()
    return {
      pdf: null,
      log,
      error: `La compilation a échoué (erreur ${response.status}).`,
      unreachable: false,
    }
  }

  return { pdf: await response.blob(), log: '', error: null, unreachable: false }
}
