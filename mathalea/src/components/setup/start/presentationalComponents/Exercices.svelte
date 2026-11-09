<script lang="ts">
  import { flip } from 'svelte/animate'
  import { isReordering } from '../../../../lib/stores/generalStore'
  import type { InterfaceParams } from '../../../../lib/types'
  import Footer from '../../../Footer.svelte'
  import Exercice from '../../../shared/exercice/Exercice.svelte'
  import MathadataBanner from './MathadataBanner.svelte'

  export let exercicesParams: InterfaceParams[]
  export let toggleSidenav: (open: boolean) => void
</script>

<div
  id="exercisesWrapper"
  class="flex flex-col w-full md:h-full justify-between md:pl-4"
>
  <div class="flex flex-col md:mt-9 xl:mt-0">
    <MathadataBanner {exercicesParams} />
    {#each exercicesParams as paramsExercice, i (paramsExercice)}
      <div id="exo{i}" animate:flip={{ duration: $isReordering ? (d) => 30 * Math.sqrt(d) : 0 }}>
        <Exercice
          {paramsExercice}
          {toggleSidenav}
          indiceExercice={i}
          indiceLastExercice={exercicesParams.length - 1}
          on:exerciseRemoved
        />
      </div>
    {/each}
  </div>
  <div class="hidden md:flex items-center justify-center">
    <Footer />
  </div>
</div>
