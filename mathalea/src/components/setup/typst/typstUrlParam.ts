/**
 * Transport du paramètre `typstParam` (réglages du document et de la mise en
 * page) dans l'URL de la vue Typst.
 *
 * Ce paramètre n'a pas de taille bornée (code Typst saisi à la main, textes
 * insérés…) alors que les serveurs refusent les URL trop longues (HTTP 414 /
 * 431, souvent au-delà de 8 000 caractères) : la page ne se rechargerait plus.
 * Trois formes cohabitent donc :
 * - `?typstParam=<base64>` quand l'URL reste raisonnable (cas courant) ;
 * - `?typstParam=local` quand elle serait trop longue : la valeur complète est
 *   alors gardée dans le `sessionStorage` de l'onglet (le rechargement
 *   fonctionne, l'URL reste courte) ;
 * - `#typstParam=<base64>` dans les liens à partager et le fichier de
 *   redirection : un fragment n'est jamais envoyé au serveur, il n'a donc pas
 *   de limite côté serveur.
 */

/** Longueur maximale d'une URL écrite dans la barre d'adresse */
export const TYPST_URL_BUDGET = 6000

/** Valeur de `typstParam` qui renvoie à la copie gardée dans l'onglet */
export const LOCAL_TYPST_PARAM = 'local'

const STORAGE_KEY = 'mathalea-typst-param-local'

function sessionStorageOrNull(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

/** Valeur complète de `typstParam` lue dans le fragment d'une URL */
function readHashParam(url: URL): string | null {
  return new URLSearchParams(url.hash.replace(/^#/, '')).get('typstParam')
}

/**
 * Valeur complète (base64) de `typstParam` portée par une URL, quelle que soit
 * sa forme (voir l'en-tête du fichier). `null` si l'URL n'en porte pas ou si la
 * copie locale a disparu (autre onglet, stockage vidé).
 */
export function readTypstParam(url: URL): string | null {
  const raw = url.searchParams.get('typstParam') ?? readHashParam(url)
  if (raw !== LOCAL_TYPST_PARAM) return raw
  return sessionStorageOrNull()?.getItem(STORAGE_KEY) ?? null
}

/**
 * Valeur de `typstParam` à écrire dans la barre d'adresse : la valeur complète
 * si l'URL qui en résulte tient dans `TYPST_URL_BUDGET`, sinon `local` (la
 * valeur complète est alors mise de côté dans l'onglet).
 */
export function typstParamForAddressBar(
  fullParam: string,
  currentUrl: string,
  budget = TYPST_URL_BUDGET,
): string {
  const url = new URL(currentUrl)
  url.hash = ''
  url.searchParams.set('typstParam', fullParam)
  if (url.href.length <= budget) return fullParam
  try {
    sessionStorageOrNull()?.setItem(STORAGE_KEY, fullParam)
  } catch {
    // stockage plein ou indisponible : le rechargement perdra ces réglages,
    // mais la page restera utilisable
  }
  return LOCAL_TYPST_PARAM
}

/**
 * URL qui régénère la fiche à l'identique sur n'importe quel poste : la valeur
 * complète de `typstParam` va dans la requête, ou dans le fragment si l'URL
 * dépasserait `TYPST_URL_BUDGET`.
 */
export function buildShareUrl(
  currentUrl: string,
  fullParam: string,
  budget = TYPST_URL_BUDGET,
): string {
  const url = new URL(currentUrl)
  url.hash = ''
  url.searchParams.delete('typstParam')
  if (fullParam === '') return url.href
  url.searchParams.set('typstParam', fullParam)
  if (url.href.length <= budget) return url.href
  url.searchParams.delete('typstParam')
  url.hash = `typstParam=${encodeURIComponent(fullParam)}`
  return url.href
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Page HTML qui redirige vers `targetUrl` : à ouvrir depuis le poste de
 * l'enseignant ou à déposer sur un ENT, sans avoir à conserver une URL
 * longue. La redirection ne dépend pas de JavaScript.
 */
export function buildRedirectHtml(targetUrl: string, title: string): string {
  const href = escapeHtml(targetUrl)
  const pageTitle = escapeHtml(title.trim() === '' ? 'MathALÉA' : title.trim())
  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>${pageTitle} – MathALÉA</title>
    <meta http-equiv="refresh" content="0; url=${href}" />
  </head>
  <body>
    <p>Redirection vers MathALÉA… Si rien ne se passe, <a href="${href}">ouvrir la fiche « ${pageTitle} »</a>.</p>
  </body>
</html>
`
}
