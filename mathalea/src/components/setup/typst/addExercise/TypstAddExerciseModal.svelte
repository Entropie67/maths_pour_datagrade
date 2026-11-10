<script lang="ts">
  import { onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { stringToCriterion } from '../../../../lib/components/filters'
  import {
    nodeCode,
    nodeLabel,
    parentPath,
    resolveNode,
    sectionPath,
    splitChildren,
    typstMenuSectionsForLocale,
  } from '../../../../lib/components/mobileMenu'
  import { debounce } from '../../../../lib/components/time'
  import { banquesExternes } from '../../../../lib/stores/banquesExternesStore'
  import { exercicesParams } from '../../../../lib/stores/generalStore'
  import { referentielLocale } from '../../../../lib/stores/languagesStore'
  import {
    buildResourcesSet,
    getReferentiels,
  } from '../../../../lib/stores/referentielsStore'
  import type { InterfaceParams } from '../../../../lib/types'
  import {
    isExerciceItemInReferentiel,
    isTool,
    type JSONReferentielEnding,
    type ReferentielInMenu,
    type ResourceAndItsPath,
  } from '../../../../lib/types/referentiels'
  import MobileTile from '../../mobile/MobileTile.svelte'
  import TypstExercisePreview from './TypstExercisePreview.svelte'

  /**
   * Modale « Ajouter un exercice » de la vue Typst.
   *
   * Même navigation que la vue mobile (rubrique > niveau > thèmes >
   * sous-thèmes), enrichie de la Course aux nombres et des ressources
   * complémentaires (voir `views` dans `src/json/mobileMenu.json`). Les
   * exercices d'un thème sont tous affichés en aperçu, chacun paramétrable
   * (roue dentée) et ajoutable à la fiche sans quitter la modale.
   */
  type Props = {
    /** Ajoute une ressource à la fiche (traité par `Typst.svelte`) */
    onAdd: (params: InterfaceParams) => void
    onClose: () => void
    /** Chemin d'arrivée : [rubrique, niveau, ...clés du référentiel] (vue Parcours) */
    initialPath?: string[]
    /** Toute la page plutôt qu'une boîte de dialogue (vue Parcours) */
    fullScreen?: boolean
    /** Réglages des exercices dépliés d'emblée (vue Parcours) */
    settingsOpen?: boolean
    /** Ce qui reçoit les exercices, pour les libellés (« la fiche » par défaut) */
    target?: string
    /** Exercices déjà ajoutés, à compter sur les aperçus (la fiche par défaut) */
    selection?: InterfaceParams[]
  }

  const {
    onAdd,
    onClose,
    initialPath = [],
    fullScreen = false,
    settingsOpen = false,
    target = 'la fiche',
    selection,
  }: Props = $props()

  const referentiels: ReferentielInMenu[] = $derived.by(() => {
    // dépendance explicite : les banques externes sont chargées de façon
    // asynchrone au démarrage, le menu doit se reconstruire à leur arrivée
    void $banquesExternes
    return getReferentiels(get(referentielLocale))
  })
  const typstMenuSections = typstMenuSectionsForLocale(get(referentielLocale))

  /** Chemin courant : [rubrique, niveau, ...clés du référentiel]. */
  // svelte-ignore state_referenced_locally
  let path = $state<string[]>([...initialPath])
  /** Nombre d'exercices ajoutés depuis l'ouverture (retour visuel) */
  let addedCount = $state(0)

  /** Ressources cherchables, aplaties (même source que la recherche mobile) */
  const resourcesSet = $derived(buildResourcesSet(referentiels))

  let searchField: HTMLInputElement | undefined = $state()
  let searchInput = $state('')
  let searchResults = $state<ResourceAndItsPath[]>([])

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
   * Attend la fin de la saisie avant de lancer la recherche : chaque
   * résultat déclenche la génération d'un exercice (aperçu), une opération
   * coûteuse qu'il est inutile de relancer à chaque frappe.
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

  const section = $derived(typstMenuSections.find((s) => s.id === path[0]))
  const entry = $derived(section?.entries.find((e) => e.id === path[1]))
  const node = $derived(
    entry === undefined
      ? undefined
      : resolveNode(referentiels, entry.referentiel, [
          ...entry.path,
          ...path.slice(2),
        ]),
  )
  const children = $derived(splitChildren(node))

  const title = $derived.by(() => {
    if (searchInput.length !== 0) return 'Résultats de la recherche'
    if (path.length === 0) return 'Ajouter un exercice'
    if (path.length === 1) return section?.title ?? ''
    if (path.length === 2) return entry?.title ?? ''
    return nodeLabel(path[path.length - 1])
  })

  /**
   * Compte le nombre de fois où une ressource est déjà dans la fiche. Les
   * exercices MathALÉA et les outils sont distingués par leur `id` : plusieurs
   * références peuvent partager un même `uuid`.
   */
  function selectedCount(ending: JSONReferentielEnding): number {
    return (selection ?? $exercicesParams).filter((item) => {
      if (item.uuid !== ending.uuid) return false
      if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
        return item.id === ending.id
      }
      return true
    }).length
  }

  function navigate(newPath: string[]) {
    path = newPath
  }

  function goBack() {
    path = parentPath(typstMenuSections, path)
  }

  function handleAdd(params: InterfaceParams) {
    onAdd(params)
    addedCount += 1
  }

  /** Corps scrollable de la modale, cible du renvoi de scroll (voir plus bas) */
  let scrollableBody: HTMLDivElement | undefined = $state()

  /**
   * Un scroll qui atterrit sur le fond assombri (en dehors de la boîte de
   * dialogue elle-même) est perdu pour l'utilisateur : rien ne bouge, et ça
   * ressemble à une modale figée. On le redirige vers le contenu
   * défilable, comme si le fond faisait partie de la modale.
   */
  function onBackdropWheel(e: WheelEvent) {
    if (e.target !== e.currentTarget || scrollableBody == null) return
    scrollableBody.scrollTop += e.deltaY
    e.preventDefault()
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === 'Escape') onClose()
  }}
