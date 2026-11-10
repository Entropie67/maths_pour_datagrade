<script lang="ts">
  import { dismissable } from '../../../lib/components/tbiPopup'
  import { darkMode } from '../../../lib/stores/generalStore'
  import {
    canRedoTbiBoard,
    canUndoTbiBoard,
    commitTbiBoardStrokes,
    redoTbiBoard,
    TBI_BOARD_INKS,
    TBI_BOARD_SIZES,
    tbiBoardHistoryVersion,
    tbiBoardPen,
    tbiInkColor,
    undoTbiBoard,
    type TbiBoardTool,
  } from '../../../lib/stores/tbiBoardStore'
  import { showTbiToast } from '../../../lib/stores/tbiToastStore'
  import {
    isFilledShape,
    isTbiShape,
    TBI_BOARD_SHAPES,
    type TbiBoard,
    type TbiBoardInk,
    type TbiShape,
  } from '../../../lib/tbiBoard'
  import { tbiBarMirrored, tbiOpenPanel } from '../../../lib/tbiControls'
  import TbiBackgroundPicker from './TbiBackgroundPicker.svelte'
  import {
    tbiButton,
    tbiPanel,
    tbiSegment,
    tbiSegmentButton,
    tbiSeparator,
  } from './tbiUi'

  /** Commandes de l'écriture, dans le bandeau */
  interface Props {
    tabId: string
    board: TbiBoard
    /** Icônes seules quand la place manque */
    labelClass: string
  }

  let { tabId, board, labelClass }: Props = $props()

  type ToolButton = { value: TbiBoardTool; label: string; icon: string }

  const drawingTools: ToolButton[] = [
    { value: 'pen', label: 'Stylo', icon: 'bx-pencil' },
    { value: 'highlighter', label: 'Surligneur', icon: 'bx-highlight' },
  ]
  const editingTools: ToolButton[] = [
    { value: 'move', label: 'Déplacer', icon: 'bx-move' },
    { value: 'eraser', label: 'Gomme', icon: 'bx-eraser' },
  ]

  const canUndo = $derived(
    $tbiBoardHistoryVersion >= 0 && canUndoTbiBoard(tabId),
  )
  const canRedo = $derived(
    $tbiBoardHistoryVersion >= 0 && canRedoTbiBoard(tabId),
  )

  function setTool(tool: TbiBoardTool) {
    tbiBoardPen.update((pen) => ({ ...pen, tool }))
  }

  function setShape(shape: TbiShape) {
    setTool(shape)
    tbiOpenPanel.set(null)
  }

  /** Choisir une encre ou une épaisseur reprend l'outil d'écriture */
  function drawingTool(tool: TbiBoardTool): TbiBoardTool {
    return tool === 'eraser' || tool === 'move' ? 'pen' : tool
  }

  function setInk(color: TbiBoardInk) {
    tbiBoardPen.update((pen) => ({
      ...pen,
      color,
      tool: drawingTool(pen.tool),
    }))
  }

  function setSize(size: number) {
    tbiBoardPen.update((pen) => ({
      ...pen,
      size,
      tool: drawingTool(pen.tool),
    }))
  }

  function clear() {
    const previous = board.strokes
    commitTbiBoardStrokes(tabId, previous, [])
    showTbiToast('Tableau effacé', {
      label: 'Annuler',
      run: () => undoTbiBoard(tabId, []),
    })
  }

  let backgroundButton: HTMLButtonElement | undefined = $state()
  let shapesButton: HTMLButtonElement | undefined = $state()
  let inkButton: HTMLButtonElement | undefined = $state()

  const currentShape = $derived(
    isTbiShape($tbiBoardPen.tool) ? $tbiBoardPen.tool : null,
  )
  /** Taille du rond du bouton Encre et épaisseur : un peu plus grand que l'épaisseur, pour bien voir la couleur */
  const currentDot = $derived(
    (TBI_BOARD_SIZES.find((size) => size.value === $tbiBoardPen.size)?.dot ??
      13) + 6,
  )
</script>

