import { getLang } from '../stores/languagesStore'

/**
 * Symbole du parallélisme entre deux droites, à placer en mode math :
 * « // » en France, « \parallel » en Suisse.
 * @example `$(AB)${symboleParallele()}(CD)$`
 */
export function symboleParallele(): string {
  return getLang() === 'fr-CH' ? '\\parallel ' : '//'
}
