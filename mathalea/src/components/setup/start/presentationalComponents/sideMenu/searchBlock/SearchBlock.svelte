<script lang="ts">
  import type { ResourceAndItsPath } from '../../../../../../lib/types/referentiels'
  import ReferentielEnding from '../referentielNode/ReferentielEnding.svelte'
  import SearchInput from './searchInput/SearchInput.svelte'

  export let resourcesSet: ResourceAndItsPath[]
  export let addExercise: (uuid: string, id: string) => void
  let foundResources: ResourceAndItsPath[] = []
  let inputSearch: string = ''
  let searchInput: SearchInput
  export const triggerUpdateFromSearchBlock = (): void =>
    searchInput.triggerUpdate()
</script>

<!--
  @component
  Bloc de recherche comprenant~:
  - un champ texte pour saisir la recherche
  - la liste des résultats éventuels de la recherche
  #### Paramètres
  - `resourcesSet` : l'ensemble des resources à chercher sous la forme
  d'une liste d'objets de type `ResourceAndItsPath`
 -->
<div class={`${$$props.class || ''}`}>
  <div class="p-4">
    <SearchInput
      bind:this={searchInput}
      origin={resourcesSet}
      bind:results={foundResources}
      bind:inputSearch
      on:filters-change
      {addExercise}
    />
  </div>
  <ul
    class="{inputSearch.length === 0 || foundResources.length === 0
      ? 'hidden'
      : 'flex flex-col justify-start w-full mt-4 mx-0 p-4 text-[10px] bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark'} "
  >
    {#each foundResources as foundResource}
      <li>
        <ReferentielEnding
          ending={foundResource.resource}
          nestedLevelCount={1}
        />
      </li>
    {/each}
  </ul>
</div>
