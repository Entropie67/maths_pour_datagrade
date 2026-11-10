/**
 * File d'attente limitant le nombre de chargements simultanés (générer un
 * exercice pour son aperçu est coûteux : module chargé à la demande, rendu
 * KaTeX). Utilisée par `TypstExercisePreview.svelte`, dont plusieurs
 * instances peuvent entrer dans la marge de préchargement de leur
 * `IntersectionObserver` en même temps (liste de résultats de recherche).
 */
const MAX_CONCURRENT_LOADS = 5

let runningCount = 0
const waiters: Array<() => void> = []

/**
 * Demande un « ticket » de chargement : la promesse se résout dès qu'une
 * place est libre (au plus `MAX_CONCURRENT_LOADS` en cours), avec une
 * fonction à appeler pour libérer la place une fois le chargement terminé.
 * `cancel` retire la demande de la file si elle n'a pas encore été
 * satisfaite (composant détruit avant son tour).
 */
export function acquireLoadSlot(): {
  slot: Promise<() => void>
  cancel: () => void
} {
  let granted = false
  let grant: () => void

  function release() {
    runningCount -= 1
    const next = waiters.shift()
    if (next) next()
  }

  const slotPromise = new Promise<() => void>((resolve) => {
    grant = () => {
      granted = true
      runningCount += 1
      resolve(release)
    }
    if (runningCount < MAX_CONCURRENT_LOADS) {
      grant()
    } else {
      waiters.push(grant)
    }
  })

  function cancel() {
    if (granted) return
    const index = waiters.indexOf(grant)
    if (index !== -1) waiters.splice(index, 1)
  }

  return { slot: slotPromise, cancel }
}
