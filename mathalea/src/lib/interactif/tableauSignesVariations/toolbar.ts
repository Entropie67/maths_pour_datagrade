import type { MathfieldElement } from 'mathlive'
import { buildDataKeyboardFromStyle } from '../claviers/keyboard'
import { nommeChampsAutourDe } from '../nomAccessibleChamp'
import { setMathfield } from '../setMathfield'
import type { ActiveCellInfo, SensFleche, SigneSymbol } from './types'

export type ToolbarSubmit = (info: ActiveCellInfo, value: string) => void

export interface ToolbarController {
  show(info: ActiveCellInfo, anchor: HTMLElement, currentValue: string): void
  hide(): void
  destroy(): void
}

interface ButtonSpec {
  value: string
  display: string
  ariaLabel: string
}

const ERASER_ICON = `<svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24"  
fill="currentColor" viewBox="0 0 24 24" >
<!--Boxicons v3.0.8 https://boxicons.com | License  https://docs.boxicons.com/free-->
<path d="M17 6V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H2v2h2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8h2V6zM9 4h6v2H9zm9 16H6V8h12z"></path><path d="M14.29 10.29 12 12.59l-2.29-2.3-1.42 1.42 2.3 2.29-2.3 2.29 1.42 1.42 2.29-2.3 2.29 2.3 1.42-1.42-2.3-2.29 2.3-2.29z"></path>
</svg>`

const BOUTONS_SIGNE: ButtonSpec[] = [
  { value: '+', display: '+', ariaLabel: 'plus' },
  { value: '-', display: '−', ariaLabel: 'moins' },
  { value: '0', display: '0', ariaLabel: 'zéro' },
  { value: '', display: ERASER_ICON, ariaLabel: 'effacer' },
]

const BOUTONS_BARRE: ButtonSpec[] = [
  { value: '', display: '∅', ariaLabel: 'aucune barre' },
  { value: '|', display: '|', ariaLabel: 'barre simple' },
  { value: '||', display: '‖', ariaLabel: 'barre double' },
]

const BOUTONS_FLECHE: ButtonSpec[] = [
  { value: 'haut', display: '↗', ariaLabel: 'flèche haute' },
  { value: 'bas', display: '↘', ariaLabel: 'flèche basse' },
  { value: '', display: ERASER_ICON, ariaLabel: 'effacer' },
]

/**
 * Crée une toolbar contextuelle attachée au shadowRoot.
 * - Mode 'signe' / 'variation' : palette de boutons.
 * - Mode 'valeur' : un <math-field> mathlive + bouton « Valider ».
 */
