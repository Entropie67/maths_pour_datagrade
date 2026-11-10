<script lang="ts">
  import ButtonTextAction from '../../../shared/forms/ButtonTextAction.svelte'
  import { canOptions } from '../../../../lib/stores/canStore'
  import type { CanState } from '../../../../lib/types/can'
  export let state: CanState
  export let score: string
  export let time: string
</script>

<div
  class="h-full w-full flex flex-col items-center justify-center bg-coopmaths-struct dark:bg-coopmathsdark-canvas"
>
  <div
    id="counter"
    class="text-[130px] text-coopmaths-canvas dark:text-coopmathsdark-corpus font-black"
  >
    Fin !
  </div>
  <div
    class="flex flex-col md:flex-row space-x-0 md:space-x-4 space-y-2 md:space-y-0 py-4 md:py-10 items-center"
  >
    {#if $canOptions.isInteractive}
      <div
        id="score"
        class="text-3xl md:text-7xl text-coopmaths-canvas dark:text-coopmathsdark-corpus font-light"
      >
        Score : <span
          class="text-coopmaths-warn-800 dark:text-coopmathsdark-warn font-bold"
          >{score}</span
        >
      </div>
      <div
        class="hidden md:flex text-coopmaths-canvas dark:text-coopmathsdark-corpus text-3xl md:text-7xl"
      >
        &nbsp;—&nbsp;
      </div>
    {/if}
    <div
      id="score"
      class="text-3xl md:text-7xl text-coopmaths-canvas dark:text-coopmathsdark-corpus font-light"
    >
      Temps : <span
        class="text-coopmaths-warn-800 dark:text-coopmathsdark-warn font-bold"
        >{time}</span
      >
    </div>
  </div>
  {#if $canOptions.solutionsAccess}
    <ButtonTextAction
      text="Accéder aux solutions"
      class="p-2 md:p-4 font-bold rounded-lg text-sm md:text-xl mt-6 md:mt-10"
      on:click={() => {
        state = 'solutions'
      }}
    />
  {/if}
</div>
