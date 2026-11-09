<script lang="ts">
  import { onMount } from 'svelte'
  import type { QuestionResult } from '../../../../lib/types'
  import type { CanState } from '../../../../lib/types/can'
  import { canOptions } from '../../../../lib/stores/canStore'
  import { enumeration } from '../../../../lib/outils/ecritures'
  import BasicClassicModal from '../../../shared/modal/BasicClassicModal.svelte'
  import ShortPagination from './ShortPagination.svelte'

  export let current: number
  export let numberOfQuestions: number
  export let handleEndOfRace: () => void
  export let state: CanState
  export let resultsByQuestion: QuestionResult[]
  /**
   * Navigation linéaire (chronomètre par question ou feedback après chaque
   * question) : plus de flèches ni de balayage, un seul bouton fait avancer.
   */
  export let isLinear: boolean = false
  export let primaryLabel: string = ''
  export let onPrimary: () => void = () => {}
  /**
   * Bouton de fin de course affiché à la dernière question. Avec un feedback
   * après chaque question, le bouton principal joue déjà ce rôle.
   */
  export let showEndButton: boolean = true

  let isModalOpen = false

  $: unansweredQuestionNumbers = $canOptions.isInteractive
    ? $canOptions.questionGetAnswer
        .map((answered, index) => (answered ? null : index + 1))
        .filter((n): n is number => n !== null)
    : []

  function swipe(node: HTMLElement) {
    let touchStartX = 0
    let touchStartY = 0
    let touchStartTime = 0

    const minSwipeDistance = 60
    const maxSwipeTime = 300

    function handleTouchStart(event: TouchEvent) {
      touchStartX = event.touches[0].clientX
      touchStartY = event.touches[0].clientY
      touchStartTime = Date.now()
    }

    function handleTouchEnd(event: TouchEvent) {
      if (isLinear) return
      const touchEndX = event.changedTouches[0].clientX
      const touchEndY = event.changedTouches[0].clientY
      const touchEndTime = Date.now()

      const deltaX = touchEndX - touchStartX
      const deltaY = touchEndY - touchStartY
      const deltaTime = touchEndTime - touchStartTime

      // Check if swipe is horizontal enough and fast enough
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaTime <= maxSwipeTime) {
        if (Math.abs(deltaX) >= minSwipeDistance) {
          if (deltaX > 0 && current > 0) {
            // Swipe right - go to previous
            current -= 1
          } else if (deltaX < 0 && current < numberOfQuestions - 1) {
            // Swipe left - go to next
            current += 1
          }
        }
      }
    }

    node.addEventListener('touchstart', handleTouchStart, { passive: true })
    node.addEventListener('touchend', handleTouchEnd, { passive: true })

    return {
      destroy() {
        node.removeEventListener('touchstart', handleTouchStart)
        node.removeEventListener('touchend', handleTouchEnd)
      },
    }
  }

  // Le bouton de fin de course n'apparaît qu'à la dernière question : il
  // reste inactif les 5 premières secondes de la course (clic accidentel).
  let isEndButtonEnabled = false
  onMount(() => {
    const timeout = setTimeout(() => {
      isEndButtonEnabled = true
    }, 5 * 1000)
    return () => clearTimeout(timeout)
  })
</script>

<div
  use:swipe
  class="w-full {state === 'race'
    ? 'pb-1 gap-y-2'
    : 'pb-8 md:pb-10 space-y-4'} px-10 flex flex-col md:grid md:grid-cols-[1fr_auto_1fr] items-center"
