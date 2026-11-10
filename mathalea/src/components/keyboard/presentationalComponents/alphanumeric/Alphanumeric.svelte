<script lang="ts">
  import { alphanumericLayouts } from '../../layouts/alphanumericRows'
  import { isSpecialKey } from '../../types/keycap'
  import { keys } from '../../lib/keycaps'
  import type { AlphanumericPages, Keys } from '../../types/keyboardContent'
  import type { KeyCap } from '../../types/keycap'
  // import type { KeyCap } from '../../types/keycap'
  export let pageType: AlphanumericPages
  $: rows = alphanumericLayouts[pageType]
  export let clickKeycap: (
    data: KeyCap,
    event: MouseEvent,
    value?: Keys,
  ) => void
</script>

<div class="flex justify-center">
  <div
    class="flex flex-col w-2/3 space-y-1 md:space-y-4 bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark"
  >
    {#each rows as row, rowIndex (rowIndex)}
      <div
        class="flex flex-row w-full bg-coopmaths-canvas dark:bg-coopmathsdark-canvas-dark justify-evenly space-x-1 md:space-x-4"
      >
        {#each row as key (key)}
          <button
            type="button"
            class="key--{key} flex justify-center items-center grow h-10 text-mormal md:text-xl border-b-2 border-r border-r-slate-400 dark:border-r-gray-500 border-b-slate-300 dark:border-b-gray-600 active:border-b-0 active:border-r-0 text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light active:text-coopmaths-canvas active:translate-y-[1.5px] dark:active:text-coopmathsdark-canvas active:bg-coopmaths-action active:shadow-none dark:active:bg-coopmathsdark-action dark:active:shadow-none transition-transform ease-in-out shadow-[2px_2px_4px_rgba(180,180,180,0.5)]
            {isSpecialKey(key)
              ? 'bg-coopmaths-canvas-moredark dark:bg-coopmathsdark-canvas-moredark'
              : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest'}  py-1.5 px-2 md:py-2 md:px-4 text-center rounded-md font-mono"
            on:click={(e) => {
              clickKeycap(keys[key], e, key)
            }}
          >
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html keys[key].display}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  button.key--SPACE {
    flex: var(--special-flex, 3);
  }
</style>
