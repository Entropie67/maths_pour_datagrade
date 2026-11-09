<script lang="ts">
  import { tick } from 'svelte'
  import { mathaleaRenderDiv } from '../../../../lib/mathalea'
  import { listOfRandomIndexes } from '../../../../lib/outils/arrayOutils'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import { referentielLocale } from '../../../../lib/stores/languagesStore'
  import {
    type IExercice,
    type InterfaceParams,
    type NumberRange,
  } from '../../../../lib/types'
  import { isIntegerInRange0to4 } from '../../../../lib/types/integerInRange'
  import ButtonIconTooltip from '../../../shared/forms/ButtonIconTooltip.svelte'
  import NavBar from '../../../shared/header/NavBar.svelte'
  import { goToTypstWithSeries } from '../goToTypstWithSeries'
  import type { SlideshowHistoryOptions } from '../types'
  import DisplaySettings from './presentationalComponents/DisplaySettings.svelte'
  import ExercisesSettings from './presentationalComponents/ExercisesSettings.svelte'
  import GlobalDurationSettings from './presentationalComponents/GlobalDurationSettings.svelte'
  import LinksSettings from './presentationalComponents/LinksSettings.svelte'
  import OrderSettings from './presentationalComponents/OrderSettings.svelte'
  import SelectedExercisesSettings from './presentationalComponents/SelectedExercisesSettings.svelte'
  import TransitionSettings from './presentationalComponents/TransitionSettings.svelte'
  import ViewSettings from './presentationalComponents/ViewSettings.svelte'
  import SlideshowHistoryModal from './SlideshowHistoryModal.svelte'

  export let exercises: IExercice[]
  export let updateExercises: (updateSlidesContent?: boolean) => void
  export let transitionSounds: {
    0: HTMLAudioElement
    1: HTMLAudioElement
    2: HTMLAudioElement
    3: HTMLAudioElement
  }
  export let startSlideshow: () => void
  export let applySlideshowFromHistory: (
    item: {
      options: SlideshowHistoryOptions
      exercicesParams: InterfaceParams[]
    },
    autoStart: boolean,
  ) => Promise<void>
  export let goToOverview: () => void
  export let goToHome: () => void

  let divTableDurationsQuestions: HTMLDivElement
  let historyModal: SlideshowHistoryModal | undefined
  let previousNumberOfSelectedExercises: number
  let isHistoryModalOpen = false

  $: if (divTableDurationsQuestions && exercises.length > 0) {
    tick().then(() => {
      mathaleaRenderDiv(divTableDurationsQuestions)
    })
  }

  function applyRandomSelectionOfExercises(numberOfSelectedExercises: number) {
    let selection: number[] | undefined
    if (
      numberOfSelectedExercises > 0 &&
      numberOfSelectedExercises < exercises.length
    ) {
      selection = [
        ...listOfRandomIndexes(exercises.length, numberOfSelectedExercises),
      ].sort((a, b) => a - b)
    }
    previousNumberOfSelectedExercises = numberOfSelectedExercises
    updateSelect(selection)
  }

  function updateNbOfViews(nbVues: NumberRange<1, 4>) {
    $globalOptions.nbVues = nbVues
  }

  function updateFlow(flow: 0 | 1 | 2) {
    $globalOptions.flow = flow
  }

  function updateScreenBetweenSlides(screenBetweenSlides: boolean) {
    $globalOptions.screenBetweenSlides = screenBetweenSlides
  }

  function updatePauseAfterEachQuestion(pauseAfterEachQuestion: boolean) {
    $globalOptions.pauseAfterEachQuestion = pauseAfterEachQuestion
  }

  function updateTune(tune: -1 | 0 | 1 | 2 | 3) {
    const soundCandidate = tune + 1
    if (isIntegerInRange0to4(soundCandidate)) {
      $globalOptions.sound = soundCandidate
    }
  }

  function updateQuestionsOrder(isQuestionsOrdered: boolean) {
    $globalOptions.shuffle = !isQuestionsOrdered
    updateExercises()
  }

  function updateSelect(selectedExercisesIndexes: number[] | undefined) {
    $globalOptions.select = selectedExercisesIndexes
    updateExercises()
  }

  function updateManualMode(isManualModeActive: boolean) {
    $globalOptions.manualMode = isManualModeActive
  }

  function updateDurationGlobal(durationGlobal: number | undefined) {
    $globalOptions.durationGlobal = durationGlobal
  }

  function updateDurationCorrection(durationCorrection: number | undefined) {
    $globalOptions.durationCorrection = durationCorrection
  }

  function updateIsImagesOnSides(isImagesOnSides: boolean) {
    $globalOptions.isImagesOnSides = isImagesOnSides
  }

  function handleStartSlideshow() {
    historyModal?.saveCurrentSlideshow()
    startSlideshow()
  }

  function remove(exerciseIndex: number) {
    exercises.splice(exerciseIndex, 1)
    if (exercises.length === 0) {
      goToHome()
    }
    applyRandomSelectionOfExercises(previousNumberOfSelectedExercises)
    updateExercises()
    exercises = exercises // to refresh ExercisesSettings component
  }
