<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { getUniqueStringBasedOnTimeStamp } from '../../../../../../../lib/components/time'
  import {
    FILTER_SECTIONS_TITLES,
    type FilterType,
  } from '../../../../../../../lib/types'
  import type { Level } from '../../../../../../../lib/types/referentiels'
  import CheckboxWithLabel from '../../../../../../shared/forms/CheckboxWithLabel.svelte'
  import { allFilters, filtersHaveChanged } from '../../filtersStore'
  export let filterType: FilterType = 'levels'
  const timeTag: string = getUniqueStringBasedOnTimeStamp()
  const dispatch = createEventDispatcher()
  /**
   * Gérer le cochage des filtres. On a juste à gérer les niveaux multiples
   * collège et lycée qui concernent plusieurs niveaux.
   * @remarks __Bizarrerie__ : Pour être sûr que la fonction callback de `subsribe` du store
   * `allFilters` soit appelée, on ajoute 1 à la propriété `clicked`
   * @param selectedEntry
   */
  function handleFiltersChanges(selectedEntry: Level | string) {
    $filtersHaveChanged = true
    if (filterType === 'levels') {
      switch (selectedEntry) {
        case 'college':
        case 'lycee':
          Object.values($allFilters.levels[selectedEntry].values).forEach(
            (level) => {
              // on met tous les niveaux college/lycee à `true` ou `false`
              if ($allFilters.levels[selectedEntry].isSelected) {
                $allFilters.levels[level].isSelected = true
              } else {
                $allFilters.levels[level].isSelected = false
              }
            },
          )
          $allFilters.levels[selectedEntry].clicked++
          break
        default:
          $allFilters.levels[selectedEntry].clicked++
          break
      }
      // on décoche `college` si tous les niveaux de college ne sont pas cochés
      $allFilters.levels.college.values.forEach((level) => {
        if (!$allFilters.levels[level].isSelected) {
          $allFilters.levels.college.isSelected = false
        }
      })
      // on décoche `lycee` si tous les niveaux de lycee ne sont pas cochés
      $allFilters.levels.lycee.values.forEach((level) => {
        if (!$allFilters.levels[level].isSelected) {
          $allFilters.levels.lycee.isSelected = false
        }
      })
    } else {
      $allFilters[filterType][selectedEntry].clicked++
    }
  }
</script>

<div class={`${$$props.class || ''} flex flex-col`}>
  <div
    class="text-coopmaths-struct font-semibold text-sm px-1 border-b w-full border-coopmaths-struct"
  >
    {FILTER_SECTIONS_TITLES[filterType]}
  </div>
  <div>
    <ul class="w-full columns-[175px] gap-4 mt-2">
      {#each Object.entries($allFilters[filterType]) as [key, filter], i}
        <li
          class="break-inside-avoid flex-row justify-start items-center pr-4 pl-6 py-0 my-0 leading-none
          text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        >
          <CheckboxWithLabel
            id="checkbox-{key}-{i}-{timeTag}"
            bind:isChecked={filter.isSelected}
            label={filter.title}
            size="sm"
            on:change={() => {
              handleFiltersChanges(key)
              dispatch('filters-change')
            }}
          />
        </li>
      {/each}
    </ul>
  </div>
</div>
