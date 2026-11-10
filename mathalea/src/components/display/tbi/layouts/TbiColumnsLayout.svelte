<script lang="ts">
  import { onDestroy } from 'svelte'
  import { flip } from 'svelte/animate'
  import {
    getTbiColumnGroups,
    tbiIsShuffling,
    tbiState,
    type TbiSingleColumnAlign,
  } from '../../../../lib/stores/tbiStore'
  import {
    tbiControlsVisible,
    tbiDropTabId,
    tbiEditing,
    tbiTabIdAtPoint,
  } from '../../../../lib/tbiControls'
  import TbiCardHost from '../TbiCardHost.svelte'
  import type { TbiItem } from '../tbiTypes'

  interface Props {
    items: TbiItem[]
    nbColumns: number
    /** Alignement horizontal quand nbColumns === 1 (sans effet au-delà) */
    singleColumnAlign?: TbiSingleColumnAlign
    /** Réordonnancement : déplace l'exercice de la position from à la position to */
    onMove?: (from: number, to: number, groups?: number[][]) => void
    withPadding?: boolean
    /** Onglets vers lesquels déplacer un exercice */
    moveTargets?: { value: number | string; label: string }[]
    onMoveTo?: (paramsIndex: number, value: number | string) => void
    onDelete?: (paramsIndex: number) => void
  }

  let {
    items,
    nbColumns,
    singleColumnAlign = 'center',
    onMove = () => {},
    withPadding = true,
    moveTargets = [],
    onMoveTo,
    onDelete,
  }: Props = $props()

  let layout: HTMLDivElement
  let draggedKey = $state<number | null>(null)
  let target = $state<{ column: number; position: number } | null>(null)
  let pointer = $state<{ x: number; y: number } | null>(null)
  let announcement = $state('')
  let stopGesture: (() => void) | undefined
  let groups = $derived(
    getTbiColumnGroups(
      items.map((item) => item.paramsIndex),
      $tbiState.cards,
      nbColumns,
    ).map((group) =>
      group.map((index) => items.find((item) => item.paramsIndex === index)!),
    ),
  )
  let draggedItem = $derived(items.find((item) => item.key === draggedKey))

  function cancel() {
    stopGesture?.()
    stopGesture = undefined
    draggedKey = null
    target = null
    pointer = null
  }
  onDestroy(cancel)
  $effect(() => {
    if (
      draggedKey !== null &&
      (!draggedItem || (target && target.column >= nbColumns))
    )
      cancel()
  })

  function commit() {
    if (!draggedItem || !target) {
      cancel()
      return
    }
    const from = draggedItem.paramsIndex
    const nextGroups = groups.map((group) =>
      group
        .filter((item) => item.key !== draggedKey)
        .map((item) => item.paramsIndex),
    )
    nextGroups[target.column].splice(target.position, 0, from)
    announcement = `Exercice déplacé dans la colonne ${target.column + 1}, position ${target.position + 1}.`
    cancel()
    onMove(from, from, nextGroups)
  }

  function locate(x: number, y: number) {
    const columns = Array.from(
      layout.querySelectorAll<HTMLElement>('[data-tbi-column]'),
    )
    const bounds = layout.getBoundingClientRect()
    if (
      x < bounds.left - 24 ||
      x > bounds.right + 24 ||
      y < bounds.top - 24 ||
      y > bounds.bottom + 24
    ) {
      target = null
      return
    }
    const column = columns.findIndex((node, index) => {
      const rect = node.getBoundingClientRect()
      return x <= rect.right + 8 || index === columns.length - 1
    })
    if (column < 0) return
    const cards = Array.from(
      columns[column].querySelectorAll<HTMLElement>('[data-tbi-card]'),
    ).filter((node) => Number(node.dataset.tbiCard) !== draggedKey)
    const position = cards.findIndex((node) => {
      const rect = node.getBoundingClientRect()
      return y < rect.top + rect.height / 2
    })
    target = { column, position: position < 0 ? cards.length : position }
  }

  function startPointer(event: PointerEvent, item: TbiItem) {
    if (event.button !== 0 || !event.isPrimary) return
    cancel()
    event.preventDefault()
    const handle = event.currentTarget as HTMLButtonElement
    const startX = event.clientX
    const startY = event.clientY
    const pointerId = event.pointerId
    let frame = 0
    try {
      handle.setPointerCapture(pointerId)
    } catch {
      /* Pointeur synthétique. */
    }
    function scroll() {
      if (!pointer) return
      const edge = 72
      const delta =
        pointer.y < edge ? -12 : pointer.y > window.innerHeight - edge ? 12 : 0
      if (delta) {
        window.scrollBy(0, delta)
        locate(pointer.x, pointer.y)
      }
      frame = requestAnimationFrame(scroll)
    }
    function move(event: PointerEvent) {
      if (event.pointerId !== pointerId) return
      if (
        draggedKey === null &&
        Math.hypot(event.clientX - startX, event.clientY - startY) < 5
      )
        return
      draggedKey = item.key
      pointer = { x: event.clientX, y: event.clientY }
      tbiDropTabId.set(tbiTabIdAtPoint(event.clientX, event.clientY))
      locate(event.clientX, event.clientY)
      if (!frame) frame = requestAnimationFrame(scroll)
    }
    function end(event: PointerEvent) {
      if (event.pointerId !== pointerId) return
      tbiDropTabId.set(null)
      // déposé sur un onglet du bandeau : l'exercice y est déplacé
      const tabId =
        event.type === 'pointercancel' || draggedKey === null
          ? null
          : tbiTabIdAtPoint(event.clientX, event.clientY)
      if (event.type === 'pointercancel') cancel()
      else if (tabId !== null && draggedItem) {
        const { paramsIndex } = draggedItem
        cancel()
        onMoveTo?.(paramsIndex, tabId)
      } else commit()
    }
    function escape(event: KeyboardEvent) {
      if (event.key === 'Escape') cancel()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', end)
    window.addEventListener('pointercancel', end)
    window.addEventListener('keydown', escape)
    stopGesture = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', end)
      window.removeEventListener('pointercancel', end)
      window.removeEventListener('keydown', escape)
      try {
        handle.releasePointerCapture(pointerId)
      } catch {
        /* Capture déjà relâchée. */
      }
    }
  }

  function keyboard(
    event: KeyboardEvent,
    item: TbiItem,
    column: number,
    position: number,
  ) {
    if (event.key === 'Escape') {
      event.preventDefault()
      cancel()
      return
    }
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (draggedKey === item.key) {
        commit()
        // Le changement de colonne recrée la carte : retrouver sa poignée.
        requestAnimationFrame(() =>
          layout
            .querySelector<HTMLButtonElement>(`[data-tbi-handle="${item.key}"]`)
            ?.focus(),
        )
      } else {
        cancel()
        draggedKey = item.key
        target = { column, position }
        announcement =
          'Exercice saisi. Utiliser les flèches pour choisir la position, Entrée pour déposer, Échap pour annuler.'
      }
    } else if (
      draggedKey === item.key &&
      target &&
      event.key.startsWith('Arrow')
    ) {
      event.preventDefault()
      const nextColumn = Math.max(
        0,
        Math.min(
          nbColumns - 1,
          target.column +
            (event.key === 'ArrowRight'
              ? 1
              : event.key === 'ArrowLeft'
                ? -1
                : 0),
        ),
      )
      const length = groups[nextColumn].filter(
        (entry) => entry.key !== draggedKey,
      ).length
      const nextPosition = Math.max(
        0,
        Math.min(
          length,
          target.position +
            (event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0),
        ),
      )
      target = { column: nextColumn, position: nextPosition }
      announcement = `Colonne ${nextColumn + 1}, position ${nextPosition + 1}.`
    }
  }

  /**
   * Colonne centrée : sa largeur suit la taille du texte, jusqu'à la largeur de
   * l'écran, pour que les énoncés restent sur une ligne en grandissant.
   */
  let centeredMaxWidth = $derived.by(() => {
    if (nbColumns !== 1 || singleColumnAlign !== 'center') return undefined
    const zoom = $tbiState.cards[items[0]?.paramsIndex]?.zoom ?? 1
    return `${64 * zoom}rem`
  })

  // Alignement horizontal du conteneur quand il n'y a qu'une seule colonne :
  // centré (largeur limitée, comportement historique), moitié gauche/droite de
  // l'écran, ou toute la largeur. Sans effet dès qu'il y a plusieurs colonnes.
  let widthClass = $derived.by(() => {
    if (nbColumns !== 1) return 'w-full'
    switch (singleColumnAlign) {
      case 'left':
        return 'w-1/2 mr-auto'
      case 'right':
        return 'w-1/2 ml-auto'
      case 'full':
        return 'w-full'
      default:
        return 'w-full mx-auto'
    }
  })
