<script lang="ts">
  import { onMount, setContext, tick } from 'svelte'
  import { get } from 'svelte/store'
  import {
    mobileMenuSectionsForLocale,
    nodeLabel,
    parentPath,
  } from '../../../lib/components/mobileMenu'
  import { mathaleaGenerateSeed } from '../../../lib/mathalea'
  import { scrollToLastExercise } from '../../../lib/scrollToLastExercise'
  import { banquesExternes } from '../../../lib/stores/banquesExternesStore'
  import { changes, exercicesParams } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../lib/stores/languagesStore'
  import {
    buildResourcesSet,
    getReferentiels,
  } from '../../../lib/stores/referentielsStore'
  import type { InterfaceParams } from '../../../lib/types'
  import {
    isExerciceItemInReferentiel,
    isGeoDynamic,
    isTool,
    type JSONReferentielEnding,
    type ReferentielInMenu,
  } from '../../../lib/types/referentiels'
  import type { VueType } from '../../../lib/VueType'
  import Footer from '../../Footer.svelte'
  import Exercice from '../../shared/exercice/Exercice.svelte'
  import ChipsList from '../../shared/ui/ChipsList.svelte'
  import MobileBrowser from './MobileBrowser.svelte'
  import MobileGlobalMenu from './MobileGlobalMenu.svelte'
  import MobileSearchOverlay from './MobileSearchOverlay.svelte'

  /**
   * Vue par défaut sur téléphone : navigation par tuiles (rubrique > niveau >
   * thèmes > exercices), affichage des exercices choisis, menu général et menu
   * par exercice en plein écran.
   */
  type Props = {
    newDataForAll: () => void
    setAllInteractive: (isAllInteractive: boolean) => void
    trash: () => void
    handleExport: (vue: VueType) => void
    /** Force la vue bureau (demandée depuis le menu général). */
    useDesktopView: () => void
  }

  const {
    newDataForAll,
    setAllInteractive,
    trash,
    handleExport,
    useDesktopView,
  }: Props = $props()

  // Les composants d'exercice adaptent leur barre de titre grâce à ce contexte.
  setContext('mobileView', true)

  const referentiels: ReferentielInMenu[] = $derived.by(() => {
    // dépendance explicite : les banques externes sont chargées de façon
    // asynchrone au démarrage, le menu doit se reconstruire à leur arrivée
    void $banquesExternes
    return getReferentiels(get(referentielLocale))
  })
  const mobileMenuSections = mobileMenuSectionsForLocale(get(referentielLocale))

  /** Chemin courant : [rubrique, niveau, ...clés du référentiel]. */
  let path = $state<string[]>([])
  /** `true` quand la liste des exercices remplace la navigation. */
  let areExercisesDisplayed = $state(get(exercicesParams).length !== 0)

  // Une URL qui contient déjà des exercices les affiche directement : le choix
  // des niveaux n'est proposé au chargement que si la sélection est vide.
  // Le `tick()` couvre le cas où `App.svelte` n'a pas encore lu l'URL au moment
  // du montage de ce composant.
  onMount(async () => {
    await tick()
    if (get(exercicesParams).length !== 0) areExercisesDisplayed = true
  })
  let isGlobalMenuOpen = $state(false)
  let isReorderDisplayed = $state(false)
  /** Recherche plein écran avec aperçu (équivalent mobile du Ctrl/Cmd+K). */
  let isSearchOpen = $state(false)

  /** Ressources cherchables, aplaties (même source que la recherche bureau) */
  const resourcesSet = $derived(buildResourcesSet(referentiels))

  /**
   * Compte le nombre de fois où une ressource est déjà dans la sélection.
   * Les exercices MathALÉA et les outils sont distingués par leur `id` car
   * plusieurs références peuvent partager un même `uuid`.
   */
  function selectedCount(ending: JSONReferentielEnding): number {
    return $exercicesParams.filter((item) => {
      if (item.uuid !== ending.uuid) return false
      if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
        return item.id === ending.id
      }
      return true
    }).length
  }

  const isAllInteractive = $derived($globalOptions.setInteractive === '1')
  const hasExercises = $derived($exercicesParams.length !== 0)
  // Une sélection vidée (suppression du dernier exercice, « Tout effacer »)
  // renvoie automatiquement au choix des exercices.
  const showExercises = $derived(areExercisesDisplayed && hasExercises)

  const currentTitle = $derived.by(() => {
    if (showExercises) return 'Mes exercices'
    if (path.length === 0) return 'AxioMaths'
    const section = mobileMenuSections.find((s) => s.id === path[0])
    if (path.length === 1) return section?.title ?? ''
    if (path.length === 2) {
      return section?.entries.find((e) => e.id === path[1])?.title ?? ''
    }
    return nodeLabel(path[path.length - 1])
  })

  const canGoBack = $derived(showExercises || path.length !== 0)

  function navigate(newPath: string[]) {
    path = newPath
    areExercisesDisplayed = false
  }

  function goBack() {
    if (showExercises) {
      areExercisesDisplayed = false
    } else {
      path = parentPath(mobileMenuSections, path)
    }
  }

  /**
   * Ajoute une ressource à la sélection puis bascule sur l'affichage des
   * exercices (mêmes règles que dans le menu de la vue bureau).
   */
  function addExercise(ending: JSONReferentielEnding) {
    const newExercise: InterfaceParams = {
      uuid: ending.uuid,
      alea: mathaleaGenerateSeed(),
    }
    if (isGeoDynamic(ending)) newExercise.interactif = '1'
    if (isExerciceItemInReferentiel(ending) || isTool(ending)) {
      newExercise.id = ending.id
    }
    // Sur la vue mobile, les exercices sont interactifs par défaut,
    // sauf si l'utilisateur a explicitement désactivé l'interactivité.
    if (
      $globalOptions.recorder === 'capytale' ||
      $globalOptions.setInteractive !== '0'
    ) {
      newExercise.interactif = '1'
    }
    exercicesParams.update((list) => [...list, newExercise])
    $changes++
    areExercisesDisplayed = true
    tick().then(scrollToLastExercise)
  }

  /**
   * Ajout depuis la recherche plein écran : les paramètres (graine, réglages)
   * proviennent de l'aperçu et ne sont pas régénérés. Mêmes règles
   * d'interactivité par défaut que `addExercise`.
   */
  function addExerciseFromParams(params: InterfaceParams) {
    const newExercise: InterfaceParams = { ...params }
    if (
      $globalOptions.recorder === 'capytale' ||
      $globalOptions.setInteractive !== '0'
    ) {
      newExercise.interactif = '1'
    }
    exercicesParams.update((list) => [...list, newExercise])
    $changes++
    areExercisesDisplayed = true
    tick().then(scrollToLastExercise)
  }

  /** Vide la sélection et revient à l'accueil. */
  function trashAndGoHome() {
    trash()
    path = []
    areExercisesDisplayed = false
  }

  /** Appelé par les exercices : quand la liste se vide, on revient au choix. */
  function backToBrowsing() {
    if ($exercicesParams.length === 0) areExercisesDisplayed = false
  }
