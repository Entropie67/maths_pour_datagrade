<script lang="ts">
  import seedrandom from 'seedrandom'
  import { onDestroy, onMount } from 'svelte'
  import { get } from 'svelte/store'
  import { notify } from '../../../bugsnag'
  import {
    mathaleaFormatExercice,
    mathaleaGenerateSeed,
    mathaleaHandleExerciceSimple,
    mathaleaHandleSup,
    mathaleaUpdateExercicesParamsFromUrl,
    mathaleaUpdateUrlFromExercicesParams,
  } from '../../../lib/mathalea'
  import { isSvelte } from '../../../lib/components/componentsUtils'
  import { buildExercise } from '../../../lib/components/exercisesUtils'
  import { shuffle } from '../../../lib/outils/arrayOutils'
  import {
    darkMode,
    exercicesParams,
    previousView,
  } from '../../../lib/stores/generalStore'
  import { globalOptions } from '../../../lib/stores/globalOptions'
  import type { IExercice, InterfaceParams } from '../../../lib/types'
  import type { CanState } from '../../../lib/types/can'
  import { isIntegerInRange0to3 } from '../../../lib/types/integerInRange'
  import { context } from '../../../modules/context.js'
  import CountDown from '../../display/can/presentationalComponents/CountDown.svelte'
  import KickOff from '../../display/can/presentationalComponents/KickOff.svelte'
  import ButtonText from '../../shared/forms/ButtonText.svelte'
  import { extraitLettresQcm, extraitReponsesCourtes } from './answersTable'
  import { getShortAnswer } from '../typst/minimalCorrection'
  import SlideshowOverview from './slideshowOverview/SlideshowOverview.svelte'
  import SlideshowPlay from './slideshowPlay/SlideshowPlay.svelte'
  import SlideshowSettings from './slideshowSettings/SlideshowSettings.svelte'
  import type {
    Slide,
    Slideshow,
    SlideshowHistoryItem,
    SlideshowHistoryOptions,
    Vue,
  } from './types'

  const transitionSounds = {
    0: new Audio('assets/sounds/transition_sound_01.mp3'),
    1: new Audio('assets/sounds/transition_sound_02.mp3'),
    2: new Audio('assets/sounds/transition_sound_03.mp3'),
    3: new Audio('assets/sounds/transition_sound_04.mp3'),
  }

  let state: CanState = 'end'
  let exercises: IExercice[] = []
  let slideshow: Slideshow = {
    slides: [],
    currentQuestion: -1,
    selectedQuestionsNumber: 0,
  }

  $: if ($globalOptions.v === 'overview' && exercises.length > 0)
    updateExercises(true)
  $: if (state === 'race') startSlideshow()

  onMount(async () => {
    if ($previousView === undefined) state = 'start'
    context.vue = 'diap'
    document.addEventListener('updateAsyncEx', forceUpdate)
    exercises = await loadExercises()
    // Certains exercices (les « Sélection d'automatismes ») ne connaissent leur
    // nombre de questions qu'après une première génération : sans cela l'écran
    // de réglages afficherait 0 question.
    for (const exercise of exercises) {
      if (!exercise.nbQuestions) reroll(exercise)
    }
    updateExercises(false, true)
  })

  onDestroy(() => {
    document.removeEventListener('updateAsyncEx', forceUpdate)
  })

  async function forceUpdate() {
    updateExercises(true)
  }

  async function loadExercises(): Promise<IExercice[]> {
    const params = get(exercicesParams).filter((param) => !isSvelte(param.uuid))
    const loaded: IExercice[] = []
    for (const param of params) {
      const exercise = await buildExercise(param)
      exercise.duration = param.duration ?? 10
      if (exercise.typeExercice === 'statique') {
        exercise.nbQuestions = 1
        exercise.nbQuestionsModifiable = false
      }
      loaded.push(exercise)
    }
    return loaded
  }

  async function updateExercises(
    updateSlidesContent = false,
    updateParamsFromUrl = false,
  ) {
    if (updateSlidesContent) setSlidesContent(exercises)
    if ($globalOptions.v !== 'overview') adjustQuestionsOrder()
    updateParamsFromUrl
      ? mathaleaUpdateExercicesParamsFromUrl()
      : updateExerciseParams(exercises)
    mathaleaUpdateUrlFromExercicesParams($exercicesParams)
  }

  function setSlidesContent(newExercises: IExercice[]) {
    const slides = []
    const nbOfVues = $globalOptions.nbVues || 1
    let selectedQuestionsNumber = 0
    for (const [k, exercise] of [...newExercises].entries()) {
      reroll(exercise)
      const isSelected = $globalOptions.select?.includes(k) ?? true
      if (isSelected) selectedQuestionsNumber += exercise.listeQuestions.length
      for (let i = 0; i < exercise.listeQuestions.length; i++) {
        const slide: Slide = {
          exercise,
          isSelected,
          vues: [],
        }
        for (let idVue = 0; idVue < nbOfVues; idVue++) {
          if (isIntegerInRange0to3(idVue)) {
            /**
             * Nombre de tentatives pour générer une question différente pour une même vue.
             */
            let attempt = 0
            let vue!: Vue
            do {
              reroll(exercise, idVue, attempt++)
              const consigne = mathaleaFormatExercice(
                exercise.consigne + exercise.introduction
                  ? '\n' + exercise.consigne + exercise.introduction
                  : '',
              )
              const question = mathaleaFormatExercice(
                exercise.listeQuestions[i],
              ).replaceAll('{zoomFactor}', '1')
              const correction = mathaleaFormatExercice(
                exercise.listeCorrections[i],
              ).replaceAll('{zoomFactor}', '1')
              const { svgs: questionSvgs, text: questionText } =
                splitSvgFromText(question)
              const { svgs: consigneSvgs, text: consigneText } =
                splitSvgFromText(consigne)
              const { svgs: correctionSvgs, text: correctionText } =
                splitSvgFromText(correction)
              const lettresQcm = extraitLettresQcm(exercise, i)
              vue = {
                consigne,
                question,
                correction,
                consigneSvgs,
                consigneText,
                questionSvgs,
                questionText,
                correctionSvgs,
                correctionText,
                key: exercise.key,
                lettresQcm,
                reponsesCourtes: extraitReponsesCourtes(
                  correction,
                  lettresQcm.length === 0,
                  getShortAnswer(exercise, i),
                ),
              }
            } while (
              exercise.typeExercice !== 'statique' &&
              attempt < 10 &&
              slide.vues.some((v) => v.questionText === vue.questionText)
            )
            slide.vues.push(vue)
          } else {
            notify(`idVue ${idVue} is not an integer in range 0 to 3`, {})
          }
        }
        slides.push(slide)
      }
    }
    const questionsNumber = selectedQuestionsNumber || slides.length
    slideshow = {
      slides,
      // On conserve la question courante : `setSlidesContent()` est aussi
      // appelé par `forceUpdate()` quand un exercice vient de finir son
      // chargement asynchrone (« Sélection d'automatismes »). Remettre -1
      // renvoyait alors l'utilisateur aux réglages en plein diaporama.
      currentQuestion: Math.min(slideshow.currentQuestion, questionsNumber),
      selectedQuestionsNumber: questionsNumber,
    }
  }

  function reroll(exercise: IExercice, idVue?: 0 | 1 | 2 | 3, attempt = 0) {
    if (exercise.typeExercice === 'statique') return
    const interactif = exercise.interactif
    exercise.interactif = false
    if (exercise.seed === undefined) exercise.seed = mathaleaGenerateSeed()
    const originalSeed = exercise.seed
    if (idVue !== undefined && idVue > 0)
      exercise.seed = exercise.seed + String(idVue)
    if (attempt > 0) exercise.seed = exercise.seed + '_a' + String(attempt)
    if (exercise.typeExercice === 'simple') {
      mathaleaHandleExerciceSimple(exercise, false)
    } else {
      seedrandom(exercise.seed, { global: true })
      exercise.nouvelleVersionWrapper?.(idVue)
    }
    exercise.seed = originalSeed
    exercise.interactif = interactif
  }

  function splitSvgFromText(sourceText: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(sourceText, 'text/html')
    const mathalea2dContainers = doc.querySelectorAll('div.svgContainer')
    const scratchContainers = doc.querySelectorAll('pre.blocks')
    const svgContainers = [...mathalea2dContainers, ...scratchContainers]
    const svgs = Array.from(svgContainers).map(
      (container) => container.outerHTML,
    )
    const text = removeSvgContainers(doc.body.innerHTML, svgs)
    return {
      svgs,
      text,
    }
  }

  function removeSvgContainers(wholeQuestion: string, svgContainers: string[]) {
    let questionWithoutSvgContainers = wholeQuestion
    svgContainers.forEach((svgContainer) => {
      questionWithoutSvgContainers = questionWithoutSvgContainers.replace(
        svgContainer,
        '',
      )
    })
    return questionWithoutSvgContainers
  }

  function adjustQuestionsOrder() {
    const areSomeExercisesSelected =
      $globalOptions.select && $globalOptions.select.length > 0
    const selectedIndexes = areSomeExercisesSelected
      ? getSelectedQuestionsIndexes()
      : [...Array(slideshow.slides.length).keys()]
    let order = undefined
    if ($globalOptions.order && $globalOptions.order.length > 0) {
      order = $globalOptions.order.slice(0, selectedIndexes.length)
    }
    if (
      ($globalOptions.select && $globalOptions.select.length > 0) ||
      ($globalOptions.order &&
        $globalOptions.order.length < selectedIndexes.length)
    ) {
      order = selectedIndexes
    }
    if ($globalOptions.shuffle) {
      if (
        !$globalOptions.order ||
        $globalOptions.order.length === 0 ||
        isSameArray($globalOptions.order, selectedIndexes)
      ) {
        order = shuffle(selectedIndexes)
      } else {
        if ($globalOptions.order.length >= selectedIndexes.length) {
          order = $globalOptions.order.slice(0, selectedIndexes.length)
        } else {
          order = shuffle(selectedIndexes)
        }
      }
    }
    $globalOptions.order = order
  }

  function isSameArray(a: number[], b: number[]) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }

  function getSelectedQuestionsIndexes() {
    const indexes = []
    for (const [i, slide] of [...slideshow.slides].entries()) {
      if (slide.isSelected) {
        indexes.push(i)
      }
    }
    return indexes
  }

  function updateExerciseParams(newExercises: IExercice[]) {
    if (newExercises.length === get(exercicesParams).length) {
      // Update si nécessaire
      exercicesParams.update((params: InterfaceParams[]) => {
        params.forEach((param, i) => {
          // Toujours synchroniser (même si param.alea n'était pas encore
          // défini) : sinon un export régénère une graine aléatoire au lieu
          // de reprendre celle utilisée par le diaporama.
          if (param.alea !== newExercises[i].seed?.substring(0, 4))
            param.alea = newExercises[i].seed?.substring(0, 4)
        })
        return params
      })
    } else {
      // MGU : on remet tout mais j'aime PAS , ancien code, ne devrait pas être utilisé
      const newParams: InterfaceParams[] = []
      for (const exercice of newExercises) {
        newParams.push({
          cd: exercice.correctionDetaillee ? '1' : '0',
          uuid: exercice.uuid,
          id: exercice.id,
          alea: exercice.seed?.substring(0, 4),
          nbQuestions: exercice.nbQuestions,
          duration: exercice.duration,
          sup: mathaleaHandleSup(exercice.sup),
          sup2: mathaleaHandleSup(exercice.sup2),
          sup3: mathaleaHandleSup(exercice.sup3),
          sup4: mathaleaHandleSup(exercice.sup4),
          sup5: mathaleaHandleSup(exercice.sup5),
        })
      }
      exercicesParams.set(newParams)
    }
  }

  function startSlideshow() {
    updateExercises(true)
    $globalOptions.v = 'diaporama'
    slideshow.currentQuestion = 0
  }

  function applyHistoryOptions(options: SlideshowHistoryOptions) {
    $globalOptions.nbVues = options.nbVues
    $globalOptions.flow = options.flow
    $globalOptions.screenBetweenSlides = options.screenBetweenSlides
    $globalOptions.sound = options.sound
    $globalOptions.shuffle = options.shuffle
    $globalOptions.manualMode = options.manualMode
    $globalOptions.pauseAfterEachQuestion = options.pauseAfterEachQuestion
    $globalOptions.isImagesOnSides = options.isImagesOnSides
    $globalOptions.select = options.select
    $globalOptions.order = options.order
    $globalOptions.durationGlobal = options.durationGlobal
    $globalOptions.durationCorrection = options.durationCorrection
  }

  async function applySlideshowFromHistory(
    item: SlideshowHistoryItem,
    autoStart: boolean,
  ) {
    exercicesParams.set(item.exercicesParams.map((param) => ({ ...param })))
    exercises = await loadExercises()
    applyHistoryOptions(item.options)
    $globalOptions.v = 'diaporama'
    updateExercises(true)
    slideshow.currentQuestion = -1
    if (autoStart) startSlideshow()
  }

  function backToSettings() {
    $globalOptions.v = 'diaporama'
    slideshow.currentQuestion = -1
  }

  function goToHome() {
    $globalOptions.v = ''
  }

  function goToOverview() {
    $globalOptions.v = 'overview'
  }
