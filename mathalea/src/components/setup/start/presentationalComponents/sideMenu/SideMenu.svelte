<script lang="ts">
  import {
    buildReferentiel,
    getAllEndings,
  } from '../../../../../lib/components/refUtils'
  import {
    type ActivationName,
    type JSONReferentielObject,
    type ReferentielInMenu,
    type ResourceAndItsPath,
  } from '../../../../../lib/types/referentiels'
  import ReferentielNode from './referentielNode/ReferentielNode.svelte'
  import SearchBlock from './searchBlock/SearchBlock.svelte'
  import SideMenuApps from './SideMenuApps.svelte'

  import { onDestroy, onMount } from 'svelte'
  import codeToLevelList from '../../../../../json/codeToLevelList.json'
  import { referentielLocale } from '../../../../../lib/stores/languagesStore'
  import { applyFilters } from './filtersStore'

  import { get } from 'svelte/store'
  import { sortArrayOfResourcesBasedOnYearAndMonth } from '../../../../../lib/components/sorting'
  import { banquesExternes } from '../../../../../lib/stores/banquesExternesStore'
  import {
    buildResourcesSet,
    deepReferentielInMenuCopy,
    getReferentiels,
  } from '../../../../../lib/stores/referentielsStore'
  import type { Language } from '../../../../../lib/types/languages'
  import BanquesExternesDialog from './BanquesExternesDialog.svelte'

  export let excludedReferentiels: ActivationName[] = []
  export let hideThirdAppsButton = false
  export let addExercise: (uuid: string, id: string) => void

  let searchBlock: { triggerUpdateFromSearchBlock: () => void } | undefined

  let isBanquesDialogDisplayed = false

  let referentielsForMenu: ReferentielInMenu[] = []

  let localeValue: Language = get(referentielLocale)

  let referentiels: ReferentielInMenu[] = getReferentiels(
    get(referentielLocale),
  )

  /**
   * Souscription aux changements de langues.
   * À chaque changement, on doit :
   * -> changement du référentiel courant (celui qui sert de référence)
   * -> changement du référentiel dans le store
   * -> mise à jour des entrées du menu
   */
  const unsubscribeToReferentielLocale = referentielLocale.subscribe(
    (value) => {
      if (localeValue !== value) {
        localeValue = value
        referentiels = getReferentiels(value)
        updateRepositories()
      }
    },
  )

  /**
   * Les banques externes sont chargées de façon asynchrone au démarrage, et
   * peuvent être ajoutées ou retirées en cours de session : à chaque
   * changement, « Ressources partenaires » doit être reconstruit.
   */
  let premierAppelBanques = true
  const unsubscribeToBanquesExternes = banquesExternes.subscribe(() => {
    // `subscribe` déclenche immédiatement : le premier appel n'apporte rien de
    // neuf, les référentiels viennent tout juste d'être construits
    if (premierAppelBanques) {
      premierAppelBanques = false
      return
    }
    referentiels = getReferentiels(localeValue)
    updateRepositories()
  })

  onMount(() => {
    updateRepositories()
  })
  onDestroy(() => {
    unsubscribeToReferentielLocale()
    unsubscribeToBanquesExternes()
  })

  function updateRepositories() {
    const updatedRepositories: ReferentielInMenu[] = []
    const repositoriesInMenu: ReferentielInMenu[] = deepReferentielInMenuCopy(
      referentiels,
    ).filter((e) => {
      return !excludedReferentiels.includes(e.name)
    })
    for (const repositoryInMenu of repositoriesInMenu) {
      if (repositoryInMenu.searchable) {
        let filteredRepository: JSONReferentielObject =
          buildFilteredRepository(repositoryInMenu)

        if (repositoryInMenu.name === 'aleatoires') {
          filteredRepository = orderFollowingSchoolLevel(filteredRepository)
        }
        repositoryInMenu.referentiel = filteredRepository
        updatedRepositories.push(repositoryInMenu)
      } else {
        // /!\ TODO : doit-ordonner les référentiels non cherchable ? (item.referentiel)
        updatedRepositories.push(repositoryInMenu)
      }
    }
    referentielsForMenu = updatedRepositories
  }

  function buildFilteredRepository(repositoryInMenu: ReferentielInMenu) {
    const allExercices = getAllEndings(repositoryInMenu.referentiel)
    // const filteredExercices: ResourceAndItsPath[] = applyFilters(allExercices) // EE : (15/05/025) Commenté et remplacé par la ligne ci-dessous car tri dans les annales incorrect
    const filteredExercices: ResourceAndItsPath[] =
      sortArrayOfResourcesBasedOnYearAndMonth(
        applyFilters(allExercices),
        'desc',
      )
    return buildReferentiel(filteredExercices)
  }

  function orderFollowingSchoolLevel(
    filteredRepository: JSONReferentielObject,
  ) {
    for (const key of Object.keys(codeToLevelList).reverse()) {
      if (Object.keys(filteredRepository).includes(key)) {
        const keyToBeFirst = { [key]: null }
        filteredRepository = Object.assign(keyToBeFirst, filteredRepository)
      }
    }
    return filteredRepository
  }
</script>

<aside
  class="flex w-full md:h-full md:min-h-full flex-col items-start pb-4 pt-0 md:pt-4 ml-0 md:mx-0 bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
>
  <SearchBlock
    bind:this={searchBlock}
    class="w-full flex flex-col justify-start pt-0 sm:"
    resourcesSet={buildResourcesSet(referentielsForMenu)}
    on:filters-change={() => {
      updateRepositories()
      searchBlock?.triggerUpdateFromSearchBlock()
    }}
    {addExercise}
  />
  <div class="mt-4 w-full">
    <!-- Affichage de tous les référentiels -->
    {#each referentielsForMenu as item, i}
      <ReferentielNode
        bind:subset={item.referentiel}
        indexBase={i + 1}
        levelTitle={item.title}
        nestedLevelCount={1}
        class="w-full px-4 text-[10px]"
        pathToThisNode={[]}
      >
        <!-- En fin de « Ressources partenaires » : ajout d'une banque perso -->
        <svelte:fragment slot="trailing">
          {#if item.name === 'partenaires'}
            <li>
              <button
                type="button"
                class="w-full flex flex-row items-center gap-1 text-start font-bold text-base py-2 text-coopmaths-action dark:text-coopmathsdark-action hover:bg-coopmaths-canvas-darkest dark:hover:bg-coopmathsdark-canvas-darkest"
                style="padding-left: 0.8rem"
                on:click={() => (isBanquesDialogDisplayed = true)}
              >
                <i class="bx bx-plus-circle text-lg"></i>
                Ajouter une banque d'exercices
              </button>
            </li>
          {/if}
        </svelte:fragment>
      </ReferentielNode>
    {/each}
    <!-- Bouton spécial pour les applications tierces -->
    {#if !hideThirdAppsButton}
      <SideMenuApps class="text-start p-6 w-full" />
    {/if}
    <BanquesExternesDialog bind:isDisplayed={isBanquesDialogDisplayed} />
  </div>
</aside>
