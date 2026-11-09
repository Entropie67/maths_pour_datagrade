export function isLocalStorageAvailable() {
  try {
    window.localStorage.setItem('__test__', '__test__')
    window.localStorage.removeItem('__test__')
    return true
  } catch (e) {
    return false
  }
}

const FORMAT_NUMERIQUE_KEY = 'mathalea-format-numerique'

/**
 * Choix Papier / Numérique de la conception de document, mémorisé pour les
 * prochaines visites (le lien partagé, lui, porte `numerique=1`).
 */
export function saveFormatNumerique(isNumerique: boolean) {
  if (!isLocalStorageAvailable()) return
  window.localStorage.setItem(FORMAT_NUMERIQUE_KEY, isNumerique ? '1' : '0')
}

export function isFormatNumeriqueSaved(): boolean {
  if (!isLocalStorageAvailable()) return false
  return window.localStorage.getItem(FORMAT_NUMERIQUE_KEY) === '1'
}
