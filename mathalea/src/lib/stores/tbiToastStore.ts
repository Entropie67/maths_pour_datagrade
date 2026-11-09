import { writable } from 'svelte/store'

/** Message bref de la vue TBI, avec une action éventuelle (« Annuler ») */
export interface TbiToast {
  id: number
  message: string
  actionLabel?: string
  onAction?: () => void
}

/** Durée d'affichage (ms) : le temps de se raviser, debout devant le tableau */
export const TBI_TOAST_DURATION = 8000

export const tbiToast = writable<TbiToast | null>(null)

let nextId = 1
let timer: ReturnType<typeof setTimeout> | undefined

export function dismissTbiToast() {
  if (timer !== undefined) clearTimeout(timer)
  tbiToast.set(null)
}

export function showTbiToast(
  message: string,
  action?: { label: string; run: () => void },
) {
  if (timer !== undefined) clearTimeout(timer)
  tbiToast.set({
    id: nextId++,
    message,
    actionLabel: action?.label,
    onAction: action?.run,
  })
  timer = setTimeout(() => tbiToast.set(null), TBI_TOAST_DURATION)
}