</script>

<div
  id="diaporama"
  class="min-h-screen h-screen {$darkMode.isActive ? 'dark' : ''}"
>
  {#if $globalOptions.v === 'overview' && slideshow.slides.length > 0}
    <SlideshowOverview
      {exercises}
      {slideshow}
      {updateExercises}
      {backToSettings}
    />
  {:else}
    {#if slideshow.currentQuestion === -1}
      {#if state === 'start'}
        <KickOff title="Diaporama" subTitle="" bind:state>
          <ButtonText
            class="mt-8 py-3 px-6 text-3xl rounded-xl font-bold border-2
              border-coopmaths-struct-light dark:border-coopmathsdark-struct-light
              text-coopmaths-canvas dark:text-coopmathsdark-canvas
              bg-coopmaths-struct dark:bg-coopmathsdark-struct
              hover:bg-coopmaths-struct-light dark:hover:bg-coopmathsdark-struct-lightest"
            text="Paramètres"
            on:click={() => {
              state = 'end'
            }}
          />
        </KickOff>
      {:else if state === 'countdown'}
        <CountDown bind:state />
      {:else}
        <SlideshowSettings
          {exercises}
          {updateExercises}
          {transitionSounds}
          {startSlideshow}
          {applySlideshowFromHistory}
          {goToOverview}
          {goToHome}
        />
      {/if}
    {/if}
    {#if slideshow.currentQuestion > -1}
      <SlideshowPlay
        {slideshow}
        {transitionSounds}
        {backToSettings}
        {goToOverview}
      />
    {/if}
  {/if}
</div>
