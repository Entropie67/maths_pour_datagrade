<script lang="ts">
  import { mathaleaFormatExercice } from '../../../../../../lib/mathalea'
  import type { Serie } from '../../../types'

  export let isQuestionsVisible: boolean | undefined
  export let isCorrectionVisible: boolean | undefined
  export let seriesIndex: number
  export let order: number[]
  export let series: Serie[]
  export let correctionsSteps: number[]
  export let zoom: string
</script>

<div
  class="p-6 pb-2 text-3xl font-black
  text-coopmaths-struct dark:text-coopmathsdark-struct"
>
  {#if series.length > 1}
    Série {seriesIndex + 1}
  {:else}
    {isQuestionsVisible ? 'Questions' : ''}
    {isCorrectionVisible && isQuestionsVisible ? ' / ' : ''}
    {isCorrectionVisible ? 'Réponses' : ''}
  {/if}
</div>
<div
  class="mt-2
  mx-2 lg:mx-6"
>
  {#each order as i, index (series[seriesIndex].keys[i] + zoom + '-' + i)}
    <div class="flex flex-row my-4">
      <div class="pr-2">
        <span
          class="font-black
          text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          {index + 1})
        </span>
      </div>
      <div class="flex flex-col justify-start items-start">
        {#if isQuestionsVisible}
          <div>
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            {@html mathaleaFormatExercice(series[seriesIndex].questions[i])}
          </div>
        {/if}
        {#if isCorrectionVisible || correctionsSteps.includes(i)}
          <div
            class="relative self-start max-w-full border-l-[3px] mt-6 py-2 pl-6
              border-l-coopmaths-struct dark:border-l-coopmathsdark-struct
              text-coopmaths-corpus dark:text-coopmathsdark-corpus"
          >
            <div class="container overflow-x-auto overflow-y-hidden">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -->
              {@html mathaleaFormatExercice(series[seriesIndex].corrections[i])}
            </div>
            <div
              class="absolute -left-0.75 -top-3.75 py-[1.5px] px-3 rounded-t-md
                font-semibold text-xs
                bg-coopmaths-struct dark:bg-coopmathsdark-struct
                text-coopmaths-canvas dark:text-coopmathsdark-canvas"
            >
              Correction
            </div>
            <div
              class="absolute bottom-0 left-0 border-b-[3px] w-4
                border-coopmaths-struct dark:border-coopmathsdark-struct"
            ></div>
          </div>
        {/if}
      </div>
    </div>
  {/each}
</div>
