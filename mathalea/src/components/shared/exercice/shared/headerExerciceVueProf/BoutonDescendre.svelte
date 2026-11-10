<script lang="ts">
  import {
    exercicesParams,
    moveExercice,
    isReordering,
  } from '../../../../../lib/stores/generalStore'
  export let indice: number
  export let indiceLastExercice: number
  function descendre() {
    isReordering.set(true)
    exercicesParams.update((l) => {
      return moveExercice(l, indice, indice + 1)
    })
    setTimeout(() => isReordering.set(false), 300)
  }
</script>

<button
  on:click={descendre}
  aria-label="Descendre l'exercice"
  class={indice === indiceLastExercice ? 'hidden md:invisible' : ''}
>
  <i
    class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-down-arrow-circle"
  ></i>
</button>
