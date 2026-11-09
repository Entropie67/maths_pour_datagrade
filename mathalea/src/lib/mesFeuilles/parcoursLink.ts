import { createURL } from '../createURL'

/**
 * Lien de la vue Parcours, qui s'ouvre sur un parcours (paramètre `parcours`,
 * lu à l'ouverture de la vue).
 * @param id identifiant du parcours (par défaut, le premier de la bibliothèque)
 */
export function parcoursUrl(id?: string): URL {
  const url = createURL([])
  url.searchParams.set('v', 'parcours')
  if (id !== undefined) url.searchParams.set('parcours', id)
  return url
}
