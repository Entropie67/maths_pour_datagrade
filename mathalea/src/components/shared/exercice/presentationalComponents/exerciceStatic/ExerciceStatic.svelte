<script lang="ts">
  import { getContext } from 'svelte'
  import HeaderExerciceVueProf from '../../shared/headerExerciceVueProf/HeaderExerciceVueProf.svelte'
  import HeaderExerciceVueEleve from '../shared/HeaderExerciceVueEleve.svelte'
  import ButtonTextAction from '../../../forms/ButtonTextAction.svelte'
  import {
    computeStaticExercicePngUrls,
    retrieveResourceFromUuid,
  } from '../../../../../lib/components/refUtils'
  import {
    resourceHasPlace,
    isStaticType,
    isBanqueExterneType,
    type JSONReferentielObject,
    isCrpeType,
  } from '../../../../../lib/types/referentiels'
  /**
   * Gestion du référentiel pour la recherche de l'uuid
   */
  import referentielStaticFR from '../../../../../json/referentielStaticFRHydrated'
  import referentielStaticCH from '../../../../../json/referentielStaticCH.json'

  import referentielBibliotheque from '../../../../../json/referentielBibliotheque.json'
  import { referentielMathadata } from '../../../../../lib/components/mathadataReferentiel'
  import { referentielBanquesExternes } from '../../../../../lib/stores/banquesExternesStore'
  import { isMenuNeededForExercises } from '../../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../../lib/stores/globalOptions'
  import type { HeaderProps } from '../../../../../lib/types/ui'
  import type { VueType } from '../../../../../lib/VueType'
  import { SM_BREAKPOINT } from '../../../../keyboard/lib/sizes'
  // on rassemble les deux référentiel statique
  // les banques externes sont ajoutées ici et non figées à l'import : elles
  // peuvent être installées ou retirées en cours de session
  const allStaticReferentiels: JSONReferentielObject = {
    ...referentielBibliotheque,
    ...referentielStaticFR,
    ...referentielStaticCH,
    ...referentielMathadata,
    ...referentielBanquesExternes(),
  }
  // on supprime les entrées par thème qui entraîne des doublons
  delete allStaticReferentiels['Brevet des collèges par thème - APMEP']
  delete allStaticReferentiels['BAC par thème - APMEP']
  delete allStaticReferentiels['CRPE (2015-2019) par thème - COPIRELEM']
  delete allStaticReferentiels['CRPE (2022-2023) par thème']
  delete allStaticReferentiels['E3C par thème - APMEP']
  delete allStaticReferentiels['EVACOM par thème']

  export let uuid: string
  export let indiceExercice: number
  export let indiceLastExercice: number
  export let zoomFactor: string
  export let isSolutionAccessible: boolean
  export let vue: VueType | undefined = undefined
  const isVueEleve =
    vue === 'eleve' ||
    vue === 'myriade' ||
    vue === 'indices' ||
    vue === 'indice'
  const foundResource = retrieveResourceFromUuid(allStaticReferentiels, uuid)
  const exercice = computeStaticExercicePngUrls(foundResource)
  const resourceToDisplay =
    isStaticType(foundResource) || isCrpeType(foundResource)
      ? { ...foundResource }
      : null
  let isCorrectionVisible = $globalOptions.cor === true
  let isContentVisible = true
  let title = ''
  if (resourceToDisplay !== null) {
    if (resourceHasPlace(resourceToDisplay)) {
      title = `${resourceToDisplay.typeExercice.toUpperCase()} ${
        resourceToDisplay.mois || ''
      } ${resourceToDisplay.annee} ${resourceToDisplay.lieu} ${resourceToDisplay.jour || ''} Ex ${resourceToDisplay.numeroInitial}`
    } else if ('titre' in resourceToDisplay && resourceToDisplay.titre) {
      title = resourceToDisplay.titre
    } else {
      title = resourceToDisplay.uuid
    }
  }
  // Attribution discrète de la banque externe d'origine. Pour FFJM, seul le
  // titre de la banque est affiché au-dessus de l'exercice.
  const sourceBanqueExterne =
    resourceToDisplay !== null && isBanqueExterneType(resourceToDisplay)
      ? resourceToDisplay.banque !== 'ffjm' && resourceToDisplay.banqueAuteur
        ? `${resourceToDisplay.banqueTitre} — ${resourceToDisplay.banqueAuteur}`
        : resourceToDisplay.banqueTitre
      : null
  let headerExerciceProps: HeaderProps
  if (resourceToDisplay !== null) {
    headerExerciceProps = {
      title,
      id: '',
      isInteractif: false,
      settingsReady: false,
      isSettingsVisible: false,
      interactifReady: false,
      indiceExercice,
      indiceLastExercice,
      randomReady: false,
      correctionReady: isSolutionAccessible,
    }
  }

  let noCorrectionAvailable = false

  function handleNoCorrectionAvailable() {
    noCorrectionAvailable = true
  }

  let innerWidth = window.innerWidth
  $: isMobileView =
    getContext('mobileView') === true || innerWidth < SM_BREAKPOINT

  /**
   * Ouvre une image d'énoncé ou de correction dans un nouvel onglet : sur un
   * écran de téléphone, c'est le seul moyen de la zoomer et de s'y déplacer.
   */
  function openImageInNewTab(url: string) {
    window.open(url, '_blank', 'noopener')
  }
