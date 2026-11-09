<script lang="ts">
  import {
    exercicesParams,
    moveExercice,
    isReordering,
  } from '../../../../../lib/stores/generalStore'
  export let indice: number
  function monter() {
    isReordering.set(true)
    exercicesParams.update((l) => {
      return moveExercice(l, indice, indice - 1)
    })
    setTimeout(() => isReordering.set(false), 300)
  }
</script>

<button on:click={monter} aria-label="Monter l'exercice" class={indice === 0 ? 'hidden md:invisible' : ''}>
  <i
    class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-up-arrow-circle"
  ></i>
</button>
