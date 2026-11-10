<script lang="ts">
  import { onMount, tick } from 'svelte'
  import type { QuizzStatusDataMap } from '../../../../modules/quizz/types'
  import QuizzTimer from '../presentationalComponents/QuizzTimer.svelte'
  import { quizzRenderDiv } from '../quizzRender'

  /** Énoncé seul, avant l'ouverture des réponses (barre = cooldown). */
  export let data: QuizzStatusDataMap['SHOW_QUESTION']

  let container: HTMLDivElement
  onMount(async () => {
    await tick()
    quizzRenderDiv(container)
  })
</script>

<div class="flex flex-col items-center justify-center gap-8 px-6 w-full">
  <div
    bind:this={container}
    class="w-11/12 max-w-7xl shadow-lg px-8 py-6 text-center
    quizz-text-question font-semibold
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
    text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    {@html data.question}
  </div>
  <QuizzTimer seconds={data.cooldown} />
</div>