</script>

<svelte:window bind:innerWidth />

{#if isVueEleve}
  <HeaderExerciceVueEleve
    {title}
    {indiceExercice}
    showNumber={indiceLastExercice > 0 &&
      $globalOptions.presMode !== 'un_exo_par_page'}
    isMenuNeededForExercises={$isMenuNeededForExercises}
    presMode={$globalOptions.presMode}
    seed={undefined}
    zoom={zoomFactor ?? $globalOptions.z ?? 1}
  />
  {#if isSolutionAccessible}
    <div class="flex flex-row items-center ml-2 mb-2">
      <ButtonTextAction
        text={isCorrectionVisible
          ? 'Masquer la correction'
          : 'Voir la correction'}
        icon={isCorrectionVisible ? 'bx-hide' : 'bx-show'}
        class="py-0.5 px-2 text-[0.7rem]"
        inverted={true}
        on:click={() => (isCorrectionVisible = !isCorrectionVisible)}
      />
    </div>
  {/if}
{:else}
  <HeaderExerciceVueProf
    {...headerExerciceProps}
    {indiceExercice}
    {indiceLastExercice}
    {isCorrectionVisible}
    on:clickCorrection={(event) => {
      isCorrectionVisible = event.detail.isCorrectionVisible
    }}
    on:clickVisible={(event) => {
      isContentVisible = event.detail.isVisible
      isCorrectionVisible = event.detail.isVisible
    }}
    on:exerciseRemoved
  />
{/if}

<div class="p-4">
  {#if isContentVisible}
    {#if sourceBanqueExterne}
      <p
        class="text-[0.65rem] italic opacity-60 mb-2 text-coopmaths-corpus dark:text-coopmathsdark-corpus"
      >
        Source : {sourceBanqueExterne}
      </p>
    {/if}
    {#if exercice}
      {#each exercice.png as url, i}
        <img
          src={url}
          class="mb-6"
          style="width: min(100%, calc(850px * {zoomFactor}))"
          alt="énoncé"
        />
        {#if isMobileView}
          <div class="print-hidden flex flex-row mb-6">
            <ButtonTextAction
              text={exercice.png.length > 1
                ? `Ouvrir l'énoncé (partie ${i + 1}) en plein écran`
                : "Ouvrir l'énoncé en plein écran"}
              icon="bx-zoom-in"
              inverted={true}
              class="py-0.5 px-2 text-[0.7rem]"
              title="Ouvre l'image dans un nouvel onglet pour pouvoir zoomer"
              on:click={() => openImageInNewTab(url)}
            />
          </div>
        {/if}
      {/each}
    {/if}
  {/if}

  {#if isCorrectionVisible}
    <div
      class="relative border-l-coopmaths-struct dark:border-l-coopmathsdark-struct border-l-[3px] text-coopmaths-corpus dark:text-coopmathsdark-corpus mt-6 lg:mt-2 mb-6 py-2 pl-4"
      id="correction{indiceExercice}"
    >
      <div class="container">
        {#if exercice}
          {#each exercice.pngCor as url, i}
            {#if noCorrectionAvailable}
              <p class="text-red-500">Aucune correction disponible</p>
            {:else}
              <img
                src={url}
                class="p-2"
                style="width: min(100%, calc(850px * {zoomFactor}))"
                alt="correction"
                on:error={handleNoCorrectionAvailable}
              />
              {#if isMobileView}
                <div class="print-hidden flex flex-row mb-4 pl-2">
                  <ButtonTextAction
                    text={exercice.pngCor.length > 1
                      ? `Ouvrir la correction ${i + 1} en grand`
                      : 'Ouvrir la correction en grand'}
                    icon="bx-zoom-in"
                    inverted={true}
                    class="py-0.5 px-2 text-[0.7rem]"
                    title="Ouvre l'image dans un nouvel onglet pour pouvoir zoomer"
                    on:click={() => openImageInNewTab(url)}
                  />
                </div>
              {/if}
            {/if}
          {/each}
        {/if}
      </div>
      <!-- <div class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct top-0 left-0 border-b-[3px] w-10" /> -->
      <div
        class="absolute flex flex-row py-[1.5px] px-3 rounded-t-md justify-center items-center -left-[3px] -top-[15px] bg-coopmaths-struct dark:bg-coopmathsdark-struct font-semibold text-xs text-coopmaths-canvas dark:text-coopmathsdark-canvas"
      >
        Correction
      </div>
      <div
        class="absolute border-coopmaths-struct dark:border-coopmathsdark-struct bottom-0 left-0 border-b-[3px] w-4"
      ></div>
    </div>
  {/if}

  {#if isMobileView && !isVueEleve && isSolutionAccessible}
    <div class="print-hidden flex flex-row flex-wrap gap-2 mt-2 mb-8">
      <ButtonTextAction
        text={isCorrectionVisible
          ? 'Masquer la correction'
          : 'Afficher la correction'}
        icon={isCorrectionVisible ? 'bx-hide' : 'bx-check-circle'}
        inverted={true}
        class="py-0.5 px-2 text-[0.7rem]"
        on:click={() => (isCorrectionVisible = !isCorrectionVisible)}
      />
    </div>
  {/if}
</div>
