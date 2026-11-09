<script lang="ts">
  import type { StaticItemInreferentiel } from '../../../lib/types/referentiels'
  import StarIcon from '../icons/StarIcon.svelte'
  import { exercicesParams } from '../../../lib/stores/generalStore'

  export let exercise: StaticItemInreferentiel
  export let reversed: boolean = false
  export let selected: boolean = false

  let listeCodes: string[]
  // on compte réactivement le nombre d'occurences
  // de la ressource dans la liste des sélectionnés
  $: {
    listeCodes = []
    for (const entry of $exercicesParams) {
      listeCodes.push(entry.uuid)
    }
    listeCodes = listeCodes
  }

  function addExerciseToList() {
    exercicesParams.update((list) => [...list, { uuid: exercise.uuid }])
  }
  const isPresent = (code: string) => {
    return code === exercise.uuid
  }
  function removeExerciseFromList() {
    const matchingIndex = listeCodes.findIndex(isPresent)
    exercicesParams.update((list) => [
      ...list.slice(0, matchingIndex),
      ...list.slice(matchingIndex + 1),
    ])
  }
  function handelSelection() {
    selected = !selected
    if (selected) {
      addExerciseToList()
    } else {
      removeExerciseFromList()
    }
  }
</script>

<button
  type="button"
  class="block relative w-full rounded-lg bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark shadow-lg border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  on:click={handelSelection}
>
  <div class="{reversed ? 'hide' : 'block'} ">
    <img
      src={exercise.png}
      alt="{exercise.uuid} image"
      class="object-fill rounded-t-lg"
    />
  </div>
  <div class="p-2">
    <h5
      class="mb-2 text-lg font-bold leading-tight text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      {exercise.uuid}
    </h5>
  </div>
  <div class="absolute -bottom-4 left-1/2 -translate-x-1/2">
    <div
      class="rounded-full h-8 w-8 bg-coopmaths-action text-coopmaths-canvas flex justify-center items-center hover:animate-pulse"
    >
      <i class="bx bx-sm {selected ? 'bx-minus' : 'bx-plus'}"></i>
    </div>
  </div>
  {#if selected}
    <div class="absolute top-3 right-3 rotate-frac">
      <div class="relative">
        <StarIcon
          class="container top-0 left-0 h-12 w-12 text-coopmaths-warn-800 dark:text-coopmathsdark-warn"
        />
        <i
          class="container absolute top-1 left-[0.1rem] bx bx-check bx-md text-coopmaths-canvas dark:text-coopmathsdark-canvas"
        ></i>
      </div>
    </div>
  {/if}
</button>

<style>
  @-webkit-keyframes rotation {
    0%,
    70% {
      -webkit-transform: rotate(0deg);
    }
    80%,
    100% {
      -webkit-transform: rotate(360deg);
    }
  }
  @keyframes rotation {
    0%,
    70% {
      transform: rotate(0deg);
    }
    80%,
    100% {
      transform: rotate(360deg);
    }
  }
  .rotate-frac {
    -webkit-animation: rotation 4s infinite linear;
    animation: rotation 4s infinite linear;
  }
</style>
