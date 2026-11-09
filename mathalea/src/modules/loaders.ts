import { MathfieldElement } from 'mathlive'
import { get } from 'svelte/store'
import { litTouchesPersonnalisees } from '../components/keyboard/lib/touchesPersonnalisees'
import { keyboardState } from '../components/keyboard/stores/keyboardStore'
import type { BlockForKeyboard } from '../components/keyboard/types/keyboardContent'
import { getKeyboardShortcusts } from '../lib/interactif/claviers/keyboard'
import { handleMathfieldPowerKeydown } from '../lib/interactif/mathfieldPowerKey'
import { isMathfieldFocused } from '../lib/interactif/mathfieldFocus'
import { nommeChampsDe } from '../lib/interactif/nomAccessibleChamp'
import { globalOptions } from '../lib/stores/globalOptions'
import { context } from './context'
import { UserFriendlyError } from './messages'
const apps: Record<string, string[]> = {
  scratchblocks: ['assets/externalJs/scratchblocks-v3.5-min.js'],
}

const loadedApps = new Set<string>()
const pendingApps = new Map<string, Promise<void>>()

function loadUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (url.endsWith('.css')) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = url
      link.onload = () => resolve()
      link.onerror = () => reject(new Error(`Échec du chargement : ${url}`))
      document.head.appendChild(link)
    } else {
      const script = document.createElement('script')
      script.src = url
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Échec du chargement : ${url}`))
      document.head.appendChild(script)
    }
  })
}

// Champs ayant déjà reçu les écouteurs anonymes de `loadMathLive()` : certains
// composants (vue CAN, une question par page) l'appellent à chaque montage sur
// tout le document, et un écouteur anonyme n'est pas dédoublonné par le
// navigateur (un ^ saisi serait alors interprété autant de fois que d'appels).
const mathfieldsWithListeners = new WeakSet<MathfieldElement>()

let hasGlobalTabTracker = false
let lastTabDirection: 'backward' | 'forward' | null = null
let lastTabTimestamp = 0

function handleGlobalTabKeydown(event: KeyboardEvent) {
  if (event.key !== 'Tab') return
  lastTabDirection = event.shiftKey ? 'backward' : 'forward'
  lastTabTimestamp = Date.now()
}

function consumeRecentTabDirection() {
  if (lastTabDirection == null) return null
  if (Date.now() - lastTabTimestamp > 250) {
    lastTabDirection = null
    return null
  }
  const direction = lastTabDirection
  lastTabDirection = null
  return direction
}

function ensureGlobalTabTracker() {
  if (hasGlobalTabTracker) return
  document.addEventListener('keydown', handleGlobalTabKeydown, true)
  hasGlobalTabTracker = true
}

function selectFillInTheBlanksPrompt(
  mf: MathfieldElement,
  direction: 'backward' | 'forward',
) {
  if (mf.classList.contains('corrected')) return false
  const prompts = mf.getPrompts?.({ locked: false })
  if (!Array.isArray(prompts) || prompts.length === 0) return false

  const promptId =
    direction === 'backward' ? prompts[prompts.length - 1] : prompts[0]
  if (promptId == null) return false

  const range = mf.getPromptRange?.(promptId)
  if (range == null) return false

  mf.selection = { ranges: [range], direction }
  return true
}

function isSafariLikeBrowser() {
  if (typeof navigator === 'undefined') return false
  return (
    /\bAppleWebKit\//.test(navigator.userAgent) &&
    /\bSafari\//.test(navigator.userAgent) &&
    !/\bChrome\//.test(navigator.userAgent) &&
    !/\bChromium\//.test(navigator.userAgent)
  )
}

function insertInFillInTheBlanksPrompt(mf: MathfieldElement, text: string) {
  if (!mf.isSelectionEditable) {
    selectFillInTheBlanksPrompt(mf, 'forward')
  }
  mf.insert(text)
}

function handleFillInTheBlanksBeforeInput(event: InputEvent) {
  const mf = event.currentTarget
  if (!(mf instanceof MathfieldElement)) return
  if (mf.classList.contains('corrected')) {
    event.preventDefault()
    return
  }

  if (!isSafariLikeBrowser()) {
    if (mf.isSelectionEditable) return
    event.preventDefault()
    selectFillInTheBlanksPrompt(mf, 'forward')
    return
  }

  if (event.inputType === 'insertText' && typeof event.data === 'string') {
    event.preventDefault()
    insertInFillInTheBlanksPrompt(mf, event.data)
    return
  }

  if (mf.isSelectionEditable) return
  event.preventDefault()
  selectFillInTheBlanksPrompt(mf, 'forward')
}

function handleFillInTheBlanksKeydown(event: KeyboardEvent) {
  if (
    event.key.length !== 1 ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return
  }
  const mf = event.currentTarget
  if (!(mf instanceof MathfieldElement)) return
  if (mf.classList.contains('corrected')) {
    event.preventDefault()
    return
  }

  if (isSafariLikeBrowser()) {
    if (mf.isSelectionEditable) return
    event.preventDefault()
    insertInFillInTheBlanksPrompt(mf, event.key)
    return
  }

  if (mf.isSelectionEditable) return
  event.preventDefault()
  selectFillInTheBlanksPrompt(mf, 'forward')
}

function handleCorrectedFillInTheBlanksPointer(event: Event) {
  const mf = event.currentTarget
  if (!(mf instanceof MathfieldElement)) return
  if (!mf.classList.contains('corrected')) return
  event.preventDefault()
  mf.blur?.()
}

async function load(name: string): Promise<void> {
  if (!apps[name]) throw new UserFriendlyError(`application ${name} inconnue`)
  if (loadedApps.has(name)) return
  if (pendingApps.has(name)) return pendingApps.get(name)
  const urls = Array.isArray(apps[name]) ? apps[name] : [apps[name]]
  const promise = Promise.all(urls.map(loadUrl))
    .then(() => {
      loadedApps.add(name)
      pendingApps.delete(name)
    })
    .catch((error) => {
      pendingApps.delete(name)
      console.error(error)
      throw new UserFriendlyError(`Le chargement de ${name} a échoué`)
    })
  pendingApps.set(name, promise)
  return promise
}

export function loadScratchblocks() {
  return load('scratchblocks')
}

export function injectStyleForCells(mf: MathfieldElement) {
  if (!mf.classList.contains('tableauMathlive')) return
  const shadow = mf.shadowRoot
  if (!shadow) return
  const container = shadow.querySelector('.ML__container')
  if (container) {
    const span = container.parentElement
    if (span) {
      span.style.display = 'flex'
      span.style.flexDirection = 'row'
    }
  }
  if (shadow && !shadow.getElementById('ml-cell-style')) {
    const style = document.createElement('style')
    style.id = 'ml-cell-style'
    style.textContent = `
      .ML__container {
        display: inline-block;
        width: 100%;
        justify-content: center !important;
      }
      .ML__content {
        justify-content: center !important;
        padding: 0;
      }
    `
    shadow.appendChild(style)
  }
}

export function injectFontInMetaInteractif2d(mf: MathfieldElement) {
  if (!mf.classList.contains('metaInteractif2d')) return
  const shadow = mf.shadowRoot
  if (shadow && !shadow.getElementById('prompt-for-2d')) {
    // Crée une balise style
    const style = document.createElement('style')
    style.id = 'prompt-for-2d'
    style.textContent = `
        .ML__text {
          font-family: 'KaTeX_Main', serif !important;
        }
          .ML__content {
          "justify-content": center !important;
          padding: 0;
          }
          .ML__latex {
          line-height: 0.9em !important;
          }
        .ML__prompt-atom {
    line-height: 0.9 !important;
     vertical-align: 0.1em !important;
    }
      .ML__prompt:not(.ML__lockedPromptBox) {
    min-height: 0.9em !important;
   
    }
      `
    shadow.appendChild(style)
  }
}

function injectPromptStyles(mf: MathfieldElement) {
  if (!mf.classList.contains('fillInTheBlanks')) {
    if (mf.classList.contains('tableauMathlive')) {
      injectStyleForCells(mf)
    }
    return
  }
  const shadow = mf.shadowRoot
  if (shadow && !shadow.getElementById('ml-prompt-styles')) {
    const style = document.createElement('style')
    style.id = 'ml-prompt-styles'
    const hostCaretStyle = isSafariLikeBrowser()
      ? `
    :host {
      caret-color: transparent;
    }
    `
      : ''
    style.textContent = `
    ${hostCaretStyle}
    .ML__prompt:not(.ML__lockedPromptBox):not(.ML__focusedPromptBox) {
    min-height: 1em !important;
     outline: solid !important;
  outline-width: thin !important;
  outline-color: var(--color-coopmathsdark-corpus-light) !important;
    }
    :host(:focus-within) .ML__prompt:not(.ML__lockedPromptBox).ML__focusedPromptBox {
      outline: solid !important;
  outline-width: 2px !important;
  outline-color: var(--color-coopmaths-struct) !important;
    min-height: 1em !important;
    }
    :host(:not(:focus-within)) .ML__prompt:not(.ML__lockedPromptBox).ML__focusedPromptBox {
      outline: solid !important;
      outline-width: thin !important;
      outline-color: var(--color-coopmathsdark-corpus-light) !important;
    }
    /* Le rouge par défaut de MathLive (#a01b00) est peu visible à côté du vert : on le renforce. */
    .ML__incorrectPromptBox {
      outline: 2px solid #dc2626 !important;
      box-shadow: 0 0 6px 1px #dc2626 !important;
    }
    
    `
    shadow.appendChild(style)
  }
}

/**
 * Charge MathLive et personnalise les réglages
 * MathLive est chargé dès qu'un tag math-field est créé
 */
export async function loadMathLive(divExercice?: HTMLElement) {
  await import('mathlive')
  ensureGlobalTabTracker()
  let champs
  if (divExercice) {
    champs = divExercice.getElementsByTagName('math-field')
  } else {
    champs = document.getElementsByTagName('math-field')
  }
  if (champs != null) {
    for (const mf of champs) {
      if (mf instanceof MathfieldElement) {
        if (
          mf.classList.contains('fillInTheBlanks') ||
          mf.classList.contains('metaInteractif2d')
        ) {
          mf.classList.remove('invisible')
        }
        //   mf.classList.add('ml-1')
        // Un math-field enveloppé dans <mathalea-mathfield> a déjà ses propres
        // écouteurs focus/focusout (voir `lib/interactif/setMathfield.ts`, qui
        // marque `data-listener-added`). Les ajouter une deuxième fois ici fait
        // tourner deux mises à jour concurrentes de `keyboardState` sur les
        // mêmes variables partagées de `Keyboard.svelte`, ce qui peut faire
        // disparaître les touches personnalisées de la question au clavier
        // (une des deux mises à jour écrase l'autre en cours de rendu).
        if (mf.dataset.listenerAdded !== 'true') {
          mf.addEventListener('focus', handleFocusMathField)
          mf.addEventListener('focusout', handleFocusOutMathField)
        }
        if (!mathfieldsWithListeners.has(mf)) {
          mathfieldsWithListeners.add(mf)
          mf.addEventListener(
            'keydown',
            (event) => handleMathfieldPowerKeydown(event, mf),
            true,
          )
          mf.addEventListener('input', () => {
            const content = mf.getValue()
            // Remplace les espaces consécutifs par un seul espace
            const filteredContent = content.replaceAll('\\,\\,', '\\,')
            if (filteredContent !== content) {
              mf.setValue(filteredContent)
            }
          })
        }
        if (mf.classList.contains('fillInTheBlanks')) {
          mf.addEventListener(
            'pointerdown',
            handleCorrectedFillInTheBlanksPointer,
            true,
          )
          mf.addEventListener(
            'mousedown',
            handleCorrectedFillInTheBlanksPointer,
            true,
          )
          mf.addEventListener(
            'beforeinput',
            handleFillInTheBlanksBeforeInput,
            true,
          )
          mf.addEventListener('keydown', handleFillInTheBlanksKeydown, true)
        }
        if (mf.getAttribute('data-space') === 'true') {
          mf.mathModeSpace = '\\,'
        }

        if (mf.isConnected) {
          // mf is already in the DOM. You can check if it's ready by accessing a property.
          setMathfield(mf)
        } else {
          // Add a listener for the `mount` event in case it's not mounted yet.
          mf.addEventListener('mount', () => setMathfield(mf), { once: true })
        }
      }
    }
    nommeChampsDe(divExercice ?? document)
    // On envoie la hauteur de l'iFrame après le chargement des champs MathLive
    if (context.vue === 'exMoodle') {
      const hauteurExercice =
        window.document.querySelector('section')?.scrollHeight ?? 0
      window.parent.postMessage(
        {
          hauteurExercice,
          iMoodle: Number(
            new URLSearchParams(window.location.search).get('iMoodle'),
          ),
        },
        '*',
      )
      const domExerciceInteractifReady = new window.Event(
        'domExerciceInteractifReady',
        { bubbles: true },
      )
      document.dispatchEvent(domExerciceInteractifReady)
    }
  }
}

function handleFocusMathField(event: Event) {
  const mf = event.target
  if (!(mf instanceof MathfieldElement)) return
  if (
    mf.classList.contains('fillInTheBlanks') &&
    mf.classList.contains('corrected')
  ) {
    mf.blur?.()
    return
  }
  const isFillInTheBlanks =
    mf.classList.contains('fillInTheBlanks') ||
    mf.classList.contains('metaInteractif2d')

  if (mf.classList.contains('fillInTheBlanks')) {
    const tabDirection = consumeRecentTabDirection()
    setTimeout(() => {
      if (!mf.matches(':focus-within')) return
      if (tabDirection === 'backward') {
        // En entrée par TAB dans un nouveau mathfield, on force un prompt
        // cohérent sans utiliser moveTo...Placeholder qui est relatif et peut
        // ressortir du champ si MathLive a déjà placé la sélection.
        selectFillInTheBlanksPrompt(mf, 'backward')
      } else if (tabDirection === 'forward') {
        selectFillInTheBlanksPrompt(mf, 'forward')
      } else if (!mf.isSelectionEditable) {
        selectFillInTheBlanksPrompt(mf, 'forward')
      }
    }, 0)
  }

  const isNotFillInTheBlanksAndReadOnly = !isFillInTheBlanks && mf.readOnly
  const isCorrected =
    isNotFillInTheBlanksAndReadOnly || mf.classList.contains('corrected')
  getKeyboardShortcusts(mf)
  keyboardState.update((value) => {
    return {
      isVisible: !isCorrected, // Les fillInTheBlanks sont toujours readOnly
      isInLine: value.isInLine,
      idMathField: mf.id,
      alphanumericLayout: value.alphanumericLayout,
      blocks: getKeyboardBlocks(mf.dataset.keyboard),
      customKeys: litTouchesPersonnalisees(mf.dataset.keys),
    }
  })
}

function handleFocusOutMathField(_event: Event) {
  // Si le focus est sur un autre élément que mathfield, on cache le clavier
  // On utilise setTimeout pour être sûr que le focus soit bien sur le nouvel élément
  // car au focusout, le focus est sur body
  if (get(globalOptions).v === 'can') return
  setTimeout(() => {
    if (!isMathfieldFocused(document.activeElement)) {
      keyboardState.update((value) => {
        const newValue = value
        newValue.isVisible = false
        return newValue
      })
    }
  }, 200)
}

function setMathfield(mf: MathfieldElement) {
  if ('mathVirtualKeyboardPolicy' in mf) mf.mathVirtualKeyboardPolicy = 'manual'
  if ('menuItems' in mf) mf.menuItems = []
  if ('virtualKeyboardMode' in mf) mf.virtualKeyboardMode = 'manual'
  injectFontInMetaInteractif2d(mf)
  injectPromptStyles(mf)
}

const defaultKeyboardBlocks: BlockForKeyboard[] = [
  'numbers',
  'fullOperations',
  'variables',
]

export function getKeyboardBlocks(
  value: string | undefined,
): BlockForKeyboard[] {
  // `data-keyboard` absent (undefined) : clavier par défaut. `data-keyboard=""`
  // (clavier n'utilisant que des touches personnalisées, voir
  // `clavierEntierementPersonnalisable`) : clavier volontairement vide, à ne
  // pas confondre avec le cas précédent malgré leur fausseté commune.
  if (value === undefined) return defaultKeyboardBlocks
  return value.split(' ').filter((bloc) => bloc !== '') as BlockForKeyboard[]
}
