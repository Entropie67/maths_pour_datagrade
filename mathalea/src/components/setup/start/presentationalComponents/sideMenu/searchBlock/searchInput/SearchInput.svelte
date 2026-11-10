<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import { stringToCriterion } from '../../../../../../../lib/components/filters'
  import {
    isExerciceItemInReferentiel,
    isTool,
    type ExerciceItemInReferentiel,
    type ResourceAndItsPath,
    type ToolItemInReferentiel,
    type Level,
    isStaticType,
    isExamItemInReferentiel,
  } from '../../../../../../../lib/types/referentiels'
  import {
    allFilters,
    getSelectedFiltersObjects,
    handleUncheckingMutipleFilters,
    filtersHaveChanged,
  } from '../../filtersStore'
  import type { FilterObject } from '../../../../../../../lib/types'
  import {
    getUniqueStringBasedOnTimeStamp,
    debounce,
  } from '../../../../../../../lib/components/time'
  import Filtres from './Filtres.svelte'
  import Chip from './Chip.svelte'
  import type { Unsubscriber } from 'svelte/store'
  import ButtonIcon from '../../../../../../shared/forms/ButtonIcon.svelte'
  import {
    sortArrayOfResourcesBasedOnProp,
    sortArrayOfResourcesBasedOnYearAndMonth,
  } from '../../../../../../../lib/components/sorting'
  export let origin: ResourceAndItsPath[]
  export let results: ResourceAndItsPath[] = []
  export let addExercise: (uuid: string, id: string) => void
  export let inputSearch: string = ''

  let searchField: HTMLInputElement
  let isFiltersVisible: boolean = false
  let selectedFilters: FilterObject<string | Level>[] = []
  let lastInput: string = ''
  let isInputFocused = false
  let isEnterDown: boolean = false
  let unsubscribeToFiltersStore: Unsubscriber

  const dispatch = createEventDispatcher()
  const timeStamp = getUniqueStringBasedOnTimeStamp()
  const fetchResults = debounce<typeof updateResults>(updateResults, 500)
  const inputSearchSamples = [
    'pythagore',
    '3e proba',
    'dnb+3e stat',
    'bac asie python',
    'crpe 2016+2015 aires',
  ]

  onMount(() => {
    typeWriter(`#searchInputField-${timeStamp}`, inputSearchSamples, true)
    unsubscribeToFiltersStore = allFilters.subscribe(() => {
      selectedFilters = [...getSelectedFiltersObjects()]
    })
  })

  onDestroy(() => {
    if (unsubscribeToFiltersStore) unsubscribeToFiltersStore()
  })

  $: if (inputSearch != null && inputSearch.length !== 0) {
    handleInput(inputSearch)
  } else {
    results.length = 0
    // Sans ça, retaper le même terme après avoir vidé le champ ne relance
    // aucune recherche (`handleInput` ne fait rien si `input === lastInput`)
    // et les résultats restent vides indéfiniment.
    lastInput = ''
  }

  // ===================================================================================
  //
  //                                Gestion de la recherche
  //
  // ===================================================================================
  function updateResults(input: string): void {
    if (input == null || input.length === 0) {
      results.length = 0
    } else {
      const resultsWithDuplicates = getResults(input)
      const unsortedResults = getUniques(resultsWithDuplicates)
      // on ordonne la liste de recherche
      // tri des exercices par type
      let nonStatics: ResourceAndItsPath[] = []
      let statics: ResourceAndItsPath[] = []
      const others: ResourceAndItsPath[] = []
      for (const item of unsortedResults) {
        if (isExerciceItemInReferentiel(item.resource)) {
          nonStatics.push(item)
        } else if (isStaticType(item.resource)) {
          statics.push(item)
        } else {
          others.push(item)
        }
      }
      // ordonner les exercices dans chaque catégorie :
      // -- année/mois décroissant pour examens
      // -- id ordre alpha pour les exercices
      nonStatics = [...sortArrayOfResourcesBasedOnProp(nonStatics, 'id')]
      statics = [
        ...sortArrayOfResourcesBasedOnYearAndMonth(statics, 'desc'),
      ].sort((eltA, eltB) => {
        // ranger dans les sujets d'examens identiques par numéro d'exercices croissant
        const nameA = eltA.resource.uuid.slice(0, -1)
        const nameB = eltB.resource.uuid.slice(0, -1)
        if (nameA.localeCompare(nameB) === 0) {
          if (
            isExamItemInReferentiel(eltA.resource) &&
            isExamItemInReferentiel(eltB.resource)
          ) {
            return (
              parseInt(eltA.resource.numeroInitial) -
              parseInt(eltB.resource.numeroInitial)
            )
          } else {
            return 0
          }
        } else {
          return 0
        }
      })
      results = [...nonStatics, ...statics, ...others]
    }
  }

  function getResults(input: string) {
    if (input.length === 0) {
      return []
    } else {
      return [...stringToCriterion(input, true).meetCriterion(origin)]
    }
  }

  function getUniques(results: ResourceAndItsPath[]) {
    const uniques: ResourceAndItsPath[] = []
    const treatedUuids: string[] = []
    for (const elt of results) {
      if (!treatedUuids.includes(elt.resource.uuid)) {
        treatedUuids.push(elt.resource.uuid)
        uniques.push(elt)
      }
    }
    return uniques
  }

  function handleInput(input: string) {
    const beginsWithQuote = input.replace(/^[\s"']/, '').length === 0
    if (input == null || input.length === 0 || beginsWithQuote) {
      results.length = 0
    } else {
      if (input !== lastInput) {
        lastInput = input
        fetchResults(input)
      }
      if ($filtersHaveChanged) {
        $filtersHaveChanged = false
        fetchResults(input)
      }
    }
  }

  export const triggerUpdate = (): void => {
    if (inputSearch != null && inputSearch.length !== 0) {
      handleInput(inputSearch)
    }
  }

  // ===================================================================================
  //
  //                                Gestion du clavier
  //
  // ===================================================================================
  function onFocusInput() {
    isInputFocused = true
  }
  function onBlurInput() {
    isInputFocused = false
  }

  /**
   * Recherche si la chaîne de l'input correspond à une ID de la liste des résultats.
   * @returns {ExerciceItemInReferentiel|ToolItemInReferentiel|null} renvoie l'exercice trouvé ou `null`
   */
  function matchOnResultsList(
    inputSearch: string,
  ): ExerciceItemInReferentiel | ToolItemInReferentiel | null {
    if (inputSearch == null || inputSearch.length === 0) return null
    for (const result of results) {
      if (
        isExerciceItemInReferentiel(result.resource) ||
        isTool(result.resource)
      ) {
        if (inputSearch === result.resource.id) {
          return result.resource
        }
      }
    }
    return null
  }
  /**
   * Si Entrée et qu'un seul exercice matche alors on ajoute l'exercice à la liste
   */
  function onEnterDown() {
    const matchingResource = matchOnResultsList(inputSearch)
    if (matchingResource !== null) {
      addExercise(matchingResource.uuid, matchingResource.id)
    }
  }
  /**
   *
   * @param event
   */
  function onKeyDown(event: KeyboardEvent) {
    if (event.repeat) return
    switch (event.key) {
      case 'Enter':
        // l'écouteur est sur window : Entrée ne doit être bloquée que dans le
        // champ de recherche (sinon plus de saut de ligne dans un textarea)
        if (isInputFocused) {
          isEnterDown = true
          event.preventDefault()
        }
        break
    }
    if (isEnterDown) {
      onEnterDown()
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        isEnterDown = false
        break
    }
  }
  /**
   * Permet d'afficher séquentiellement une liste de chaînes de caractères
   * dans un champ de recherche à la place du placeholder
   * @see https://stackoverflow.com/a/57903237/6625987
   * @param selectorTarget
   * @param textList
   * @param placeholder
   * @param i
   * @param textListI
   * @param delayMs
   */
  function typeWriter(
    selectorTarget: string,
    textList: string[],
    placeholder = false,
    i = 0,
    textListI = 0,
    delayMs = 100,
  ) {
    if (lastInput === '') {
      if (!i) {
        if (placeholder) {
          const inputDiv = document.querySelector(
            selectorTarget,
          ) as HTMLInputElement
          if (inputDiv) {
            inputDiv.placeholder = ''
          }
        } else {
          const inputDiv = document.querySelector(
            selectorTarget,
          ) as HTMLInputElement
          if (inputDiv) {
            inputDiv.innerHTML = ''
          }
        }
      }
      const txt = textList[textListI]
      if (i < txt.length) {
        if (placeholder) {
          const inputDiv = document.querySelector(
            selectorTarget,
          ) as HTMLInputElement
          if (inputDiv) {
            inputDiv.placeholder += txt.charAt(i)
          }
        } else {
          const inputDiv = document.querySelector(
            selectorTarget,
          ) as HTMLInputElement
          if (inputDiv) {
            inputDiv.innerHTML += txt.charAt(i)
          }
        }
        i++
        setTimeout(
          typeWriter,
          delayMs,
          selectorTarget,
          textList,
          placeholder,
          i,
          textListI,
        )
      } else {
        textListI++
        if (typeof textList[textListI] === 'undefined') {
          setTimeout(
            typeWriter,
            delayMs * 7,
            selectorTarget,
            textList,
            placeholder,
          )
        } else {
          i = 0
          setTimeout(
            typeWriter,
            delayMs * 7,
            selectorTarget,
            textList,
            placeholder,
            i,
            textListI,
          )
        }
      }
    } else {
      const inputDiv = document.querySelector(
        selectorTarget,
      ) as HTMLInputElement
      if (inputDiv) {
        inputDiv.placeholder = '🔍 Thème, identifiant...'
      }
    }
  }
</script>

<!--
  @component
  Champ de texte pour recherche d'exercices
  ### Paramètres
  - **origin** (_ResourceAndItsPath[]_) : le référentiel à rechercher (déplier dans un tableau)
  - **result** (_ResourceAndItsPath[]_) : la liste des entrées correspondant au texte dans le champ de recherche
 -->
<svelte:window on:keydown={onKeyDown} on:keyup={onKeyUp} />
<div class="flex flex-col justify-start items-center">
  <div class="relative flex flex-col w-full">
    <input
      type="search"
      id="searchInputField-{timeStamp}"
      data-tour="search-input"
      class="w-full border border-coopmaths-action dark:border-coopmathsdark-action focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest focus:outline-0 focus:ring-0 focus:border-1 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light text-sm placeholder-coopmaths-corpus-lightest dark:placeholder-coopmathsdark-corpus-lightest placeholder:italic placeholder-opacity-50"
      placeholder="🔍 Thème, identifiant..."
      bind:value={inputSearch}
      bind:this={searchField}
      on:focus={onFocusInput}
      on:blur={onBlurInput}
      autocomplete="off"
      autocorrect="off"
      name="”notASearchField”"
    />
    <!-- Invite pour presser Entrée lors d'un match input = ID d'exo -->
    <div
      class="absolute -bottom-6 {matchOnResultsList(inputSearch) !== null &&
      isInputFocused
        ? 'flex'
        : 'hidden'} items-center pl-1 italic font-extralight text-xs text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
    >
      Presser <span class="font-normal mx-1">Entrée</span> pour ajouter l'exercice
    </div>
    <!-- Bouton pour effacer l'input de recherche -->
    <ButtonIcon
      icon="bxs-tag-x text-2xl"
      ariaLabel="Effacer la recherche"
      class="absolute right-2 top-1"
      disabled={inputSearch.length === 0}
      on:click={() => {
        inputSearch = ''
      }}
    />
    <!-- Bouton pour afficher les filtres -->
    <button
      type="button"
      class="absolute right-2 -bottom-6 text-sm text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest hover:dark:text-coopmathsdark-action-lightest"
      on:click={() => {
        isFiltersVisible = !isFiltersVisible
      }}
    >
      Filtrer les exercices <i class="bx bx-filter-alt" aria-hidden="true"></i>
    </button>
  </div>
  <!-- Chips des filtres -->
  <div
    class={selectedFilters.length === 0
      ? 'hidden'
      : 'flex w-full flex-row flex-wrap justify-start text-sm mt-6 leading-tight'}
  >
    {#each selectedFilters as filter}
      <Chip
        text={filter.content.title}
        textColor="canvas"
        bgColor="struct"
        isVisible={true}
        on:action={() => {
          $allFilters[filter.type][filter.key].isSelected = false
          handleUncheckingMutipleFilters(filter.key)
          dispatch('filters-change')
          $filtersHaveChanged = true
          triggerUpdate()
        }}
      />
    {/each}
  </div>
  <!-- Filtres -->
  <div class={isFiltersVisible ? 'flex flex-col w-full mt-4' : 'hidden'}>
    <Filtres class="mt-2" filterType="levels" on:filters-change />
    <Filtres class="mt-2" filterType="specs" on:filters-change />
    <Filtres class="mt-2" filterType="types" on:filters-change />
  </div>
</div>