{#snippet shapeIcon(shape: TbiShape)}
  <svg
    viewBox="0 0 24 24"
    class="w-6 h-6 shrink-0"
    fill={isFilledShape(shape) ? 'currentColor' : 'none'}
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if shape === 'line'}
      <line x1="4" y1="20" x2="20" y2="4" />
    {:else if shape === 'arrow'}
      <path d="M4 20 20 4M11 4h9v9" />
    {:else if shape === 'rectangle' || shape === 'filledRectangle'}
      <rect x="3" y="6" width="18" height="12" rx="1" />
    {:else}
      <ellipse cx="12" cy="12" rx="10" ry="7" />
    {/if}
  </svg>
{/snippet}

{#snippet toolButton(tool: ToolButton)}
  <button
    type="button"
    class="{tbiSegmentButton($tbiBoardPen.tool === tool.value)} text-2xl"
    title={tool.label}
    aria-label={tool.label}
    aria-pressed={$tbiBoardPen.tool === tool.value}
    onclick={() => setTool(tool.value)}
  >
    <i class="bx {tool.icon}"></i>
  </button>
{/snippet}

<div class={tbiSegment} role="group" aria-label="Outil d'écriture">
  {#each drawingTools as tool (tool.value)}
    {@render toolButton(tool)}
  {/each}
  <div class="relative">
    <button
      bind:this={shapesButton}
      type="button"
      class="{tbiSegmentButton(currentShape !== null)} text-2xl"
      title="Formes"
      aria-label="Formes"
      aria-expanded={$tbiOpenPanel === 'shapes'}
      onclick={() =>
        tbiOpenPanel.update((panel) =>
          panel === 'shapes' ? null : 'shapes',
        )}
    >
      {#if currentShape}
        {@render shapeIcon(currentShape)}
      {:else}
        <i class="bx bx-shape-square"></i>
      {/if}
    </button>
    {#if $tbiOpenPanel === 'shapes'}
      <div
        use:dismissable={{
          onDismiss: () => tbiOpenPanel.set(null),
          ignore: () => [shapesButton],
        }}
        data-tbi-chrome
        data-tbi-panel
        role="dialog"
        aria-label="Formes"
        class="{tbiPanel} absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[26rem] max-w-[calc(100vw-1.5rem)] p-3"
      >
        <h2 class="mb-2 text-lg font-bold">Formes</h2>
        <div class="grid grid-cols-2 gap-1">
          {#each TBI_BOARD_SHAPES as shape (shape.value)}
            <button
              type="button"
              class={tbiSegmentButton(currentShape === shape.value)}
              aria-pressed={currentShape === shape.value}
              onclick={() => setShape(shape.value)}
            >
              {@render shapeIcon(shape.value)}
              <span class="ml-2 flex-1 text-left">{shape.label}</span>
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
  {#each editingTools as tool (tool.value)}
    {@render toolButton(tool)}
  {/each}
</div>
{#snippet inkChoices()}
  <div
    class="flex flex-row items-center shrink-0"
    role="group"
    aria-label="Encre"
  >
    {#each TBI_BOARD_INKS as ink (ink.value)}
      <button
        type="button"
        class="flex items-center justify-center w-11 h-12"
        title={ink.label}
        aria-label={`Encre : ${ink.label}`}
        aria-pressed={$tbiBoardPen.color === ink.value}
        onclick={() => setInk(ink.value)}
      >
        <span
          class="block w-6 h-6 rounded-full"
          style:background={tbiInkColor(ink.value, $darkMode.isActive)}
          style:outline={$tbiBoardPen.color === ink.value
            ? `2px solid ${tbiInkColor(ink.value, $darkMode.isActive)}`
            : undefined}
          style:outline-offset="2px"
        ></span>
      </button>
    {/each}
  </div>
{/snippet}

{#snippet sizeChoices()}
  <div class={tbiSegment} role="group" aria-label="Épaisseur">
    {#each TBI_BOARD_SIZES as size (size.value)}
      <button
        type="button"
        class={tbiSegmentButton($tbiBoardPen.size === size.value)}
        title={size.label}
        aria-label={`Épaisseur : ${size.label}`}
        aria-pressed={$tbiBoardPen.size === size.value}
        onclick={() => setSize(size.value)}
      >
        <span
          class="block rounded-full bg-current"
          style:width="{size.dot}px"
          style:height="{size.dot}px"
        ></span>
      </button>
    {/each}
  </div>
{/snippet}

<div class="hidden @min-[72rem]:contents">
  {@render inkChoices()}
  {@render sizeChoices()}
</div>
<!-- Faute de place, encre et épaisseur passent dans un panneau : le bandeau ne doit pas déborder -->
<div class="relative @min-[72rem]:hidden">
  <button
    bind:this={inkButton}
    type="button"
    class={tbiButton($tbiOpenPanel === 'ink', 'px-0')}
    title="Encre et épaisseur"
    aria-label="Encre et épaisseur"
    aria-expanded={$tbiOpenPanel === 'ink'}
    onclick={() =>
      tbiOpenPanel.update((panel) => (panel === 'ink' ? null : 'ink'))}
  >
    <span
      class="block rounded-full ring-2 ring-coopmaths-canvas dark:ring-coopmathsdark-canvas"
      style:background={tbiInkColor($tbiBoardPen.color, $darkMode.isActive)}
      style:width="{currentDot}px"
      style:height="{currentDot}px"
    ></span>
  </button>
  {#if $tbiOpenPanel === 'ink'}
    <div
      use:dismissable={{
        onDismiss: () => tbiOpenPanel.set(null),
        ignore: () => [inkButton],
      }}
      data-tbi-chrome
      data-tbi-panel
      role="dialog"
      aria-label="Encre et épaisseur"
      class="{tbiPanel} absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3"
    >
      <h2 class="mb-1 text-lg font-bold">Encre</h2>
      {@render inkChoices()}
      <h2 class="mt-2 mb-1 text-lg font-bold">Épaisseur</h2>
      {@render sizeChoices()}
    </div>
  {/if}
</div>
<span class={tbiSeparator}></span>
<button
  type="button"
  class={tbiButton(false, 'text-2xl')}
  title="Annuler"
  aria-label="Annuler le dernier trait"
  disabled={!canUndo}
  onclick={() => undoTbiBoard(tabId, board.strokes)}
>
  <i class="bx bx-undo"></i>
</button>
<button
  type="button"
  class={tbiButton(false, 'text-2xl')}
  title="Rétablir"
  aria-label="Rétablir le dernier trait"
  disabled={!canRedo}
  onclick={() => redoTbiBoard(tabId, board.strokes)}
>
  <i class="bx bx-redo"></i>
</button>
<button
  type="button"
  class={tbiButton(false, 'text-2xl')}
  title="Tout effacer"
  aria-label="Tout effacer"
  disabled={board.strokes.length === 0}
  onclick={clear}
>
  <i class="bx bx-trash"></i>
</button>
<span class={tbiSeparator}></span>
<div class="relative">
  <button
    bind:this={backgroundButton}
    type="button"
    class={tbiButton($tbiOpenPanel === 'background')}
    title="Fond du tableau"
    aria-label="Fond du tableau"
    aria-expanded={$tbiOpenPanel === 'background'}
    onclick={() =>
      tbiOpenPanel.update((panel) =>
        panel === 'background' ? null : 'background',
      )}
  >
    <i class="bx bx-grid text-2xl"></i>
    <span class={labelClass}>Fond</span>
  </button>
  {#if $tbiOpenPanel === 'background'}
    <div
      use:dismissable={{
        onDismiss: () => tbiOpenPanel.set(null),
        ignore: () => [backgroundButton],
      }}
      data-tbi-chrome
      data-tbi-panel
      role="dialog"
      aria-label="Fond du tableau"
      class="{tbiPanel} absolute bottom-full {$tbiBarMirrored
        ? 'left-0'
        : 'right-0'} mb-2 w-[30rem] max-w-[calc(100vw-1.5rem)] p-3"
    >
      <h2 class="mb-2 text-lg font-bold">Fond du tableau</h2>
      <TbiBackgroundPicker {tabId} {board} />
    </div>
  {/if}
</div>
