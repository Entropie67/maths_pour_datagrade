<script lang="ts">
  import { onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { draggable, resizable } from '../../../../lib/components/tbiPointer'
  import {
    TBI_MAX_CARD_WIDTH,
    TBI_MIN_CARD_WIDTH,
    tbiCardNumber,
    tbiState,
    toggleTbiCardCollapsed,
  } from '../../../../lib/stores/tbiStore'
  import {
    tbiControlsVisible,
    tbiDropTabId,
    tbiEditing,
    tbiPointer,
    tbiTabIdAtPoint,
  } from '../../../../lib/tbiControls'
  import { snapFreePosition, type TbiBox } from '../../../../lib/tbiLayout'
  import TbiCardHost from '../TbiCardHost.svelte'
  import type { TbiItem } from '../tbiTypes'

  interface Props {
    items: TbiItem[]
    /** Sauvegarde des positions (localStorage), appelée en fin de geste */
    persistLayout: () => void
    /** Onglets vers lesquels déplacer un exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (paramsIndex: number, value: number | string) => void
    /** Demande de suppression, traitée par la vue TBI */
    onDelete?: (paramsIndex: number) => void
  }

  let {
    items,
    persistLayout,
    moveTargets = [],
    onMoveTo,
    onDelete,
  }: Props = $props()

  /** Carte au premier plan (la dernière manipulée) */
  let frontIndex: number | null = $state(null)

  /**
   * Geste en cours. Pendant le geste, seul le style du shell est modifié,
   * directement dans le DOM et au rythme de l'écran (requestAnimationFrame) :
   * aucune écriture dans le store, donc aucun re-render Svelte et aucun
   * recalcul de la hauteur du canvas par pointermove. Le redimensionnement
   * ne touche que la largeur du cadre (pas de re-typeset KaTeX : le zoom du
   * contenu est indépendant et ne change pas pendant ce geste). Le store
   * n'est mis à jour qu'au relâchement (commit), en une seule notification.
   */
  let gesture: {
    paramsIndex: number
    shell: HTMLElement
    x: number
    y: number
    w: number
    raf: number | null
    kind: 'drag' | 'resize'
    /** Position aimantée, celle qui sera enregistrée */
    snapX?: number
    snapY?: number
  } | null = null

  /** Place des autres cartes, pour s'y aimanter */
  function otherBoxes(shell: HTMLElement): TbiBox[] {
    const siblings =
      shell.parentElement?.querySelectorAll<HTMLElement>('.tbi-free-shell')
    return [...(siblings ?? [])]
      .filter((other) => other !== shell)
      .map((other) => ({
        x: other.offsetLeft,
        y: other.offsetTop,
        w: other.offsetWidth,
        h: other.offsetHeight,
      }))
  }

  function beginGesture(
    paramsIndex: number,
    handle: HTMLElement,
    kind: 'drag' | 'resize',
  ) {
    const shell = handle.closest('.tbi-free-shell')
    const card = get(tbiState).cards[paramsIndex]
    if (!(shell instanceof HTMLElement) || !card) return
    frontIndex = paramsIndex
    gesture = {
      paramsIndex,
      shell,
      x: card.x,
      y: card.y,
      w: card.w,
      raf: null,
      kind,
    }
  }

  function applyGestureStyle() {
    if (!gesture) return
    gesture.raf = null
    gesture.shell.style.left = `${gesture.snapX ?? gesture.x}px`
    gesture.shell.style.top = `${gesture.snapY ?? gesture.y}px`
    gesture.shell.style.width = `${gesture.w}px`
  }

  function scheduleApply() {
    if (!gesture || gesture.raf !== null) return
    gesture.raf = requestAnimationFrame(applyGestureStyle)
  }

  function onDragMove(dx: number, dy: number) {
    if (!gesture) return
    gesture.x = Math.max(0, gesture.x + dx)
    gesture.y = Math.max(0, gesture.y + dy)
    const shell = gesture.shell
    const snapped = snapFreePosition(
      {
        x: gesture.x,
        y: gesture.y,
        w: gesture.w,
        h: shell.offsetHeight,
      },
      otherBoxes(shell),
      shell.parentElement?.clientWidth ?? window.innerWidth,
    )
    gesture.snapX = snapped.x
    gesture.snapY = snapped.y
    tbiDropTabId.set(tbiTabIdAtPoint(tbiPointer.x, tbiPointer.y))
    scheduleApply()
  }

  function onResizeMove(dw: number) {
    if (!gesture) return
    gesture.w = Math.min(
      TBI_MAX_CARD_WIDTH,
      Math.max(TBI_MIN_CARD_WIDTH, gesture.w + dw),
    )
    scheduleApply()
  }

  function commitGesture() {
    if (!gesture) return
    if (gesture.raf !== null) cancelAnimationFrame(gesture.raf)
    applyGestureStyle()
    const doneGesture = gesture
    const { paramsIndex, w, kind } = gesture
    const x = gesture.snapX ?? gesture.x
    const y = gesture.snapY ?? gesture.y
    gesture = null
    tbiDropTabId.set(null)
    // déposé sur un onglet du bandeau : l'exercice y part, à sa place d'origine
    const targetTab =
      kind === 'drag' ? tbiTabIdAtPoint(tbiPointer.x, tbiPointer.y) : null
    if (targetTab !== null) {
      const { shell } = doneGesture
      const card = get(tbiState).cards[paramsIndex]
      if (card) {
        shell.style.left = `${card.x}px`
        shell.style.top = `${card.y}px`
      }
      onMoveTo?.(paramsIndex, targetTab)
      return
    }
    tbiState.update((state) => {
      const card = state.cards[paramsIndex]
      if (card) {
        card.x = x
        card.y = y
        card.w = w
      }
      return state
    })
    persistLayout()
  }

  // Repli de chaque exercice, dérivé au niveau du composant (et non via un
  // {@const} imbriqué) pour que le basculement de card.collapsed — mutation
  // en place dans le store — déclenche bien le re-rendu.
  let collapsedFlags = $derived(
    items.map((item) => $tbiState.cards[item.paramsIndex]?.collapsed ?? false),
  )

  /**
   * Hauteur de la zone : celle des cartes, positionnées en absolu, pour que la
   * page ne défile que s'il y a quelque chose à voir plus bas.
   */
  let canvasHeight = $state(0)
  let area: HTMLElement | undefined = $state()
  const shellObserver = new ResizeObserver(measureCanvas)

  function measureCanvas() {
    const shells = area?.querySelectorAll<HTMLElement>('.tbi-free-shell') ?? []
    canvasHeight = Math.max(
      0,
      ...[...shells].map((shell) => shell.offsetTop + shell.offsetHeight),
    )
  }

  function observeShell(shell: HTMLElement) {
    shellObserver.observe(shell)
    return {
      destroy() {
        shellObserver.unobserve(shell)
      },
    }
  }

  $effect(() => {
    void $tbiState
    measureCanvas()
  })

  onDestroy(() => shellObserver.disconnect())
</script>

<div
  bind:this={area}
  class="relative w-full"
  style="min-height: {canvasHeight}px"
>
  {#each items as item, i (item.key)}
    {@const card = $tbiState.cards[item.paramsIndex]}
    {#if card}
      {@const collapsed = collapsedFlags[i]}
      {@const showHandles = $tbiEditing && $tbiControlsVisible}
      <div
        class="tbi-free-shell absolute flex flex-col rounded-lg {frontIndex ===
        item.paramsIndex
          ? 'z-10'
          : 'z-0'}"
        style="left: {card.x}px; top: {card.y}px; width: {card.w}px"
        data-tbi-shell={item.paramsIndex}
        use:observeShell
      >
        {#if showHandles}
          <div
            data-tbi-chrome
            class="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-row items-center gap-2 h-12 px-4 rounded-full select-none font-semibold shadow-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus"
            style="touch-action: none; user-select: none"
            title="Glisser pour déplacer"
            use:draggable={{
              onStart: (handle) =>
                beginGesture(item.paramsIndex, handle, 'drag'),
              onMove: onDragMove,
              onEnd: commitGesture,
            }}
          >
            <i class="bx bx-move text-xl"></i>
            Déplacer
          </div>
        {/if}
        {#if collapsed}
          <button
            type="button"
            class="flex flex-row items-center gap-2 h-12 px-3 rounded-lg font-semibold text-left bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas"
            title="Déplier l'exercice"
            aria-label={`Déplier l'exercice ${tbiCardNumber($tbiState, item.paramsIndex)}`}
            onclick={() => toggleTbiCardCollapsed(item.paramsIndex)}
          >
            <i class="bx bx-chevron-right text-2xl"></i>
            Exercice {tbiCardNumber($tbiState, item.paramsIndex)}
          </button>
        {:else}
          <TbiCardHost
            {item}
            {moveTargets}
            {onMoveTo}
            onCollapse={toggleTbiCardCollapsed}
            {onDelete}
          />
          {#if showHandles}
            <div
              data-tbi-chrome
              class="absolute -bottom-3 -right-3 z-20 w-12 h-12 rounded-full flex items-center justify-center shadow-md border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus dark:text-coopmathsdark-corpus"
              style="touch-action: none; user-select: none"
              title="Redimensionner le cadre de l'exercice"
              use:resizable={{
                onStart: (handle) =>
                  beginGesture(item.paramsIndex, handle, 'resize'),
                onMove: onResizeMove,
                onEnd: commitGesture,
              }}
            >
              <i class="bx bx-expand-alt text-xl"></i>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  {/each}
</div>
