<script lang="ts">
  import { onMount, tick } from 'svelte'
  import { quizzRenderDiv } from '../quizzRender'

  /** Panneau de correction affiché à la révélation (raisonnement MathALÉA). */
  export let html: string

  let container: HTMLDivElement
  onMount(async () => {
    await tick()
    quizzRenderDiv(container)
  })
</script>

<div
  class="w-11/12 max-w-7xl shadow-lg px-6 py-4
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
  text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <div
    class="quizz-text-correction font-bold text-coopmaths-struct dark:text-coopmathsdark-struct pb-1"
  >
    Correction
  </div>
  <div bind:this={container} class="quizz-text-correction font-light text-left">
    {@html html}
  </div>
</div>