</script>

<p class="sr-only" aria-live="polite">{announcement}</p>
<div
  bind:this={layout}
  class="{widthClass} {withPadding ? 'p-4' : ''} tbi-columns"
  class:is-dragging={draggedKey !== null}
  class:show-handles={$tbiEditing && $tbiControlsVisible}
  style="display: grid; grid-template-columns: repeat({nbColumns}, minmax(0, 1fr)); column-gap: 1rem"
  style:max-width={centeredMaxWidth}
>
  {#each groups as colItems, colIndex (colIndex)}
    <div
      class="tbi-column flex flex-col gap-4 min-w-0"
      data-tbi-column={colIndex}
      class:drop-column={target?.column === colIndex}
    >
      {#each colItems as item, position (item.key)}
        <div
          class="tbi-card min-w-0"
          data-tbi-card={item.key}
          class:drag-source={draggedKey === item.key}
          animate:flip={{
            duration:
              $tbiIsShuffling &&
              !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
                ? (d) => 300 + Math.sqrt(d) * 6
                : 0,
          }}
        >
          {#if target?.column === colIndex && item.key !== draggedKey && target.position === colItems
                .filter((entry) => entry.key !== draggedKey)
                .indexOf(item)}
            <div class="drop-marker"><span>Déposer ici</span></div>
          {/if}
          <button
            type="button"
            class="drag-handle bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
            data-tbi-handle={item.key}
            aria-label={`Déplacer l'exercice ${item.id}`}
            aria-pressed={draggedKey === item.key}
            title="Glisser pour déplacer. Au clavier : Entrée, puis les flèches."
            onpointerdown={(event) => startPointer(event, item)}
            onkeydown={(event) => keyboard(event, item, colIndex, position)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="currentColor"
              aria-hidden="true"
              ><circle cx="6" cy="4" r="1.5"></circle><circle
                cx="12"
                cy="4"
                r="1.5"
              ></circle><circle cx="6" cy="9" r="1.5"></circle><circle
                cx="12"
                cy="9"
                r="1.5"
              ></circle><circle cx="6" cy="14" r="1.5"></circle><circle
                cx="12"
                cy="14"
                r="1.5"
              ></circle></svg
            >
            <span>Déplacer</span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              ><path
                d="M12 3v18M3 12h18M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3"
              ></path></svg
            >
          </button>
          <TbiCardHost {item} {moveTargets} {onMoveTo} {onDelete} />
        </div>
      {/each}
      <div class="column-tail">
        {#if target?.column === colIndex && target.position === colItems.filter((entry) => entry.key !== draggedKey).length}
          <div class="drop-marker"><span>Déposer ici</span></div>
        {/if}
      </div>
    </div>
  {/each}
</div>
{#if pointer && draggedItem}
  <div
    class="drag-preview"
    style:left="{pointer.x + 16}px"
    style:top="{pointer.y + 16}px"
    aria-hidden="true"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="currentColor"
      aria-hidden="true"
      ><circle cx="6" cy="4" r="1.5"></circle><circle cx="12" cy="4" r="1.5"
      ></circle><circle cx="6" cy="9" r="1.5"></circle><circle
        cx="12"
        cy="9"
        r="1.5"
      ></circle><circle cx="6" cy="14" r="1.5"></circle><circle
        cx="12"
        cy="14"
        r="1.5"
      ></circle></svg
    >
    {draggedItem.exercise?.titre ??
      draggedItem.staticContent?.title ??
      draggedItem.id}
    <small
      >{target
        ? `Colonne ${target.column + 1} · Position ${target.position + 1}`
        : 'Relâcher pour annuler'}</small
    >
  </div>
{/if}

<style>
  .tbi-columns,
  .drag-preview {
    --tbi-accent: var(--color-coopmaths-struct);
    --tbi-on-accent: var(--color-coopmaths-canvas);
    --tbi-line: var(--color-coopmaths-canvas-darkest);
    --tbi-ink: var(--color-coopmaths-corpus);
  }
  :global(.dark) .tbi-columns,
  :global(.dark) .drag-preview {
    --tbi-accent: var(--color-coopmathsdark-struct);
    --tbi-on-accent: var(--color-coopmathsdark-canvas);
    --tbi-line: var(--color-coopmathsdark-canvas-darkest);
    --tbi-ink: var(--color-coopmathsdark-corpus);
  }
  .tbi-column {
    position: relative;
    border-radius: 12px;
    min-height: 160px;
    transition:
      background 150ms,
      box-shadow 150ms;
  }
  .show-handles .tbi-column {
    outline: 2px dashed var(--tbi-line);
    outline-offset: 4px;
  }
  .drop-column {
    background: color-mix(in srgb, var(--tbi-accent) 10%, transparent);
    box-shadow: 0 0 0 2px var(--tbi-accent);
  }
  .tbi-card {
    position: relative;
  }
  .drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    position: absolute;
    top: -24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 25;
    height: 48px;
    padding: 2px 16px;
    border-radius: 999px;
    border: 1px solid var(--tbi-line);
    opacity: 0;
    pointer-events: none;
    transition: opacity 150ms;
    box-shadow: 0 2px 6px rgb(0 0 0 / 15%);
    color: var(--tbi-ink);
    cursor: grab;
    touch-action: none;
    user-select: none;
    font-size: 16px;
    font-weight: 600;
  }
  .show-handles .drag-handle,
  .drag-handle[aria-pressed='true'] {
    opacity: 1;
    pointer-events: auto;
  }
  .drag-handle:hover,
  .drag-handle:focus-visible {
    outline: 2px solid var(--tbi-accent);
    outline-offset: 2px;
  }
  .drag-source {
    opacity: 0.35;
  }
  .is-dragging .drag-handle {
    cursor: grabbing;
  }
  .column-tail {
    position: relative;
    flex: 1;
  }
  .show-handles .column-tail {
    min-height: 32px;
  }
  .drop-marker {
    position: absolute;
    top: -10px;
    left: 0;
    right: 0;
    height: 4px;
    border-radius: 4px;
    background: var(--tbi-accent);
    z-index: 30;
    pointer-events: none;
  }
  .drop-marker span {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 3px 12px;
    border-radius: 20px;
    background: var(--tbi-accent);
    color: var(--tbi-on-accent);
    font-size: 16px;
    font-weight: 600;
    white-space: nowrap;
  }
  .drag-preview {
    position: fixed;
    z-index: 1000;
    pointer-events: none;
    max-width: 300px;
    padding: 12px 16px;
    border-radius: 12px;
    background: var(--tbi-accent);
    color: var(--tbi-on-accent);
    box-shadow: 0 12px 30px rgb(0 0 0 / 25%);
    font-size: 16px;
  }
  .drag-preview small {
    display: block;
    margin-top: 4px;
    opacity: 0.85;
  }
</style>
