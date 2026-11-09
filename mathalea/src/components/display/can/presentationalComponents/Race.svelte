<script lang="ts">
  import { canOptions } from '../../../../lib/stores/canStore'
  import type { QuestionResult } from '../../../../lib/types'
  import type { CanState } from '../../../../lib/types/can'
  import Keyboard from '../../../keyboard/Keyboard.svelte'
  import { keyboardState } from '../../../keyboard/stores/keyboardStore'
  import Feedback from './Feedback.svelte'
  import NavigationButtons from './NavigationButtons.svelte'
  import Pagination from './Pagination.svelte'
  import Question from './Question.svelte'
  import Timer from './Timer.svelte'

  export let state: CanState
  /** Durée totale prévue (globale, ou somme des durées par question). */
  export let numberOfSeconds: number = 20
  export let checkAnswers: () => void
  export let checkQuestion: (index: number) => void
  let current: number = 0
  export let questions: string[]
  export let consignes: string[]
  export let corrections: string[] = []
  export let consignesCorrections: string[] = []
  export let resultsByQuestion: QuestionResult[] = []
  const numberOfQuestions: number = questions.length
  let timerComponent: Timer
  let keyboardHeight = 0

  // Chronomètre par question : chaque question a son propre décompte et on ne
  // peut plus revenir en arrière.
  $: isPerQuestionTimer =
    $canOptions.timerMode === 'question' && !$canOptions.isTimerDisabled
  // Feedback après chaque question : la réponse est validée puis corrigée
  // avant de passer à la suivante (sans réponses à vérifier, pas de feedback).
  $: isFeedbackEach =
    $canOptions.feedbackMode === 'each' && $canOptions.isInteractive
  $: isLinear = isPerQuestionTimer || isFeedbackEach
  let phase: 'answering' | 'feedback' = 'answering'
  // Temps passé sur les questions terminées (chronomètre par question)
  let elapsedOnPreviousQuestions = 0
  let isQuestionTimerStopped = false
  let isEndRequested = false
  // Avec un feedback après chaque question, les résultats sont envoyés au
  // recorder dès que la dernière question est corrigée.
  let areResultsSent = false

  function setRemainingTimeInSeconds(du: number, el: number) {
    // Sans chronomètre, le temps passé peut dépasser la durée prévue : le
    // « temps restant » devient négatif pour que le temps mis (durée prévue
    // moins temps restant) reste exact.
    $canOptions.remainingTimeInSeconds =
      el >= du && !$canOptions.isTimerDisabled
        ? 0
        : Math.floor((du - el) / 1000)
  }

  function endTimer(e: CustomEvent) {
    setRemainingTimeInSeconds(
      parseInt(e.detail.duration),
      parseInt(e.detail.elapsed),
    )
    handleEndOfRace()
  }

  /**
   * Fin du décompte de la question courante (temps écoulé ou question validée)
   * avec un chronomètre par question.
   */
  function endQuestionTimer(e: CustomEvent) {
    const du = parseInt(e.detail.duration)
    const el = parseInt(e.detail.elapsed)
    elapsedOnPreviousQuestions += Math.min(el, du)
    isQuestionTimerStopped = true
    if (isEndRequested) {
      endRace()
    } else {
      finishQuestion()
    }
  }

  /**
   * Gestion de la fin de la course : on annule le décompte,
   * si le mode interactif est présent, on vérifie les questions
   * et on bascule sur l'état `end`
   */
  function handleEndOfRace() {
    if ($canOptions.isInteractive) {
      checkAnswers()
    }
    state = 'end'
  }

  /** Temps mis connu sans arrêter le chronomètre en cours. */
  function updateRemainingTime() {
    if (isPerQuestionTimer) {
      $canOptions.remainingTimeInSeconds = Math.floor(
        (numberOfSeconds * 1000 - elapsedOnPreviousQuestions) / 1000,
      )
    } else {
      setRemainingTimeInSeconds(
        numberOfSeconds * 1000,
        timerComponent.getElapsed(),
      )
    }
  }

  function endRace() {
    if (areResultsSent) {
      state = 'end'
    } else if (isPerQuestionTimer) {
      updateRemainingTime()
      handleEndOfRace()
    } else {
      timerComponent.terminateTimer()
    }
  }

  /** Bouton de fin de course : le temps de la question en cours est comptabilisé. */
  function requestEnd() {
    if (isPerQuestionTimer && !isQuestionTimerStopped) {
      isEndRequested = true
      timerComponent.terminateTimer()
    } else {
      endRace()
    }
  }

  /** La question courante est terminée : feedback ou question suivante. */
  function finishQuestion() {
    if (isFeedbackEach) {
      checkQuestion(current)
      phase = 'feedback'
      $keyboardState.isVisible = false
      if (current === numberOfQuestions - 1) {
        // dernière question corrigée : le score est envoyé sans attendre
        updateRemainingTime()
        checkAnswers()
        areResultsSent = true
      }
    } else {
      goToNextQuestion()
    }
  }

  function goToNextQuestion() {
    phase = 'answering'
    if (current < numberOfQuestions - 1) {
      current += 1
      isQuestionTimerStopped = false
    } else {
      endRace()
    }
  }

  /** Bouton « Valider » ou « Question suivante » de la navigation linéaire. */
  function handlePrimaryAction() {
    if (phase === 'feedback') {
      goToNextQuestion()
    } else if (isPerQuestionTimer) {
      // le chronomètre prévient `endQuestionTimer`
      timerComponent.terminateTimer()
    } else {
      finishQuestion()
    }
  }

  // Sur la dernière question, un seul bouton de fin : « Terminer et
  // enregistrer les résultats » dans NavigationButtons sans feedback ; avec un
  // feedback après chaque question, les résultats sont déjà envoyés et le
  // bouton principal se contente de « Terminer ».
  $: primaryLabel =
    phase === 'feedback' || !isFeedbackEach
      ? current < numberOfQuestions - 1
        ? 'Question suivante'
        : isFeedbackEach
          ? 'Terminer'
          : ''
      : 'Valider'

  function nextQuestion() {
    if (current < numberOfQuestions - 1) {
      current += 1
    }
  }

  function handleKeyUp(e: KeyboardEvent) {
    /* keyup plutôt que keydown, sinon plusieurs events tirés pour une même pression prolongée */
    if (e.key !== 'Enter') return
    if (!isLinear) {
      nextQuestion()
    } else if (
      phase === 'feedback' ||
      !isFeedbackEach ||
      $canOptions.questionGetAnswer[current]
    ) {
      // Avec un feedback, on ne valide pas une question sans réponse par
      // simple appui sur Entrée
      handlePrimaryAction()
    }
  }
