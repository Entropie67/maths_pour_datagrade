import type { MathfieldElement } from 'mathlive'

/** Empêche qu'un raccourci physique MathLive interprète ^ comme une fraction. */
export function handleMathfieldPowerKeydown(
  event: KeyboardEvent,
  mf: MathfieldElement,
): void {
  if (
    !mf.isSelectionEditable ||
    mf.mode !== 'math' ||
    event.isComposing ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return
  }

  // Sur les claviers français, la touche ^ peut être une touche morte. On
  // n'appelle surtout pas preventDefault() : le système d'exploitation doit
  // composer la touche suivante (^ puis e donne ê). Si aucune composition n'est
  // possible (^ puis 2), il envoie « ^2 » au champ et MathLive traite alors
  // lui-même le ^ comme une puissance, puis insère le 2 dans l'exposant.
  // Insérer l'exposant dès la touche morte ajoutait un ^ en trop : x^{^2}.
  const isFrenchDeadCaret =
    event.key === 'Dead' && event.code === 'BracketLeft' && !event.shiftKey
  if (isFrenchDeadCaret) {
    // Empêche seulement MathLive d'y voir un raccourci physique (fraction).
    event.stopPropagation()
    return
  }
  if (event.key !== '^') return

  event.preventDefault()
  event.stopPropagation()
  mf.executeCommand('moveToSuperscript')
}