</script>

<div
  id="start"
  class="flex flex-col min-h-screen scrollbar-hide
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
    text-coopmaths-corpus dark:text-coopmathsdark-corpus"
>
  <NavBar
    subtitle="Réglages du diaporama"
    subtitleType="export"
    handleLanguage={() => {}}
    locale={$referentielLocale}
  />
  <div
    class="flex justify-end items-start mt-10
    flex-col md:flex-row"
  >
    <!-- Left Side -->
    <div class="flex flex-col justify-start ml-4">
      <DisplaySettings {goToOverview} />
      <ViewSettings
        nbOfViews={$globalOptions.nbVues ?? 1}
        {updateNbOfViews}
        isImagesOnSides={!!$globalOptions.isImagesOnSides}
        {updateIsImagesOnSides}
      />
      <TransitionSettings
        {transitionSounds}
        screenBetweenSlides={!!$globalOptions.screenBetweenSlides}
        sound={$globalOptions.sound ?? 0}
        {updateFlow}
        {updateScreenBetweenSlides}
        {updateTune}
        {updatePauseAfterEachQuestion}
        questionThenCorrectionToggle={$globalOptions.flow === 1 ||
          $globalOptions.flow === 2}
        questionWithCorrectionToggle={$globalOptions.flow === 2}
        pauseAfterEachQuestion={!!$globalOptions.pauseAfterEachQuestion}
        isManualModeActive={!!$globalOptions.manualMode}
        durationCorrection={$globalOptions.durationCorrection}
        {updateDurationCorrection}
      />
      <OrderSettings
        isQuestionsOrdered={!$globalOptions.shuffle}
        {updateQuestionsOrder}
      />
      <SelectedExercisesSettings
        {exercises}
        selectedExercisesIndexes={$globalOptions.select ?? []}
        {applyRandomSelectionOfExercises}
      />
      <LinksSettings />
    </div>
    <!-- Right Side -->
    <div
      class="flex flex-col justify-start
      md:w-4/6
      mr-0 md:mr-4"
    >
      <GlobalDurationSettings
        {exercises}
        isManualModeActive={!!$globalOptions.manualMode}
        {updateManualMode}
        durationGlobal={$globalOptions.durationGlobal}
        {updateDurationGlobal}
      />
      <div
        class="flex flex-col align-middle min-w-full h-screen px-4"
        bind:this={divTableDurationsQuestions}
      >
        <ExercisesSettings
          {exercises}
          isManualModeActive={!!$globalOptions.manualMode}
          {updateExercises}
          durationGlobal={$globalOptions.durationGlobal}
          selectedExercisesIndexes={$globalOptions.select ?? []}
          {remove}
        />
        <div class="flex flex-row items-center justify-end w-full my-4 gap-3">
          <ButtonIconTooltip
            icon="bx-printer text-3xl"
            tooltip="PDF sujets + corrigés"
            on:click={goToTypstWithSeries}
          />
          <ButtonIconTooltip
            icon="bxs-slideshow text-3xl"
            tooltip="Diaporama PDF (une question par page)"
            on:click={() => ($globalOptions.v = 'slides')}
          />
          <button
            type="button"
            class="inline-flex items-center justify-center shadow-2xl rounded-lg p-4 pr-2
              font-extrabold text-3xl
              bg-coopmaths-struct dark:bg-coopmathsdark-struct
              hover:bg-coopmaths-struct-light dark:hover:bg-coopmathsdark-struct-lightest
              text-coopmaths-canvas dark:text-coopmathsdark-canvas"
            on:click={() => {
              isHistoryModalOpen = true
            }}
          >
            Historique<i class="bx bx-time-five"></i>
          </button>
          <button
            type="button"
            id="diaporama-play-button"
            class="animate-pulse inline-flex items-center justify-center shadow-2xl rounded-lg p-4 pr-2
              font-extrabold text-3xl
              bg-coopmaths-action dark:bg-coopmathsdark-action
              hover:bg-coopmaths-action-lightest dark:hover:bg-coopmathsdark-action-lightest
              text-coopmaths-canvas dark:text-coopmathsdark-canvas"
            on:click={handleStartSlideshow}
            on:keydown={handleStartSlideshow}
          >
            Play<i class="bx bx-play"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<SlideshowHistoryModal
  bind:this={historyModal}
  bind:isOpen={isHistoryModalOpen}
  {exercises}
  {startSlideshow}
  {applySlideshowFromHistory}
/>
