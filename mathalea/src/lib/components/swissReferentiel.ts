/** Reconnaître un niveau, une catégorie ou une référence du CO genevois. */
export function isSwissCycleCode(code: string): boolean {
  return /^(9R[123]|1[01](CT|LC|LS))(?=$|NO|FA|ES|GM|QCM)/.test(code)
}

/**
 * Conserver l'ordre pédagogique des catégories du CO et trier naturellement
 * les références d'une feuille, sans modifier l'objet du référentiel.
 */
export function sortSwissCycleEntries<T>(
  entries: [string, T][],
): [string, T][] {
  if (
    entries.length > 0 &&
    entries.every(([code]) => isSwissCycleCode(code) && /-\d+$/.test(code))
  ) {
    return [...entries].sort(([a], [b]) =>
      a.localeCompare(b, 'fr', { numeric: true }),
    )
  }
  return entries
}