export function createToolbarController(
  shadowRoot: ShadowRoot,
  onSubmit: ToolbarSubmit,
): ToolbarController {
  const toolbar = document.createElement('div')
  toolbar.classList.add('tab-sv__toolbar')
  toolbar.style.display = 'none'
  toolbar.setAttribute('role', 'toolbar')

  let currentInfo: ActiveCellInfo | null = null
  let currentAnchor: HTMLElement | null = null

  const docClickHandler = (event: MouseEvent) => {
    if (toolbar.style.display === 'none') return
    const path = event.composedPath()
    if (path.includes(toolbar)) return
    if (currentAnchor && path.includes(currentAnchor)) return
    // Ignore les clics sur le clavier virtuel du site (rendu hors du shadow DOM
    // du tableau), sous peine de fermer la toolbar avant la saisie.
    const keyboard = document.getElementById('mathalea-virtual-keyboard')
    if (keyboard && path.includes(keyboard)) return
    hide()
  }
  const escHandler = (event: KeyboardEvent) => {
    if (event.key === 'Escape') hide()
  }

  document.addEventListener('mousedown', docClickHandler, true)
  document.addEventListener('keydown', escHandler)

  function reposition() {
    if (!currentAnchor) return
    const rect = currentAnchor.getBoundingClientRect()
    const host = (shadowRoot.host as HTMLElement).getBoundingClientRect()
    const margin = 8
    // La toolbar est déjà affichée (display: flex) et son contenu construit :
    // sa taille réelle est mesurable, ce qui permet de la garder dans le viewport.
    const toolbarWidth = toolbar.offsetWidth
    const toolbarHeight = toolbar.offsetHeight
    const viewportWidth = document.documentElement.clientWidth

    // Centrée sur la cellule par défaut, en coordonnées de viewport…
    let left = rect.left + rect.width / 2 - toolbarWidth / 2
    // … puis ramenée dans le viewport si la cellule est proche d'un bord
    // (première/dernière colonne d'un tableau collé au bord de l'écran).
    left = Math.min(
      Math.max(left, margin),
      Math.max(margin, viewportWidth - toolbarWidth - margin),
    )

    // Position relative au host, au-dessus de la cellule
    toolbar.style.left = `${left - host.left}px`
    toolbar.style.top = `${rect.top - host.top - 8 - toolbarHeight}px`
    toolbar.style.transform = 'none'
  }

  function clearToolbar() {
    while (toolbar.firstChild) toolbar.removeChild(toolbar.firstChild)
  }

  function buildButtons(
    specs: ButtonSpec[],
    current: string,
    submitInfo?: ActiveCellInfo,
  ) {
    specs.forEach((spec) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.classList.add('tab-sv__tool-btn')
      if (spec.value === current) btn.classList.add('is-current')
      btn.innerHTML = spec.display
      btn.setAttribute('aria-label', spec.ariaLabel)
      btn.addEventListener('click', (e) => {
        e.preventDefault()
        const info = submitInfo ?? currentInfo
        if (info) onSubmit(info, spec.value)
        hide()
      })
      toolbar.appendChild(btn)
    })
  }

  function buildMathInput(current: string, clavier?: string) {
    // <math-field> de mathlive : on suppose que la lib est déjà chargée
    // globalement (utilisée partout dans le projet).
    const wrapper = document.createElement('div')
    wrapper.classList.add('tab-sv__tool-mathinput')
    const mf = document.createElement('math-field') as MathfieldElement
    mf.id = 'tab-sv-toolbar-mathfield'
    mf.classList.add('tab-sv__math-field')
    mf.dataset.nomAccessible = 'valeur de la case'
    mf.setAttribute(
      'data-keyboard',
      buildDataKeyboardFromStyle(clavier ?? '').join(' '),
    )
    mf.value = current ?? ''
    wrapper.appendChild(mf)

    const focusMathField = () => {
      try {
        mf.focus?.()
      } catch {
        /* noop */
      }
    }

    // MathLive n'est prêt à recevoir le focus qu'une fois monté dans le DOM
    // (évènement 'mount') : un requestAnimationFrame seul peut le devancer.
    if (mf.isConnected) {
      setMathfield(mf)
      nommeChampsAutourDe(mf)
      focusMathField()
    } else {
      mf.addEventListener(
        'mount',
        () => {
          setMathfield(mf)
          nommeChampsAutourDe(mf)
          focusMathField()
        },
        { once: true },
      )
    }

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        if (currentInfo) onSubmit(currentInfo, String(mf.value ?? ''))
        hide()
      }
    }

    mf.addEventListener('keydown', handleKeydown)

    const validateBtn = document.createElement('button')
    validateBtn.type = 'button'
    validateBtn.classList.add('tab-sv__tool-btn', 'tab-sv__tool-btn--validate')
    validateBtn.textContent = '✓'
    validateBtn.setAttribute('aria-label', 'valider')
    validateBtn.addEventListener('click', (e) => {
      e.preventDefault()
      if (currentInfo) onSubmit(currentInfo, String(mf.value ?? ''))
      hide()
    })

    const clearBtn = document.createElement('button')
    clearBtn.type = 'button'
    clearBtn.classList.add('tab-sv__tool-btn')
    clearBtn.innerHTML = ERASER_ICON
    clearBtn.setAttribute('aria-label', 'effacer')
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault()
      if (currentInfo) onSubmit(currentInfo, '')
      hide()
    })

    wrapper.appendChild(validateBtn)
    wrapper.appendChild(clearBtn)
    toolbar.appendChild(wrapper)

    // Filet de sécurité si l'évènement 'mount' était déjà passé ou n'est pas
    // déclenché par l'environnement de test.
    requestAnimationFrame(focusMathField)
  }

  function show(
    info: ActiveCellInfo,
    anchor: HTMLElement,
    currentValue: string,
  ) {
    currentInfo = info
    currentAnchor = anchor
    clearToolbar()
    if (info.mode === 'signe') {
      const isValueColumn = info.cellIndex % 2 === 0
      buildButtons(
        isValueColumn ? BOUTONS_BARRE : BOUTONS_SIGNE,
        (currentValue as SigneSymbol) ?? '',
      )
    } else if (info.mode === 'variation') {
      buildButtons(BOUTONS_FLECHE, (currentValue as SensFleche) ?? '')
    } else if (info.mode === 'barre') {
      buildButtons(BOUTONS_BARRE, (currentValue as SigneSymbol) ?? '')
    } else if (info.mode === 'signeBarree') {
      const [signe = '', marker = ''] = currentValue.split('\u0000')
      buildButtons(BOUTONS_SIGNE, signe)
      if (info.secondaryCellId != null) {
        buildButtonsForInfo(BOUTONS_BARRE, marker, {
          ...info,
          cellId: info.secondaryCellId,
          mode: 'barre',
        })
      }
    } else if (info.mode === 'valeurBarree') {
      const [latex = '', marker = ''] = currentValue.split('\u0000')
      buildMathInput(latex, info.clavier)
      if (info.secondaryCellId != null) {
        buildButtonsForInfo(BOUTONS_BARRE, marker, {
          ...info,
          cellId: info.secondaryCellId,
          mode: 'barre',
        })
      }
    } else if (info.mode === 'valeur' || info.mode === 'valeurDroite') {
      buildMathInput(currentValue ?? '', info.clavier)
    }
    toolbar.style.display = 'flex'
    reposition()
  }

  function buildButtonsForInfo(
    specs: ButtonSpec[],
    current: string,
    submitInfo: ActiveCellInfo,
  ) {
    buildButtons(specs, current, submitInfo)
  }

  function hide() {
    toolbar.style.display = 'none'
    clearToolbar()
    currentInfo = null
    currentAnchor = null
  }

  function destroy() {
    document.removeEventListener('mousedown', docClickHandler, true)
    document.removeEventListener('keydown', escHandler)
    toolbar.remove()
  }

  shadowRoot.appendChild(toolbar)

  return { show, hide, destroy }
}
