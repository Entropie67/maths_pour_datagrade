<script lang="ts">
  import { canOptions } from '../../../../lib/stores/canStore'
  import type { QuestionResult } from '../../../../lib/types'
  import type { CanState } from '../../../../lib/types/can'

  export let current: number
  export let state: CanState
  export let resultsByQuestion: QuestionResult[]
</script>

<div
  aria-label="course pagination"
  class="w-full md:hidden flex flex-row justify-center items-centers py-4"
>
  <div class="relative block">
    <div
      class="rounded-full px-3 py-1.5 text-sm md:text-base font-black transition-all duration-300 text-coopmaths-canvas dark:text-coopmathsdark-canvas bg-coopmaths-struct dark:bg-coopmathsdark-struct"
    >
      {current + 1}
    </div>
    {#if state === 'race'}
      <div
        class="absolute -bottom-1 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-coopmaths-struct
        {$canOptions.isInteractive && $canOptions.questionGetAnswer[current]
          ? 'flex'
          : 'hidden'}"
      ></div>
    {/if}
    {#if state === 'solutions'}
      <div class="absolute -bottom-4 left-1/2 -translate-x-1/2 flex">
        <i
          class="bx {resultsByQuestion[current]
            ? 'bxs-check-square text-coopmaths-warn-800 dark:text-green-500'
            : 'bxs-x-square text-red-500 dark:text-coopmathsdark-warn'}"
        ></i>
      </div>
    {/if}
  </div>
</div>