/>

<!-- svelte-ignore a11y_no_static_element_interactions, a11y_click_events_have_key_events -->
<div
  class="fixed inset-0 z-1100 flex items-center justify-center bg-black/50 {fullScreen
    ? ''
    : 'p-4'}"
  onclick={(e) => {
    if (e.target === e.currentTarget) onClose()
  }}
  onwheel={onBackdropWheel}
>
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Ajouter un exercice à {target}"
    class="flex w-full flex-col overflow-hidden shadow-xl
    {fullScreen ? 'h-full' : 'h-[85vh] max-w-4xl rounded-lg'}
    bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <header
      class="flex shrink-0 flex-row items-center gap-2 border-b px-4 py-3
      border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      {#if path.length > 0 && searchInput.length === 0}
        <button
          type="button"
          aria-label="Revenir à la catégorie précédente"
          class="shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
          onclick={goBack}
        >
          <i class="bx bx-chevron-left"></i>
        </button>
      {/if}
      <h2
        class="min-w-0 grow truncate text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html title}
      </h2>
      <button
        type="button"
        aria-label="Fermer"
        class="shrink-0 text-2xl text-coopmaths-action dark:text-coopmathsdark-action"
        onclick={onClose}
      >
        <i class="bx bx-x"></i>
      </button>
    </header>

    <div
      class="shrink-0 border-b px-4 py-3
      border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <input
        bind:this={searchField}
        type="search"
        data-tour="add-exercise-search-input"
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
    </div>

    <div
      bind:this={scrollableBody}
      data-tour="add-exercise-results"
      class="min-h-0 grow overflow-y-auto p-4"
    >
      <!-- Contenu plus étroit que la modale : les marges de part et
           d'autre restent du fond défilable, pas un aperçu, pour qu'on
           puisse y poser la molette sans qu'un exercice ne capte le scroll. -->
      <div class="mx-auto w-full">
        {#if searchInput.length !== 0}
          <!-- Résultats de recherche -->
          {#if searchResults.length !== 0}
            <ul class="flex flex-col gap-3">
              {#each searchResults as result (result.resource.uuid + ('id' in result.resource ? result.resource.id : ''))}
                <TypstExercisePreview
                  ending={result.resource}
                  count={selectedCount(result.resource)}
                  onAdd={handleAdd}
                  {settingsOpen}
                  {target}
                  settingsAside={fullScreen}
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
        {:else if path.length === 0}
          <!-- Rubriques -->
          <div class="flex flex-col gap-3">
            {#each typstMenuSections as menuSection (menuSection.id)}
              <MobileTile
                size="large"
                title={menuSection.title}
                subtitle={menuSection.subtitle}
                icon={menuSection.icon}
                onclick={() => navigate(sectionPath(menuSection))}
              />
            {/each}
          </div>
        {:else if path.length === 1}
          <!-- Niveaux de la rubrique choisie -->
          <div class="flex flex-col gap-3">
            {#each section?.entries ?? [] as menuEntry (menuEntry.id)}
              <MobileTile
                title={menuEntry.title}
                onclick={() => navigate([...path, menuEntry.id])}
              />
            {/each}
          </div>
        {:else}
          <!-- Thèmes, sous-thèmes puis exercices en aperçu -->
          <div class="flex flex-col gap-3">
            {#each children.categories as key (key)}
              <MobileTile
                title={nodeLabel(key)}
                subtitle={nodeCode(key)}
                onclick={() => navigate([...path, key])}
              />
            {/each}
            {#if children.endings.length !== 0}
              <ul class="flex flex-col gap-3">
                {#each children.endings as [key, ending] (key)}
                  <TypstExercisePreview
                    {ending}
                    count={selectedCount(ending)}
                    onAdd={handleAdd}
                    {settingsOpen}
                    {target}
                    settingsAside={fullScreen}
                  />
                {/each}
              </ul>
            {/if}
            {#if children.categories.length === 0 && children.endings.length === 0}
              <p
                class="py-8 text-center font-light text-coopmaths-corpus-lightest dark:text-coopmathsdark-corpus-lightest"
              >
                Aucun exercice dans cette rubrique pour le moment.
              </p>
            {/if}
          </div>
        {/if}
      </div>
    </div>

    <footer
      class="flex shrink-0 flex-row items-center justify-between gap-3 border-t px-4 py-3
      border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest"
    >
      <span
        class="text-sm text-coopmaths-corpus dark:text-coopmathsdark-corpus"
        aria-live="polite"
      >
        {#if addedCount === 0}
          Choisissez un exercice à ajouter à {target}.
        {:else if addedCount === 1}
          1 exercice ajouté à {target}.
        {:else}
          {addedCount} exercices ajoutés à {target}.
        {/if}
      </span>
      <button
        type="button"
        class="rounded-lg px-4 py-1.5 font-bold
        bg-coopmaths-action text-coopmaths-canvas hover:bg-coopmaths-action-lightest
        dark:bg-coopmathsdark-action dark:text-coopmathsdark-canvas dark:hover:bg-coopmathsdark-action-lightest"
        onclick={onClose}
      >
        Valider
      </button>
    </footer>
  </div>
</div>
