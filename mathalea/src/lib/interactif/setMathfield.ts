import { MathfieldElement } from 'mathlive'
import { get } from 'svelte/store'
import { keyboardState } from '../../components/keyboard/stores/keyboardStore'
import { ajouteTouche } from '../../components/keyboard/lib/keycaps'
import { litTouchesPersonnalisees } from '../../components/keyboard/lib/touchesPersonnalisees'
import type { BlockForKeyboard } from '../../components/keyboard/types/keyboardContent'
import { injectFontInMetaInteractif2d } from '../../modules/loaders'
import { globalOptions } from '../stores/globalOptions'
import { getKeyboardShortcusts } from './claviers/keyboard'
import { champAvecClavierFocalise } from './champTexteClavier'

export const setMathfieldListener = (e: Event) =>
  setMathfield(e.currentTarget as MathfieldElement)

export function setMathfield(mf: MathfieldElement) {
  if ('mathVirtualKeyboardPolicy' in mf) mf.mathVirtualKeyboardPolicy = 'manual'
  if ('menuItems' in mf) mf.menuItems = []
  if ('virtualKeyboardMode' in mf) mf.virtualKeyboardMode = 'manual'
  mf.classList.add('ml-1')
  mf.addEventListener('focus', (event) => {
    handleFocusMathField(event)
  })
  mf.addEventListener('focusout', (event) => {
    handleFocusOutMathField(event)
  })
  // Le focus peut être déjà dans le champ alors que le clavier est masqué
  // (fermeture par la touche du clavier, ou perte de focus provoquée par la
  // fermeture du clavier natif d'un autre champ, sous Android) : aucun
  // évènement `focus` ne se produit au toucher suivant, on rouvre donc le
  // clavier au clic.
  mf.addEventListener('click', () => {
    const { isVisible, idMathField } = get(keyboardState)
    if (isVisible && idMathField === mf.id) return
    afficheClavierPourChamp(mf)
  })
  mf.addEventListener('input', () => {
    const content = mf.getValue()
    // Remplace les espaces consécutifs par un seul espace
    const filteredContent = content.replaceAll('\\,\\,', '\\,')
    mf.setValue(filteredContent)
  })
  mf.dataset.listenerAdded = 'true'
  if (mf.getAttribute('data-space') === 'true') {
    mf.mathModeSpace = '\\,'
  }
  injectFontInMetaInteractif2d(mf)
  mf.removeEventListener('mount', setMathfieldListener)
}

function handleFocusMathField(event: FocusEvent) {
  afficheClavierPourChamp(event.target as MathfieldElement)
}

function afficheClavierPourChamp(mf: MathfieldElement) {
  const isCorrected = mf.classList.contains('corrected')
  getKeyboardShortcusts(mf)
  // Touche `INCONNUE` (bloc `numbersInconnue`) : la lettre dépend du champ.
  const inconnue = mf.dataset.inconnue || 'x'
  ajouteTouche('INCONNUE', { display: `$${inconnue}$`, insert: inconnue })
  keyboardState.update((value) => {
    return {
      isVisible: true && !isCorrected,
      isInLine: value.isInLine,
      idMathField: mf.id ?? '',
      alphanumericLayout: value.alphanumericLayout,
      blocks:
        'keyboard' in mf.dataset
          ? // Un data-keyboard="" (clavier n'utilisant que des touches
            // personnalisées, voir `clavierEntierementPersonnalisable`) doit
            // donner un clavier vide : `''.split(' ')` vaudrait `['']` sinon.
            ((mf.dataset.keyboard || '')
              .split(' ')
              .filter((bloc) => bloc !== '') as BlockForKeyboard[])
          : (['numbers', 'fullOperations', 'variables'] as BlockForKeyboard[]),
      customKeys: litTouchesPersonnalisees(mf.dataset.keys),
    }
  })
}

function handleFocusOutMathField(event: FocusEvent) {
  // Si le focus est sur un autre élément que mathfield, on cache le clavier
  // On utilise setTimeout pour être sûr que le focus soit bien sur le nouvel élément
  // car au focusout, le focus est sur body
  if (get(globalOptions).v === 'can') return
  setTimeout(() => {
    const focusDansClavier = document.activeElement?.closest(
      '#mathalea-virtual-keyboard',
    )
    if (
      !champAvecClavierFocalise(document.activeElement) &&
      focusDansClavier == null
    ) {
      keyboardState.update((value) => {
        const newValue = value
        newValue.isVisible = false
        return newValue
      })
    }
  }, 200)
}