>
  <div class={state === 'race' ? 'hidden md:block' : ''}></div>
  {#if isLinear}
    <div class="flex flex-row items-center space-x-10">
      <ShortPagination {current} {state} {resultsByQuestion} />
      {#if primaryLabel !== ''}
        <button
          id="can-primary-btn"
          type="button"
          class="inline-block p-3 md:p-5 font-bold rounded-lg text-lg md:text-3xl leading-normal text-coopmaths-canvas dark:text-coopmathsdark-canvas transition duration-150 ease-in-out bg-coopmaths-action hover:bg-coopmaths-action-lightest focus:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none focus:ring-0 active:bg-coopmaths-action-light dark:active:bg-coopmathsdark-action-light"
          on:click={onPrimary}
        >
          {primaryLabel}
        </button>
      {/if}
    </div>
  {:else}
    <div class="flex flex-row space-x-10">
      <button
        class="md:hidden flex justify-center items-center"
        type="button"
        aria-label="Reculer de 10 questions"
        on:click={() => {
          if (current >= 10) {
            current -= 10
          }
        }}
      >
        <i
          class="bx bxs-chevrons-left text-3xl md:text-7xl
            {current < 10
            ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10'
            : 'text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'}"
        ></i>
      </button>
      <button
        type="button"
        aria-label="Question précédente"
        on:click={() => {
          if (current > 0) {
            current -= 1
          }
        }}
      >
        <i
          class="bx bxs-chevron-left md:bxs-left-arrow text-3xl md:text-7xl
            {current === 0
            ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10'
            : 'text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'}"
        ></i>
      </button>
      <ShortPagination {current} {state} {resultsByQuestion} />
      <button
        type="button"
        aria-label="Question suivante"
        on:click={() => {
          if (current < numberOfQuestions - 1) {
            current += 1
          }
        }}
      >
        <i
          class="bx bxs-chevron-right md:bxs-right-arrow text-3xl md:text-7xl
            {current === numberOfQuestions - 1
            ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10'
            : 'text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'}"
        ></i>
      </button>
      <button
        class="md:hidden flex justify-center items-center"
        type="button"
        aria-label="Avancer de 10 questions"
        on:click={() => {
          if (current + 10 <= numberOfQuestions - 1) {
            current += 10
          }
        }}
      >
        <i
          class="bx bxs-chevrons-right text-3xl md:text-7xl
            {current > numberOfQuestions - 11
            ? 'text-coopmaths-action/10 dark:text-coopmathsdark-action/10'
            : 'text-coopmaths-action dark:text-coopmathsdark-action hover:text-coopmaths-action-lightest dark:hover:text-coopmathsdark-action-lightest'}"
        ></i>
      </button>
    </div>
  {/if}
  <div
    class="md:justify-self-end {state === 'race' &&
    !(showEndButton && current === numberOfQuestions - 1)
      ? 'hidden md:block'
      : ''}"
  >
    {#if state === 'race' && showEndButton && current === numberOfQuestions - 1}
      <button
        id="race-ended-by-user-btn"
        type="button"
        class="inline-block p-2 md:p-4 font-bold rounded-lg text-sm md:text-xl leading-normal text-coopmaths-canvas dark:text-coopmathsdark-canvas transition duration-150 ease-in-out bg-coopmaths-action hover:bg-coopmaths-action-lightest focus:bg-coopmaths-action-lightest dark:bg-coopmathsdark-action dark:hover:bg-coopmathsdark-action-lightest dark:focus:bg-coopmathsdark-action-lightest focus:outline-none focus:ring-0 active:bg-coopmaths-action-light dark:active:bg-coopmathsdark-action-light disabled:bg-coopmaths-action/10"
        on:click={() => (isModalOpen = true)}
        disabled={!isEndButtonEnabled}
      >
        Terminer et enregistrer les résultats
      </button>
    {/if}
  </div>
</div>
<BasicClassicModal bind:isDisplayed={isModalOpen} icon="bxs-error">
  <span slot="header">Attention !</span>
  <div
    slot="content"
    class="text-coopmaths-corpus dark:text-coopmathsdark-corpus"
  >
    <div>
      Si vous cliquez sur le bouton
      <span class="font-bold">Terminer et enregistrer les résultats</span>
      alors vous ne pourrez plus revenir en arrière.
    </div>
    {#if unansweredQuestionNumbers.length > 0}
      <div class="mt-4 font-bold">
        Attention, vous n'avez pas répondu {unansweredQuestionNumbers.length > 1
          ? 'aux questions'
          : 'à la question'}
        {enumeration(unansweredQuestionNumbers.map(String))}.
      </div>
    {/if}
    <div class="mt-4">Que souhaitez-vous faire ?</div>
  </div>
  <div slot="footer" class="flex flex-wrap items-center justify-center gap-2">
    <button
      type="button"
      class="inline-block rounded bg-coopmaths-action-200 dark:bg-coopmathsdark-action-lightest px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-coopmaths-action dark:text-coopmathsdark-action-dark transition duration-150 ease-in-out hover:bg-coopmaths-action-400 focus:bg-coopmaths-action-400"
      on:click={() => (isModalOpen = false)}
    >
      Continuer
    </button>
    <button
      type="button"
      class="inline-block rounded bg-coopmaths-action dark:bg-coopmathsdark-action px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-coopmaths-canvas dark:text-coopmathsdark-canvas transition duration-150 ease-in-out hover:bg-coopmaths-action-dark focus:bg-coopmaths-action-dark"
      on:click={() => {
        handleEndOfRace()
        isModalOpen = false
      }}
    >
      Terminer et enregistrer les résultats
    </button>
  </div>
</BasicClassicModal>
