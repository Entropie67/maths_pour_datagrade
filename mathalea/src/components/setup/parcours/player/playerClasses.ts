// Classes de l'aperçu élève, reprises de l'application MathALÉA, qui les
// prend elle-même au site (ExerciceMathaleaVueEleve.svelte, ButtonTextAction.svelte).

/** Bouton principal : bouton de vérification de la vue élève */
export const actionButton = `inline-flex items-center justify-center gap-2 px-3 py-2.5 text-center
  bg-coopmaths-action dark:bg-coopmathsdark-action
  text-coopmaths-canvas dark:text-coopmathsdark-canvas
  hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
  font-semibold text-sm leading-tight rounded-xl shadow-sm disabled:opacity-40
  transition duration-150 ease-in-out`

/** Bouton secondaire : variante « inverted » de ButtonTextAction.svelte */
export const invertedButton = `inline-flex items-center justify-center gap-2 px-3 py-2.5 text-center rounded-xl
  border border-coopmaths-action dark:border-coopmathsdark-action
  text-coopmaths-action dark:text-coopmathsdark-action
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  hover:bg-coopmaths-canvas-dark dark:hover:bg-coopmathsdark-canvas-dark
  font-semibold text-sm leading-tight disabled:opacity-40
  transition duration-150 ease-in-out`

/** Action secondaire sans cadre */
export const linkButton = `inline-flex items-center justify-center gap-2 px-3 py-2.5 text-center rounded-xl
  text-coopmaths-action dark:text-coopmathsdark-action
  hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest
  font-semibold text-sm leading-tight`

/** Pastille d'un score réussi (MobileEndingItem.svelte) */
export const badge = `shrink-0 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full
  bg-coopmaths-warn
  text-coopmaths-canvas dark:text-coopmathsdark-canvas text-xs font-bold`

const neutralBadge = `shrink-0 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full
  bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest
  text-coopmaths-corpus dark:text-coopmathsdark-corpus text-xs font-bold`

/** Couleur de réussite à partir de 80 %, neutre en dessous */
export const scoreBadge = (percentage: number) =>
  percentage >= 80 ? badge : neutralBadge

/** Liste groupée (MobileBrowser.svelte) */
export const groupedList = `flex flex-col rounded-xl overflow-hidden
  border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
  divide-y divide-coopmaths-canvas-darkest dark:divide-coopmathsdark-canvas-darkest`

export const quiet =
  'text-sm text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest'

export const rounded = (x: number) =>
  Number.isInteger(x) ? String(x) : x.toFixed(1)
