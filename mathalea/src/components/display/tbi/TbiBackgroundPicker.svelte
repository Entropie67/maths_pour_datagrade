<script lang="ts">
  import {
    setTbiTabBackground,
    setTbiTabGridSize,
  } from '../../../lib/stores/tbiStore'
  import {
    TBI_BOARD_BACKGROUNDS,
    TBI_DEFAULT_GRID_SIZE,
    TBI_GRID_MAX,
    TBI_GRID_MIN,
    TBI_GRID_STEP,
    type TbiBoard,
  } from '../../../lib/tbiBoard'

  /** Choix du fond d'un onglet et de la taille de son quadrillage */
  interface Props {
    tabId: string
    /** Absent : l'onglet n'a encore ni fond ni écriture */
    board?: TbiBoard
  }

  let { tabId, board }: Props = $props()

  const background = $derived(board?.background ?? 'blank')
  const gridSize = $derived(board?.gridSize ?? TBI_DEFAULT_GRID_SIZE)
</script>

<div class="grid grid-cols-4 gap-2">
  {#each TBI_BOARD_BACKGROUNDS as option (option.value)}
    <button
      type="button"
      class="flex flex-col items-center justify-center gap-1 h-24 rounded-xl text-base font-semibold bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest {background ===
      option.value
        ? 'outline-3 outline-coopmaths-struct dark:outline-coopmathsdark-struct'
        : ''}"
      aria-pressed={background === option.value}
      onclick={() => setTbiTabBackground(tabId, option.value)}
    >
      <span
        class="preview bg-{option.value} block w-16 h-10 rounded border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
      ></span>
      {option.label}
    </button>
  {/each}
</div>
{#if background !== 'blank'}
  <label
    class="flex flex-row items-center gap-3 mt-2 min-h-12 text-lg font-semibold"
  >
    <span class="shrink-0">Taille</span>
    <input
      type="range"
      class="tbi-slider flex-1 min-w-0"
      min={TBI_GRID_MIN}
      max={TBI_GRID_MAX}
      step={TBI_GRID_STEP}
      value={gridSize}
      aria-label="Taille du quadrillage"
      oninput={(event) =>
        setTbiTabGridSize(tabId, Number(event.currentTarget.value))}
    />
    <span class="w-20 shrink-0 text-right tabular-nums"
      >{Math.round(gridSize * 100)}&nbsp;%</span
    >
  </label>
{/if}

<style>
  /* curseur assez grand pour le doigt sur un tableau */
  .tbi-slider {
    --thumb: var(--color-coopmaths-struct);
    appearance: none;
    height: 48px;
    background: transparent;
    cursor: pointer;
  }
  :global(.dark) .tbi-slider {
    --thumb: var(--color-coopmathsdark-struct);
  }
  .tbi-slider::-webkit-slider-runnable-track {
    height: 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--thumb) 30%, transparent);
  }
  .tbi-slider::-moz-range-track {
    height: 8px;
    border-radius: 4px;
    background: color-mix(in srgb, var(--thumb) 30%, transparent);
  }
  .tbi-slider::-webkit-slider-thumb {
    appearance: none;
    width: 32px;
    height: 32px;
    margin-top: -12px;
    border: 0;
    border-radius: 50%;
    background: var(--thumb);
  }
  .tbi-slider::-moz-range-thumb {
    width: 32px;
    height: 32px;
    border: 0;
    border-radius: 50%;
    background: var(--thumb);
  }
  .preview {
    --unit: 10px;
    --line: color-mix(in srgb, var(--color-coopmaths-struct) 22%, transparent);
    --line-strong: color-mix(
      in srgb,
      var(--color-coopmaths-struct) 55%,
      transparent
    );
    background-color: var(--color-coopmaths-canvas);
  }
  :global(.dark) .preview {
    background-color: var(--color-coopmathsdark-canvas);
  }
  .bg-grid {
    background-image:
      linear-gradient(var(--line-strong) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-strong) 1px, transparent 1px);
    background-size: var(--unit) var(--unit);
  }
  .bg-seyes {
    background-image:
      linear-gradient(var(--line-strong) 1px, transparent 1px),
      linear-gradient(var(--line) 1px, transparent 1px),
      linear-gradient(90deg, var(--line-strong) 1px, transparent 1px);
    background-size:
      var(--unit) var(--unit),
      var(--unit) calc(var(--unit) / 4),
      var(--unit) var(--unit);
  }
  .bg-dots {
    background-image: radial-gradient(
      var(--line-strong) 1.2px,
      transparent 1.6px
    );
    background-size: var(--unit) var(--unit);
  }
</style>
