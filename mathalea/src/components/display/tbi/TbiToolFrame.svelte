<script lang="ts">
  import { onMount, type Snippet } from 'svelte'
  import {
    clampToViewport,
    draggable,
    isGripReachable,
    resizable,
  } from '../../../lib/components/tbiPointer'
  import { TBI_BOTTOM_RESERVE } from '../../../lib/tbiToolPlacement'
  import type { TbiToolGeometry } from './tbiTypes'

  /**
   * Cadre commun des outils de la vue TBI et de la vue élève : en-tête qui
   * s'efface au repos, déplacement, redimensionnement par les 4 coins, plan et
   * fermeture. Seul le contenu diffère d'un outil à l'autre.
   *
   * Pendant un geste, seul le style du cadre change (au rythme de l'écran) :
   * l'état n'est mis à jour qu'au relâchement, pour ne pas re-rendre la vue à
   * chaque mouvement du pointeur.
   */
  interface Props {
    title: string
    x: number
    y: number
    w: number
    /** Absente : la hauteur suit le contenu */
    h?: number
    z?: number
    minW: number
    maxW: number
    minH?: number
    maxH?: number
    /** Ratio verrouillé : la hauteur est dérivée de la largeur */
    heightForWidth?: (w: number) => number
    /** En-tête et poignées affichés (ils s'effacent au repos) */
    chromeVisible?: boolean
    /** Masqué sans être démonté, pour conserver l'état du contenu */
    hidden?: boolean
    /** Occupe toute la fenêtre */
    maximized?: boolean
    closeLabel?: string
    bodyClass?: string
    /** Commandes propres à l'outil, dans l'en-tête */
    header?: Snippet
    children: Snippet
    onCommit: (geometry: TbiToolGeometry) => void
    onClose: () => void
    onFront?: (event: PointerEvent) => void
    /** Un geste commence ou se termine (une iframe ne doit pas capter le pointeur) */
    onGesture?: (active: boolean) => void
    /** Épinglé sur tous les onglets ; sans `onTogglePin`, pas d'épingle */
    pinned?: boolean
    onTogglePin?: () => void
    /** Hauteur réservée au bandeau, en bas de l'écran (px) */
    bottomReserve?: number
    /** Non utilisé par le cadre : transmis à l'outil avec les autres commandes */
    persistLayout?: () => void
    /** Évènements clavier sur le cadre (télécommande de présentation) */
    onkeydown?: (event: KeyboardEvent) => void
    onfocusout?: (event: FocusEvent) => void
    /** Élément du cadre, pour que l'outil y gère le focus */
    frame?: HTMLElement
  }

  let {
    title,
    x,
    y,
    w,
    h,
    z,
    minW,
    maxW,
    minH = 0,
    maxH = Infinity,
    heightForWidth,
    chromeVisible = true,
    hidden = false,
    maximized = false,
    closeLabel = `Fermer : ${title}`,
    bodyClass = '',
    header,
    children,
    onCommit,
    onClose,
    onFront,
    onGesture,
    pinned = false,
    onTogglePin,
    bottomReserve = TBI_BOTTOM_RESERVE,
    onkeydown,
    onfocusout,
    frame = $bindable(),
  }: Props = $props()

  type Corner = 'nw' | 'ne' | 'sw' | 'se'
  let gesture: {
    x: number
    y: number
    w: number
    h: number
    corner: Corner | null
    raf: number | null
    moved: boolean
  } | null = null

  function currentHeight(): number {
    return h ?? frame?.getBoundingClientRect().height ?? 0
  }

  function applyGestureStyle() {
    if (!gesture || !frame) return
    gesture.raf = null
    frame.style.left = `${gesture.x}px`
    frame.style.top = `${gesture.y}px`
    frame.style.width = `${gesture.w}px`
    if (h !== undefined) frame.style.height = `${gesture.h}px`
  }

  function scheduleApply() {
    if (!gesture || gesture.raf !== null) return
    gesture.raf = requestAnimationFrame(applyGestureStyle)
  }

  function beginGesture(corner: Corner | null) {
    if (maximized) return
    gesture = { x, y, w, h: currentHeight(), corner, raf: null, moved: false }
    onGesture?.(true)
  }

  function onDragMove(dx: number, dy: number) {
    if (!gesture) return
    gesture.moved = true
    ;({ x: gesture.x, y: gesture.y } = clampToViewport(
      gesture.x + dx,
      gesture.y + dy,
      gesture.w,
      gesture.h,
      bottomReserve,
    ))
    scheduleApply()
  }

  function clampW(value: number): number {
    return Math.min(maxW, Math.max(minW, value))
  }

  function clampH(value: number): number {
    return Math.min(maxH, Math.max(minH, value))
  }

  /** Poignée d'angle : le coin opposé à la poignée saisie reste fixe */
  function onResizeMove(dx: number, dy: number) {
    if (!gesture || !gesture.corner) return
    gesture.moved = true
    const anchorRight = gesture.x + gesture.w
    const anchorBottom = gesture.y + gesture.h
    const growsRight = gesture.corner === 'ne' || gesture.corner === 'se'
    const growsBottom = gesture.corner === 'sw' || gesture.corner === 'se'
    const dw = growsRight ? dx : -dx
    const dh = growsBottom ? dy : -dy
    if (heightForWidth) {
      // ratio verrouillé : la largeur combine les deux axes du geste
      const ratio = gesture.w / Math.max(1, gesture.h)
      gesture.w = clampW(gesture.w + (dw + dh * ratio) / 2)
      gesture.h = heightForWidth(gesture.w)
    } else if (h === undefined) {
      // hauteur libre de suivre le contenu
      gesture.w = clampW(gesture.w + (dw + dh) / 2)
    } else {
      gesture.w = clampW(gesture.w + dw)
      gesture.h = clampH(gesture.h + dh)
    }
    if (!growsRight) gesture.x = anchorRight - gesture.w
    if (!growsBottom) gesture.y = anchorBottom - gesture.h
    scheduleApply()
  }

  function commitGesture() {
    if (!gesture) return
    if (gesture.raf !== null) cancelAnimationFrame(gesture.raf)
    applyGestureStyle()
    const done = gesture
    gesture = null
    onGesture?.(false)
    if (!done.moved) return
    onCommit({
      x: done.x,
      y: done.y,
      w: done.w,
      ...(h !== undefined ? { h: done.h } : {}),
    })
  }

  /**
   * Ramène dans la fenêtre un outil qui en est sorti. À l'ouverture (position
   * enregistrée sur un écran plus grand), il y est ramené entier. Quand la
   * fenêtre change de taille, il n'est déplacé que si son en-tête n'est plus
   * atteignable : l'ouverture du clavier d'un téléphone ne le déplace pas.
   */
  function keepInViewport(atLoad = false) {
    if (gesture || hidden || maximized) return
    if (!atLoad && isGripReachable(x, y, w)) return
    const clamped = clampToViewport(x, y, w, currentHeight(), bottomReserve)
    if (clamped.x === x && clamped.y === y) return
    onCommit({ ...clamped, w, ...(h !== undefined ? { h } : {}) })
  }

  onMount(() => keepInViewport(true))

  /**
   * Au clavier, l'en-tête a le focus : les flèches déplacent l'outil, et avec
   * Maj elles le redimensionnent.
   */
  const KEYBOARD_STEP = 24

  function onHeaderKeydown(event: KeyboardEvent) {
    if (event.target !== event.currentTarget || maximized) return
    const dx =
      event.key === 'ArrowRight'
        ? KEYBOARD_STEP
        : event.key === 'ArrowLeft'
          ? -KEYBOARD_STEP
          : 0
    const dy =
      event.key === 'ArrowDown'
        ? KEYBOARD_STEP
        : event.key === 'ArrowUp'
          ? -KEYBOARD_STEP
          : 0
    if (dx === 0 && dy === 0) return
    event.preventDefault()
    event.stopPropagation()
    beginGesture(event.shiftKey ? 'se' : null)
    if (event.shiftKey) onResizeMove(dx, dy)
    else onDragMove(dx, dy)
    commitGesture()
  }

  const corners: {
    corner: Corner
    position: string
    marker: string
    cursor: string
  }[] = [
    {
      corner: 'nw',
      position: '-top-2 -left-2',
      marker: 'top-1 left-1 border-t-2 border-l-2',
      cursor: 'nwse-resize',
    },
    {
      corner: 'ne',
      position: '-top-2 -right-2',
      marker: 'top-1 right-1 border-t-2 border-r-2',
      cursor: 'nesw-resize',
    },
    {
      corner: 'sw',
      position: '-bottom-5 -left-5',
      marker: 'bottom-4 left-4 border-b-2 border-l-2',
      cursor: 'nesw-resize',
    },
    {
      corner: 'se',
      position: '-bottom-5 -right-5',
      marker: 'bottom-4 right-4 border-b-2 border-r-2',
      cursor: 'nwse-resize',
    },
  ]
