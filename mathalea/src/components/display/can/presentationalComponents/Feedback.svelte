<!--
  @component
  Feedback affiché après la validation d'une question lorsque le réglage
  « feedback après chaque question » est actif (`canOptions.feedbackMode`).

  La correction n'est montrée que si l'enseignant a autorisé l'accès aux
  solutions (`canOptions.solutionsAccess`). Le bilan global (score et
  solutions) reste affiché à la fin de la course.
-->
<script lang="ts">
  import { onMount } from 'svelte'
  import { mathaleaRenderDiv } from '../../../../lib/mathalea'
  import { canOptions } from '../../../../lib/stores/canStore'

  export let isCorrect: boolean
  export let consigneCorrection: string
  export let correction: string

  let container: HTMLDivElement

  onMount(() => {
    if (container) mathaleaRenderDiv(container)
  })
</script>

<div
  id="can-feedback"
  bind:this={container}
  class="w-full px-4 md:px-20 lg:px-32 flex flex-col items-center space-y-2 mb-6 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <div
    id="can-feedback-result"
    class="flex items-center space-x-2 text-2xl font-bold {isCorrect
      ? 'text-coopmaths-warn-800 dark:text-green-500'
      : 'text-red-500 dark:text-coopmathsdark-warn'}"
  >
    <i class="bx {isCorrect ? 'bxs-check-square' : 'bxs-x-square'}"></i>
    <span>{isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse.'}</span>
  </div>
  {#if $canOptions.solutionsAccess}
    <div
      class="p-2 text-xl text-pretty bg-coopmaths-warn-200 dark:bg-coopmathsdark-warn-lightest text-coopmaths-corpus dark:text-coopmathsdark-corpus-darkest"
    >
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html consigneCorrection}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html correction}
    </div>
  {/if}
</div>