</script>

<div
  class="flex flex-col min-h-screen bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
>
  <!-- Barre supérieure : menu général à gauche, bascule navigation/exercices à droite -->
  <header
    class="sticky top-0 z-40 flex flex-row items-center justify-between gap-2 px-3 py-2
    border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <button
      type="button"
      aria-label="Ouvrir le menu général"
      onclick={() => (isGlobalMenuOpen = true)}
      class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
    >
      <i class="bx bx-menu text-3xl"></i>
    </button>
    <div
      class="min-w-0 flex-1 text-center font-logo9 tracking-tighter font-black text-2xl truncate
      text-coopmaths-struct dark:text-coopmathsdark-struct"
    >
      AxioMaths
    </div>
    <button
      type="button"
      aria-label={showExercises
        ? 'Choisir des exercices'
        : 'Voir les exercices choisis'}
      disabled={!hasExercises}
      onclick={() => (areExercisesDisplayed = !showExercises)}
      class="relative shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action
      disabled:opacity-40"
    >
      <i
        class="bx {showExercises ? 'bx-list-plus' : 'bx-book-content'} text-3xl"
      ></i>
      {#if hasExercises && !showExercises}
        <span
          class="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full
          bg-coopmaths-warn dark:bg-coopmathsdark-warn
          text-coopmaths-canvas dark:text-coopmathsdark-canvas text-xs font-bold"
        >
          {$exercicesParams.length}
        </span>
      {/if}
    </button>
  </header>

  <!-- Fil d'Ariane : retour à la catégorie parente -->
  {#if canGoBack}
    <div
      class="flex flex-row items-center gap-1 px-2 py-2
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      border-b border-coopmaths-canvas-dark dark:border-coopmathsdark-canvas-dark"
    >
      <button
        type="button"
        aria-label="Revenir à la catégorie précédente"
        onclick={goBack}
        class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
      >
        <i class="bx bx-chevron-left text-2xl"></i>
      </button>
      <h1
        class="min-w-0 truncate font-bold text-lg text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <!-- eslint-disable-next-line svelte/no-at-html-tags -->
        {@html currentTitle}
      </h1>
    </div>
  {/if}

  <main class="flex-1">
    {#if showExercises}
      <div class="flex flex-col px-4">
        {#each $exercicesParams as paramsExercice, i (paramsExercice)}
          <div id="exo{i}">
            <Exercice
              {paramsExercice}
              toggleSidenav={backToBrowsing}
              indiceExercice={i}
              indiceLastExercice={$exercicesParams.length - 1}
            />
          </div>
        {/each}
      </div>
    {:else}
      <MobileBrowser
        {path}
        {referentiels}
        {navigate}
        {addExercise}
        openSearch={() => (isSearchOpen = true)}
      />
    {/if}
  </main>

  <Footer />
</div>

{#if isSearchOpen}
  <MobileSearchOverlay
    {resourcesSet}
    onAdd={addExerciseFromParams}
    {selectedCount}
    onClose={() => (isSearchOpen = false)}
  />
{/if}

{#if isGlobalMenuOpen}
  <MobileGlobalMenu
    {isAllInteractive}
    {hasExercises}
    {newDataForAll}
    {setAllInteractive}
    trash={trashAndGoHome}
    {handleExport}
    openReorder={() => (isReorderDisplayed = true)}
    {useDesktopView}
    onclose={() => (isGlobalMenuOpen = false)}
  />
{/if}

{#if isReorderDisplayed}
  <div
    class="fixed inset-0 z-[1100] overflow-y-auto p-6
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <ChipsList bind:chipsListDisplayed={isReorderDisplayed} />
  </div>
{/if}
