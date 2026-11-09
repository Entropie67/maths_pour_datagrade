<script lang="ts">
  import Sortable from 'sortablejs'
  import ChipExo from './ChipExo.svelte'
  import {
    exercicesParams,
    moveExercice,
    isReordering,
  } from '../../../lib/stores/generalStore'
  import { get } from 'svelte/store'
  import { onMount } from 'svelte'
  import {
    uuidCount,
    exercisesUuidRanking,
  } from '../../../lib/components/counts'
  import type { ChipContentType } from '../../../lib/types'
  export let chipsListDisplayed: boolean
  let listIdsForChips: ChipContentType[] = []

  function buildChipsList(params: typeof $exercicesParams): ChipContentType[] {
    const lIFC: ChipContentType[] = []
    const ranks = exercisesUuidRanking(params)
    const counts = uuidCount(params)
    for (const [i, ex] of params.entries()) {
      const insert: string = `${
        counts[ex.uuid] > 1 ? ' [' + ranks[i] + ']' : ''
      }`
      const obj: ChipContentType = {
        ref: ex.id ?? ex.uuid,
        title: `${ex.id ?? ex.uuid}${insert}`,
        key: ex.uuid + '_' + (ex.alea || i.toString()),
      }
      lIFC.push(obj)
    }
    return lIFC
  }

  // Initialisation et mise à jour uniquement quand ce n'est pas un réordonnancement
  $: if (!$isReordering) {
    listIdsForChips = buildChipsList($exercicesParams)
  }

  onMount(() => {
    listIdsForChips = buildChipsList(get(exercicesParams))
    Sortable.create(document.getElementById('chips-list'), {
      animation: 150,
      // Erreur dans le linter : Parameter 'evt' implicitly has an 'any' type.
      // Sortable étant écrit en JavaScript on ne connait pas le type de `evt`.
      // @ts-ignore
      onEnd: (evt) => {
        isReordering.set(true)
        // Réordonner listIdsForChips pour rester synchronisé avec le DOM
        const [moved] = listIdsForChips.splice(evt.oldIndex, 1)
        listIdsForChips.splice(evt.newIndex, 0, moved)
        listIdsForChips = listIdsForChips
        // Mettre à jour le store
        exercicesParams.update((l) => {
          return moveExercice(l, evt.oldIndex, evt.newIndex)
        })
        setTimeout(() => isReordering.set(false), 300)
      },
    })
  })
</script>

<div class="w-full flex flex-col space-y-6">
  <div class="relative w-full flex flex-col">
    <button
      class="absolute -right-3 -top-3"
      type="button"
      aria-label="Fermer la liste"
      on:click={() => {
        chipsListDisplayed = false
      }}
    >
      <i
        class="bx bx-x text-2xl text-coopmaths-action hover:text-coopmaths-action-lightest"
      ></i>
    </button>
    <div class="text-coopmaths-struct font-semibold text-lg">
      Réorganisation des exercices
    </div>
    <div class="p-2 text-coopmaths-corpus-light text-sm font-extralight">
      Saisir un exercice et le déposer à la place souhaitée.
    </div>
  </div>
  <div
    class="w-full grid justify-items-stretch place-content-stretch grid-cols-1 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 2xl:grid-cols-10 gap-2 p-0 items-center overflow-x-auto whitespace-nowrap"
    id="chips-list"
  >
    {#each listIdsForChips as id, indice (id.key)}
      <ChipExo text={id.title} {indice} />
    {/each}
  </div>
</div>
