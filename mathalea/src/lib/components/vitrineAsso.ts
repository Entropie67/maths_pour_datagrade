/**
 * Vitrine de l'association CoopMaths affichée sur la page d'accueil tant
 * qu'aucun exercice n'est sélectionné.
 *
 * Le contenu n'est pas dans le bundle : il est rédigé et construit dans le
 * projet `www` (coopmaths.fr/www), qui publie un fragment HTML autonome
 * (styles embarqués, sans script) sur `/www/vitrine/fragment/`. Il est lu
 * sur le site qui sert nos fichiers hors bundle (voir `siteOrigin`), et comme
 * il n'existe que sur les noms coopmaths, un nom mathalea lit le nom coopmaths
 * jumeau (staging.mathalea.fr lit staging.coopmaths.fr, qui envoie l'en-tête
 * CORS pour ce chemin).
 */

import { DEFAULT_ORIGIN, siteOrigin } from '../siteOrigin'

export const VITRINE_FRAGMENT_PATH = '/www/vitrine/fragment/'

/** Classe du conteneur racine du fragment, telle que produite par `www`. */
const ROOT_CLASS = 'vitrine-alea'

/** Origine du site qui sert le fragment pour le site courant (voir en tête). */
export function vitrineOrigin(
  location: { hostname: string; origin: string } = window.location,
): string {
  const origin = siteOrigin(location)
  const { hostname } = new URL(origin)
  const twin = hostname.replace(
    /mathalea\.(fr|education-nationale\.eu)$/,
    'coopmaths.$1',
  )
  return origin.replace(hostname, twin)
}

/**
 * Prépare le fragment reçu pour l'injection dans la page d'accueil :
 * vérifie qu'il s'agit bien de la vitrine, fait ouvrir tous les liens
 * dans un nouvel onglet pour ne pas quitter le générateur, et complète les
 * adresses relatives (images, liens en `/www/...`) avec l'origine du site
 * qui a servi le fragment : résolues sur le site courant, elles n'existent
 * pas sur un nom mathalea.
 *
 * Renvoie `null` si le HTML n'est pas celui attendu (page d'erreur du
 * serveur, réponse vide…).
 */
export function prepareVitrineHtml(
  html: string,
  origin: string = DEFAULT_ORIGIN,
): string | null {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const root = doc.querySelector(`.${ROOT_CLASS}`)
  if (root == null) return null
  // Aucun script n'est exécuté par l'injection, mais on ne prend aucun risque.
  root.querySelectorAll('script').forEach((script) => script.remove())
  root.querySelectorAll('img[src^="/"]').forEach((img) => {
    const src = img.getAttribute('src') ?? ''
    img.setAttribute('src', new URL(src, origin).toString())
  })
  root.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href') ?? ''
    if (href.startsWith('mailto:') || href.startsWith('#')) return
    if (href.startsWith('/')) {
      link.setAttribute('href', new URL(href, origin).toString())
    }
    link.setAttribute('target', '_blank')
    link.setAttribute('rel', 'noopener noreferrer')
  })
  return root.outerHTML
}

let cache: Promise<string | null> | undefined

/**
 * Récupère le fragment de la vitrine (une seule requête par chargement de
 * page, le résultat est mémorisé). Renvoie `null` en cas d'échec réseau ou
 * de contenu inattendu : l'appelant affiche alors l'accueil historique.
 */
export function loadVitrineHtml(): Promise<string | null> {
  if (cache === undefined) {
    cache = fetchVitrineHtml().catch(() => null)
  }
  return cache
}

async function fetchVitrineHtml(): Promise<string | null> {
  const origin = vitrineOrigin()
  const url = new URL(VITRINE_FRAGMENT_PATH, origin)
  const response = await fetch(url.toString(), {
    headers: { Accept: 'text/html' },
    cache: 'no-store',
  })
  if (!response.ok) return null
  return prepareVitrineHtml(await response.text(), origin)
}

/** Réservé aux tests. */
export function resetVitrineCache(): void {
  cache = undefined
}
