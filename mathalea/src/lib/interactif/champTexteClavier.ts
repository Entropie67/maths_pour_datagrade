import { get } from 'svelte/store'
import { keyboardState } from '../../components/keyboard/stores/keyboardStore'
import type { KeyCap } from '../../components/keyboard/types/keycap'
import { globalOptions } from '../stores/globalOptions'
import { isMathfieldFocused } from './mathfieldFocus'

/**
 * Relie un champ `<input>` ordinaire (pas un champ MathLive) au clavier
 * virtuel de MathALÉA : le clavier s'affiche quand le champ prend le focus,
 * avec seulement les touches demandées, et ses touches écrivent dans le champ.
 *
 * Les touches sont décrites comme celles d'une question
 * (voir `touchesPersonnalisees.ts`) : chaque chaîne est le texte inséré.
 */

/** Indique si l'élément est un champ texte relié au clavier virtuel. */
export function estChampTexteAvecClavier(
  element: Element | null,
): element is HTMLInputElement {
  return (
    element instanceof HTMLInputElement &&
    element.dataset.clavierVirtuel === 'true'
  )
}

/** Indique si le focus est sur un champ qui utilise le clavier virtuel. */
export function champAvecClavierFocalise(element: Element | null): boolean {
  return isMathfieldFocused(element) || estChampTexteAvecClavier(element)
}

/**
 * Relie le champ au clavier virtuel.
 * Le champ doit avoir un `id` unique dans la page : c'est par lui que le
 * clavier retrouve le champ actif.
 * @param touches blocs de touches à afficher
 */
export function brancheClavierSurChampTexte(
  input: HTMLInputElement,
  touches: string[][],
) {
  input.dataset.clavierVirtuel = 'true'
  // Pas de clavier natif sur tablette : le clavier virtuel le remplace.
  input.inputMode = 'none'
  input.autocomplete = 'off'
  input.addEventListener('focus', () => {
    keyboardState.update((value) => ({
      ...value,
      isVisible: !input.readOnly && !input.disabled,
      idMathField: input.id,
      blocks: [],
      customKeys: touches,
    }))
  })
  input.addEventListener('focusout', () => {
    if (get(globalOptions).v === 'can') return
    // Au focusout, le focus est encore sur body : on attend le nouvel élément.
    setTimeout(() => {
      const focusDansClavier = document.activeElement?.closest(
        '#mathalea-virtual-keyboard',
      )
      if (
        !champAvecClavierFocalise(document.activeElement) &&
        focusDansClavier == null
      ) {
        keyboardState.update((value) => ({ ...value, isVisible: false }))
      }
    }, 200)
  })
}

/** Nom de la commande MathLive portée par une touche, s'il y en a une. */
function commandeDeLaTouche(key: KeyCap): string | undefined {
  if (key.command === undefined) return undefined
  if (typeof key.command === 'string') return key.command
  // ['performWithFeedback', 'deleteBackward'] → 'deleteBackward'
  return key.command[key.command.length - 1]
}

/**
 * Applique l'appui sur une touche du clavier virtuel à un champ texte.
 * Renvoie false si la touche n'a pas d'équivalent dans un champ texte.
 */
export function appliqueToucheAuChampTexte(
  input: HTMLInputElement,
  key: KeyCap,
): boolean {
  const debut = input.selectionStart ?? input.value.length
  const fin = input.selectionEnd ?? input.value.length
  const commande = commandeDeLaTouche(key)
  if (commande === 'moveToPreviousChar' || commande === 'moveToNextChar') {
    const position =
      debut !== fin
        ? commande === 'moveToPreviousChar'
          ? debut
          : fin
        : Math.min(
            input.value.length,
            Math.max(0, debut + (commande === 'moveToPreviousChar' ? -1 : 1)),
          )
    input.setSelectionRange(position, position)
    return true
  }
  if (commande === 'deleteBackward') {
    if (debut === fin && debut === 0) return true
    input.setRangeText('', debut === fin ? debut - 1 : debut, fin, 'end')
  } else if (commande !== undefined && commande !== '') {
    return false
  } else {
    const texte = key.insert ?? key.display
    const longueur = input.value.length - (fin - debut) + texte.length
    if (input.maxLength >= 0 && longueur > input.maxLength) return true
    input.setRangeText(texte, debut, fin, 'end')
  }
  input.dispatchEvent(new Event('input', { bubbles: true }))
  return true
}
