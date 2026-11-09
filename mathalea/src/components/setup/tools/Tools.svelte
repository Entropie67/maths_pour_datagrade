<script context="module" lang="ts">
  // Module-level flag: persists across component mount/unmount cycles
  let returningFromExport = false
</script>

<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { get } from 'svelte/store'
  import referentielProfs from '../../../json/referentielProfs.json'
  import {
    exercicesParams,
    previousView,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import {
    localisedIDToUuid,
    referentielLocale,
  } from '../../../lib/stores/languagesStore'
  import type { InterfaceParams } from '../../../lib/types'
  import {
    ALLOWED_LANGUAGES,
    isLanguage,
    type Language,
  } from '../../../lib/types/languages'
  import type { VueType } from '../../../lib/VueType'
  import Footer from '../../Footer.svelte'
  import Exercice from '../../shared/exercice/Exercice.svelte'
  import ButtonIconTooltip from '../../shared/forms/ButtonIconTooltip.svelte'
  import SelectedIndicator from '../../shared/forms/SelectedIndicator.svelte'
  import NavBar from '../../shared/header/NavBar.svelte'
  import PdfTextIcon from '../../shared/icons/PdfTextIcon.svelte'
  import SetupShell from '../SetupShell.svelte'
  import SideMenuWrapper from '../start/presentationalComponents/header/SideMenuWrapper.svelte'

  interface ToolEntry {
    id: string
    uuid: string
    titre: string
    url: string
    typeExercice: string
  }

  // Le référentiel des outils est structuré par rubriques.
  // Il faut aplatir d'abord les rubriques pour obtenir les entrées d'outils.
  const tools: ToolEntry[] = Object.values(referentielProfs)
    .flatMap((group) => Object.values(group as Record<string, ToolEntry>))
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

  // Map qui compte combien de fois chaque outil est sélectionné dans exercicesParams.
  // Dérivée réactivement depuis $exercicesParams : couvre à la fois les ajouts via
  // selectTool() ET les suppressions via la poubelle du composant Exercice (même si
  // l'événement exerciseRemoved ne remonte pas jusqu'ici pour les exercices standard).
  let selectedToolCounts: Map<string, number> = new Map()
  $: {
    const counts = new Map<string, number>()
    for (const param of $exercicesParams) {
      if (param.id) {
        counts.set(param.id, (counts.get(param.id) ?? 0) + 1)
      }
    }
    selectedToolCounts = counts
  }

  // Référence au composant shell pour appeler toggleSidenav depuis les callbacks
  let shell: SetupShell

  let localeValue: Language = get(referentielLocale)

  const unsubscribeToReferentielLocale = referentielLocale.subscribe(
    (value) => {
      localeValue = value
    },
  )

  function selectTool(tool: ToolEntry) {
    // selectedToolCounts est mis à jour automatiquement via la réactivité sur $exercicesParams
    exercicesParams.update((list) => [
      ...list,
      { uuid: tool.uuid, id: tool.id } as InterfaceParams,
    ])
  }

  /**
   * Retire la première occurrence de l'outil dans exercicesParams.
   * Même logique que ReferentielEnding.removeFromList(), mais par id d'outil.
   */
  function removeToolOnce(tool: ToolEntry) {
    const matchingIndex = $exercicesParams.findIndex((p) => p.id === tool.id)
    if (matchingIndex !== -1) {
      exercicesParams.update((list) => [
        ...list.slice(0, matchingIndex),
        ...list.slice(matchingIndex + 1),
      ])
    }
  }

  function handleExport(vue: VueType) {
    returningFromExport = true
    $previousView = 'tools'
    globalOptions.update((params) => {
      params.v = vue
      return params
    })
  }

  const handleLanguage = (lang: string) => {
    let selectedLanguage: Language = ALLOWED_LANGUAGES[0]
    if (isLanguage(lang)) {
      selectedLanguage = lang
    } else {
      window.notify(`${lang} is not allowed as language.`, {})
    }
    referentielLocale.set(selectedLanguage)
    const currentRefToUuid = localisedIDToUuid[get(referentielLocale)]
    exercicesParams.update((list) => {
      for (let i = 0; i < list.length; i++) {
        const localeID = (
          Object.keys(currentRefToUuid) as (keyof typeof currentRefToUuid)[]
        ).find((key) => {
          return currentRefToUuid[key] === list[i].uuid
        })
        if (localeID) {
          list[i].id = localeID
        }
      }
      return list
    })
  }

  onMount(() => {
    if (returningFromExport) {
      // On revient d'un export : exercicesParams est déjà peuplé, selectedToolCounts
      // sera reconstruit automatiquement via la dérivation réactive.
      returningFromExport = false
    } else {
      // Arrivée fraîche : repart de zéro
      exercicesParams.set([])
    }
  })

  onDestroy(() => {
    unsubscribeToReferentielLocale()
  })
</script>

<!--
  SetupShell fournit :
    - le wrapper dark-mode (w-screen h-screen)
    - la gestion réactive de isMd (SM_BREAKPOINT)
    - le Sidenav desktop avec transition fly
    - le panneau collapsible mobile avec bouton toggle
    - le Footer mobile
    - les styles scrollbar
  Il expose isSidenavOpened, toggleSidenav et isMd comme slot-props
  pour que les slots puissent les consommer.
  bind:this={shell} permet d'appeler shell.toggleSidenav() depuis les callbacks
  de ce composant si nécessaire.
-->
<SetupShell
  id="toolsComponent"
  mobileSidebarTitle="Choix de l'outil"
  bind:this={shell}
  let:isMd
  let:isSidenavOpened
  let:toggleSidenav
>
  <!-- ============================================================
       HEADER SLOT
       NavBar + barre de boutons d'export (disparaît quand vide)
       ============================================================ -->
  <div
    slot="header"
    let:isSidenavOpened
    let:toggleSidenav
    let:isMd
    class="print-hidden"
  >
    <div class="bg-coopmaths-canvas dark:bg-coopmathsdark-canvas">
      <NavBar
        subtitle="Outils pour le professeur"
        subtitleType="design"
        locale={localeValue}
        {handleLanguage}
      />
    </div>

    <!-- Barre de boutons d'export — visible uniquement quand des outils sont sélectionnés -->
    <div
      class="flex {$exercicesParams.length > 0
        ? 'xl:h-[50px] md:h-[50px]'
        : 'h-0'}"
    >
      <div
        class={$exercicesParams.length === 0
          ? 'hidden'
          : 'relative w-full flex flex-row justify-between items-center bg-coopmaths-canvas dark:bg-coopmathsdark-canvas px-4'}
        id="barre-boutons"
      >
        <!-- Bouton de toggle de la sidenav (desktop uniquement, style Start.svelte) -->
        <SideMenuWrapper
          isRecorder={false}
          {isSidenavOpened}
          {toggleSidenav}
          {isMd}
        />

        <div></div>

        <div
          class="flex flex-row justify-end items-center space-x-3 md:space-x-4 pr-4"
        >
          <ButtonIconTooltip
            icon={'bx-link text-3xl'}
            cornerIcon="bxs-graduation"
            cornerIconClass="text-coopmaths-action dark:text-coopmathsdark-action"
            tooltip="Lien pour les élèves"
            on:click={() => handleExport('confeleve')}
          />
          <button
            type="button"
            class="tooltip tooltip-bottom tooltip-neutral"
            data-tip="PDF via LaTeX"
            aria-label="PDF via LaTeX"
            on:click={() => handleExport('latex')}
          >
            <PdfTextIcon
              class="w-7 h-7 hover:fill-coopmaths-action-lightest fill-coopmaths-action dark:fill-coopmathsdark-action dark:hover:fill-coopmathsdark-action-lightest"
            />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ============================================================
       SIDEBAR SLOT
       Liste de tous les outils disponibles avec indicateur de
       sélection (badge de comptage) et highlight quand sélectionné.
       Partagé entre le Sidenav desktop et le panneau mobile du shell.
       ============================================================ -->
  <div
    slot="sidebar"
    class="w-full bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark"
  >
    <div class="p-3">
      <h2
        class="text-sm font-semibold uppercase tracking-wider
               text-coopmaths-corpus-light dark:text-coopmathsdark-corpus-light
               mb-3 px-2"
      >
        {tools.length} outils disponibles
      </h2>
      <ul class="flex flex-col gap-1">
        {#each tools as tool (tool.id)}
          {@const count = selectedToolCounts.get(tool.id) ?? 0}
          <!--
            ml-4 réserve la place pour le SelectedIndicator positionné en
            absolute à -left-4. La position relative est portée par le <li>.
          -->
          <li class="relative ml-4">
            <SelectedIndicator
              selectedCount={count}
              on:remove={() => removeToolOnce(tool)}
            />
            <button
              type="button"
              class="w-full text-left pl-2 pr-3 py-2 rounded-lg transition-colors duration-150
                     text-coopmaths-corpus dark:text-coopmathsdark-corpus
                     {count > 0
                ? 'bg-coopmaths-warn dark:bg-coopmathsdark-warn hover:bg-coopmaths-action-light dark:hover:bg-coopmathsdark-action-light'
                : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas-darkest hover:bg-coopmaths-action-light dark:hover:bg-coopmathsdark-action-light'}"
              on:click={() => selectTool(tool)}
            >
              <span class="text-xs font-mono font-bold">{tool.id}</span>
              <span class="text-sm leading-snug"> - {tool.titre}</span>
            </button>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <!-- ============================================================
       MAIN CONTENT (default slot)
       Liste des outils sélectionnés, ou placeholder si vide.

       Corrections par rapport à la version initiale :
         1. Clé {#each ... (paramsExercice)} au lieu de (i) : évite les
            problèmes de destroy/animate lors des suppressions en milieu
            de liste, cohérent avec Exercices.svelte.
         2. animate:flip pour l'animation de réorganisation (cohérence
            avec Start.svelte).
         3. on:exerciseRemoved={rebuildCountsFromParams} : synchronise
            selectedToolCounts après que HeaderExerciceVueProf ait
            modifié exercicesParams via la poubelle.
       ============================================================ -->
  {#if $exercicesParams.length > 0}
    <div class="flex flex-col w-full md:h-full justify-between md:pl-4">
      <div class="flex flex-col md:mt-9 xl:mt-0">
        {#each $exercicesParams as paramsExercice, i (paramsExercice)}
          <div animate:flip={{ duration: (d) => 30 * Math.sqrt(d) }}>
            <Exercice
              {paramsExercice}
              {toggleSidenav}
              indiceExercice={i}
              indiceLastExercice={$exercicesParams.length - 1}
            />
          </div>
        {/each}
      </div>
      <div class="hidden md:flex items-center justify-center">
        <Footer />
      </div>
    </div>
  {:else}
    <div
      class="flex-1 h-full flex flex-col justify-between
             text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div></div>
      <div
        class="animate-pulse flex flex-row justify-start space-x-6 items-center"
      >
        <div class="mt-[10px]">
          <i class="bx bx-chevron-left text-[50px]"></i>
        </div>
        <div class="font-extralight text-[50px]">Sélectionner un outil</div>
      </div>
      <div class="flex items-center justify-center">
        <Footer />
      </div>
    </div>
  {/if}
</SetupShell>
