<script lang="ts">
  import { onMount } from 'svelte'
  import { fly } from 'svelte/transition'
  import { stringToCriterion } from '../../../lib/components/filters'
  import { debounce } from '../../../lib/components/time'
  import type { InterfaceParams } from '../../../lib/types'
  import type {
    JSONReferentielEnding,
    ResourceAndItsPath,
  } from '../../../lib/types/referentiels'
  import TypstExercisePreview from '../typst/addExercise/TypstExercisePreview.svelte'

  /**
   * Recherche plein écran de la vue mobile : mêmes résultats que la recherche
   * de la modale « Ajouter un exercice » (Ctrl/Cmd+K), chaque exercice affiché
   * en aperçu (énoncé généré, roue dentée, bouton d'ajout). Contrairement à la
   * version bureau, ce n'est pas une modale mais un panneau qui recouvre toute
   * la vue mobile.
   */
  type Props = {
    /** Ressources cherchables, aplaties (même source que la recherche bureau) */
    resourcesSet: ResourceAndItsPath[]
    /** Ajoute une ressource à la sélection avec les paramètres de l'aperçu */
    onAdd: (params: InterfaceParams) => void
    /** Nombre de fois où la ressource est déjà dans la sélection */
    selectedCount: (ending: JSONReferentielEnding) => number
    onClose: () => void
  }

  const { resourcesSet, onAdd, selectedCount, onClose }: Props = $props()

  let searchField: HTMLInputElement | undefined = $state()
  let searchInput = $state('')
  let searchResults = $state<ResourceAndItsPath[]>([])
  /** Nombre d'exercices ajoutés depuis l'ouverture (retour visuel) */
  let addedCount = $state(0)

  onMount(() => {
    searchField?.focus()
  })

  function getUniqueResults(list: ResourceAndItsPath[]): ResourceAndItsPath[] {
    const uniques: ResourceAndItsPath[] = []
    const treatedUuids: string[] = []
    for (const elt of list) {
      if (!treatedUuids.includes(elt.resource.uuid)) {
        treatedUuids.push(elt.resource.uuid)
        uniques.push(elt)
      }
    }
    return uniques
  }

  function updateSearchResults(input: string) {
    searchResults = getUniqueResults([
      ...stringToCriterion(input, true).meetCriterion(resourcesSet),
    ])
  }

  /**
   * Attend la fin de la saisie avant de lancer la recherche : chaque résultat
   * déclenche la génération d'un exercice (aperçu), une opération coûteuse
   * qu'il est inutile de relancer à chaque frappe.
   */
  const fetchSearchResults = debounce<typeof updateSearchResults>(
    updateSearchResults,
    800,
  )

  function onSearchInput() {
    if (searchInput.length === 0) {
      searchResults = []
    } else {
      fetchSearchResults(searchInput)
    }
  }

  function handleAdd(params: InterfaceParams) {
    onAdd(params)
    addedCount += 1
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') onClose()
  }}
/>

<div
  transition:fly={{ y: 300, duration: 200 }}
  class="fixed inset-0 z-[1100] flex flex-col
  bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <header
    class="flex shrink-0 flex-row items-center gap-2 px-3 py-3
    border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  >
    <button
      type="button"
      aria-label="Fermer la recherche"
      class="shrink-0 p-1 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
      onclick={onClose}
    >
      <i class="bx bx-chevron-left"></i>
    </button>
    <input
      bind:this={searchField}
      type="search"
      placeholder="🔍 Thème, identifiant..."
      bind:value={searchInput}
      oninput={onSearchInput}
      autocomplete="off"
      autocorrect="off"
      class="w-full rounded-lg px-3 py-2
      border border-coopmaths-action dark:border-coopmathsdark-action
      focus:border-coopmaths-action-lightest dark:focus:border-coopmathsdark-action-lightest
      focus:outline-0 focus:ring-0 focus:border-1
      bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark
      text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light text-sm
      placeholder-coopmaths-corpus-lightest dark:placeholder-coopmathsdark-corpus-lightest
      placeholder:italic placeholder-opacity-50"
    />
  </header>

  <div class="min-h-0 grow overflow-y-auto p-4">
    {#if searchInput.length === 0}
      <p
        class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        Saisissez un thème ou un identifiant pour rechercher un exercice.
      </p>
    {:else if searchResults.length !== 0}
      <ul class="flex flex-col gap-3">
        {#each searchResults as result (result.resource.uuid + ('id' in result.resource ? result.resource.id : ''))}
          <TypstExercisePreview
            ending={result.resource}
            count={selectedCount(result.resource)}
            onAdd={handleAdd}
          />
        {/each}
      </ul>
    {:else}
      <p
        class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
      >
        Aucun exercice ne correspond à cette recherche.
      </p>
    {/if}
  </div>

  <footer
    class="flex shrink-0 flex-row items-center justify-between gap-3 px-4 py-3
    border-t border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
  >
    <span
      class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      aria-live="polite"
    >
      {#if addedCount === 0}
        Choisissez un exercice à ajouter.
      {:else if addedCount === 1}
        1 exercice ajouté.
      {:else}
        {addedCount} exercices ajoutés.
      {/if}
    </span>
    <button
      type="button"
      class="rounded-lg px-4 py-1.5 font-bold
      bg-coopmaths-action text-coopmaths-canvas hover:bg-coopmaths-action-lightest
      dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas dark:hover:bg-coopmathsdark-action-lightest"
      onclick={onClose}
    >
      Terminer
    </button>
  </footer>
</div>