</script>

<svelte:window onresize={() => keepInViewport()} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
  bind:this={frame}
  role="dialog"
  aria-label={title}
  tabindex="-1"
  data-tbi-tool
  class="fixed flex flex-col pointer-events-auto outline-none print-hidden text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  style:display={hidden ? 'none' : undefined}
  style:z-index={z}
  style:left={maximized ? '0' : `${x}px`}
  style:top={maximized ? '0' : `${y}px`}
  style:width={maximized ? '100vw' : `${w}px`}
  style:height={maximized ? '100vh' : h === undefined ? undefined : `${h}px`}
  onpointerdown={(event) => onFront?.(event)}
  {onkeydown}
  {onfocusout}
>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex : l'en-tête se déplace au clavier -->
  <div
    data-tbi-chrome
    class="flex flex-row items-center gap-1 h-11 pl-3 pr-1 shrink-0 select-none outline-coopmaths-struct border border-b-0 border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-lg font-semibold transition-opacity duration-200 {maximized
      ? ''
      : 'rounded-t-xl'} {chromeVisible ? '' : 'opacity-0 pointer-events-none'}"
    title={maximized
      ? undefined
      : 'Glisser pour déplacer. Au clavier : flèches, et Maj pour redimensionner.'}
    role="group"
    aria-label={`Déplacer : ${title}`}
    tabindex={maximized ? undefined : 0}
    onkeydown={onHeaderKeydown}
    use:draggable={{
      onStart: () => beginGesture(null),
      onMove: onDragMove,
      onEnd: commitGesture,
    }}
  >
    <span class="flex-1 min-w-0 truncate" {title}>{title}</span>
    {@render header?.()}
    {#if onTogglePin}
      <button
        type="button"
        class="flex items-center justify-center w-11 h-11 shrink-0 rounded-lg hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest {pinned
          ? 'text-coopmaths-struct dark:text-coopmathsdark-struct'
          : ''}"
        title={pinned
          ? 'Afficher seulement sur cet onglet'
          : 'Afficher sur tous les onglets'}
        aria-label="Afficher sur tous les onglets"
        aria-pressed={pinned}
        onclick={onTogglePin}
      >
        <i class="bx {pinned ? 'bxs-pin' : 'bx-pin'} text-xl"></i>
      </button>
    {/if}
    <button
      type="button"
      class="flex items-center justify-center w-11 h-11 shrink-0 ml-1 rounded-lg hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest"
      title="Fermer"
      aria-label={closeLabel}
      onclick={onClose}
    >
      <i class="bx bx-x text-2xl"></i>
    </button>
  </div>
  <div
    class="flex-1 min-h-0 overflow-hidden border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas dark:bg-coopmathsdark-canvas shadow-xl {maximized
      ? ''
      : chromeVisible
        ? 'rounded-b-xl'
        : 'rounded-xl'} {bodyClass}"
  >
    {@render children()}
  </div>

  {#if !maximized && chromeVisible}
    {#each corners as { corner, position, marker, cursor } (corner)}
      <div
        data-tbi-chrome
        class="absolute bg-transparent {position} {corner.startsWith('n')
          ? 'w-5 h-5'
          : 'w-11 h-11'}"
        title="Redimensionner"
        use:resizable={{
          onStart: () => beginGesture(corner),
          onMove: onResizeMove,
          onEnd: commitGesture,
          cursor,
        }}
      >
        <span
          class="absolute w-3 h-3 pointer-events-none border-coopmaths-struct dark:border-coopmathsdark-struct {marker}"
        ></span>
      </div>
    {/each}
  {/if}
</div>
