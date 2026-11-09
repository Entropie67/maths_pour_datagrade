<script lang="ts">
  import { createEventDispatcher, getContext } from 'svelte'
  import refProfs from '../../../../../json/referentielProfs.json'
  import uuidsRessources from '../../../../../json/uuidsRessources.json'
  import { toMap } from '../../../../../lib/components/toMap'
  import { mathaleaGenerateSeed } from '../../../../../lib/mathalea'
  import { exercicesParams } from '../../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../../lib/stores/globalOptions'
  import MobileMenuAction from '../../../../setup/mobile/MobileMenuAction.svelte'
  import MobileOverlay from '../../../../setup/mobile/MobileOverlay.svelte'
  import BugReportModal from '../BugReportModal.svelte'
  import BoutonDescendre from './BoutonDescendre.svelte'
  import BoutonMonter from './BoutonMonter.svelte'
  import BoutonNouvelleVersion from './BoutonNouvelleVersion.svelte'

  // Dans la vue mobile, la barre d'actions est remplacée par une icône unique
  // qui ouvre un menu plein écran (voir `MobileView.svelte`).
  const isMobileView = getContext('mobileView') === true
  let isMobileMenuOpen = false

  // paramètres obligatoires
  export let title: string | undefined
  export let id: string
  export let indiceExercice: number
  export let indiceLastExercice: number
  export let interactifReady: boolean
  // paramètres optionnels
  export let randomReady = true
  export let settingsReady = true
  export let correctionReady = true
  export let correctionExists = true
  export let isInteractif: boolean = false
  export let interactifObligatoire = false
  export let isSortable: boolean = true
  export let isDeletable: boolean = true
  export let isHidable: boolean = true
  let isVisible = true
  export let isSettingsVisible = true
  const isContentVisible = true
  export let isCorrectionVisible = false
  let isBugReportDisplayed = false
  // redéfinition du titre lorsqu'un exercice apparait plusieurs fois :
  // si le titre contient le caractère | (ajouté lors de la création de l'exercice)
  // on coupe le titre en deux et on distingue le titre de base de l'addendum
  // afin de pouvoir décorer cet addendum
  let titleAddendum: string
  let titleBase: string
  $: {
    if (title?.includes('|')) {
      const decompo = title.split('|')
      titleBase = decompo[0]
      titleAddendum = decompo[1]
    } else {
      titleBase = title || ''
      titleAddendum = ''
    }
  }
  // Éttablissement de la catégorie
  const ressourcesUuids = Object.keys({ ...uuidsRessources })
  const profsUuids = Array.from(toMap({ ...refProfs }).values())
    .filter((entry) => entry instanceof Map)
    .map((entry) => String(entry.get('uuid') ?? ''))
  let category: string
  if (ressourcesUuids.includes($exercicesParams[indiceExercice]?.uuid)) {
    category = 'Ressource'
  } else if (profsUuids.includes($exercicesParams[indiceExercice]?.uuid)) {
    category = 'Outil'
  } else {
    category = 'Exercice'
  }
  const dispatch = createEventDispatcher()

  function switchInteractif() {
    isInteractif = !isInteractif
    dispatch('clickInteractif', { isInteractif })
  }

  function newData() {
    dispatch('clickNewData')
  }

  function remove() {
    exercicesParams.update((l) => [
      ...l.slice(0, indiceExercice),
      ...l.slice(indiceExercice + 1),
    ])
    dispatch('exerciseRemoved')
  }

  function duplicate() {
    exercicesParams.update((l) => {
      const newExercice = { ...l[indiceExercice] }
      newExercice.alea = mathaleaGenerateSeed()
      return [
        ...l.slice(0, indiceExercice + 1),
        newExercice,
        ...l.slice(indiceExercice + 1),
      ]
    })
  }
</script>

