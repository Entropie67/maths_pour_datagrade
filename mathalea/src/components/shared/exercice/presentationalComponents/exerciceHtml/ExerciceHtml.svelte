<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type TypeExercice from '../../../../../exercices/Exercice'
  import { isMenuNeededForExercises } from '../../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../../lib/stores/globalOptions'
  import type { VueType } from '../../../../../lib/VueType'
  import HeaderExerciceVueProf from '../../shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import HeaderExerciceVueEleve from '../shared/HeaderExerciceVueEleve.svelte'
  export let vue: VueType | undefined
  export let exercise: TypeExercice
  export let indiceExercice: number
  export let indiceLastExercice: number

  let divExercice: HTMLDivElement

  const headerExerciceProps = {
    isMenuNeededForExercises: true,
    title: exercise.titre,
    indiceExercice: indiceExercice,
  }

  onMount(async () => {
    if (exercise.html != null) {
      divExercice.appendChild(exercise.html)
    }
    const exercicesAffiches = new window.Event('addedToDom', { bubbles: true })
    divExercice.children[0].dispatchEvent(exercicesAffiches)
  })

  onDestroy(() => {
    if (exercise.destroy != null) {
      exercise.destroy()
    }
  })

  $: {
    headerExerciceProps.indiceExercice = indiceExercice
  }
</script>

{#if vue === 'eleve'}
  <HeaderExerciceVueEleve
    {...headerExerciceProps}
    isMenuNeededForExercises={$isMenuNeededForExercises}
    presMode={$globalOptions.presMode ?? 'liste_exos'}
    zoom={$globalOptions.z ?? 1}
    seed={exercise.seed}
  />
{:else}
  <HeaderExerciceVueProf
    {...headerExerciceProps}
    id={exercise.id ?? ''}
    interactifReady={exercise.interactifReady}
    interactifObligatoire={exercise.interactifObligatoire}
    {indiceLastExercice}
    on:exerciseRemoved
  />
{/if}
<section
  id="insert-html-{indiceExercice}"
  class="mt-6 mb-2 ml-2 lg:mx-5 w-full"
>
  <div bind:this={divExercice}></div>
</section>
