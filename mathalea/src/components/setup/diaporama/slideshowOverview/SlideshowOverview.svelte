<script lang="ts">
  import { tick } from 'svelte'
  import { isSvelte } from '../../../../lib/components/componentsUtils'
  import {
    mathaleaGenerateSeed,
    mathaleaRenderDiv,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../../lib/mathalea'
  import {
    darkMode,
    exercicesParams,
  } from '../../../../lib/stores/generalStore'
  import { globalOptions } from '../../../../lib/stores/globalOptions'
  import type { IExercice, InterfaceParams } from '../../../../lib/types'
  import { isIntegerInRange0to4 } from '../../../../lib/types/integerInRange'
  import ZoomButtons from '../../start/presentationalComponents/header/headerButtons/setupButtons/ZoomButtons.svelte'
  import type { Serie, Slideshow } from '../types'
  import SlideshowOverviewLeftPanel from './presentationalComponent/SlideshowOverviewLeftPanel.svelte'
  import SlideshowOverviewAnswersTable from './presentationalComponent/mainPanel/SlideshowOverviewAnswersTable.svelte'
  import SlideshowOverviewMainPanel from './presentationalComponent/mainPanel/SlideshowOverviewMainPanel.svelte'

  export let exercises: IExercice[] = []
  export let slideshow: Slideshow
  export let updateExercises: (
    updateSlidesContent?: boolean,
    updateParamsFromUrl?: boolean,
  ) => void
  export let backToSettings: () => void

  let currentSeriesIndex: 0 | 1 | 2 | 3 | 4 = 0
  let isCorrectionVisible = false
  let isQuestionsVisible = true
  let isAnswersTableVisible = false
  let mainPanelDiv: HTMLElement
  let correctionsSteps: number[] = []
  // Nombre de questions dont la réponse est révélée dans le tableau des
  // réponses, dans l'ordre de `order` (indépendant de `correctionsSteps`,
  // qui ne concerne que le panneau Questions/Réponses).
  // On révèle la 1re réponse par défaut : un tableau entièrement masqué
  // ne laisse pas deviner qu'on peut le dévoiler.
  let revealedAnswersCount = 1

  let nbVues: 0 | 1 | 2 | 3 | 4
  $: {
    const nbVuesCandidate = slideshow.slides[0].vues.length
    if (isIntegerInRange0to4(nbVuesCandidate)) {
      nbVues = nbVuesCandidate
    }
  }

  let order: number[]
  $: {
    const questionsNb =
      slideshow.selectedQuestionsNumber || slideshow.slides.length
    order =
      $globalOptions.order === undefined || $globalOptions.order.length === 0
        ? [...Array(questionsNb).keys()]
        : $globalOptions.order
  }

  let series: Serie[] = []
  $: {
    series = []
    for (let i = 0; i < nbVues; i++) {
      const serie: Serie = {
        consignes: [],
        questions: [],
        corrections: [],
        keys: [],
      }
      for (const slide of slideshow.slides) {
        serie.consignes.push(slide.vues[i].consigne)
        serie.questions.push(slide.vues[i].question)
        serie.corrections.push(slide.vues[i].correction)
        serie.keys.push(slide.vues[i].key)
      }
      series.push(serie)
    }
  }

  // Le MainPanel reste monté (masqué en CSS) même quand le tableau des
  // réponses est affiché, pour éviter un bug Svelte qui vide le <main> lors
  // d'un {#if}/{:else} direct sur un noeud avec bind:this. Mais il ne faut
  // pas lui infliger un redimensionnement coûteux (SVGs, cases à cocher…)
  // tant qu'il est caché, sous peine de ralentir le zoom. Le tableau des
  // réponses gère lui-même son rendu KaTeX (voir SlideshowOverviewAnswersTable).
  $: if (
    !isAnswersTableVisible &&
    (isQuestionsVisible ||
      isCorrectionVisible ||
      correctionsSteps.length > 0) &&
    currentSeriesIndex !== undefined
  ) {
    tick().then(() => mathaleaRenderDiv(mainPanelDiv))
  }

  function setAnswersTableVisible(answersTableVisibility: boolean) {
    isAnswersTableVisible = answersTableVisibility
  }

  function setCorrectionVisible(correctionVisibility: boolean) {
    isCorrectionVisible = correctionVisibility
    if (!isCorrectionVisible) {
      setQuestionsVisible(true)
    }
  }

  function setCurrentVue(vue: number) {
    if (isIntegerInRange0to4(vue)) {
      currentSeriesIndex = vue
    }
  }

  function setQuestionsVisible(questionsVisibility: boolean) {
    isQuestionsVisible = questionsVisibility
    if (!isQuestionsVisible) {
      setCorrectionVisible(true)
    }
  }

  function newDataForAll() {
    // On ne remplace que la graine : les autres paramètres (s, s2, cd, i...)
    // doivent rester dans l'URL partagée du diaporama.
    const newParams: InterfaceParams[] = $exercicesParams
      .filter((param) => !isSvelte(param.uuid))
      .map((param, i) => {
        exercises[i].seed = mathaleaGenerateSeed()
        return { ...param, alea: exercises[i].seed.substring(0, 4) }
      })
    exercicesParams.set(newParams)
    updateExercises(true)
    mathaleaUpdateUrlFromExercicesParams($exercicesParams)
    isQuestionsVisible = true
    isCorrectionVisible = false
    correctionsSteps = []
    revealedAnswersCount = 1
  }

  /**
   * Gestion du pas à pas pour l'affichage des corrections
   * @param {string} button chaîne correspondant à la direction du pas à pas ("backward" ou "forward")
   */
  function handleCorrectionsStepsClick(button: 'backward' | 'forward') {
    if (button === 'backward') {
      if (correctionsSteps.length !== 0) {
        correctionsSteps.pop()
        correctionsSteps = correctionsSteps
      }
    }
    if (button === 'forward') {
      if (correctionsSteps.length < order.length) {
        correctionsSteps.push(order[correctionsSteps.length])
      }
      correctionsSteps = correctionsSteps
    }
  }

  /**
   * Pas à pas du tableau des réponses : révèle/masque les réponses une à une,
   * dans l'ordre de `order`.
   */
  function handleAnswersTableStepsClick(button: 'backward' | 'forward') {
    if (button === 'backward') {
      revealedAnswersCount = Math.max(0, revealedAnswersCount - 1)
    } else {
      revealedAnswersCount = Math.min(order.length, revealedAnswersCount + 1)
    }
  }

  function showAllAnswers() {
    revealedAnswersCount = order.length
  }

  function hideAllAnswers() {
    revealedAnswersCount = 0
  }

  /**
   * Révèle les réponses jusqu'à la question de rang `count` (bornes incluses).
   * Utilisé par les cellules masquées cliquables du tableau des réponses.
   */
  function setRevealedAnswersCount(count: number) {
    revealedAnswersCount = Math.max(0, Math.min(order.length, count))
  }

  function zoomUpdate(plusMinus: '+' | '-') {
    const oldZoom = Number($globalOptions.z || 1)
    const newZoom = Number(
      (plusMinus === '+' ? oldZoom + 0.1 : oldZoom - 0.1).toFixed(1),
    )
    $globalOptions.z = newZoom.toString()
    tick().then(() => mathaleaRenderDiv(mainPanelDiv))
    mathaleaUpdateUrlFromExercicesParams()
  }
</script>

<div class={$darkMode.isActive ? 'dark' : ''}>
  {#if !isAnswersTableVisible}
    <div
      class="fixed z-20 rounded-b-full rounded-t-full
      bottom-2 lg:bottom-6
      right-2 lg:right-6
      bg-coopmaths-canvas/80 dark:bg-coopmathsdark-canvas/80"
    >
      <div
        class="flex flex-col space-y-2
        scale-75 lg:scale-100"
      >
        <ZoomButtons {zoomUpdate} />
      </div>
    </div>
  {/if}
  <div
    class="flex
    bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  >
    <aside class="h-screen sticky top-0">
      <SlideshowOverviewLeftPanel
        {isQuestionsVisible}
        {isCorrectionVisible}
        {isAnswersTableVisible}
        currentVue={currentSeriesIndex}
        nbOfVues={nbVues}
        {setCurrentVue}
        {setQuestionsVisible}
        {setCorrectionVisible}
        {setAnswersTableVisible}
        {handleCorrectionsStepsClick}
        {handleAnswersTableStepsClick}
        {showAllAnswers}
        {newDataForAll}
        {backToSettings}
      />
    </aside>
    <main
      class="flex flex-col grow min-w-0 p-2
      bg-coopmaths-canvas dark:bg-coopmathsdark-canvas
      text-coopmaths-corpus dark:text-coopmathsdark-corpus"
    >
      <div class={isAnswersTableVisible ? 'flex w-full min-w-0' : 'hidden'}>
        <SlideshowOverviewAnswersTable
          slides={slideshow.slides}
          {order}
          {nbVues}
          {revealedAnswersCount}
          {showAllAnswers}
          {hideAllAnswers}
          {setRevealedAnswersCount}
          {handleAnswersTableStepsClick}
        />
      </div>
      <div
        class={isAnswersTableVisible ? 'hidden' : 'flex flex-row'}
        bind:this={mainPanelDiv}
      >
        <SlideshowOverviewMainPanel
          {isQuestionsVisible}
          {isCorrectionVisible}
          {currentSeriesIndex}
          {order}
          {series}
          {correctionsSteps}
          zoom={$globalOptions.z || '1'}
        />
      </div>
    </main>
  </div>
</div>