</script>

<svelte:window on:keyup={handleKeyUp} />

<div
  class="w-full h-full flex flex-col justify-between items-center overflow-y-auto bg-coopmaths-canvas dark:bg-coopmathsdark-canvas"
  style:padding-bottom="{$keyboardState.isVisible ? keyboardHeight : 0}px"
>
  <div class="w-full flex flex-col shrink-0">
    {#if isPerQuestionTimer}
      {#key current}
        <Timer
          bind:this={timerComponent}
          durationInMilliSeconds={$canOptions.durationPerQuestionInSeconds *
            1000}
          on:message={endQuestionTimer}
        />
      {/key}
    {:else}
      <Timer
        bind:this={timerComponent}
        durationInMilliSeconds={numberOfSeconds * 1000}
        isDisabled={$canOptions.isTimerDisabled}
        isPaused={isFeedbackEach && phase === 'feedback'}
        on:message={endTimer}
      />
    {/if}
    <Pagination
      bind:current
      {numberOfQuestions}
      {isLinear}
      state={'race'}
      resultsByQuestion={[]}
    />
  </div>
  <div
    id="questions-container"
    class="flex flex-1 min-h-0 flex-col justify-center items-center overflow-y-auto font-light text-coopmaths-corpus dark:text-coopmathsdark-corpus text-3xl md:text-5xl w-full"
  >
    {#each [...Array(numberOfQuestions).keys()] as i}
      <Question
        consigne={consignes[i]}
        question={questions[i]}
        consigneCorrection={''}
        correction={''}
        mode={'display'}
        visible={current === i}
        isLocked={phase === 'feedback' && current === i}
        index={i}
      />
    {/each}
  </div>
  {#if phase === 'feedback'}
    {#key current}
      <Feedback
        isCorrect={resultsByQuestion[current] === true}
        consigneCorrection={consignesCorrections[current] ?? ''}
        correction={corrections[current] ?? ''}
      />
    {/key}
  {/if}
  <div class="flex justify-center w-full shrink-0">
    <NavigationButtons
      bind:current
      {numberOfQuestions}
      handleEndOfRace={requestEnd}
      {isLinear}
      showEndButton={!isFeedbackEach}
      {primaryLabel}
      onPrimary={handlePrimaryAction}
      {state}
      resultsByQuestion={[]}
    />
  </div>
  <Keyboard bind:height={keyboardHeight} />
</div>