<!--
  @component
  Barre de titre et d'actions au-dessus d'un exercice

  __Utilisation__ :

  ```tsx
  const headerExerciceProps: HeaderProps = {
    title: exercice.titre,
    indiceExercice: 2,
    indiceLastExercice: 4,
    interactifReady: true,
    randomReady: true,
    settingsReady: true,
    correctionReady: true
  }
  <HeaderExerciceVueProf {...headerExerciceProps}/>
  ```

  Dans la vue mobile (contexte `mobileView`), la barre d'actions est remplacée
  par une icône unique ouvrant un menu plein écran qui recouvre les exercices.
 -->

{#if isMobileView}
  <div class="z-0 flex-1">
    <div
      class="flex flex-row items-center justify-between gap-2 mt-4 pb-1
      border-b border-coopmaths-struct dark:border-coopmathsdark-struct"
    >
      <h1
        id="exerciceHeader{indiceExercice}"
        class="min-w-0 flex flex-row items-center gap-2 text-coopmaths-struct dark:text-coopmathsdark-struct"
      >
        <span
          class="{$exercicesParams.length <= 1
            ? 'hidden'
            : 'flex'} shrink-0 items-center justify-center h-5 w-5 text-xs font-light
          bg-coopmaths-struct dark:bg-coopmathsdark-struct
          text-coopmaths-canvas dark:text-coopmathsdark-canvas"
        >
          {indiceExercice + 1}
        </span>
        <span
          id="exotitle-{indiceExercice}"
          class="min-w-0 truncate font-bold text-base">{titleBase}</span
        >
        {#if titleAddendum}
          <span
            class="flex shrink-0 justify-center items-center rounded-full h-5 w-5 bg-coopmaths-warn-900 text-coopmaths-canvas font-bold text-sm"
          >
            {titleAddendum}
          </span>
        {/if}
      </h1>
      <BoutonNouvelleVersion {indiceExercice} />
      <button
        type="button"
        aria-label="Régler l'exercice"
        class="print-hidden shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
        on:click={() => (isMobileMenuOpen = true)}
      >
        <i aria-hidden="true" class="bx bx-slider-alt text-2xl"></i>
      </button>
    </div>
  </div>

  {#if isMobileMenuOpen}
    <div
      class="fixed inset-0 z-[1100] flex flex-col overflow-y-auto
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
    >
      <div
        class="sticky top-0 flex flex-row items-center justify-between gap-2 px-4 py-3
        border-b border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest
        bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
      >
        <h2
          class="min-w-0 truncate text-lg font-bold text-coopmaths-struct dark:text-coopmathsdark-struct"
        >
          {titleBase}
        </h2>
        <button
          type="button"
          aria-label="Fermer le menu de l'exercice"
          class="shrink-0 p-1 text-coopmaths-action dark:text-coopmathsdark-action"
          on:click={() => (isMobileMenuOpen = false)}
        >
          <i aria-hidden="true" class="bx bx-x text-3xl"></i>
        </button>
      </div>
      <div class="flex flex-col gap-2 p-4">
        {#if randomReady}
          <MobileMenuAction
            icon="bx-refresh"
            label="Nouvelles données"
            description="Régénère l'énoncé de cet exercice"
            onclick={() => {
              isMobileMenuOpen = false
              newData()
            }}
          />
        {/if}
        {#if settingsReady}
          <MobileMenuAction
            icon="bx-slider"
            label={isSettingsVisible
              ? 'Masquer les paramètres'
              : "Paramétrer l'exercice"}
            onclick={() => {
              isMobileMenuOpen = false
              isSettingsVisible = !isSettingsVisible
              dispatch('clickSettings', { isSettingsVisible })
            }}
          />
        {/if}
        {#if interactifReady && !interactifObligatoire}
          <MobileMenuAction
            icon={isInteractif ? 'bx-toggle-right' : 'bx-toggle-left'}
            label={isInteractif
              ? "Désactiver l'interactivité"
              : "Activer l'interactivité"}
            onclick={() => {
              isMobileMenuOpen = false
              switchInteractif()
            }}
          />
        {/if}
        {#if isDeletable}
          <MobileMenuAction
            icon="bx-trash"
            label="Supprimer l'exercice"
            onclick={() => {
              isMobileMenuOpen = false
              remove()
            }}
          />
        {/if}
        <!-- toujours en dernier -->
        <MobileMenuAction
          icon="bx-bug"
          label="Signaler un problème"
          description="Nous aider à corriger cet exercice"
          onclick={() => {
            isMobileMenuOpen = false
            isBugReportDisplayed = true
          }}
        />
      </div>
    </div>
  {/if}
{:else}
  <div class="z-0 flex-1">
    <h1
      class="border-b border-coopmaths-struct dark:border-coopmathsdark-struct text-coopmaths-struct dark:text-coopmathsdark-struct pl-0 mt-4 flex flex-col lg:flex-row justify-start lg:justify-between items-start xl:items-baseline"
    >
      <div
        class="flex flex-col xl:flex-row xl:justify-start xl:items-center"
        id="exerciceHeader{indiceExercice}"
      >
        <div
          class="flex flex-row items-center whitespace-pre font-bold text-sm md:text-base lg:text-xl pb-1 lg:pb-0"
        >
          <div
            class="{$exercicesParams.length <= 1
              ? 'hidden'
              : 'flex'} items-center justify-center h-4 lg:h-8 w-4 lg:w-6 bg-coopmaths-struct dark:bg-coopmathsdark-struct text-coopmaths-canvas dark:text-coopmathsdark-canvas font-light text-xs lg:text-lg mr-2 lg:mr-4"
          >
            {indiceExercice + 1}
          </div>
          {category}&#8239
          {#if id && id.length !== 0}
            {id}<span class="hidden xl:inline-flex xl:mx-1 font-bold"
              >&middot;</span
            >
          {/if}
        </div>
        {#key titleAddendum}
          <div
            id="exotitle-{indiceExercice}"
            class="flex items-center gap-x-1 text-sm md:text-base xl:text-lg pl-0
        {id && id.length !== 0 ? 'lg:pl-0' : 'lg:pl-4'}"
          >
            <div>
              {titleBase}
            </div>
            {#if titleAddendum}
              <span
                class="ml-2 flex justify-center items-center shrink-0 rounded-full h-5 w-5 bg-coopmaths-warn-900 text-coopmaths-canvas font-bold text-sm"
              >
                {titleAddendum}
              </span>
            {/if}
            <BoutonNouvelleVersion {indiceExercice} />
          </div>
        {/key}
      </div>
      <div
        class="print-hidden flex flex-col md:flex-row justify-start space-x-2 md:space-x-10 text-normal mt-1 text-xl lg:justify-end mr-1"
      >
        <div class="flex flex-row justify-start items-center">
          <!-- <button
          class="mx-2 tooltip tooltip-left"
          data-tip={isMessagesVisible ? "Masquer les messages" : "Montrer les messages"}
          type="button"
          on:click={() => {
            isMessagesVisible = !isMessagesVisible
            dispatch("clickMessages", { isMessagesVisible })
          }}
        >
          <i class="bx {isMessagesVisible ? 'bxs-bulb' : 'bx-bulb'}" />
        </button> -->
          <button
            class="mx-2 tooltip tooltip-left tooltip-neutral {correctionExists &&
            correctionReady
              ? ''
              : 'hidden'}"
            data-tip={isCorrectionVisible
              ? 'Masquer la correction'
              : 'Montrer la correction'}
            type="button"
            aria-label={isCorrectionVisible
              ? 'Masquer la correction'
              : 'Montrer la correction'}
            on:click={() => {
              isCorrectionVisible = !isCorrectionVisible
              dispatch('clickCorrection', {
                isCorrectionVisible,
                isContentVisible,
              })
            }}
          >
            <i
              aria-hidden="true"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx {isCorrectionVisible
                ? 'bxs-check-circle'
                : 'bx-check-circle'}"
            ></i>
          </button>
          {#if interactifReady && !interactifObligatoire}
            <button
              class="mx-2 tooltip tooltip-left tooltip-neutral"
              data-tip={isInteractif
                ? "Désactiver l'interactivité"
                : 'Rendre interactif'}
              type="button"
              aria-label={isInteractif
                ? "Désactiver l'interactivité"
                : 'Rendre interactif'}
              on:click={switchInteractif}
            >
              <i
                aria-hidden="true"
                class="bx {isInteractif
                  ? 'bx-laptop'
                  : 'bx-file'} text-2xl text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest"
              ></i>
            </button>
          {/if}
          <button
            class="mx-2 tooltip tooltip-left {randomReady ? '' : 'hidden'}"
            data-tip="Nouvel énoncé"
            type="button"
            aria-label="Nouvel énoncé"
            on:click={newData}
          >
            <i
              aria-hidden="true"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-refresh"
            ></i>
          </button>
          {#if isHidable}
            <button
              type="button"
              on:click={() => {
                isVisible = !isVisible
                dispatch('clickVisible', { isVisible })
              }}
              class="mx-2 tooltip tooltip-left"
              data-tip="{isVisible ? 'Masquer' : 'Montrer'} l'exercice"
              aria-label="{isVisible ? 'Masquer' : 'Montrer'} l'exercice"
            >
              <i
                aria-hidden="true"
                class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx {isVisible
                  ? 'bx-hide'
                  : 'bx-show'}"
              ></i>
            </button>
          {/if}
          <button
            class="mx-2 tooltip tooltip-left tooltip-neutral"
            data-tip="Dupliquer l'exercice"
            type="button"
            aria-label="Dupliquer l'exercice"
            on:click={duplicate}
          >
            <i
              aria-hidden="true"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-duplicate"
            ></i>
          </button>
          {#if isDeletable}
            <button
              class="mx-2 tooltip tooltip-left tooltip-neutral"
              data-tip="Supprimer l'exercice"
              type="button"
              aria-label="Supprimer l'exercice"
              on:click={remove}
            >
              <i
                aria-hidden="true"
                class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-trash"
              ></i>
            </button>
          {/if}
          <button
            class="mx-2 tooltip tooltip-left tooltip-neutral {settingsReady
              ? ''
              : 'hidden'} "
            data-tip="Changer les paramètres de l'exercice"
            aria-label="Paramètres de l'exercice"
            type="button"
            on:click={() => {
              isSettingsVisible = !isSettingsVisible
              dispatch('clickSettings', { isSettingsVisible })
            }}
          >
            <i
              aria-hidden="true"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-slider"
            ></i>
          </button>
        </div>
        <div
          class="flex flex-row justify-start items-center space-x-4 md:space-x-1"
        >
          <!-- en dernier des actions, juste avant les boutons monter/descendre -->
          <button
            class="mx-2 tooltip tooltip-left tooltip-neutral text-xl"
            data-tip="Signaler un problème"
            type="button"
            aria-label="Signaler un problème"
            on:click={() => (isBugReportDisplayed = true)}
          >
            <i
              aria-hidden="true"
              class="text-coopmaths-action hover:text-coopmaths-action-lightest dark:text-coopmathsdark-action dark:hover:text-coopmathsdark-action-lightest bx bx-bug"
            ></i>
          </button>
          {#if isSortable}
            <BoutonMonter indice={indiceExercice} />
            <BoutonDescendre indice={indiceExercice} {indiceLastExercice} />
          {/if}
        </div>
      </div>
    </h1>
  </div>
{/if}

{#if isBugReportDisplayed}
  <BugReportModal
    bind:isDisplayed={isBugReportDisplayed}
    exerciceId={id}
    exerciceTitle={titleBase}
    exerciceIndex={indiceExercice}
  />
{/if}
