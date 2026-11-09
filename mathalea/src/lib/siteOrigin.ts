/**
 * Origine du site de l'association qui sert, pour la page courante, ce qui
 * n'est pas dans le bundle : les scans d'annales (`/alea/static/`) et la
 * vitrine (`/www/`).
 *
 * C'est le site courant sur nos noms (coopmaths, mathalea, leur staging,
 * l'adresse technique du conteneur) et en développement, où Vite proxifie
 * ces chemins (voir vite.config.ts). Partout ailleurs, c'est coopmaths.fr :
 * une copie de MathALÉA hébergée par un autre site (Capytale, un ENT, un
 * miroir) ou un aperçu local (`pnpm preview`) n'a pas ces chemins.
 * DataGrade héberge ses annales sous /alea/static ; la vitrine associative
 * reste sur son origine habituelle.
 */
export const DEFAULT_ORIGIN = 'https://coopmaths.fr'

const OUR_HOSTS =
  /(^|\.)(coopmaths|mathalea)\.(fr|education-nationale\.eu)$|\.scw\.cloud$/

export function siteOrigin(
  location:
    { hostname: string; origin: string } | undefined = globalThis.location,
  resource: 'site' | 'static' = 'site',
): string {
  if (location === undefined) return DEFAULT_ORIGIN
  if (resource === 'static' && location.hostname === 'maths.datagrade.fr') {
    return location.origin
  }
  if (import.meta.env.DEV || OUR_HOSTS.test(location.hostname)) {
    return location.origin
  }
  return DEFAULT_ORIGIN
}
